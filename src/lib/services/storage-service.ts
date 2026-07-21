import { supabase } from "@/integrations/supabase/client";

// 10 years — used because buckets are private and we save the signed URL directly.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

// Supabase Storage default per-file cap. Buckets have no explicit override in
// this project, so this is the effective ceiling for uploads.
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function humanizeStorageError(err: unknown, fileSize: number): Error {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "Falha no upload";
  const msg = raw.toLowerCase();
  if (msg.includes("exceeded") || msg.includes("payload too large") || msg.includes("413")) {
    return new Error(
      `Arquivo muito grande (${(fileSize / 1024 / 1024).toFixed(1)} MB). Limite: 50 MB.`,
    );
  }
  if (msg.includes("mime") || msg.includes("invalid_mime_type")) {
    return new Error("Tipo de arquivo não permitido.");
  }
  if (msg.includes("row-level security") || msg.includes("unauthorized") || msg.includes("permission")) {
    return new Error("Sem permissão para enviar. Faça login como administrador.");
  }
  if (msg.includes("duplicate")) {
    return new Error("Arquivo já existe. Tente novamente.");
  }
  return new Error(raw);
}

async function uploadAndSign(
  bucket: "vehicles" | "gallery" | "tours" | "experiences",
  file: File,
  folder?: string,
): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Limite: 50 MB.`,
    );
  }
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
  const path = `${folder ? folder + "/" : ""}${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined, upsert: false, cacheControl: "3600" });
  if (upErr) throw humanizeStorageError(upErr, file.size);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw humanizeStorageError(error ?? new Error("Falha ao gerar URL"), file.size);
  return data.signedUrl;
}

export type ExperienceMediaKind =
  | "cover"
  | "horizontal"
  | "vertical"
  | "preview"
  | "main"
  | "drone"
  | "onboard"
  | "video360"
  | "gallery"
  | "map";

export const StorageService = {
  uploadVehicleImage: (file: File) => uploadAndSign("vehicles", file),
  uploadGalleryImage: (file: File) => uploadAndSign("gallery", file),
  uploadTourImage: (file: File) => uploadAndSign("tours", file),
  uploadExperienceMedia: (file: File, kind: ExperienceMediaKind) =>
    uploadAndSign("experiences", file, kind),
};
