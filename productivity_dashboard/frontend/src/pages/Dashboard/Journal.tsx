import { useEffect, useState } from 'react';
import './Journal.css';
import ApiService from '../../services/ApiService';

type Journal = {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export const Journal = () => {
    const [journals, setJournals] = useState<Journal[]>([]);
    const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null);
    const [journalTitle, setJournalTitle] = useState("");
    const [journalContent, setJournalContent] = useState("");

    useEffect(() => {
        fetchJournals();
    }, []);

    const loadJournal = async (id: number) => {
        try {
            const response = await ApiService.journal.get<Journal>(id);
            console.log("journal detail:", response.data);
            const journal = response.data;
            setSelectedJournalId(journal.id);
            setJournalTitle(journal.title || "");
            setJournalContent(journal.content || "");
        } catch (error) {
            console.error(error);
        }
    };

    const fetchJournals = async () => {
        try {
            const response = await ApiService.journal.list<Journal[]>();
            console.log("journals:", response.data);
            setJournals(response.data);
            if (response.data.length > 0 && selectedJournalId === null) {
                await loadJournal(response.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch Journal data", error);
        }
    };

    const createJournal = async () => {
        try {
            const response = await ApiService.journal.create<Journal>({ title: "Untitled Entry", content: "" })
            setJournals(prev => [response.data, ...prev]);
            setSelectedJournalId(response.data.id);
            setJournalTitle(response.data.title);
            setJournalContent("");
        } catch (error) {
            console.error("Failed to create a journal", error);
        }
    };

    const openJournal = async (journal: Journal) => {
        await loadJournal(journal.id);
    };

    const handleSaveJournal = async () => {
        try {
            if (!selectedJournalId) return;
            await ApiService.journal.update(
                selectedJournalId, { title: journalTitle, content: journalContent })
            setJournals(prev => prev.map(journal => journal.id === selectedJournalId ? {
                ...journal,
                title: journalTitle, content: journalContent,
                updated_at: new Date().toISOString(),
            } : journal));
        } catch (error) {
            console.error("Failed to save journal: ", error)
        }
    };

    const selectedJournal = journals.find(journal => journal.id === selectedJournalId);

    return (
        <div className="journal-container">
            <div className="journal-layout">
                <aside className="journal-sidebar">
                    <div className="journal-sidebar-header">
                        <h2>Journal</h2>
                        <button
                            className="new-journal-btn"
                            onClick={createJournal}
                        > + New Entry </button>
                    </div>
                    <div className="journal-list">
                        {journals.length === 0 ? <p> No journals yet </p> : (
                            journals.map(journal => (
                                <div
                                    key={journal.id}
                                    className={`journal-item ${selectedJournalId === journal.id ? "active-journal" : ""}`}
                                    onClick={() => openJournal(journal)}
                                >
                                    <h4>{journal.title}</h4>
                                    <span>{new Date(journal.updated_at).toLocaleDateString()}</span>
                                </div>
                            )))}
                    </div>
                </aside>

                <main className="journal-editor">
                    <div className="journal-editor-header">
                        <input
                            className="journal-title-input"
                            placeholder="Journal title..."
                            value={journalTitle}
                            onChange={(e) => setJournalTitle(e.target.value)}
                        />
                        <span className="journal-date">
                            {selectedJournal ? new Date(selectedJournal.updated_at).toLocaleDateString() : ""}
                        </span>
                    </div>

                    <textarea
                        className="journal-textarea"
                        placeholder="Start writing here..."
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                    />

                    <div className="journal-actions">
                        <button className="save-journal-btn" onClick={handleSaveJournal}>
                            Save Entry
                        </button>
                    </div>
                </main>
            </div>
        </div>
    )
}
