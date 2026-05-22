import React, { useEffect, useState, useCallback, memo } from 'react';
import './Workspace.css';
import './Dashboard.css';
import ApiService from '../../services/ApiService';
import Whiteboard from './Whiteboard';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Workspace } from './Workspace';

export interface UserProfile {
    id?: string;
    username?: string;
    email: string;
    timezone?: string;
    profile_pic?: string;
}

export const Dashboard = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("Overview");
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeProfile, setActiveProfile] = useState<number | null>(null);
    const navigate = useNavigate()
    const { logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const taskResponse = await ApiService.tasks.getAll<any>();
                setTasks(taskResponse.data);

                const profileResponse = await ApiService.users.getUserProfile<UserProfile>()
                setUser(profileResponse.data);

            } catch (err) {
                console.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        const logoutR = await logout();
        navigate("/");
    }

    const toggleProfile = (index: number) => {
        setActiveProfile(prev => prev === index ? null : index);
    };

    const getDisplayName = (email?: string) => {
        if (!email) return "User";

        return email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="logo">TaskMaster</div>
                <nav>
                    <ul>
                        <li
                            className={activeView === "Overview" ? "active" : ""}
                            onClick={() => setActiveView("Overview")}
                        > Overview
                        </li>
                        <li
                            className={activeView === "Workspace" ? "active" : ""}
                            onClick={() => setActiveView("Workspace")}
                        >Workspace
                        </li>
                        <li
                            className={activeView === "Whiteboard" ? "active" : ""}
                            onClick={() => setActiveView("Whiteboard")}
                        > Whiteboard
                        </li>
                        <li
                            className={activeView === "Analytics" ? "active" : ""}
                            onClick={() => setActiveView("Analytics")}
                        > Analytics</li>
                        <li
                            className={activeView === "Settings" ? "active" : ""}
                            onClick={() => setActiveView("Settings")}
                        > Settings</li>
                    </ul>
                </nav>
            </aside>

            <main className="main-content">
                {activeView === "Overview" && (
                    <>
                        <header className="top-bar">
                            <h1>Dashboard Overview</h1>
                            <div className="users-container">
                                <div className="profile-wrapper">
                                    <div
                                        className="user-profile"
                                        onClick={() => setActiveProfile(activeProfile ? null : 1)}
                                    >
                                        {user?.profile_pic ? (
                                            <img
                                                src={user.profile_pic}
                                                alt="profile"
                                                className='profile-image'
                                            />) : (
                                            getDisplayName(user?.email).charAt(0)
                                        )}
                                    </div>

                                    {activeProfile && (
                                        <div className="profile-dropdown">
                                            <div className="profile-header">
                                                <div className="profile-avatar">
                                                    {user?.profile_pic ? (
                                                        <img
                                                            src={user.profile_pic}
                                                            alt="profile"
                                                            className='profile-avatar-image'
                                                        />) : (
                                                        getDisplayName(user?.email).charAt(0)
                                                    )}
                                                </div>

                                                <div>
                                                    <h3>{getDisplayName(user?.email)}</h3>
                                                    <p>{user?.timezone}</p>
                                                </div>
                                            </div>

                                            <div className="profile-menu">
                                                <button onClick={() => navigate("/profile")}>Profile</button>
                                                <button>Settings</button>
                                                <button>Analytics</button>

                                                <div className="divider"></div>

                                                <button className="logout-btn" onClick={handleLogout}>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>

                        <section className="stats-grid">
                            <div className="stat-card"><h3>Active Tasks</h3><p>{tasks.length}</p></div>
                            <div className="stat-card"><h3>Productivity</h3><p>87%</p></div>
                            <div className="stat-card"><h3>Completed</h3><p>24</p></div>
                        </section>

                        <section className="task-list">
                            <h2>Recent Tasks</h2>
                            {loading ? <p>Loading...</p> : (
                                <ul>
                                    {tasks.map(task => (
                                        <li key={task.id} className="task-item">
                                            <div className="task-left">
                                                <h3>{task.title}</h3>
                                                <div className="task-badges">
                                                    <span className={`status ${task.status}`} >
                                                        {task.status_display}
                                                    </span>
                                                    <span className={`priority ${task.priority}`} >
                                                        {task.priority_display}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="task-right">
                                                <p> Assigned to: <span>{getDisplayName(user?.email)}</span> </p>
                                                <p> Deadline:
                                                    <span>
                                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                                                    </span>
                                                </p>
                                                <p> Created:
                                                    <span>
                                                        {new Date(task.created_at).toLocaleDateString()}
                                                    </span>
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}

                {activeView === "Workspace" && (
                    <section className="workspace-area">
                        < Workspace />
                    </section>
                )}
                {activeView === "Whiteboard" && (
                    <section className="whiteboard-area">
                        <h2>Whiteboard Canvas</h2>
                        <Whiteboard />
                    </section>
                )}

                {activeView === "Analytics" && (
                    <section className="analytics-area">
                        <h2>User Analytics</h2>
                    </section>
                )}

                {activeView === "Settings" && (
                    <section className="settings-area">
                        <h2>User settings</h2>
                    </section>
                )}
            </main>
        </div >
    );
};

