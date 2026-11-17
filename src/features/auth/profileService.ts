
import { supabase } from "../../lib/supabase";
import type { Profile } from "./types/profile";

// Create a temporary URL for a private profile image.
export async function getAvatarUrl(
  storagePath: string | null
): Promise<string | null> {
  if (!storagePath) return null;

  // Allow existing external image URLs.
  if (storagePath.startsWith("http")) {
    return storagePath;
  }

  const { data, error } = await supabase.storage
    .from("circle-media")
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}

// Get the currently logged-in user's profile.
export async function getMyProfile(): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Ingen användare är inloggad.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return {
    ...data,
    avatar_url: await getAvatarUrl(data.avatar_url),
  } as Profile;
}

// Update the user's profile information.
export async function updateMyProfile(
  updates: Partial<Pick<Profile, "display_name" | "avatar_url">>
): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Ingen användare är inloggad.");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;

  return getMyProfile();
}

// Upload a new profile image.
export async function uploadProfileAvatar(
  file: File
): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Ingen användare är inloggad.");

  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (!fileExtension) {
    throw new Error("Bilden saknar filändelse.");
  }

  const filePath = `${user.id}/avatar.${fileExtension}`;

  const {
  data: { session },
} = await supabase.auth.getSession();

console.log("Upload auth debug:", {
  userId: user.id,
  sessionUserId: session?.user.id,
  hasAccessToken: !!session?.access_token,
  filePath,
});

  const { data, error } = await supabase.storage
    .from("circle-media")
    
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  await updateMyProfile({
    avatar_url: data.path,
  });

  return getMyProfile();
}
