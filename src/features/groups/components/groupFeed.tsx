import type { Post } from "../../posts/types/post";
import type { Group } from "../types/group";
import PostCard from "../../posts/components/postCard";

interface GroupFeedProps {
  posts: Post[];
  group: Group;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function GroupFeed({
  posts,
  group,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
}: GroupFeedProps) {
  return (
    <div className="group-feed">
      {loading ? (
        <p>Hämtar inlägg...</p>
      ) : posts.length === 0 ? (
        <p>Här var det tomt! Dela ett minne med gruppen.</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} group={group} />
        ))
      )}

      {hasMore && (
        <button
          type="button"
          className="load-more-button"
          onClick={onLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "Hämtar..." : "Ladda fler inlägg"}
        </button>
      )}
    </div>
  );
}