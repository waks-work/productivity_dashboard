import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
/* import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Task from "./pages/Task/Task";
import NotFound from "./pages/NotFound/Notfound"; */
import LoginRegister from "./pages/Login/Login.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginRegister />} />
        {
          /*<Route path="/profile" element={<Profile />} />
        <Route path="/task" element={<Task />} />
        <Route path="/notfound" element={<NotFound />} />*/
        }
      </Routes>
    </Router>
  );
}

export default App;

