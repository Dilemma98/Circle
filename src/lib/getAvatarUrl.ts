import { supabase } from "./supabase";

export async function getAvatarUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  // If the URL is already valid, return it.
  if (storagePath.startsWith("http")) return storagePath;

  const { data, error } = await supabase.storage
    .from("circle-media")
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}