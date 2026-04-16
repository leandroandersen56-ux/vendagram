// Helper unificado para upload de imagens via edge function `upload-image` (ImgBB).
// Usado em todos os fluxos: avatar, capa, screenshots de anúncios, prints de embaixador, etc.

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Falha ao preparar imagem"));
        return;
      }
      const [, base64 = ""] = reader.result.split(",");
      if (!base64) {
        reject(new Error("Falha ao converter imagem"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(file);
  });

export interface UploadImageOptions {
  /** Tamanho máximo em MB (default 10) */
  maxSizeMB?: number;
}

/**
 * Faz upload de uma imagem para ImgBB via edge function `upload-image`.
 * Retorna a URL pública persistente.
 */
export async function uploadImage(file: File, options: UploadImageOptions = {}): Promise<string> {
  const { maxSizeMB = 10 } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Arquivo não é uma imagem válida");
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`Imagem maior que ${maxSizeMB}MB`);
  }

  const image = await fileToBase64(file);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        image,
        filename: file.name,
        mimeType: file.type,
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok || !payload?.url) {
    throw new Error(payload?.error || payload?.details || "Falha ao enviar imagem");
  }

  return payload.url as string;
}
