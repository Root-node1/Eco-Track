<<<<<<< HEAD
# Carbon Footprint Predictor

This model predicts future carbon footprints (kg CO2e) based on historical user activity and behavioral profiles.

## Model Details
- **Algorithm**: Random Forest Regressor
- **Features**:
  1. `lag_1_day_footprint`: The total footprint from the previous day.
  2. `rolling_7_day_avg_footprint`: Average footprint over the last week.
  3. `user_type_encoded`: Profile code (0: Eco-Warrior, 1: Heavy Emitter).

## Setup & Installation
1. Ensure you have the model file `carbon_footprint_predictor.joblib` in your directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage (Terminal)
Run the prediction script by passing the three required features as arguments:
```bash
python predict.py <lag_1_day> <rolling_7_avg> <user_type_code>
```

**Example:**
```bash
python predict.py 30.0 28.5 1
```
=======
# Eco-Track 🌱

Eco-Track is a sustainability tracking application with a React frontend and Django backend, packaged as a single monorepo for easy deployment.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Local Development

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd eco-track
   npm run install-all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

### Docker Deployment

```bash
# Build and start
docker-compose up -d

# Access
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
```

## Project Structure

```
eco-track/
├── client-eco-track/          # React Vite frontend
├── server-eco-track/          # Django REST backend
├── package.json               # Monorepo scripts
├── docker-compose.yml         # Docker orchestration
├── Dockerfile.client          # Frontend container
├── Dockerfile.server          # Backend container
├── Makefile                   # Convenient commands
├── DEPLOYMENT.md              # Detailed deployment guide
└── README.md                  # This file
```

## Available Commands

### Development
- `npm run dev` - Start both frontend and backend
- `npm run dev:client` - Frontend only
- `npm run dev:server` - Backend only

### Build
- `npm run build` - Build both apps
- `npm run build:client` - Build frontend
- `npm run build:server` - Collect static files

### Docker
- `docker-compose up` - Start development containers
- `docker-compose build` - Build images
- `docker-compose down` - Stop containers

### Makefile (if make is available)
- `make dev` - Development mode
- `make build-docker` - Build Docker images
- `make up` - Start Docker containers
- `make down` - Stop containers

## Deployment

### Docker (Recommended)
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- Development with Docker
- Production deployment with Nginx
- Cloud deployment options

### Traditional Deployment
Deploy backend and frontend separately on your infrastructure.

## Technology Stack

**Frontend:**
- React 19
- Vite
- ESLint

**Backend:**
- Django 4.2
- Django REST Framework
- PostgreSQL

**DevOps:**
- Docker & Docker Compose
- Nginx (production)
- GitHub Actions (CI/CD)

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [client-eco-track/README.md](client-eco-track/README.md) - Frontend docs
- [server-eco-track/README.md](server-eco-track/README.md) - Backend docs (if available)

## Contributing

1. Create a feature branch
2. Make changes
3. Test locally: `npm run dev`
4. Commit and push
5. Create a pull request

## License

See [LICENSE](LICENSE) file

## Support

For issues or questions, please open an issue on GitHub.
>>>>>>> 86413e6eb8ee9436f83efb3e6772fe4f62bb251b
