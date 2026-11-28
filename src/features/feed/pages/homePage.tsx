import "./homePage.css";

import type { Post } from "../../posts/types/post";
import PostCard from "../../posts/components/postCard";
import type { ImagePreview } from "../../posts/hooks/useImagePreviews";

import { useLocation, useNavigate } from "react-router-dom";
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

export default function HomePage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
const [hasMorePosts, setHasMorePosts] = useState(false);
const [loadingMorePosts, setLoadingMorePosts] = useState(false);
const [postPage, setPostPage] = useState(0);

  const { profile } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openCreatePost) {
      setIsCreatePostOpen(true);

      // Clear the navigation state so the modal does not reopen on refresh.
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location.pathname, location.state, navigate]);

  async function loadMorePosts() {
  if (groups.length === 0 || loadingMorePosts) return;

  const nextPage = postPage + 1;

  setLoadingMorePosts(true);

  try {
    const result = await getGroupPosts(
      groups.map((group) => group.id),
      nextPage,
    );

    setPosts((currentPosts) => [
      ...currentPosts,
      ...result.posts,
    ]);

    setPostPage(nextPage);
    setHasMorePosts(result.hasMore);
  } catch (error) {
    console.error("Could not load more posts:", error);
  } finally {
    setLoadingMorePosts(false);
  }
}

  useEffect(() => {
    async function loadGroups() {
      try {
        const data = await getMyGroups();
        setGroups(data);

        const groupIds = data.map((group) => group.id);

        if (groupIds.length > 0) {
         const result = await getGroupPosts(groupIds, 0);

setPosts(result.posts);
setHasMorePosts(result.hasMore);
setPostPage(0);
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
              const group = groups.find((group) => group.id === post.groupId);

              if (!group) return null;

              return <PostCard key={post.id} post={post} group={group} />;
            })}
          </div>
        )}
        {hasMorePosts && (
  <button
    type="button"
    className="load-more-button"
    onClick={loadMorePosts}
    disabled={loadingMorePosts}
  >
    {loadingMorePosts ? "Hämtar..." : "Ladda fler inlägg"}
  </button>
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
