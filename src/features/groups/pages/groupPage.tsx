import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth/authProvider";

import {
  getGroupById,
  getGroupMembers,
  type GroupMember,
} from "../groupService";

import type { Group } from "../types/group";

import {
  getGroupPosts,
  getGroupPhotos,
} from "../../posts/services/postService";
import GroupFeed from "../components/groupFeed";
import GroupAlbum from "../components/groupAlbum";
import GroupMembers from "../components/groupMembers";

import type { Post, GroupPhoto } from "../../posts/types/post";

import "./groupPage.css";

type GroupTab = "feed" | "album" | "members" | "settings";

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<GroupTab>("feed");
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [postPage, setPostPage] = useState(0);

  const [photos, setPhotos] = useState<GroupPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  const isOwner = members.some(
    (member) => member.user_id === user?.id && member.role === "owner",
  );

  const groupedPhotos = photos.reduce<Record<string, GroupPhoto[]>>(
    (groups, photo) => {
      const date = new Date(photo.createdAt).toLocaleDateString("sv-SE");

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(photo);

      return groups;
    },
    {},
  );

  useEffect(() => {
    async function loadGroup() {
      if (!groupId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getGroupById(groupId);
        setGroup(data);
      } catch (error) {
        console.error("Could not load group:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGroup();
  }, [groupId]);

  async function loadMembers() {
    if (!groupId) return;

    setMembersLoading(true);

    try {
      const data = await getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error("Could not load group members:", error);
    } finally {
      setMembersLoading(false);
    }
  }

  async function loadPosts() {
    if (!groupId) return;

    setPostsLoading(true);

    try {
      const result = await getGroupPosts([groupId], 0);

      setPosts(result.posts);
      setHasMorePosts(result.hasMore);
      setPostPage(0);
    } catch (error) {
      console.error("Could not load group posts:", error);
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadMorePosts() {
    if (!groupId || loadingMorePosts) return;

    const nextPage = postPage + 1;

    setLoadingMorePosts(true);

    try {
      const result = await getGroupPosts([groupId], nextPage);

      setPosts((currentPosts) => [...currentPosts, ...result.posts]);
      setPostPage(nextPage);
      setHasMorePosts(result.hasMore);
    } catch (error) {
      console.error("Could not load more group posts:", error);
    } finally {
      setLoadingMorePosts(false);
    }
  }

  async function loadPhotos() {
    if (!groupId) return;

    setPhotosLoading(true);

    try {
      const data = await getGroupPhotos(groupId);
      setPhotos(data);
    } catch (error) {
      console.error("Could not load group photos:", error);
    } finally {
      setPhotosLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  useEffect(() => {
    loadPosts();
  }, [groupId]);

  useEffect(() => {
    if (activeTab === "album") {
      loadPhotos();
    }
  }, [activeTab, groupId]);

  if (loading) {
    return <p>Hämtar gruppen...</p>;
  }

  if (!group) {
    return <p>Gruppen kunde inte hittas.</p>;
  }

  return (
    <div className="group-page">
      {group.coverImage && (
        <div className="group-cover-image">
          <img src={group.coverImage} alt={`Omslagsbild för ${group.name}`} />
        </div>
      )}

      <header className="group-page-header">
        <div className="group-page-heading">
          <div>
            <h1>{group.name}</h1>
            <p>Här samlas era gemensamma minnen.</p>
          </div>
        </div>
      </header>

      <nav className="group-tabs">
        <button
          className={activeTab === "feed" ? "active" : ""}
          onClick={() => setActiveTab("feed")}
        >
          Flöde
        </button>

        <button
          className={activeTab === "album" ? "active" : ""}
          onClick={() => setActiveTab("album")}
        >
          Album
        </button>

        <button
          className={activeTab === "members" ? "active" : ""}
          onClick={() => setActiveTab("members")}
        >
          Medlemmar
        </button>

        {isOwner && (
          <button
            type="button"
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => navigate(`/groups/${group.id}/settings`)}
          >
            {/* <span>⚙</span> */}
            Inställningar
          </button>
        )}
      </nav>

      <section className="group-tab-content">
        {activeTab === "feed" && (
          <GroupFeed
            posts={posts}
            group={group}
            loading={postsLoading}
            hasMore={hasMorePosts}
            loadingMore={loadingMorePosts}
            onLoadMore={loadMorePosts}
          />
        )}

        {activeTab === "album" && (
          <GroupAlbum photos={photos} loading={photosLoading} />
        )}

        {activeTab === "members" && (
          <GroupMembers
            members={members}
            loading={membersLoading}
            isOwner={isOwner}
            groupId={group.id}
          />
        )}
      </section>
    </div>
  );
}
