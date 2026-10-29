# Deployment Guide — Smart Food Distribution System

This project is configured for **effortless full-stack deployment**. The backend Express server automatically serves the compiled React frontend, API endpoints (`/api/*`), and real-time WebSockets (`/socket.io`) under a single domain.

---

## 🌟 Recommended: Deploy Free on Render (Single Web Service)

Render offers a free tier that supports Node.js, WebSockets (Socket.IO), and background processes.

### Step 1: Get a Free MongoDB Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create a Database** and select the **M0 (Free)** cluster tier.
3. Under **Security → Database Access**, create a database user (e.g., username `fooduser`, secure password).
4. Under **Security → Network Access**, add IP address `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
5. Click **Connect → Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://fooduser:<password>@cluster0.abcde.mongodb.net/foodful_hands?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual database user password).*

---

### Step 2: Push Code to GitHub
Ensure this codebase is in a GitHub repository:
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

### Step 3: Deploy on Render
1. Log in to [render.com](https://render.com) and click **New + → Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name:** `smart-food-distribution`
   - **Environment:** `Node`
   - **Region:** Any (e.g. Oregon or Singapore)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build && cd backend && npm install`
   - **Start Command:** `node backend/server.js`
   - **Plan:** Free
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `SESSION_SECRET` | *Any random long string (e.g., `supersecretkey123456789`)* |
   | `CLIENT_URL` | `*` |
5. Click **Create Web Service**.

Render will automatically build the frontend, install backend packages, and launch the application!

---

### Step 4 (Optional): Seed Initial Demo Accounts
Once your Render web service is live, you can seed demo donors, organizations, and sample food rescues:
1. In your Render Dashboard, go to your Web Service and click **Shell** in the left sidebar.
2. Run:
   ```bash
   node backend/utils/seedUsers.js
   ```
This will automatically create:
- **Admin**: `admin@smartfoodhub.org` / `admin123`
- **Donor**: `donor@demo.com` / `donor123`
- **Organization**: `org@demo.com` / `org123`

---

## ⚡ Alternative: Vercel (Frontend) + Render (Backend)

If you prefer to host the frontend on Vercel:
1. **Deploy Backend to Render** using root directory `backend`, Build: `npm install`, Start: `node server.js`.
2. Copy your Render backend URL (e.g. `https://food-api.onrender.com`).
3. Set `CLIENT_URL=https://your-frontend.vercel.app` on Render.
4. **Deploy Frontend to Vercel**:
   - Connect repository to [vercel.com](https://vercel.com).
   - Set Environment Variable: `VITE_API_URL=https://food-api.onrender.com/api`
   - Vercel will build with `npm run build` using the included `vercel.json`.

---

## 🐳 Docker Container Deployment

If you are using Railway, Fly.io, Google Cloud Run, or your own VPS:
```bash
# Build the Docker image
docker build -t smart-food-hub .

# Run the container
docker run -p 5000:5000 \
  -e MONGO_URI="your-mongodb-atlas-uri" \
  -e SESSION_SECRET="random-secret-key" \
  smart-food-hub
```
