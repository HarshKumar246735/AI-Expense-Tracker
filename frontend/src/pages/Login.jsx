import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utils/errors";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-sub">Log in to see your finances.</p>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && <p className="alert alert-error" role="alert">{serverError}</p>}
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div className="pw-wrap">
            <input id="login-password" className="input" type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={set("password")} />
            <button type="button" className="btn-icon pw-toggle" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Logging in..." : "Log in"}</button>
      </form>
      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
    </>
  );
}
