const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const IMGBB_API_KEY = Deno.env.get("IMGBB_API_KEY");
    if (!IMGBB_API_KEY) {
      return jsonResponse({ ok: false, error: "IMGBB_API_KEY not configured" });
    }

    let imageBase64 = "";
    let fileName = "upload";
    let mimeType = "";

    const contentType = (req.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const imageFile = formData.get("image");

      if (!imageFile || !(imageFile instanceof File)) {
        return jsonResponse({ ok: false, error: "No image file provided" });
      }

      if (imageFile.size > 32 * 1024 * 1024) {
        return jsonResponse({ ok: false, error: "Image too large. Max 32MB." });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowedTypes.includes(imageFile.type)) {
        return jsonResponse({ ok: false, error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, BMP" });
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
    } else {
      let body: Record<string, unknown> | null = null;

      try {
        body = await req.json();
      } catch {
        try {
          const rawText = await req.text();
          body = rawText ? JSON.parse(rawText) : null;
        } catch {
          body = null;
        }
      }

      if (!body || typeof body !== "object") {
        return jsonResponse({ ok: false, error: "Invalid request body" });
      }

      imageBase64 = typeof body?.image === "string" ? body.image : "";
      fileName = typeof body?.filename === "string" ? body.filename.replace(/\.[^.]+$/, "") : "upload";
      mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";

      if (!imageBase64) {
        return jsonResponse({ ok: false, error: "No image payload provided" });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"];
      if (!allowedTypes.includes(mimeType)) {
        return jsonResponse({ ok: false, error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP, BMP" });
      }
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
      return jsonResponse({ ok: false, error: "Failed to upload to image hosting", details: errText });
    }

    const result = await imgbbResponse.json();

    return jsonResponse({
      ok: true,
      url: result.data.url,
      thumb: result.data.thumb?.url || result.data.url,
      delete_url: result.data.delete_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Internal server error" });
  }
});
