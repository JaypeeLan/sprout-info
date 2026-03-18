const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// GET /tasks
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// POST /tasks
router.post('/', async (req, res) => {
  const { title, description = '', status = 'todo' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string.' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Task id must be a number.' });

  const { title, description, status } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '')
      return res.status(400).json({ error: 'title must be a non-empty string.' });
    values.push(title.trim());
    updates.push(`title = $${values.length}`);
  }
  if (description !== undefined) {
    values.push(description);
    updates.push(`description = $${values.length}`);
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}.` });
    values.push(status);
    updates.push(`status = $${values.length}`);
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields provided for update.' });

  values.push(id);
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: `Task ${id} not found.` });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Task id must be a number.' });

  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: `Task ${id} not found.` });
    res.json({ message: `Task ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router;
