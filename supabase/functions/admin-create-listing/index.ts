import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const personalUrl = 'https://yzwncktlibdfycqhvlqg.supabase.co';
    const serviceKey = Deno.env.get('PERSONAL_SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(personalUrl, serviceKey);

    const body = await req.json();
    const { action } = body;

    if (action === 'upload_image') {
      const { image_url, file_name } = body;
      const imgRes = await fetch(image_url);
      const imgBlob = await imgRes.blob();

      const { error } = await supabase.storage
        .from('listings')
        .upload(file_name, imgBlob, { contentType: 'image/jpeg', upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('listings')
        .getPublicUrl(file_name);

      return new Response(JSON.stringify({ url: urlData.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_listing') {
      const { listing } = body;
      const { data, error } = await supabase
        .from('listings')
        .insert(listing)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ listing: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_listing') {
      const { id, updates } = body;
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ listing: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update_profile') {
      const { user_id, updates } = body;
      // Try update first
      const { data: existing } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user_id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ profile: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert({ user_id, ...updates })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ profile: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'run_sql') {
      const { sql } = body;
      const { data, error } = await supabase.rpc('exec_sql', { query: sql });
      // Fallback: use raw REST
      const res = await fetch(`${personalUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      const result = await res.text();
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
