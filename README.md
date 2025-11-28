# Customer Service Bot

An automated customer service bot using n8n and Chatwoot.

## What This Does

This project integrates n8n (workflow automation) with Chatwoot (customer messaging platform) to create an intelligent customer service bot. The bot can handle common inquiries, route conversations, and automate responses.

## Tech Stack

- **n8n** - Workflow automation platform
- **Chatwoot** - Open-source customer engagement platform
- **PostgreSQL** - Database for both services
- **Redis** - Cache and session storage
- **Docker & Docker Compose** - Containerization

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values
2. Follow the detailed setup in [docs/SETUP.md](docs/SETUP.md)
3. Run `docker-compose up -d`
4. Access n8n at http://localhost:5678
5. Access Chatwoot at http://localhost:3000

## Project Structure

- `n8n/workflows/` - n8n workflow definitions
- `chatwoot/config/` - Chatwoot configuration files
- `docs/` - Documentation
- `scripts/` - Helper scripts

## Documentation

- [Setup Guide](docs/SETUP.md)
- [Workflow Documentation](docs/WORKFLOWS.md)

## License

MIT
