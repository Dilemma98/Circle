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
} from "../../posts/postService";

import FeedToolbar from "../components/feedToolbar";
import EmptyFeed from "../components/emptyFeed";
import CreatePostModal from "../../posts/components/createPostModal";
import CreatePostButton from "../../posts/components/createPostButton";

export default function HomePage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
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

  return (
    <div className="home-page">
      <section className="feed-section">
        <h2>Hej {profile?.display_name ?? "där"}! 👋</h2>
        <FeedToolbar />

        {posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="post-list">
            {posts.map((post) => {
              const group = groups.find((group) => group.id === post.groupId);

              if (!group) return null;

              return <PostCard key={post.id} post={post} group={group} />;
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
      <CreatePostButton onClick={handleOpenCreatePost} />
    </div>
  );
}
