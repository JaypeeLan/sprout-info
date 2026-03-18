import { Task, CreateTaskPayload, UpdateTaskPayload } from './types';

const BASE = process.env.REACT_APP_API_URL || '/tasks';

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  getTasks: (): Promise<Task[]> =>
    fetch(BASE).then(handle<Task[]>),

  createTask: (payload: CreateTaskPayload): Promise<Task> =>
    fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle<Task>),

  updateTask: (id: number, payload: UpdateTaskPayload): Promise<Task> =>
    fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handle<Task>),

  deleteTask: (id: number): Promise<{ message: string }> =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handle<{ message: string }>),
};
