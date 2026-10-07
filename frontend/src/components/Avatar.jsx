import "./Avatar.css";

export default function Avatar({ user, size = 36 }) {
  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return user?.avatar ? (
    <img className="avatar" src={user.avatar} alt={user.name} style={{ width: size, height: size }} />
  ) : (
    <span className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials}
    </span>
  );
}
