import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WC_BASE = "https://alphapropriedadesdigitais.com.br/wp-json/wc/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const wcKey = Deno.env.get("WC_CONSUMER_KEY");
    const wcSecret = Deno.env.get("WC_CONSUMER_SECRET");

    if (!wcKey || !wcSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "WooCommerce credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch orders from WooCommerce REST API (last 100, sorted by date)
    const body = await req.json().catch(() => ({}));
    const page = body.page ?? 1;
    const perPage = body.per_page ?? 100;
    const after = body.after; // ISO date to fetch orders after

    let url = `${WC_BASE}/orders?consumer_key=${wcKey}&consumer_secret=${wcSecret}&per_page=${perPage}&page=${page}&orderby=date&order=desc`;
    if (after) {
      url += `&after=${after}`;
    }

    console.log(`Fetching WC orders page=${page} per_page=${perPage}`);

    const wcRes = await fetch(url);
    if (!wcRes.ok) {
      const errText = await wcRes.text();
      console.error("WC API error:", wcRes.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: `WooCommerce API error: ${wcRes.status}` }),
        { status: wcRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orders = await wcRes.json();
    console.log(`Fetched ${orders.length} orders from WooCommerce`);

    let inserted = 0;
    let skipped = 0;

    for (const order of orders) {
      const externalId = String(order.id);

      // Check if already exists
      const { data: existing } = await supabase
        .from("external_orders")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();

      if (existing) {
        // Update status if changed
        await supabase
          .from("external_orders")
          .update({
            status: order.status,
            updated_at: new Date().toISOString(),
          })
          .eq("external_id", externalId);
        skipped++;
        continue;
      }

      // Upsert customer
      let customerId: string | null = null;
      const billing = order.billing || {};
      if (billing.email || billing.first_name) {
        const customerData = {
          name: [billing.first_name, billing.last_name].filter(Boolean).join(" ") || null,
          email: billing.email || null,
          country: billing.country || null,
          ip_address: order.customer_ip_address || null,
          external_id: order.customer_id ? String(order.customer_id) : null,
        };

        // Try to find existing customer by email
        if (billing.email) {
          const { data: existingCustomer } = await supabase
            .from("external_customers")
            .select("id")
            .eq("email", billing.email)
            .maybeSingle();

          if (existingCustomer) {
            customerId = existingCustomer.id;
            await supabase
              .from("external_customers")
              .update(customerData)
              .eq("id", customerId);
          }
        }

        if (!customerId) {
          const { data: newCustomer } = await supabase
            .from("external_customers")
            .insert(customerData)
            .select("id")
            .single();
          customerId = newCustomer?.id ?? null;
        }
      }

      // Calculate financials
      const totalAmount = parseFloat(order.total) || 0;
      const platformFee = parseFloat(order.fee_lines?.[0]?.total || "0");
      const commission = totalAmount * 0.07; // 7% platform commission
      const netAmount = totalAmount - platformFee - commission;

      // Insert order
      const { data: newOrder, error: orderError } = await supabase
        .from("external_orders")
        .insert({
          external_id: externalId,
          customer_id: customerId,
          status: order.status || "pending",
          total_amount: totalAmount,
          payment_method: order.payment_method_title || order.payment_method || null,
          platform_fee: platformFee,
          commission: commission,
          net_amount: netAmount,
          currency: order.currency || "BRL",
          raw_data: order,
          ordered_at: order.date_created || null,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error(`Error inserting order ${externalId}:`, orderError.message);
        continue;
      }

      // Insert order items
      if (newOrder && order.line_items?.length) {
        const items = order.line_items.map((item: any) => ({
          order_id: newOrder.id,
          product_name: item.name || "Produto",
          category: item.categories?.[0]?.name || null,
          price: parseFloat(item.total) || 0,
          quantity: item.quantity || 1,
          external_product_id: item.product_id ? String(item.product_id) : null,
        }));

        await supabase.from("external_order_items").insert(items);
      }

      inserted++;
    }

    const totalPages = parseInt(wcRes.headers.get("X-WP-TotalPages") || "1");
    const totalOrders = parseInt(wcRes.headers.get("X-WP-Total") || "0");

    console.log(`Sync complete: ${inserted} inserted, ${skipped} updated/skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        skipped,
        total_in_page: orders.length,
        total_orders: totalOrders,
        total_pages: totalPages,
        current_page: page,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
