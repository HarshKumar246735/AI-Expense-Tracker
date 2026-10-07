import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) next.password = "Password must include a letter and a number";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      toast.success("Account created. Welcome aboard!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-sub">Start tracking income, expenses and budgets.</p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && <p className="alert alert-error" role="alert">{serverError}</p>}
        <div className="field">
          <label htmlFor="reg-name">Name</label>
          <input id="reg-name" className="input" autoComplete="name" value={form.name} onChange={set("name")} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <div className="pw-wrap">
            <input id="reg-password" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={set("password")} />
            <button type="button" className="btn-icon pw-toggle" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password ? <span className="field-error">{errors.password}</span> : <span className="muted" style={{ fontSize: 12 }}>At least 8 characters with a letter and a number</span>}
        </div>
        <div className="field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <input id="reg-confirm" className="input" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={set("confirmPassword")} />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Creating account..." : "Create account"}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </>
  );
}
