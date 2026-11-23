import { supabase } from "../../../lib/supabase";
import { getAvatarUrl } from "../../../lib/getAvatarUrl";

export const LIKE = "like";

export async function getReactionSummary(postId: string, userId: string) {
  const { data: reactions, error } = await supabase
    .from("reactions")
    .select("user_id")
    .eq("post_id", postId)
    .eq("type", LIKE);

  if (error) throw error;

  const rows = reactions ?? [];
  const userIds = rows.map((row) => row.user_id);

  let profiles: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  }[] = [];

  if (userIds.length > 0) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    if (profileError) throw profileError;

    profiles = await Promise.all(
  (data ?? []).map(async (profile) => ({
    ...profile,
    avatar_url: await getAvatarUrl(profile.avatar_url),
  }))
);
  }
  return {
    count: rows.length,
    reacted: rows.some((row) => row.user_id === userId),
    profiles,
  };
}

export async function addReaction(postId: string, userId: string) {
  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, user_id: userId, type: LIKE });

  if (error) throw error;
}

export async function removeReaction(postId: string, userId: string) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
    .eq("type", LIKE);

  if (error) throw error;
}
