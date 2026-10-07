import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Plus, Settings, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import "./Topbar.css";

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <button type="button" className="btn-icon topbar-menu" onClick={onMenu} aria-label="Open menu">
        <Menu size={21} />
      </button>
      <div className="topbar-spacer" />
      <Link to="/transactions/add" className="btn btn-primary btn-sm topbar-add">
        <Plus size={16} /> <span>Add transaction</span>
      </Link>
      <NotificationBell />
      <ThemeToggle />
      <div className="topbar-user" ref={menuRef}>
        <button type="button" className="topbar-user-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
          <Avatar user={user} size={34} />
          <span className="topbar-name">{user?.name}</span>
        </button>
        {open && (
          <div className="topbar-menu-pop card" role="menu">
            <div className="topbar-email muted">{user?.email}</div>
            <Link to="/profile" role="menuitem" onClick={() => setOpen(false)}><User size={15} /> Profile</Link>
            <Link to="/settings" role="menuitem" onClick={() => setOpen(false)}><Settings size={15} /> Settings</Link>
            <button type="button" role="menuitem" onClick={handleLogout}><LogOut size={15} /> Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
