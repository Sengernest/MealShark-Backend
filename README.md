# Meal Planner Backend

## Local Setup
1. Install dependencies
```
npm install
```
2. Run the dev server
```
npm run dev
```
3. Pull PostgreSQL image and start a Postgres instance
```
docker pull postgres
docker run -e POSTGRES_PASSWORD=mypassword -d -p 5432:5432 postgres  
4. Set environment variables e.g.
```
PORT=3000
DATABASE_URL=postgres://postgres:mypassword@localhost:5432/postgres
```
