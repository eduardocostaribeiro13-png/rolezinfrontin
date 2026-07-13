import { supabase } from "@/integrations/supabase/client";

// 10 years — used because buckets are private and we save the URL directly.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

async function uploadAndSign(
  bucket: "vehicles" | "gallery" | "tours",
  file: File,
): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Falha ao gerar URL");
  return data.signedUrl;
}

export const StorageService = {
  uploadVehicleImage: (file: File) => uploadAndSign("vehicles", file),
  uploadGalleryImage: (file: File) => uploadAndSign("gallery", file),
  uploadTourImage: (file: File) => uploadAndSign("tours", file),
};
