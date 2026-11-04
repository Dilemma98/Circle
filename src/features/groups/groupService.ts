import { supabase } from "../../lib/supabase";
import type { Group } from "./types/group";

export async function getMyGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
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
  };

  const { error } = await supabase
    .from("groups")
    .insert(newGroup);

  if (error) throw error;

  return {
    id: newGroup.id,
    name: newGroup.name,
  };
}

export async function getGroupById(
  groupId: string
): Promise<Group | null> {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name")
    .eq("id", groupId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export interface GroupMember {
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  display_name: string | null;
  avatar_url: string | null;
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

  return members.map((member) => {
    const profile = profiles?.find(
      (profile) => profile.id === member.user_id
    );

    return {
      ...member,
      display_name: profile?.display_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    };
  });
}