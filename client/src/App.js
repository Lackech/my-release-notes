import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import ReactMarkdown from 'react-markdown';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function App() {
  const [view, setView] = useState('calendar'); // calendar, learnings, editor
  const [dailyEntries, setDailyEntries] = useState([]);
  const [learnings, setLearnings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [stats, setStats] = useState({ totalDays: 0, totalLearnings: 0, tags: [] });
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedLearning, setSelectedLearning] = useState(null);

  // Load data
  useEffect(() => {
    loadDailyEntries();
    loadLearnings();
    loadStats();
  }, []);

  const loadDailyEntries = async () => {
    try {
      const response = await fetch('/api/daily');
      const data = await response.json();
      setDailyEntries(data);
    } catch (error) {
      console.error('Error loading daily entries:', error);
    }
  };

  const loadLearnings = async () => {
    try {
      const response = await fetch('/api/learnings');
      const data = await response.json();
      setLearnings(data);
    } catch (error) {
      console.error('Error loading learnings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    const dateStr = formatDate(date);

    try {
      const response = await fetch(`/api/daily/${dateStr}`);
      const data = await response.json();
      setCurrentEntry(data);
      setEditContent(data.content);
      setView('editor');
      setEditMode(data.isNew || false);
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const handleSave = async () => {
    const dateStr = formatDate(selectedDate);
    try {
      await fetch(`/api/daily/${dateStr}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      setEditMode(false);
      await loadDailyEntries();
      await loadStats();

      // Reload current entry
      const response = await fetch(`/api/daily/${dateStr}`);
      const data = await response.json();
      setCurrentEntry(data);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleLearningClick = async (slug) => {
    try {
      const response = await fetch(`/api/learnings/${slug}`);
      const data = await response.json();
      setSelectedLearning(data);
      setView('learning-view');
    } catch (error) {
      console.error('Error loading learning:', error);
    }
  };

  const tileClassName = ({ date }) => {
    const dateStr = formatDate(date);
    const hasEntry = dailyEntries.some(e => e.date === dateStr);
    return hasEntry ? 'has-entry' : null;
  };

  const filteredLearnings = selectedTag
    ? learnings.filter(l => l.tags.includes(selectedTag))
    : learnings;

  return (
    <div className="app">
      <header className="header">
        <h1>📝 My Daily Coding Progress</h1>
        <nav>
          <button
            className={view === 'calendar' ? 'active' : ''}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
          <button
            className={view === 'learnings' ? 'active' : ''}
            onClick={() => setView('learnings')}
          >
            Learnings ({stats.totalLearnings})
          </button>
        </nav>
      </header>

      <div className="content">
        {view === 'calendar' && (
          <div className="calendar-view">
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-value">{stats.totalDays}</span>
                <span className="stat-label">Days Logged</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.totalLearnings}</span>
                <span className="stat-label">Learnings</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.tags.length}</span>
                <span className="stat-label">Tags</span>
              </div>
            </div>

            <div className="calendar-container">
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                tileClassName={tileClassName}
              />
            </div>

            <div className="recent-entries">
              <h2>Recent Entries</h2>
              {dailyEntries.slice(0, 5).map(entry => (
                <div
                  key={entry.date}
                  className="entry-card"
                  onClick={() => handleDateClick(new Date(entry.date))}
                >
                  <div className="entry-date">{entry.date}</div>
                  <div className="entry-preview">{entry.preview}</div>
                  <div className="entry-tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'learnings' && (
          <div className="learnings-view">
            <div className="learnings-header">
              <h2>Knowledge Base</h2>
              <button
                className="btn-new"
                onClick={() => {
                  const slug = prompt('Enter learning slug (e.g., "terraform-modules"):');
                  if (slug) handleLearningClick(slug);
                }}
              >
                + New Learning
              </button>
            </div>

            <div className="tags-filter">
              <button
                className={!selectedTag ? 'tag active' : 'tag'}
                onClick={() => setSelectedTag(null)}
              >
                All
              </button>
              {stats.tags.map(tag => (
                <button
                  key={tag}
                  className={selectedTag === tag ? 'tag active' : 'tag'}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="learnings-grid">
              {filteredLearnings.map(learning => (
                <div
                  key={learning.slug}
                  className="learning-card"
                  onClick={() => handleLearningClick(learning.slug)}
                >
                  <h3>{learning.title}</h3>
                  <p>{learning.summary}</p>
                  <div className="entry-tags">
                    {learning.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'editor' && currentEntry && (
          <div className="editor-view">
            <div className="editor-header">
              <button onClick={() => setView('calendar')}>← Back to Calendar</button>
              <h2>{formatDate(selectedDate)}</h2>
              <div>
                {editMode ? (
                  <>
                    <button onClick={handleSave} className="btn-save">Save</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)}>Edit</button>
                )}
              </div>
            </div>

            <div className="editor-content">
              {editMode ? (
                <div className="editor-split">
                  <div className="editor-pane">
                    <h3>Edit</h3>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your daily log here..."
                    />
                  </div>
                  <div className="preview-pane">
                    <h3>Preview</h3>
                    <div className="markdown-preview">
                      <ReactMarkdown>{editContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="markdown-preview">
                  <ReactMarkdown>{currentEntry.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'learning-view' && selectedLearning && (
          <div className="learning-view">
            <div className="editor-header">
              <button onClick={() => setView('learnings')}>← Back to Learnings</button>
            </div>
            <div className="markdown-preview learning-content">
              <ReactMarkdown>{selectedLearning.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
