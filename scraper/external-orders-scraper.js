#!/usr/bin/env node
/**
 * External Orders Scraper - Playwright
 * 
 * Captura pedidos do site externo via navegador automatizado.
 * Roda como processo standalone (VPS, servidor, ou local).
 * 
 * INSTALAÇÃO:
 *   cd scraper
 *   npm install playwright dotenv
 *   npx playwright install chromium
 * 
 * CONFIGURAÇÃO (.env no diretório scraper/):
 *   TARGET_URL=https://alphapropriedadesdigitais.com.br
 *   LOGIN_URL=https://alphapropriedadesdigitais.com.br/minha-conta/
 *   ORDERS_URL=https://alphapropriedadesdigitais.com.br/minha-conta/orders/
 *   WP_USERNAME=seu_usuario
 *   WP_PASSWORD=sua_senha
 *   SUPABASE_FUNCTION_URL=https://tqfvhfrbeolnvjpcfckl.supabase.co/functions/v1/receive-external-orders
 *   SCRAPER_SECRET_KEY=sua_chave_secreta
 *   SYNC_INTERVAL_MS=60000
 * 
 * EXECUÇÃO:
 *   node external-orders-scraper.js          # Roda uma vez
 *   node external-orders-scraper.js --loop   # Roda a cada 60s
 */

const { chromium } = require("playwright");
const path = require("path");

// Load .env from scraper directory
require("dotenv").config({ path: path.join(__dirname, ".env") });

const CONFIG = {
  targetUrl: process.env.TARGET_URL || "https://alphapropriedadesdigitais.com.br",
  loginUrl: process.env.LOGIN_URL || "https://alphapropriedadesdigitais.com.br/minha-conta/",
  ordersUrl: process.env.ORDERS_URL || "https://alphapropriedadesdigitais.com.br/minha-conta/orders/",
  wpAdmin: process.env.WP_ADMIN_URL || "https://alphapropriedadesdigitais.com.br/wp-admin/edit.php?post_type=shop_order",
  username: process.env.WP_USERNAME,
  password: process.env.WP_PASSWORD,
  supabaseUrl: process.env.SUPABASE_FUNCTION_URL,
  scraperKey: process.env.SCRAPER_SECRET_KEY,
  interval: parseInt(process.env.SYNC_INTERVAL_MS || "60000"),
  headless: process.env.HEADLESS !== "false",
};

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function logError(msg, err) {
  console.error(`[${new Date().toISOString()}] ❌ ${msg}`, err?.message || err);
}

/**
 * STRATEGY 1: Scrape via WP-Admin orders page (needs admin login)
 */
async function scrapeViaWpAdmin(page) {
  log("Strategy: WP-Admin orders page");

  // Login to WordPress
  await page.goto(CONFIG.loginUrl, { waitUntil: "networkidle", timeout: 30000 });

  // Check if already logged in
  const isLoggedIn = await page.evaluate(() => {
    return document.body.classList.contains("logged-in") ||
           !!document.querySelector(".woocommerce-MyAccount-navigation");
  });

  if (!isLoggedIn) {
    log("Logging in...");
    // Try WP login form
    const wpLoginForm = await page.$("form#loginform, form.woocommerce-form-login");
    if (wpLoginForm) {
      const usernameField = await page.$('#username, #user_login, input[name="username"], input[name="log"]');
      const passwordField = await page.$('#password, #user_pass, input[name="password"], input[name="pwd"]');

      if (usernameField && passwordField) {
        await usernameField.fill(CONFIG.username);
        await passwordField.fill(CONFIG.password);
        await page.click('button[type="submit"], input[type="submit"], .woocommerce-form-login__submit');
        await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
        log("Login submitted");
      }
    }
  }

  // Navigate to WP Admin orders
  await page.goto(CONFIG.wpAdmin, { waitUntil: "networkidle", timeout: 30000 });

  // Check if redirected to login (no admin access)
  if (page.url().includes("wp-login.php")) {
    log("No WP-Admin access, trying frontend orders...");
    return null; // fallback to Strategy 2
  }

  // Extract orders from WP Admin table
  const orders = await page.evaluate(() => {
    const rows = document.querySelectorAll("table.wp-list-table tbody tr, table.wc-orders-list-table tbody tr");
    const result = [];

    rows.forEach((row) => {
      const idEl = row.querySelector(".order_number a, .column-order_number a, td.order_number");
      const statusEl = row.querySelector(".order_status mark, .column-order_status mark, .status");
      const dateEl = row.querySelector(".order_date time, .column-date time, td.date");
      const totalEl = row.querySelector(".order_total .woocommerce-Price-amount, .column-order_total .amount, td.order_total");
      const customerEl = row.querySelector(".shipping_address, .column-billing_address, .billing_address");

      if (idEl) {
        const idText = idEl.textContent?.trim().replace("#", "") || "";
        result.push({
          id: idText,
          status: statusEl?.textContent?.trim()?.toLowerCase() || "pending",
          date: dateEl?.getAttribute("datetime") || dateEl?.textContent?.trim() || null,
          total: totalEl?.textContent?.replace(/[^\d.,]/g, "").replace(",", ".") || "0",
          customer_name: customerEl?.textContent?.trim() || null,
          items: [],
          raw: { source: "wp-admin-scrape" },
        });
      }
    });

    return result;
  });

  log(`Extracted ${orders.length} orders from WP-Admin`);
  return orders;
}

/**
 * STRATEGY 2: Scrape via Dokan vendor dashboard or My Account orders
 */
async function scrapeViaFrontend(page) {
  log("Strategy: Frontend orders page");

  await page.goto(CONFIG.ordersUrl, { waitUntil: "networkidle", timeout: 30000 });

  // Extract orders from the frontend orders table
  const orders = await page.evaluate(() => {
    const rows = document.querySelectorAll(
      ".woocommerce-orders-table tbody tr, " +
      ".dokan-orders-table tbody tr, " +
      "table.shop_table tbody tr, " +
      ".order-list tbody tr"
    );
    const result = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const link = row.querySelector("a[href*='order']");
      const idText = cells[0]?.textContent?.trim().replace("#", "") || 
                     link?.textContent?.trim().replace("#", "") || "";
      
      const statusEl = row.querySelector(".order-status, .label, .badge, mark");
      const dateCell = cells[1]?.textContent?.trim() || cells[2]?.textContent?.trim() || null;
      const totalCell = row.querySelector(".woocommerce-Price-amount, .amount");

      if (idText) {
        result.push({
          id: idText,
          status: statusEl?.textContent?.trim()?.toLowerCase() || "pending",
          date: dateCell,
          total: totalCell?.textContent?.replace(/[^\d.,]/g, "").replace(",", ".") || "0",
          customer_name: null,
          items: [],
          raw: { source: "frontend-scrape" },
        });
      }
    });

    return result;
  });

  log(`Extracted ${orders.length} orders from frontend`);
  return orders;
}

/**
 * STRATEGY 3: Intercept XHR/Fetch network requests
 */
async function scrapeViaNetworkIntercept(page) {
  log("Strategy: Network interception");

  const capturedOrders = [];

  // Intercept API calls
  page.on("response", async (response) => {
    const url = response.url();
    if (
      url.includes("/wp-json/wc/") ||
      url.includes("/wp-json/dokan/") ||
      url.includes("orders") ||
      url.includes("admin-ajax.php")
    ) {
      try {
        const contentType = response.headers()["content-type"] || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach((item) => {
              if (item.id && (item.total || item.order_total)) {
                capturedOrders.push({
                  id: String(item.id),
                  status: item.status || "pending",
                  date: item.date_created || item.date || null,
                  total: String(item.total || item.order_total || "0"),
                  customer_name: item.billing?.first_name
                    ? `${item.billing.first_name} ${item.billing.last_name || ""}`.trim()
                    : null,
                  customer_email: item.billing?.email || null,
                  payment_method: item.payment_method_title || item.payment_method || null,
                  items: (item.line_items || []).map((li) => ({
                    name: li.name,
                    price: String(li.total || li.price || "0"),
                    quantity: li.quantity || 1,
                    product_id: String(li.product_id || ""),
                  })),
                  raw: { source: "network-intercept", original: item },
                });
              }
            });
          }
        }
      } catch (e) {
        // Not JSON, skip
      }
    }
  });

  // Navigate to trigger API calls
  await page.goto(CONFIG.ordersUrl, { waitUntil: "networkidle", timeout: 30000 });
  
  // Also try admin page
  if (CONFIG.username) {
    await page.goto(CONFIG.wpAdmin, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  }

  // Wait a bit for any lazy-loaded requests
  await page.waitForTimeout(3000);

  log(`Intercepted ${capturedOrders.length} orders from network`);
  return capturedOrders;
}

/**
 * Send orders to Supabase edge function
 */
async function sendToSupabase(orders) {
  if (!orders.length) {
    log("No orders to send");
    return;
  }

  if (!CONFIG.supabaseUrl || !CONFIG.scraperKey) {
    logError("Missing SUPABASE_FUNCTION_URL or SCRAPER_SECRET_KEY");
    return;
  }

  // Send in batches of 50
  const batchSize = 50;
  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize);
    
    try {
      const res = await fetch(CONFIG.supabaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-scraper-key": CONFIG.scraperKey,
        },
        body: JSON.stringify({ orders: batch }),
      });

      const data = await res.json();
      if (data.success) {
        log(`Batch ${Math.floor(i / batchSize) + 1}: ${data.inserted} inseridos, ${data.updated} atualizados`);
      } else {
        logError(`Batch error: ${data.error}`);
      }
    } catch (err) {
      logError("Failed to send batch to Supabase", err);
    }
  }
}

/**
 * Main scraping function
 */
async function scrape() {
  log("=== Starting scrape cycle ===");

  const browser = await chromium.launch({ headless: CONFIG.headless });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
  });

  // Load cookies if saved
  const cookiesPath = path.join(__dirname, "cookies.json");
  try {
    const fs = require("fs");
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath, "utf-8"));
      await context.addCookies(cookies);
      log("Loaded saved cookies");
    }
  } catch (e) {
    // No cookies file
  }

  const page = await context.newPage();
  let orders = [];

  try {
    // Strategy 1: Network interception (best data quality)
    orders = await scrapeViaNetworkIntercept(page);

    // Strategy 2: WP-Admin scrape (if network didn't capture enough)
    if (orders.length === 0 && CONFIG.username) {
      orders = await scrapeViaWpAdmin(page);
    }

    // Strategy 3: Frontend scrape (fallback)
    if (!orders || orders.length === 0) {
      orders = await scrapeViaFrontend(page);
    }

    // Save cookies for session persistence
    try {
      const fs = require("fs");
      const cookies = await context.cookies();
      fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
      log("Cookies saved");
    } catch (e) {
      // ignore
    }

    // Send to Supabase
    if (orders.length > 0) {
      await sendToSupabase(orders);
    } else {
      log("⚠️ No orders captured from any strategy");
    }
  } catch (err) {
    logError("Scrape cycle failed", err);
  } finally {
    await browser.close();
  }

  log("=== Scrape cycle complete ===\n");
}

// Entry point
(async () => {
  const isLoop = process.argv.includes("--loop");

  await scrape();

  if (isLoop) {
    log(`Loop mode: running every ${CONFIG.interval / 1000}s`);
    setInterval(scrape, CONFIG.interval);
  }
})();
