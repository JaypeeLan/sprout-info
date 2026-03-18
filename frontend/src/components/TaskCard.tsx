import { useState } from 'react';
import { Task, TaskStatus } from '../types';

interface Props {
  task: Task;
  onUpdate: (id: number, payload: { status: TaskStatus }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  'todo':        { label: 'To Do',       className: 'badge badge-todo' },
  'in-progress': { label: 'In Progress', className: 'badge badge-progress' },
  'done':        { label: 'Done',        className: 'badge badge-done' },
};

const CYCLE: Record<TaskStatus, TaskStatus> = {
  'todo': 'in-progress',
  'in-progress': 'done',
  'done': 'todo',
};

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[task.status];

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setUpdating(true);
    setError(null);
    try {
      await onUpdate(task.id, { status: e.target.value as TaskStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setDeleting(false);
    }
  }

  const date = new Date(task.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const busy = updating || deleting;

  return (
    <div className={`card task-card ${task.status === 'done' ? 'task-card--done' : ''} ${deleting ? 'task-card--deleting' : ''}`}>
      <div className="task-card__left">
        <span className={cfg.className}>{cfg.label}</span>
        <div>
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-description">{task.description}</p>}
          {error && <p className="inline-error">{error}</p>}
        </div>
        <time className="task-date">{date}</time>
      </div>

      <div className="task-card__right">
        <div className="select-wrapper select-wrapper--sm">
          <select
            className="input select select--sm"
            value={task.status}
            onChange={handleStatusChange}
            disabled={busy}
            aria-label="Change status"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <button
          className="btn btn-ghost btn-delete"
          onClick={handleDelete}
          disabled={busy}
          aria-label={`Delete ${task.title}`}
        >
          {deleting ? '…' : <span className="icon-trash" aria-label="delete"></span>}
        </button>
      </div>
    </div>
  );
}
