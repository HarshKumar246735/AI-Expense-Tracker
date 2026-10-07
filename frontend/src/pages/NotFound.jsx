import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>We could not find that page.</p>
      <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
    </div>
  );
}
