# HarvestAlert Deployment Guide

This guide covers deployment options for the HarvestAlert MVP, including Docker-based deployment and manual deployment.

## Table of Contents

- [Docker Deployment (Recommended)](#docker-deployment-recommended)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

## Docker Deployment (Recommended)

Docker deployment provides the easiest and most consistent way to deploy HarvestAlert across different environments.

### Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 2GB of available RAM
- At least 5GB of available disk space

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd HarvestAlert
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your configuration:**
   ```bash
   nano .env
   ```
   
   **Important:** Change the default PostgreSQL password!
   ```env
   POSTGRES_PASSWORD=your-secure-password-here
   ```

4. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

5. **Check service health:**
   ```bash
   docker-compose ps
   ```
   
   All services should show "healthy" status.

6. **Access the application:**
   - Frontend Dashboard: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Compose Services

The `docker-compose.yml` file defines three services:

1. **database** - PostgreSQL 15 database
   - Port: 5432 (configurable via `POSTGRES_PORT`)
   - Data persisted in Docker volume `postgres_data`
   - Health check: PostgreSQL ready check

2. **backend** - FastAPI application
   - Port: 8000 (configurable via `API_PORT`)
   - Depends on: database
   - Automatically initializes database on startup
   - Health check: `/health` endpoint

3. **frontend** - Next.js application
   - Port: 3000 (configurable via `FRONTEND_PORT`)
   - Depends on: backend
   - Health check: HTTP status check

### Docker Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Stop services and remove volumes (WARNING: deletes all data):**
```bash
docker-compose down -v
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

**Restart a service:**
```bash
docker-compose restart backend
```

**Rebuild after code changes:**
```bash
docker-compose up -d --build
```

**Execute commands in a container:**
```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec database psql -U harvestalert -d harvestalert

# Frontend shell
docker-compose exec frontend sh
```

### Docker Deployment to Production

For production deployment, follow these additional steps:

1. **Update environment variables in `.env`:**
   ```env
   # Use strong passwords
   POSTGRES_PASSWORD=<strong-random-password>
   
   # Set to production
   ENVIRONMENT=production
   
   # Update CORS origins with your production domain
   CORS_ORIGINS=https://your-domain.com
   
   # Update API URL for frontend
   NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
   ```

2. **Use a reverse proxy (nginx or Traefik):**
   - Terminate SSL/TLS
   - Route traffic to frontend and backend
   - Add rate limiting and security headers

3. **Set up database backups:**
   ```bash
   # Backup
   docker-compose exec database pg_dump -U harvestalert harvestalert > backup.sql
   
   # Restore
   docker-compose exec -T database psql -U harvestalert harvestalert < backup.sql
   ```

4. **Monitor container health:**
   ```bash
   docker-compose ps
   docker stats
   ```

## Manual Deployment

Manual deployment gives you more control but requires more setup steps.

### Backend Deployment

#### Prerequisites

- Python 3.9 or higher
- PostgreSQL 12 or higher (or SQLite for development)
- pip and virtualenv

#### Steps

1. **Set up Python environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update database connection and other settings.

3. **Set up PostgreSQL database:**
   ```bash
   # Create database and user
   sudo -u postgres psql
   ```
   
   ```sql
   CREATE DATABASE harvestalert;
   CREATE USER harvestalert WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE harvestalert TO harvestalert;
   \q
   ```

4. **Initialize database:**
   ```bash
   python init_db.py
   ```

5. **Run the application:**
   
   **Development:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   
   **Production (with Gunicorn):**
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

6. **Set up as a system service (Linux):**
   
   Create `/etc/systemd/system/harvestalert-backend.service`:
   ```ini
   [Unit]
   Description=HarvestAlert Backend API
   After=network.target postgresql.service
   
   [Service]
   Type=notify
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/HarvestAlert/backend
   Environment="PATH=/path/to/HarvestAlert/backend/venv/bin"
   ExecStart=/path/to/HarvestAlert/backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Enable and start:
   ```bash
   sudo systemctl enable harvestalert-backend
   sudo systemctl start harvestalert-backend
   sudo systemctl status harvestalert-backend
   ```

### Frontend Deployment

#### Prerequisites

- Node.js 18 or higher
- npm or yarn

#### Steps

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
   
   Update API base URL.

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run the application:**
   
   **Using Next.js built-in server:**
   ```bash
   npm start
   ```
   
   **Using PM2 (recommended for production):**
   ```bash
   npm install -g pm2
   pm2 start npm --name "harvestalert-frontend" -- start
   pm2 save
   pm2 startup
   ```

5. **Deploy to Vercel (alternative):**
   ```bash
   npm install -g vercel
   vercel --prod
   ```
   
   Follow the prompts and set environment variables in Vercel dashboard.

## Environment Configuration

### Backend Environment Variables

See `backend/.env.example` for all available options.

**Required:**
- `DATABASE_URL` - PostgreSQL or SQLite connection string
- `API_PORT` - Port for API server (default: 8000)
- `CORS_ORIGINS` - Comma-separated list of allowed frontend URLs

**Optional:**
- `API_HOST` - Host to bind to (default: 0.0.0.0)
- `ENVIRONMENT` - development, staging, or production
- `LOG_LEVEL` - DEBUG, INFO, WARNING, ERROR, CRITICAL
- `DB_POOL_SIZE` - PostgreSQL connection pool size
- `DB_MAX_OVERFLOW` - Max overflow connections
- `DB_POOL_TIMEOUT` - Connection timeout in seconds
- `DB_POOL_RECYCLE` - Connection recycle time in seconds

### Frontend Environment Variables

See `frontend/.env.example` for all available options.

**Required:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

**Optional:**
- `NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT` - Default map latitude
- `NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG` - Default map longitude
- `NEXT_PUBLIC_MAP_DEFAULT_ZOOM` - Default map zoom level
- `NODE_ENV` - development or production

### Docker Compose Environment Variables

See `.env.example` for all available options.

**Required:**
- `POSTGRES_PASSWORD` - PostgreSQL password (CHANGE IN PRODUCTION!)

**Optional:**
- `POSTGRES_DB` - Database name (default: harvestalert)
- `POSTGRES_USER` - Database user (default: harvestalert)
- `POSTGRES_PORT` - Database port (default: 5432)
- `API_PORT` - Backend port (default: 8000)
- `FRONTEND_PORT` - Frontend port (default: 3000)
- `CORS_ORIGINS` - Allowed CORS origins
- `NEXT_PUBLIC_API_BASE_URL` - API URL for frontend
- `ENVIRONMENT` - Environment name
- `LOG_LEVEL` - Logging level

## Production Considerations

### Security

1. **Use strong passwords:**
   - Generate random passwords for database
   - Never commit `.env` files to version control

2. **Enable HTTPS:**
   - Use Let's Encrypt for free SSL certificates
   - Configure reverse proxy (nginx/Traefik) for SSL termination

3. **Restrict CORS origins:**
   - Only allow your production frontend domain
   - Remove localhost origins in production

4. **Set up firewall rules:**
   - Only expose ports 80 (HTTP) and 443 (HTTPS)
   - Block direct access to database port (5432)
   - Block direct access to backend port (8000) if using reverse proxy

5. **Keep dependencies updated:**
   ```bash
   # Backend
   pip list --outdated
   pip install --upgrade <package>
   
   # Frontend
   npm outdated
   npm update
   ```

### Performance

1. **Database optimization:**
   - Ensure indexes are created (done by init_db.py)
   - Monitor query performance
   - Set up connection pooling (configured in database.py)

2. **Backend scaling:**
   - Use multiple Gunicorn workers (4 workers = 4 CPU cores)
   - Consider horizontal scaling with load balancer
   - Enable response caching for frequently accessed data

3. **Frontend optimization:**
   - Enable CDN for static assets
   - Use Next.js Image optimization
   - Enable compression (already configured)

4. **Resource limits (Docker):**
   ```yaml
   # Add to docker-compose.yml services
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
       reservations:
         cpus: '0.5'
         memory: 512M
   ```

### Monitoring

1. **Health checks:**
   - Backend: `GET /health`
   - Frontend: HTTP status check
   - Database: `pg_isready` command

2. **Logging:**
   - Backend logs to stdout (captured by Docker)
   - Frontend logs to stdout
   - Use log aggregation service (e.g., ELK stack, Datadog)

3. **Metrics:**
   - Monitor response times
   - Track error rates
   - Monitor resource usage (CPU, memory, disk)

4. **Alerting:**
   - Set up alerts for service downtime
   - Alert on high error rates
   - Alert on resource exhaustion

### Backup and Recovery

1. **Database backups:**
   ```bash
   # Automated daily backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker-compose exec -T database pg_dump -U harvestalert harvestalert > backup_$DATE.sql
   
   # Keep only last 7 days
   find . -name "backup_*.sql" -mtime +7 -delete
   ```

2. **Application backups:**
   - Version control for code (Git)
   - Backup environment files (encrypted)
   - Document configuration changes

3. **Disaster recovery plan:**
   - Document recovery procedures
   - Test recovery process regularly
   - Keep backups in multiple locations

## Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(3000|8000|5432)'

# Remove old containers and volumes
docker-compose down -v
docker-compose up -d
```

**Database connection errors:**
```bash
# Check database is running
docker-compose ps database

# Check database logs
docker-compose logs database

# Verify connection from backend
docker-compose exec backend python -c "from database import check_db_connection; print(check_db_connection())"
```

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check CORS configuration in backend
- Verify backend is accessible: `curl http://localhost:8000/health`

### Manual Deployment Issues

**Backend won't start:**
- Check Python version: `python --version`
- Verify virtual environment is activated
- Check database connection in `.env`
- Review logs for error messages

**Frontend build fails:**
- Check Node.js version: `node --version`
- Clear cache: `rm -rf .next node_modules && npm install`
- Verify environment variables are set

**Database connection fails:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection string in `.env`
- Verify database exists: `psql -U harvestalert -d harvestalert -c "\dt"`

### Performance Issues

**Slow API responses:**
- Check database query performance
- Monitor CPU and memory usage
- Review logs for errors
- Consider adding caching

**High memory usage:**
- Reduce number of workers
- Check for memory leaks
- Monitor with `docker stats` or `htop`

**Database connection pool exhausted:**
- Increase `DB_POOL_SIZE` in `.env`
- Check for connection leaks in code
- Monitor active connections

## Support

For additional help:
- Check the main [README.md](README.md) for setup instructions
- Review API documentation at `/docs` endpoint
- Check application logs for error messages
- Open an issue on the project repository

---

**Last Updated:** 2024
**Version:** 1.0.0 (MVP)
