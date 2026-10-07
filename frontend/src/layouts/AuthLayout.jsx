import { Outlet } from "react-router-dom";
import { PiggyBank, Sparkles, ShieldCheck, Wallet } from "lucide-react";
import "./AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo"><Wallet size={26} /> AI Expense Tracker</div>
          <h2>Know where your money goes.</h2>
          <ul>
            <li><Sparkles size={18} /> Type an expense in plain English and AI fills in the details</li>
            <li><PiggyBank size={18} /> Budgets, alerts and recurring payments in one place</li>
            <li><ShieldCheck size={18} /> Your data stays private to your account</li>
          </ul>
        </div>
      </aside>
      <main className="auth-panel">
        <div className="auth-card card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
