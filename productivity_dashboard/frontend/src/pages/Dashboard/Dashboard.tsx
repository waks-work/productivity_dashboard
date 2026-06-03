import React, { useEffect, useState, useCallback, memo } from 'react';
import './Workspace.css';
import './Dashboard.css';
import ApiService from '../../services/ApiService';
import Whiteboard from './Whiteboard';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Workspace } from './Workspace';
import { Journal } from './Journal';

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
                console.error("Failed to load dashboard data: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
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
            <header className="dashboard-navbar">
                <div className="dashboard-logo">
                    TaskMaster
                </div>
                <nav className="dashboard-nav">
                    <button
                        className={activeView === "Overview" ? "active-nav" : ""}
                        onClick={() => setActiveView("Overview")}
                    > Overview </button>
                    <button
                        className={activeView === "Workspace" ? "active-nav" : ""}
                        onClick={() => setActiveView("Workspace")}
                    > Workspace </button>
                    <button
                        className={activeView === "Whiteboard" ? "active-nav" : ""}
                        onClick={() => setActiveView("Whiteboard")}
                    > Whiteboard </button>
                    <button
                        className={activeView === "Journal" ? "active-nav" : ""}
                        onClick={() => setActiveView("Journal")}
                    > Journal </button>
                    <button
                        className={activeView === "Analytics" ? "active-nav" : ""}
                        onClick={() => setActiveView("Analytics")}
                    > Analytics </button>
                    <button
                        className={activeView === "Settings" ? "active-nav" : ""}
                        onClick={() => setActiveView("Settings")}
                    > Settings </button>
                </nav>

                <div className="navbar-profile">
                    <div
                        className="user-profile"
                        onClick={() => setActiveProfile(activeProfile ? null : 1)}
                    > {user?.profile_pic ? (
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
            </header>

            <main className="main-content">
                {activeView === "Overview" && (
                    <>
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
                        <Whiteboard />
                    </section>
                )}

                {activeView === "Journal" && (
                    <section className="journal-area">
                        <Journal />
                    </section>
                )}

                {activeView === "Analytics" && (
                    <section className="analytics-area">
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>Total Tasks</h3>
                                <p>128</p>
                            </div>

                            <div className="analytics-card">
                                <h3>Completed</h3>
                                <p>84</p>
                            </div>

                            <div className="analytics-card">
                                <h3>Productivity</h3>
                                <p>87%</p>
                            </div>

                            <div className="analytics-card">
                                <h3>Active Boards</h3>
                                <p>12</p>
                            </div>

                            <div className="analytics-large-card">
                                <div className="card-header">
                                    <h2>Weekly Productivity</h2>
                                </div>

                                <div className="chart-placeholder">
                                    Chart Area
                                </div>
                            </div>

                            <div className="analytics-large-card">
                                <div className="card-header">
                                    <h2>Recent Activity</h2>
                                </div>

                                <div className="activity-list">
                                    <div className="activity-item">
                                        Completed task "Landing Page"
                                    </div>

                                    <div className="activity-item">
                                        Added note to API project
                                    </div>

                                    <div className="activity-item">
                                        Created Whiteboard "System Design"
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeView === "Settings" && (
                    <section className="settings-area">
                        <div className="settings-layout">
                            <div className="settings-sidebar">
                                <button className="active-setting">
                                    Profile
                                </button>

                                <button>
                                    Appearance
                                </button>

                                <button>
                                    Notifications
                                </button>

                                <button>
                                    Workspace
                                </button>

                                <button>
                                    Security
                                </button>
                            </div>

                            <div className="settings-content">
                                <div className="settings-card">
                                    <h2>Profile Settings</h2>
                                    <div className="settings-form">
                                        <div className="settings-group">
                                            <label>Username</label>
                                            <input type="text" placeholder="Your username" />
                                        </div>

                                        <div className="settings-group">
                                            <label>Email</label>
                                            <input type="email" placeholder="you@example.com" />
                                        </div>

                                        <div className="settings-group">
                                            <label>Timezone</label>
                                            <input type="text" placeholder="Africa/Nairobi" />
                                        </div>

                                        <button className="save-settings-btn">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div >
    );
};

