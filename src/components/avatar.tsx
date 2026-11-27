
import "./avatar.css";

import { UserRound } from "lucide-react";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: number;
  fallback?: "initials" | "icon";
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 40,
  fallback = "initials",
  className = "",
}: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div
      className={`avatar ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
  src={src}
  alt=""
  loading="lazy"
  decoding="async"
/>
      ) : fallback === "icon" ? (
        <UserRound />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}
