import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";
import * as userApi from "../api/userApi";
import { useAuth } from "../hooks/useAuth";
import { CURRENCIES } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import "./Profile.css";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    currency: user.currency,
    monthlyIncome: String(user.monthlyIncome ?? 0),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.monthlyIncome === "" || Number(form.monthlyIncome) < 0) next.monthlyIncome = "Enter 0 or more";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const res = await userApi.updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        currency: form.currency,
        monthlyIncome: Number(form.monthlyIncome),
      });
      updateUser(res.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return toast.error("Choose a JPG, PNG or WebP image");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be 2 MB or smaller");

    setUploading(true);
    try {
      const res = await userApi.uploadAvatar(file);
      updateUser(res.data.user);
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="stack profile-page">
      <PageHeader title="Profile" subtitle="Your personal details." />

      <section className="card profile-avatar-card">
        <Avatar user={user} size={92} />
        <div>
          <h3>{user.name}</h3>
          <p className="muted">{user.email}</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
          <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Camera size={15} /> {uploading ? "Uploading..." : "Change picture"}
          </button>
        </div>
      </section>

      <form className="card" onSubmit={handleSave} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="pf-name">Name</label>
            <input id="pf-name" className="input" value={form.name} onChange={set("name")} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-email">Email</label>
            <input id="pf-email" className="input" type="email" value={form.email} onChange={set("email")} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-currency">Currency</label>
            <select id="pf-currency" className="select" value={form.currency} onChange={set("currency")}>
              {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-income">Monthly income</label>
            <input id="pf-income" className="input" type="number" min="0" value={form.monthlyIncome} onChange={set("monthlyIncome")} />
            {errors.monthlyIncome && <span className="field-error">{errors.monthlyIncome}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </div>
      </form>
    </div>
  );
}
