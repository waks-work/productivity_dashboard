import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login'
import Profile from './pages/Profile/Profile'
import Task from './pages/Task/Task'
import NotFound from './pages/NotFound/Notfound'


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/task' element={<Task/>}/>
        <Route path='/notfound' element={<NotFound/>}/>
      </Routes>
    </Router>
  );
}

export default App;