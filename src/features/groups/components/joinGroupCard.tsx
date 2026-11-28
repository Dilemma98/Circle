import { Link } from "react-router-dom";
import { UsersRound } from "lucide-react";

export default function JoinGroupCard() {
  return (
    <Link
      to="/invite"
      className="create-group-card join-group-card"
    >
      <span className="create-group-icon">
        <UsersRound size={24} />
      </span>

      <span>Gå med i grupp</span>
    </Link>
  );
}