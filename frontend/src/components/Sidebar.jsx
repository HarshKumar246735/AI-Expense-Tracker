import { NavLink } from "react-router-dom";
import {
  BarChart3, Bell, FileText, LayoutDashboard, PiggyBank, Repeat, Settings, Tags, User, Wallet, ArrowLeftRight, X,
} from "lucide-react";
import "./Sidebar.css";

const MAIN = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
];
const ACCOUNT = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <Wallet size={22} />
          <span>AI Expense Tracker</span>
          <button type="button" className="btn-icon sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {MAIN.map((item) => <NavItem key={item.to} {...item} />)}
          <span className="sidebar-section">Account</span>
          {ACCOUNT.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
      </aside>
    </>
  );
}
