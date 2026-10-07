import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CategoryProvider } from "./context/CategoryContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const TransactionFormPage = lazy(() => import("./pages/TransactionFormPage"));
const Categories = lazy(() => import("./pages/Categories"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Recurring = lazy(() => import("./pages/Recurring"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="spinner-center" role="status">
    <span className="spinner" />
    <span>Loading...</span>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CategoryProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/add" element={<TransactionFormPage />} />
                <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/recurring" element={<Recurring />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </CategoryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
