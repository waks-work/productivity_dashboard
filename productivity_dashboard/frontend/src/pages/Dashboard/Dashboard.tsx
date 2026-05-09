import React, { useEffect, useState, useCallback, memo } from 'react';
import './Dashboard.css';
import ApiService from '../../services/ApiService';
import Whiteboard from './Whiteboard';

export const Dashboard = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState("Overview");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiService.tasks.getAll();
                setTasks(response.data);
            } catch (err) {
                console.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
                            <div className="user-profile">Waks Work</div>
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
                                            <span>{task.title}</span>
                                            <span className={`status ${task.status}`}>{task.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
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
        </div>
    );
};

