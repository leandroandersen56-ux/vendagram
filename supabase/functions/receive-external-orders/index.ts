import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-scraper-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const scraperKey = Deno.env.get("SCRAPER_SECRET_KEY");
    const incomingKey = req.headers.get("x-scraper-key");

    if (!scraperKey || incomingKey !== scraperKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const orders = body.orders;

    if (!Array.isArray(orders) || orders.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No orders provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let inserted = 0;
    let updated = 0;

    for (const order of orders) {
      const externalId = String(order.id);

      // Check existing
      const { data: existing } = await supabase
        .from("external_orders")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("external_orders")
          .update({
            status: order.status || "pending",
            total_amount: parseFloat(order.total) || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("external_id", externalId);
        updated++;
        continue;
      }

      // Upsert customer
      let customerId: string | null = null;
      if (order.customer_name || order.customer_email) {
        if (order.customer_email) {
          const { data: existingCustomer } = await supabase
            .from("external_customers")
            .select("id")
            .eq("email", order.customer_email)
            .maybeSingle();

          if (existingCustomer) {
            customerId = existingCustomer.id;
          }
        }

        if (!customerId) {
          const { data: newCustomer } = await supabase
            .from("external_customers")
            .insert({
              name: order.customer_name || null,
              email: order.customer_email || null,
              country: order.country || null,
              external_id: order.customer_external_id || null,
            })
            .select("id")
            .single();
          customerId = newCustomer?.id ?? null;
        }
      }

      const totalAmount = parseFloat(order.total) || 0;
      const commission = totalAmount * 0.10;
      const netAmount = totalAmount - commission;

      const { data: newOrder, error: orderError } = await supabase
        .from("external_orders")
        .insert({
          external_id: externalId,
          customer_id: customerId,
          status: order.status || "pending",
          total_amount: totalAmount,
          payment_method: order.payment_method || null,
          commission,
          net_amount: netAmount,
          currency: order.currency || "BRL",
          raw_data: order.raw || {},
          ordered_at: order.date || null,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error(`Error inserting order ${externalId}:`, orderError.message);
        continue;
      }

      // Insert items
      if (newOrder && order.items?.length) {
        const items = order.items.map((item: any) => ({
          order_id: newOrder.id,
          product_name: item.name || "Produto",
          category: item.category || null,
          price: parseFloat(item.price) || 0,
          quantity: item.quantity || 1,
          external_product_id: item.product_id || null,
        }));
        await supabase.from("external_order_items").insert(items);
      }

      inserted++;
    }

    console.log(`Received: ${inserted} inserted, ${updated} updated`);

    return new Response(
      JSON.stringify({ success: true, inserted, updated, total: orders.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Receive error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
