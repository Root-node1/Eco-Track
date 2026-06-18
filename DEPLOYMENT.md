# Eco-Track Monorepo Deployment Guide

This is a monorepo containing both frontend (React) and backend (Django) applications that can be deployed together from a single repository.

## Project Structure

```
eco-track/
├── client-eco-track/          # React frontend (Vite)
├── server-eco-track/          # Django backend
├── package.json               # Root package.json (monorepo management)
├── docker-compose.yml         # Docker orchestration
├── Dockerfile.client          # Client Docker build
├── Dockerfile.server          # Server Docker build
├── nginx.conf                 # Nginx reverse proxy config
├── .env.example               # Environment variables template
├── Makefile                   # Convenient commands
└── README.md                  # This file
```

## Quick Start

### Development (Local)

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start both servers:**
   ```bash
   npm run dev
   # or use Makefile
   make dev
   ```

   This runs:
   - Frontend: `http://localhost:5173` (Vite dev server)
   - Backend: `http://localhost:8000` (Django dev server)

### Individual Development

**Frontend only:**
```bash
npm run dev:client
# or
cd client-eco-track && npm run dev
```

**Backend only:**
```bash
npm run dev:server
# or
cd server-eco-track && python manage.py runserver
```

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Development with Docker

```bash
# Build images
docker-compose build

# Start containers
docker-compose up

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Database: postgres://localhost:5432
```

### Production with Docker

1. **Copy `.env.example` to `.env` and update:**
   ```bash
   cp .env.example .env
   ```

2. **Update sensitive values in `.env`:**
   ```
   SECRET_KEY=your-actual-secret-key
   DB_PASSWORD=your-strong-password
   DEBUG=False
   ```

3. **Start production stack (with Nginx):**
   ```bash
   docker-compose --profile prod up -d
   ```

   Access via:
   - Frontend & API: `http://localhost:80`
   - Direct backend: `http://localhost:8000`
   - PostgreSQL: `localhost:5432`

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Access Django shell
docker-compose exec server python manage.py shell

# Run migrations
docker-compose exec server python manage.py migrate

# Create superuser
docker-compose exec server python manage.py createsuperuser

# Stop containers
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

## Build Commands

### Frontend Build
```bash
npm run build:client
# Output: client-eco-track/dist/
```

### Backend Build
```bash
npm run build:server
# Collects static files for production
```

### Full Build
```bash
npm run build
# Builds both frontend and backend
```

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `DEBUG`: Set to `False` for production
- `SECRET_KEY`: Django secret key (generate a strong one)
- `DB_PASSWORD`: PostgreSQL password
- `ALLOWED_HOSTS`: Comma-separated list of allowed hostnames
- `REACT_APP_API_URL`: Frontend API endpoint URL

## Deployment Options

### Option 1: Docker (Recommended)
Most flexible, works on any machine with Docker.

```bash
docker-compose up -d
```

### Option 2: Traditional VPS/Server

**Backend:**
```bash
cd server-eco-track
gunicorn --bind 0.0.0.0:8000 config.wsgi:application
```

**Frontend:**
```bash
cd client-eco-track
npm run build
serve -s dist -l 3000
# or use Nginx to serve the dist folder
```

### Option 3: Cloud Platforms

- **Heroku/Railway**: Use Procfile with both apps
- **AWS/Google Cloud**: Deploy Docker images to Container Registry
- **Netlify/Vercel**: Deploy frontend
- **AWS Lambda/Google Cloud Run**: Deploy backend

## Makefile Commands

Convenient commands for development and deployment:

```bash
make install-all    # Install all dependencies
make dev            # Start both servers
make build          # Build both apps
make build-docker   # Build Docker images
make up             # Start Docker containers
make down           # Stop Docker containers
make migrate        # Run Django migrations
make clean          # Clean build artifacts
```

## Troubleshooting

### Port Conflicts
If ports are already in use, update in `docker-compose.yml`:
- Frontend: Change `3000` to another port
- Backend: Change `8000` to another port
- Database: Change `5432` to another port

### Database Issues
```bash
# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up db

# Run migrations fresh
docker-compose exec server python manage.py migrate --run-syncdb
```

### Frontend Can't Connect to Backend
Ensure `REACT_APP_API_URL` in `.env` matches your backend URL.

For local development:
```
REACT_APP_API_URL=http://localhost:8000
```

For Docker:
```
REACT_APP_API_URL=http://server:8000
```

## Next Steps

1. Initialize Django project in `server-eco-track/`
2. Configure database settings in Django
3. Update `REACT_APP_API_URL` in frontend environment
4. Create API endpoints matching frontend requirements
5. Deploy using your chosen method above
