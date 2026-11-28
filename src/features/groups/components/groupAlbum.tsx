import type { GroupPhoto } from "../../posts/types/post";
import Avatar from "../../../components/avatar";

interface GroupAlbumProps {
  photos: GroupPhoto[];
  loading: boolean;
}

export default function GroupAlbum({
  photos,
  loading,
}: GroupAlbumProps) {
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

  if (loading) {
    return <p>Hämtar bilder...</p>;
  }

  if (photos.length === 0) {
    return (
      <p className="group-album-empty">
        Inga bilder ännu. Dela ett foto i gruppens flöde!
      </p>
    );
  }

  return (
    <div className="group-album-container">
      {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
        <div className="album-date-group" key={date}>
          <h3 className="album-date-heading">
            {new Date(`${date}T12:00:00`).toLocaleDateString("sv-SE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>

          <div className="group-album">
            {datePhotos.map((photo) => (
              <div className="group-album-photo" key={photo.id}>
                <img
                  className="album-image"
                  src={photo.url}
                  alt={photo.caption || "Bild i gruppens album"}
                  loading="lazy"
                  decoding="async"
                />

                <Avatar
                  src={photo.authorAvatar}
                  name={photo.authorName}
                  size={32}
                  className="album-photo-author"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}