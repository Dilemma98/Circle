import type { GroupMember } from "../groupService";
import InvitationPanel from "./invitationPanel";
import Avatar from "../../../components/avatar";

interface GroupMembersProps {
  members: GroupMember[];
  loading: boolean;
  isOwner: boolean;
  groupId: string;
}

export default function GroupMembers({
  members,
  loading,
  isOwner,
  groupId,
}: GroupMembersProps) {
  return (
    <>
      {isOwner && <InvitationPanel groupId={groupId} />}

      <div className="group-members">
        {loading ? (
          <p>Hämtar medlemmar...</p>
        ) : (
          members.map((member) => (
            <div className="group-member" key={member.user_id}>
              <Avatar
                src={member.avatar_url}
                name={member.display_name ?? ""}
                size={44}
                className="group-member-avatar"
              />

              <div className="group-member-info">
                <strong>
                  {member.display_name ?? "Okänd användare"}
                </strong>

                <span>
                  {member.role === "owner" ? "Gruppägare" : "Medlem"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}