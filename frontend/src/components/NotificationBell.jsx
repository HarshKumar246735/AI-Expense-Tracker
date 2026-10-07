import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import * as notificationApi from "../api/notificationApi";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      notificationApi
        .unreadCount()
        .then((res) => !cancelled && setCount(res.data.unreadCount))
        .catch(() => {});
    load();
    const id = setInterval(load, 60000);
    window.addEventListener("notifications:changed", load);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("notifications:changed", load);
    };
  }, [location.pathname]);

  return (
    <Link to="/notifications" className="bell btn-icon" aria-label={`Notifications${count ? `, ${count} unread` : ""}`}>
      <Bell size={19} />
      {count > 0 && <span className="bell-badge">{count > 9 ? "9+" : count}</span>}
    </Link>
  );
}
