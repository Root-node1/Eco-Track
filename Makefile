.PHONY: help build-docker up down logs shell-server shell-client migrate install-all clean dev

help:
	@echo "Eco-Track Deployment Commands"
	@echo "================================"
	@echo "make install-all      - Install dependencies for both frontend and backend"
	@echo "make dev              - Run development servers (frontend + backend)"
	@echo "make dev-client       - Run frontend only"
	@echo "make dev-server       - Run backend only"
	@echo "make build            - Build both frontend and backend"
	@echo "make build-docker     - Build Docker images"
	@echo "make up               - Start Docker containers"
	@echo "make up-prod          - Start Docker containers with Nginx"
	@echo "make down             - Stop Docker containers"
	@echo "make logs             - View Docker logs"
	@echo "make migrate          - Run Django migrations"
	@echo "make clean            - Clean build artifacts and caches"
	@echo "make shell-server     - Open Django shell"
	@echo "make shell-client     - Open client shell"

install-all:
	npm install
	cd client-eco-track && npm install
	cd ../server-eco-track && pip install -r requirements.txt

dev:
	npm run dev

dev-client:
	cd client-eco-track && npm run dev

dev-server:
	cd server-eco-track && python manage.py runserver

build:
	npm run build

build-docker:
	docker-compose build

up:
	docker-compose up -d

up-prod:
	docker-compose --profile prod up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	docker-compose exec server python manage.py migrate

shell-server:
	docker-compose exec server python manage.py shell

shell-client:
	cd client-eco-track && npm

clean:
	rm -rf client-eco-track/dist client-eco-track/node_modules
	rm -rf server-eco-track/__pycache__ server-eco-track/*.pyc
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
