import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginForm } from "./pages/Login/Login";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { SignInForm } from "./pages/Login/SignIn";
import { ProtectedRoute } from "./pages/Login/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { NotFound } from "./pages/NotFound/Notfound";
import { Profile } from "./pages/Profile/Profile";
import { CustomWhiteboard } from "./pages/Dashboard/CustomWhiteboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signin" element=<SignInForm /> />
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/custom-wb" element={<CustomWhiteboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router >
    );
}

export default App;
