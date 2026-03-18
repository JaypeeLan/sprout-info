// backend tests with mocha chai supertest
// run npm test from backend folder
// uses test db so it doesnt touch dev db
// table is wiped before every test

process.env.DB_NAME = 'task_tracker_test';
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const request    = require('supertest');
const app        = require('../backend/server');
const { pool, initDB } = require('../backend/db');

// helpers
async function clearTasks() {
  await pool.query('TRUNCATE TABLE tasks RESTART IDENTITY CASCADE');
}

async function seed(data = {}) {
  const defaults = { title: 'Test Task', description: 'A test task', status: 'todo' };
  const res = await request(app).post('/tasks').send({ ...defaults, ...data });
  return res.body;
}

// lifecycle
before(async () => { await initDB(); });
after(async ()  => { await pool.end(); });
beforeEach(async () => { await clearTasks(); });

// POST /tasks
describe('POST /tasks — task creation', () => {
  it('returns 201 with all fields present', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Write unit tests',
      description: 'Cover every edge case',
      status: 'todo',
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.include.keys('id', 'title', 'description', 'status', 'created_at');
    expect(res.body.title).to.equal('Write unit tests');
    expect(res.body.status).to.equal('todo');
  });

  it('defaults description to "" and status to "todo" when omitted', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Minimal task' });

    expect(res.status).to.equal(201);
    expect(res.body.description).to.equal('');
    expect(res.body.status).to.equal('todo');
  });

  it('trims leading/trailing whitespace from title', async () => {
    const res = await request(app).post('/tasks').send({ title: '  Trim me  ' });

    expect(res.status).to.equal(201);
    expect(res.body.title).to.equal('Trim me');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({ description: 'No title' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('returns 400 when title is an empty string', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Bad status', status: 'pending' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('accepts all three valid status values', async () => {
    for (const status of ['todo', 'in-progress', 'done']) {
      const res = await request(app).post('/tasks').send({ title: `Task — ${status}`, status });
      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal(status);
    }
  });
});

// GET /tasks
describe('GET /tasks — fetching tasks', () => {
  it('returns an empty array when no tasks exist', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.is.empty;
  });

  it('returns all created tasks', async () => {
    await seed({ title: 'Alpha' });
    await seed({ title: 'Beta' });
    await seed({ title: 'Gamma' });

    const res = await request(app).get('/tasks');

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(3);
  });

  it('each task has the expected shape', async () => {
    await seed({ title: 'Shape check', status: 'in-progress' });

    const res = await request(app).get('/tasks');

    expect(res.body[0]).to.include.keys('id', 'title', 'description', 'status', 'created_at');
  });

  it('returns tasks ordered newest-first', async () => {
    await seed({ title: 'First' });
    await seed({ title: 'Second' });
    await seed({ title: 'Third' });

    const res = await request(app).get('/tasks');

    expect(res.body[0].title).to.equal('Third');
    expect(res.body[2].title).to.equal('First');
  });
});

// PUT /tasks
describe('PUT /tasks/:id — updating task status', () => {
  it('updates status from todo to in-progress', async () => {
    const task = await seed({ status: 'todo' });

    const res = await request(app).put(`/tasks/${task.id}`).send({ status: 'in-progress' });

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('in-progress');
    expect(res.body.id).to.equal(task.id);
  });

  it('updates status to done', async () => {
    const task = await seed({ status: 'in-progress' });

    const res = await request(app).put(`/tasks/${task.id}`).send({ status: 'done' });

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('done');
  });

  it('can update title and description alongside status', async () => {
    const task = await seed();

    const res = await request(app).put(`/tasks/${task.id}`).send({
      title: 'Renamed',
      description: 'Updated description',
      status: 'in-progress',
    });

    expect(res.status).to.equal(200);
    expect(res.body.title).to.equal('Renamed');
    expect(res.body.description).to.equal('Updated description');
  });

  it('returns 400 for an invalid status value', async () => {
    const task = await seed();

    const res = await request(app).put(`/tasks/${task.id}`).send({ status: 'unknown' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
  });

  it('returns 400 when no valid fields are provided', async () => {
    const task = await seed();

    const res = await request(app).put(`/tasks/${task.id}`).send({});

    expect(res.status).to.equal(400);
  });

  it('returns 404 when the task does not exist', async () => {
    const res = await request(app).put('/tasks/99999').send({ status: 'done' });

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('error');
  });

  it('returns 400 when id is not a number', async () => {
    const res = await request(app).put('/tasks/abc').send({ status: 'done' });

    expect(res.status).to.equal(400);
  });
});

// DELETE /tasks
describe('DELETE /tasks/:id — deleting tasks', () => {
  it('deletes an existing task and returns 200', async () => {
    const task = await seed({ title: 'To be deleted' });

    const res = await request(app).delete(`/tasks/${task.id}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message');
  });

  it('deleted task no longer appears in GET /tasks', async () => {
    const task = await seed({ title: 'Gone soon' });
    await request(app).delete(`/tasks/${task.id}`);

    const list = await request(app).get('/tasks');

    expect(list.body.map((t) => t.id)).to.not.include(task.id);
  });

  it('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/tasks/99999');

    expect(res.status).to.equal(404);
  });

  it('returns 400 when id is not numeric', async () => {
    const res = await request(app).delete('/tasks/not-a-number');

    expect(res.status).to.equal(400);
  });
});
