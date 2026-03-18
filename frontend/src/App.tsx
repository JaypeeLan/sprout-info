import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from './types';
import { api } from './api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

type Filter = 'all' | TaskStatus;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.getTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (payload: CreateTaskPayload) => {
    const task = await api.createTask(payload);
    setTasks(prev => [task, ...prev]);
  };

  const handleUpdate = async (id: number, payload: UpdateTaskPayload) => {
    const updated = await api.updateTask(id, payload);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleDelete = async (id: number) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const counts = {
    todo:       tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="brand-icon">◈</span>
            <h1 className="brand-name">Task Tracker</h1>
          </div>
          {tasks.length > 0 && (
            <div className="header-stats">
              <span className="stat stat--todo">{counts.todo} to do</span>
              <span className="stat-divider" />
              <span className="stat stat--progress">{counts.inProgress} in progress</span>
              <span className="stat-divider" />
              <span className="stat stat--done">{counts.done} done</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <TaskForm onTaskCreated={handleCreate} />
        </aside>
        <section className="content">
          <TaskList
            tasks={tasks} loading={loading} error={error}
            filter={filter} onFilterChange={setFilter}
            onUpdate={handleUpdate} onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
}
