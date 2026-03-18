import { Task, TaskStatus, UpdateTaskPayload } from '../types';
import TaskCard from './TaskCard';

type Filter = 'all' | TaskStatus;

interface Props {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  onUpdate: (id: number, payload: UpdateTaskPayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskList({ tasks, loading, error, filter, onFilterChange, onUpdate, onDelete }: Props) {
  const visible = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="task-list-section">
      <div className="list-header">
        <h2 className="section-title">
          Tasks
          {!loading && <span className="count-pill">{visible.length}</span>}
        </h2>
        <div className="filter-group" role="group" aria-label="Filter tasks">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              className={`filter-btn ${filter === value ? 'filter-btn--active' : ''}`}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <span>Loading tasks…</span>
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-box--error">
          <span>⚠ {error}</span>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="state-box">
          <span className="empty-icon">✓</span>
          <span>{filter === 'all' ? 'No tasks yet. Add one to get started.' : `No "${filter}" tasks.`}</span>
        </div>
      )}

      <div className="task-list">
        {visible.map(task => (
          <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
