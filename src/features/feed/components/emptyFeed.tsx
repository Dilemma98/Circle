import "./emptyFeed.css";

export default function EmptyFeed() {
  return (
    <div className="empty-feed">
      <div className="empty-feed-icon">
        <span>✦</span>
      </div>

      <h3>Här börjar era minnen</h3>

      <p>
        När någon i dina grupper delar ett ögonblick
        dyker det upp här. Små vardagsstunder,
        stora händelser och allt däremellan.
      </p>
    </div>
  );
}