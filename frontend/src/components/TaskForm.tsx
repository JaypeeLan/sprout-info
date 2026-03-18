import { useState, FormEvent } from 'react';
import { CreateTaskPayload, TaskStatus } from '../types';

interface Props {
  onTaskCreated: (payload: CreateTaskPayload) => Promise<void>;
}

const EMPTY = { title: '', description: '', status: 'todo' as TaskStatus };

export default function TaskForm({ onTaskCreated }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      await onTaskCreated(form);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card form-card">
      <h2 className="section-title">New task</h2>

      <form onSubmit={handleSubmit} className="task-form" noValidate>
        <div className="field">
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title" name="title" type="text"
            className="input" placeholder="What needs doing?"
            value={form.title} onChange={handleChange}
            disabled={submitting} maxLength={255}
            autoComplete="off"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="description">Description <span className="label-hint">optional</span></label>
          <textarea
            id="description" name="description"
            className="input textarea" placeholder="Add more context…"
            value={form.description} onChange={handleChange}
            disabled={submitting} rows={3}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="status">Status</label>
          <div className="select-wrapper">
            <select id="status" name="status" className="input select"
              value={form.status} onChange={handleChange} disabled={submitting}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {error && <p className="inline-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add task'}
        </button>
      </form>
    </div>
  );
}
