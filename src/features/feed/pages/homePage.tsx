import "./homePage.css";

import type { Post } from "../../posts/types/post";
import PostCard from "../../posts/components/postCard";
import type { ImagePreview } from "../../posts/hooks/useImagePreviews";

import { useState } from "react";
import { mockGroups } from "../../groups/data/mockGroups";

import FeedToolbar from "../components/feedToolbar";
import EmptyFeed from "../components/emptyFeed";
import CreatePostModal from "../../posts/components/createPostModal";
import CreatePostButton from "../../posts/components/createPostButton";

export default function HomePage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  function handleOpenCreatePost() {
    setIsCreatePostOpen(true);
  }

  function handleCloseCreatePost() {
    setIsCreatePostOpen(false);
  }

function handleCreatePost(
  content: string,
  groupId: string,
  images: ImagePreview[],
) {
  const newPost: Post = {
    id: crypto.randomUUID(),
    groupId,
    authorId: "current-user",
    content,
    media: images.map((image) => ({
      id: crypto.randomUUID(),
      type: "image",
      url: URL.createObjectURL(image.file),
      caption: image.caption.trim() || undefined,
    })),
    createdAt: new Date().toISOString(),
  };

  setPosts((currentPosts) => [newPost, ...currentPosts]);
}

  return (
    <div className="home-page">

      <section className="feed-section">
        <FeedToolbar />

        {posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="post-list">
            {posts.map((post) => {
              const group = mockGroups.find(
                (group) => group.id === post.groupId,
              );

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
        groups={mockGroups}
      />
      <CreatePostButton onClick={handleOpenCreatePost} />
    </div>
  );
}
