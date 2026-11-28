import { supabase } from "../../lib/supabase";
import type { Group } from "./types/group";
import { getAvatarUrl } from "../../lib/getAvatarUrl";

export interface GroupMember {
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
}

export async function getMyGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, coverImage, color")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return Promise.all(
  data.map(async (group) => ({
    ...group,
    coverImage: (await getGroupCoverUrl(group.coverImage)) ?? "",
  })),
);
}

// Create a new group.
export async function createGroup(name: string): Promise<Group> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("Du måste vara inloggad för att skapa en grupp.");
  }

  const newGroup = {
    id: crypto.randomUUID(),
    name: name.trim(),
    created_by: user.id,
    coverImage: "",
    color: "#B94D79",
  };

  const { error } = await supabase
    .from("groups")
    .insert(newGroup);

  if (error) throw error;

  return newGroup;
}


export async function getGroupById(
  groupId: string,
): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, coverImage, color")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

return {
  ...data,
  coverImage: (await getGroupCoverUrl(data.coverImage)) ?? "",
};
}

export async function updateGroupColor(
  groupId: string,
  color: string,
): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .update({ color })
    .eq("id", groupId);

  if (error) throw error;
}

export async function getGroupMembers(
  groupId: string
): Promise<GroupMember[]> {
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (membersError) throw membersError;

  if (!members || members.length === 0) {
    return [];
  }

  const userIds = members.map((member) => member.user_id);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  if (profilesError) throw profilesError;

return Promise.all(
  members.map(async (member) => {
    const profile = profiles?.find(
      (profile) => profile.id === member.user_id,
    );

    return {
      ...member,
      display_name: profile?.display_name ?? null,
      avatar_url: await getAvatarUrl(profile?.avatar_url ?? null),
    };
  }),
);
}

export async function updateGroupName(
  groupId: string,
  name: string,
): Promise<void> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Gruppnamnet får inte vara tomt.");
  }

  const { error } = await supabase
    .from("groups")
    .update({ name: trimmedName })
    .eq("id", groupId);

  if (error) throw error;
}
// Create a signed URL for a group's cover image.
export async function getGroupCoverUrl(
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;

  // The database may contain an empty path for groups without a cover.
  if (storagePath.startsWith("http")) return storagePath;

  const { data, error } = await supabase.storage
    .from("circle-media")
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}

// Upload or replace a group's cover image.
export async function uploadGroupCover(
  groupId: string,
  file: File,
): Promise<string> {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensions[file.type];

  if (!extension) {
    throw new Error("Välj en bild i JPG-, PNG- eller WebP-format.");
  }

  // Get the current cover image path.
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("coverImage")
    .eq("id", groupId)
    .single();

  if (groupError) throw groupError;

  const newPath = `${groupId}/cover.${extension}`;

  // Upload the new image.
  const { data, error: uploadError } = await supabase.storage
    .from("circle-media")
    .upload(newPath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // Save the storage path in the groups table.
  const { error: updateError } = await supabase
    .from("groups")
    .update({ coverImage: data.path })
    .eq("id", groupId);

  if (updateError) throw updateError;

  // Remove the previous image if its file path has changed.
  const oldPath = group.coverImage;

  if (oldPath && oldPath !== data.path && !oldPath.startsWith("http")) {
    const { error: removeError } = await supabase.storage
      .from("circle-media")
      .remove([oldPath]);

    if (removeError) {
      console.error("Could not remove the previous cover image:", removeError);
    }
  }

  return data.path;
}