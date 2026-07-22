# Mini ERP + CRM Operations Portal

A Full Stack ERP & CRM Portal built for wholesale/distribution companies to manage customers, products, stock movements, and sales challans.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, MySQL.
- **Frontend**: React (Vite), TypeScript, Vanilla CSS.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Backend Setup
1. Open the terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
   *Update the `DATABASE_URL` with your local MySQL credentials.*
4. Initialize the database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
The frontend will be available at `http://localhost:5173`.

## Test Credentials
To get started, create an admin user using the Postman Collection provided (`postman_collection.json`) or hit the setup endpoint directly:
- **POST** `http://localhost:5000/api/auth/setup`
- **Body**: `{ "name": "Admin", "email": "admin@example.com", "password": "password" }`

After setup, use these credentials to log in.

## Deployment Instructions

### Backend (Render / Railway)
1. Push the repository to GitHub.
2. In Render, create a new **Web Service** pointing to the repository.
3. Root Directory: `backend`
4. Build Command: `npm install && npm run build && npx prisma generate`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `DATABASE_URL`: Connection string to your cloud MySQL instance.
   - `PORT`: `5000`
   - `JWT_SECRET`: Your secure secret.

### Frontend (Vercel)
1. In Vercel, create a new Project pointing to the repository.
2. Framework Preset: **Vite**
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: URL of your deployed backend (e.g., `https://your-backend.onrender.com/api`)

## Limitations / Future Improvements
- Pagination limit is hardcoded in frontend queries, could be dynamic.
- Adding items to challan in UI is simplified in this scaffold.
- Complete unit testing suite is pending.
