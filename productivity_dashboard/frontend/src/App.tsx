import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginForm } from "./pages/Login/Login";
import { DashBoard } from "./pages/Dashboard/Dashboard";
import { JSX } from "react";
import { SignInForm } from "./pages/Login/SignIn";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem("access");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signin" element=<SignInForm /> />
        <Route path="/dashboard" element=<DashBoard /> />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
