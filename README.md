# Portfolio - Teddy Truong

Full-stack portfolio with an admin dashboard for managing experiences, projects, articles, and skills.

- **Backend**: Node.js + Express + SQLite (sql.js)
- **Frontend**: React 18 + React Router 6 + Vite

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm (comes with Node.js)

## Quick Start (Development)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your own values (see Configuration below)

# 3. Run the setup (creates admin account + optional demo data)
npm run setup

# 4. Start development servers
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin panel: http://localhost:5173/admin

## Configuration

Edit `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT - Generate a secure secret for production:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Admin account (used on first startup if no admin exists)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_EMAIL=your@email.com

# CORS
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./data/portfolio.db

# Uploads (max 5MB)
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=./uploads
```

> **Note**: If you skip `npm run setup`, the server will auto-create the admin account from `.env` values on first start.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the backend server (serves built frontend in production) |
| `npm run setup` | Interactive setup (create admin + optional demo data) |
| `npm run install:all` | Install dependencies for root, frontend, and backend |

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry point
│   │   ├── config/            # Config + database setup
│   │   ├── middleware/        # Auth, validation, upload
│   │   ├── models/            # Data models (User, Article, Project...)
│   │   ├── routes/            # API routes
│   │   └── scripts/           # Setup script
│   ├── data/                  # SQLite database (auto-created)
│   ├── uploads/               # Uploaded images (auto-created)
│   └── .env                   # Environment config
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routes
│   │   ├── config/api.js      # API client
│   │   ├── context/           # Auth, Theme, Language contexts
│   │   ├── components/        # Reusable components
│   │   └── pages/             # Public + Admin pages
│   └── vite.config.js         # Vite config with API proxy
└── package.json               # Root scripts
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/articles` | No | List articles |
| GET | `/api/articles/:slug` | No | Get article by slug |
| POST | `/api/articles` | Yes | Create article |
| PUT | `/api/articles/:id` | Yes | Update article |
| DELETE | `/api/articles/:id` | Yes | Delete article |
| GET | `/api/experiences` | No | List experiences |
| GET | `/api/projects` | No | List projects |
| GET | `/api/skills` | No | List skills |
| GET | `/api/settings` | No | List settings |
| POST | `/api/uploads` | Yes | Upload image |

---

## Deployment Guide

### Option 1: VPS / Dedicated Server (Recommended)

This is the simplest approach. You deploy both the backend and frontend on a single server.

**1. Prepare the server**

```bash
# Install Node.js 18+ (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 to keep the server running
sudo npm install -g pm2
```

**2. Clone and install**

```bash
git clone <your-repo-url> /var/www/portfolio
cd /var/www/portfolio
npm run install:all
```

**3. Configure production environment**

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set these values:

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=YourVerySecurePassword123!
ADMIN_EMAIL=your@email.com
FRONTEND_URL=https://yourdomain.com
```

**4. Build and start**

```bash
# Build the frontend
npm run build

# Start with PM2
pm2 start backend/src/index.js --name portfolio
pm2 save
pm2 startup  # auto-restart on reboot
```

**5. Set up Nginx reverse proxy**

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/portfolio
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 5M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**6. Add HTTPS with Let's Encrypt**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Platform Deployment (Railway / Render / Fly.io)

These platforms handle infrastructure for you.

**Railway**

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app), connect your repo
3. Set environment variables in the Railway dashboard (same as `.env`)
4. Set the start command: `npm run build && npm start`
5. Railway will auto-deploy on push

**Render**

1. Push your code to GitHub
2. Create a new "Web Service" on [render.com](https://render.com)
3. Set build command: `npm run install:all && npm run build`
4. Set start command: `npm start`
5. Add environment variables in the Render dashboard

**Fly.io**

1. Install `flyctl`: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` from the project root
3. Set secrets: `fly secrets set JWT_SECRET=... ADMIN_PASSWORD=...`
4. Deploy: `fly deploy`

### Option 3: Docker

Create a `Dockerfile` at the project root:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm run install:all
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t portfolio .
docker run -d -p 3001:3001 \
  -e JWT_SECRET=your-secret \
  -e ADMIN_PASSWORD=your-password \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_EMAIL=your@email.com \
  -e NODE_ENV=production \
  -v portfolio-data:/app/backend/data \
  -v portfolio-uploads:/app/backend/uploads \
  --name portfolio \
  portfolio
```

### After Deployment

1. Open `https://yourdomain.com/admin` to access the admin panel
2. Log in with the credentials from your `.env`
3. Go to Settings to update site info, social links, etc.
4. Add your experiences, projects, skills, and articles

### Updating

```bash
cd /var/www/portfolio
git pull
npm run install:all
npm run build
pm2 restart portfolio
```
