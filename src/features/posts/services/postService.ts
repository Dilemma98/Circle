import { supabase } from "../../../lib/supabase";
import { optimizeImage } from "../../../lib/optimizeImage";
import type { ImagePreview } from "../hooks/useImagePreviews";
import type { GroupPhoto } from "../types/post";
import { getAvatarUrl } from "../../auth/profileService";

export async function createPost(
  groupId: string,
  content: string,
): Promise<{
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  created_at: string;
}> {
  // Get the currently logged-in user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not logged in.");

  // Create a new post.
  const { data, error } = await supabase
    .from("posts")
    .insert({
      group_id: groupId,
      author_id: user.id,
      content: content,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function uploadPostImage(
  groupId: string,
  postId: string,
  image: ImagePreview,
  position: number,
) {
  const optimizedFile = await optimizeImage(image.file, 1600);

const fileExtension = "webp";
  const filePath = `${groupId}/${postId}/${image.id}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("circle-media")
    .upload(filePath, optimizedFile);

  if (error) throw error;

  const { error: mediaError } = await supabase.from("post_media").insert({
    post_id: postId,
    type: "image",
    storage_path: data.path,
    caption: image.caption.trim() || null,
    position,
  });

  if (mediaError) throw mediaError;

  return data.path;
}

export async function getGroupPosts(groupIds: string[]) {
  const { data, error } = await supabase
    .from("posts")
    .select("*, comments(count)")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const postIds = data.map((post) => post.id);

  const authorIds = [...new Set(data.map((post) => post.author_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", authorIds);

  if (profilesError) throw profilesError;

  const profilesWithAvatars = await Promise.all(
  profiles.map(async (profile) => ({
    ...profile,
    avatar_url: await getAvatarUrl(profile.avatar_url),
  }))
);

  const { data: mediaData, error: mediaError } = await supabase
    .from("post_media")
    .select("*")
    .in("post_id", postIds)
    .order("position", { ascending: true });

  if (mediaError) throw mediaError;

  const mediaWithUrls = await Promise.all(
    mediaData.map(async (media) => {
      const { data, error } = await supabase.storage
        .from("circle-media")
        .createSignedUrl(media.storage_path, 3600);

      if (error) throw error;

      return {
        ...media,
        url: data.signedUrl,
      };
    }),
  );

  return data.map((post) => {
    const author = profilesWithAvatars.find(
  (profile) => profile.id === post.author_id
);

    return {
      id: post.id,
      groupId: post.group_id,
      authorId: post.author_id,
      authorName: author?.display_name ?? "Okänd användare",
      authorAvatar: author?.avatar_url ?? null,
      content: post.content,
      createdAt: post.created_at,
      commentCount: post.comments?.[0]?.count ?? 0,

      media: mediaWithUrls
        .filter((media) => media.post_id === post.id)
        .map((media) => ({
          id: media.id,
          type: media.type,
          url: media.url,
          caption: media.caption ?? undefined,
        })),
    };
  });
}

export async function getGroupPhotos(
  groupId: string,
): Promise<GroupPhoto[]> {
  // Get all posts from the selected group.
  const posts = await getGroupPosts([groupId]);

  // Extract every image from the posts.
  const photos = posts.flatMap((post) =>
    post.media
      .filter((media) => media.type === "image")
      .map((image) => ({
        id: image.id,
        postId: post.id,
        url: image.url,
        caption: image.caption,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        createdAt: post.createdAt,
      })),
  );

  return photos;
}
