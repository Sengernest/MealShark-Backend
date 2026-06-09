# Meal Planner Backend

## Local Setup
1. Install dependencies
```
npm install
```
2. Set environment variables e.g.
```
PORT=3000
DATABASE_URL=postgres://postgres:mypassword@localhost:5432/postgres
```
3. Start a Postgres instance using docker compose  
> NOTE:  Ensure you do not already have a local Postgres instance running on port 5432 
```
docker compose up -d
```
4. Apply schema to database
```
npx drizzle-kit push
```    
5. Import food data from json file
```
npm run import
```
6. Run the dev server
```
npm run dev
```

## Database
### Updating database schema
Whenever a change is made to the schema, run the following command to update the actual database.
```
npx drizzle-kit push
```

### Accessing database with psql
```
docker exec -it <container_name> psql -U postgres
```
