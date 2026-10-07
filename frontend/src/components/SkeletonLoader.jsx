import "./SkeletonLoader.css";

export default function SkeletonLoader({ height = 18, width = "100%", count = 1, radius = 8 }) {
  return (
    <div className="skeleton-group" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="skeleton" style={{ height, width: i === count - 1 && count > 1 ? "70%" : width, borderRadius: radius }} />
      ))}
    </div>
  );
}
