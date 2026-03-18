# task tracker

this is a simple task management app built with react on the frontend and node/express with postgresql on the backend.

## how to run locally

1. clone the repo
2. in the `backend` folder, copy `.env.example` to `.env` and put your postgres db connection info
3. create the `task_tracker` and `task_tracker_test` databases in postgres if you havent already
4. in the `backend` folder run `npm run setup` to install everything
5. open two terminal tabs:
   - in one, run `npm run start:api` from the root
   - in the other, run `npm run start:ui` from the root
6. check out the app at http://localhost:3000

## running tests
go to the `backend` folder and run `npm test`. it uses the test database so it doesnt mess up your normal data.

## project stuff
- `backend/` has all the api code and db setup
- `frontend/` has the react app
- `tests/` has the backend tests
- it's set up to be deployed on render using `render.yaml`

## api endpoints
base url is localhost:5001

- GET `/tasks` - gets all tasks
- POST `/tasks` - adds a new task 
- PUT `/tasks/:id` - updates a task
- DELETE `/tasks/:id` - removes a task
