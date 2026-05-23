import { useEffect, useState } from "react";
import ApiService from "../../services/ApiService";

interface Task {
    id?: number;
    title: string;
    description?: string;
    priority: string;
    priority_display?: string;
    status: string;
    status_display?: string;
    deadline?: string;
    created_at?: string;
}

interface CreateTask {
    title: string;
    description?: string;
    priority: string;
    status: string;
    deadline?: string;
}

interface TaskNote {
    id?: number;
    task: number;
    content: string;
    user_email?: string;
    created_at?: string;
}

interface QuickNote {
    id?: number;
    content: string;
    created_at?: string;
    updated_at?: string;
}

export const Workspace = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        deadline: ''
    });
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState<TaskNote[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)
    const [quickNote, setQuickNote] = useState("");
    const [quickNoteId, setQuickNoteId] = useState<number | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await ApiService.tasks.getAll<Task>();
                setTasks(response.data);
            } catch (error) {
                console.error("Failed to fetch tasks");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
        const fetchQuickNotes = async () => {
            try {
                const response = await ApiService.quick_notes.getAll<any>();
                if (response.data.length > 0) {
                    setQuickNote(response.data[0].content);
                    setQuickNoteId(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to  fetch quick notes")
            }
        };
        fetchQuickNotes();
    }, []);

    const todoTasks = tasks.filter(task => task.status === "TODO");
    const progressTasks = tasks.filter(
        task => task.status === "PROGRESS"
    );
    const doneTasks = tasks.filter(task => task.status === "DONE");

    const handleSubmit = async () => {
        try {
            const formattedDeadline = taskForm.deadline ? new Date(taskForm.deadline).toISOString() : undefined;

            const response = await ApiService.tasks.create<CreateTask>({
                title: taskForm.title,
                description: taskForm.description,
                priority: taskForm.priority,
                status: taskForm.status,
                deadline: formattedDeadline
            });

            setTasks(prev => [...prev, response.data]);
            setShowCreateModal(false);
            setTaskForm({
                title: '',
                description: '',
                priority: 'MEDIUM',
                status: 'TODO',
                deadline: ''
            });
        } catch (error) {
            console.error("Failed to create task");
        }
    };

    const openNotes = async (task: Task) => {
        try {
            setSelectedTask(task);
            setShowNotesModal(true);
            setLoadingNotes(true);

            const response = await ApiService.notes.getTaskNotes<TaskNote>(task.id!);
            setNotes(response.data);
        } catch (error) {
            console.error("Failed to fetch notes");
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedTask || !note.trim()) return;
        try {
            const response = await ApiService.notes.createNote<TaskNote>({ task: selectedTask.id!, content: note });
            setNotes(prev => [...prev, response.data]);
            setNote('');
        } catch (error) {
            console.error("Failed to save note");
        }
    };

    const handleDrop = async (status: string) => {
        if (!draggedTask) return;
        try {
            const updatedTasks = tasks.map(task => task.id === draggedTask.id ? { ...task, status } : task);
            setTasks(updatedTasks);
            await ApiService.tasks.update(draggedTask.id?.toString()!, { ...draggedTask, status });
        } catch (error) {
            console.error("Failed to update task");
        }
        setDraggedTask(null);
    };

    const handleSaveQuickNotes = async () => {
        try {
            if (quickNoteId) {
                await ApiService.quick_notes.update(quickNoteId, { content: quickNote })
            } else {
                const response = await ApiService.quick_notes.create<QuickNote>({ content: quickNote });
                if (response.data.id) {
                    setQuickNoteId(response.data.id)
                }
            }
        } catch (error) {
            console.error("Failed to save quick note");
        }
    };
    return (
        <div className="workspace-container">
            <div className="workspace-header">
                <button
                    className="workspace-btn"
                    onClick={() => setShowCreateModal(true)}
                > + Create Task
                </button>
            </div>

            <div className="workspace-grid">
                <section className="workspace-card kanban-card">
                    <div className="card-header">
                        <h2>Kanban Board</h2>
                    </div>

                    <div className="kanban-columns">
                        <div
                            className="kanban-column"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop("TODO")}
                        >
                            <h3>Todo</h3>
                            {todoTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="kanban-task"
                                    draggable
                                    onDragStart={() => setDraggedTask(task)}>
                                    <div className="task-top">
                                        <h3>{task.title}</h3>
                                        <span className={`priority ${task.priority.toLowerCase()}`}> {task.priority_display} </span>
                                    </div>

                                    <p className="task-description"> {task.description || "No description"} </p>
                                    <div className="task-footer">
                                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"} </span>
                                        <button onClick={() => {
                                            setSelectedTask(task);
                                            setShowNotesModal(true)
                                        }}> + Note </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            className="kanban-column"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop("PROGRESS")}
                        >
                            <h3>In Progress</h3>
                            {progressTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="kanban-task"
                                    draggable
                                    onDragStart={() => setDraggedTask(task)}
                                >
                                    <div className="task-top">
                                        <h3>{task.title}</h3>
                                        <span className={`priority ${task.priority.toLowerCase()}`}> {task.priority_display} </span>
                                    </div>
                                    <p className="task-description"> {task.description || "No description"} </p>
                                    <div className="task-footer">
                                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"} </span>
                                        <button onClick={() => {
                                            setSelectedTask(task);
                                            setShowNotesModal(true)
                                        }}> + Note </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div
                            className="kanban-column"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop("DONE")}
                        >
                            <h3>Done</h3>
                            {doneTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="kanban-task"
                                    draggable
                                    onDragStart={() => setDraggedTask(task)}
                                >
                                    <div className="task-top">
                                        <h3>{task.title}</h3>
                                        <span className={`priority ${task.priority.toLowerCase()}`}> {task.priority_display} </span>
                                    </div>
                                    <p className="task-description"> {task.description || "No description"} </p>
                                    <div className="task-footer">
                                        <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"} </span>
                                        <button onClick={() => openNotes(task)}> + Note </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                <section className="workspace-card">
                    <div className="card-header">
                        <h2>Quick Notes</h2>
                    </div>

                    <textarea
                        placeholder="Write your notes..."
                        className="workspace-notes"
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                    />
                    <button className="submit-btn" onClick={handleSaveQuickNotes} >Save Notes</button>
                </section>
            </div >
            {showCreateModal && (
                <div className="workspace-modal-overlay" onClick={() => setShowCreateModal(false)} >
                    <div className="workspace-modal" onClick={(e) => e.stopPropagation()} >
                        <div className="modal-header">
                            <h2>Create Task</h2>
                            <button onClick={() => setShowCreateModal(false)} > ✕ </button>
                        </div>

                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder="Task title"
                                value={taskForm.title}
                                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Task description"
                                value={taskForm.description}
                                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            />

                            <select
                                value={taskForm.priority}
                                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>

                            <select
                                value={taskForm.status}
                                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                            >
                                <option value="TODO">Todo</option>
                                <option value="PROGRESS"> In Progress </option>
                                <option value="DONE">Done</option>
                            </select>

                            <input
                                type="datetime-local"
                                value={taskForm.deadline}
                                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                            />

                            <button className="submit-btn" onClick={handleSubmit}> Create Task </button>
                        </div>
                    </div>
                </div>
            )}

            {showNotesModal && (
                <div className="workspace-modal-overlay" onClick={() => setShowNotesModal(false)} >
                    <div className="workspace-modal" onClick={(e) => e.stopPropagation()} >
                        <div className="modal-header">
                            <h2> Notes — {selectedTask?.title} </h2>
                            <button onClick={() => setShowNotesModal(false)} > ✕ </button>
                        </div>

                        <div className="modal-body">
                            <div className="notes-list">
                                {loadingNotes ? (
                                    <p>Loading notes...</p>
                                ) : notes.length > 0 ? (
                                    notes.map(noteItem => (
                                        <div key={noteItem.id} className="note-item">
                                            <p>{noteItem.content}</p>
                                            <span>
                                                {noteItem.created_at ? new Date(noteItem.created_at).toLocaleString() : ""}
                                            </span>
                                        </div>
                                    ))) : (
                                    <p>No notes yet</p>)}
                            </div>

                            <textarea
                                placeholder="Write task notes..."
                                className="workspace-notes"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />

                            <button className="submit-btn" onClick={handleSaveNote} >
                                Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
