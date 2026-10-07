import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import * as userApi from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { CURRENCIES } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/PageHeader";
import "./Settings.css";

const PREFS = [
  { key: "budgetAlerts", label: "Budget alerts", hint: "When a budget reaches 75%, 90% or is exceeded" },
  { key: "recurringReminders", label: "Recurring reminders", hint: "A few days before a recurring payment is due" },
  { key: "unusualExpense", label: "Unusual expenses", hint: "When an expense is far above your normal for a category" },
  { key: "monthlySummary", label: "Monthly summary", hint: "A recap at the start of every month" },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  const save = async (patch, message = "Settings saved") => {
    try {
      const res = await userApi.updateSettings(patch);
      updateUser(res.data.user);
      toast.success(message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!pw.currentPassword) next.currentPassword = "Enter your current password";
    if (pw.newPassword.length < 8) next.newPassword = "Password must be at least 8 characters";
    else if (!/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) next.newPassword = "Password must include a letter and a number";
    if (pw.confirmPassword !== pw.newPassword) next.confirmPassword = "Passwords do not match";
    setPwErrors(next);
    if (Object.keys(next).length) return;

    setPwSaving(true);
    try {
      await userApi.changePassword(pw);
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  const setField = (field) => (e) => setPw((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="stack settings-page">
      <PageHeader title="Settings" subtitle="Appearance, notifications and security." />

      <section className="card">
        <h3>Appearance</h3>
        <div className="settings-theme" role="radiogroup" aria-label="Theme">
          {[{ v: "light", label: "Light", Icon: Sun }, { v: "dark", label: "Dark", Icon: Moon }].map(({ v, label, Icon }) => (
            <button key={v} type="button" role="radio" aria-checked={theme === v} className={`settings-theme-btn${theme === v ? " active" : ""}`} onClick={() => setTheme(v)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Currency</h3>
        <div className="field settings-currency">
          <label htmlFor="st-currency">Display currency</label>
          <select id="st-currency" className="select" value={user.currency} onChange={(e) => save({ currency: e.target.value }, "Currency updated")}>
            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="muted">Only changes how amounts are displayed. Existing amounts are not converted.</span>
        </div>
      </section>

      <section className="card">
        <h3>Notifications</h3>
        <ul className="settings-prefs">
          {PREFS.map((p) => (
            <li key={p.key}>
              <label>
                <input type="checkbox" checked={user.notificationPrefs?.[p.key] !== false} onChange={(e) => save({ notificationPrefs: { [p.key]: e.target.checked } })} />
                <span><strong>{p.label}</strong><small className="muted">{p.hint}</small></span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <form className="card" onSubmit={changePassword} noValidate>
        <h3>Security</h3>
        <div className="form-grid">
          <div className="field full">
            <label htmlFor="st-current">Current password</label>
            <input id="st-current" className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={setField("currentPassword")} />
            {pwErrors.currentPassword && <span className="field-error">{pwErrors.currentPassword}</span>}
          </div>
          <div className="field">
            <label htmlFor="st-new">New password</label>
            <input id="st-new" className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={setField("newPassword")} />
            {pwErrors.newPassword && <span className="field-error">{pwErrors.newPassword}</span>}
          </div>
          <div className="field">
            <label htmlFor="st-confirm">Confirm new password</label>
            <input id="st-confirm" className="input" type="password" autoComplete="new-password" value={pw.confirmPassword} onChange={setField("confirmPassword")} />
            {pwErrors.confirmPassword && <span className="field-error">{pwErrors.confirmPassword}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={pwSaving}>{pwSaving ? "Updating..." : "Change password"}</button>
        </div>
      </form>
    </div>
  );
}
