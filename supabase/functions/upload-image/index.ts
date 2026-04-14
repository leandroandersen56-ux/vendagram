const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const IMGBB_API_KEY = Deno.env.get("IMGBB_API_KEY");
    if (!IMGBB_API_KEY) {
      return new Response(
        JSON.stringify({ error: "IMGBB_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let imageBase64 = "";
    let fileName = "upload";
    let mimeType = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const imageFile = formData.get("image");

      if (!imageFile || !(imageFile instanceof File)) {
        return new Response(
          JSON.stringify({ error: "No image file provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (imageFile.size > 32 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "Image too large. Max 32MB." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowedTypes.includes(imageFile.type)) {
        return new Response(
          JSON.stringify({ error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, BMP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }

      imageBase64 = btoa(binary);
      fileName = imageFile.name.replace(/\.[^.]+$/, "") || "upload";
      mimeType = imageFile.type;
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = typeof body?.image === "string" ? body.image : "";
      fileName = typeof body?.filename === "string" ? body.filename.replace(/\.[^.]+$/, "") : "upload";
      mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";

      if (!imageBase64) {
        return new Response(
          JSON.stringify({ error: "No image payload provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowedTypes.includes(mimeType)) {
        return new Response(
          JSON.stringify({ error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, BMP" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported content type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload to ImgBB
    const imgbbForm = new FormData();
    imgbbForm.append("key", IMGBB_API_KEY);
    imgbbForm.append("image", imageBase64);
    imgbbForm.append("name", fileName);

    const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbForm,
    });

    if (!imgbbResponse.ok) {
      const errText = await imgbbResponse.text();
      console.error("ImgBB error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to upload to image hosting" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await imgbbResponse.json();

    return new Response(
      JSON.stringify({
        url: result.data.url,
        thumb: result.data.thumb?.url || result.data.url,
        delete_url: result.data.delete_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
