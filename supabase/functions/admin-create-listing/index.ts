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
