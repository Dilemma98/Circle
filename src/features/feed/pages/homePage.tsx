
import "./homePage.css";

import type { Post } from "../../posts/types/post";
import PostCard from "../../posts/components/postCard";
import type { ImagePreview } from "../../posts/hooks/useImagePreviews";

import { useState, useEffect } from "react";
import { useAuth } from "../../auth/authProvider";
import { getMyGroups } from "../../groups/groupService";
import type { Group } from "../../groups/types/group";

import {
  createPost,
  uploadPostImage,
  getGroupPosts,
} from "../../posts/services/postService";

import EmptyFeed from "../components/emptyFeed";
import CreatePostModal from "../../posts/components/createPostModal";

import { ImagePlus, PenLine } from "lucide-react";

export default function HomePage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const { profile } = useAuth();

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await getMyGroups();
        setGroups(data);

        const groupIds = data.map((group) => group.id);

        if (groupIds.length > 0) {
          const postsData = await getGroupPosts(groupIds);
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Could not load groups:", error);
      } finally {
        setGroupsLoading(false);
        setPostsLoading(false);
      }
    }

    loadGroups();
  }, []);

  function handleOpenCreatePost() {
    setIsCreatePostOpen(true);
  }

  function handleCloseCreatePost() {
    setIsCreatePostOpen(false);
  }

  async function handleCreatePost(
    content: string,
    groupId: string,
    images: ImagePreview[],
  ) {
    let savedPost: Awaited<ReturnType<typeof createPost>>;

    try {
      savedPost = await createPost(groupId, content);

      await Promise.all(
        images.map((image, index) =>
          uploadPostImage(groupId, savedPost.id, image, index),
        ),
      );
    } catch (error) {
      console.error("Could not create post:", error);
      return;
    }

    const newPost: Post = {
      id: savedPost.id,
      groupId,
      authorId: savedPost.author_id,
      authorName: profile?.display_name ?? "Okänd användare",
      authorAvatar: profile?.avatar_url ?? null,
      content,
      media: images.map((image) => ({
        id: crypto.randomUUID(),
        type: "image",
        url: URL.createObjectURL(image.file),
        caption: image.caption.trim() || undefined,
      })),
      createdAt: savedPost.created_at,
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
  }

  const initials =
    profile?.display_name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="home-page">
      <section className="feed-section">

        {/* Feed header */}
        <div className="feed-header">
          <div>
            <span className="feed-eyebrow">DIN CIRCLE</span>
            <h1>Ditt flöde</h1>
            <p>Se vad som händer bland dina människor.</p>
          </div>

          <div className="feed-group-count">
            {groups.length} {groups.length === 1 ? "grupp" : "grupper"}
          </div>
        </div>

        {/* Quick post composer */}
        <div className="quick-post-card">
          <div className="quick-post-top">
            <div className="quick-post-avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              type="button"
              className="quick-post-input"
              onClick={handleOpenCreatePost}
            >
              Vad vill du dela med dig av?
            </button>
          </div>

          <div className="quick-post-bottom">
            <button
              type="button"
              className="quick-post-action"
              onClick={handleOpenCreatePost}
            >
              <ImagePlus size={18} />
              Foto
            </button>

            <button
              type="button"
              className="quick-post-action"
              onClick={handleOpenCreatePost}
            >
              <PenLine size={17} />
              Skriv ett inlägg
            </button>
          </div>
        </div>

        {/* Posts */}
        {postsLoading ? (
          <div className="feed-loading">
            <span className="feed-loader" />
            <p>Laddar ditt flöde...</p>
          </div>
        ) : posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="post-list">
            {posts.map((post) => {
              const group = groups.find(
                (group) => group.id === post.groupId,
              );

              if (!group) return null;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  group={group}
                />
              );
            })}
          </div>
        )}
      </section>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        onCreatePost={handleCreatePost}
        groups={groupsLoading ? [] : groups}
      />
    </div>
  );
}
