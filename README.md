# Customer Service Bot

An automated customer service bot using n8n and Chatwoot with advanced analytics and help center.

## What This Does

This project integrates n8n (workflow automation) with Chatwoot (customer messaging platform) to create an intelligent customer service bot. The bot can handle common inquiries, route conversations, automate responses, and track engagement analytics.

## ✨ Features

- **Interactive Menu System** - 10 options (0-9) for common customer queries
- **Multi-Inbox Support** - Different configurations for WhatsApp SV, WhatsApp default, and other channels
- **Help Center (Option 0)** - Integrated tutorials and YouTube videos
- **Smart Intent Detection** - Understands natural language queries
- **Sentiment Analysis** - Detects urgency and negative sentiment
- **Auto-Escalation** - Routes to human agents when needed (Option 9)
- **Analytics Tracking** - Tracks all interactions to Supabase
- **Visual Dashboard** - Real-time charts and engagement metrics
- **Business Hours Awareness** - Adapts responses based on time

## Tech Stack

- **n8n** - Workflow automation platform
- **Chatwoot** - Open-source customer engagement platform
- **Supabase** - Backend as a service (analytics database)
- **PostgreSQL** - Database for both services
- **Redis** - Cache and session storage
- **Docker & Docker Compose** - Containerization
- **Chart.js** - Analytics visualization

## Getting Started

1. Copy `.env.example` to `.env` and fill in your values
2. Follow the detailed setup in [docs/SETUP.md](docs/SETUP.md)
3. Set up Supabase following [docs/HELP-CENTER-ANALYTICS.md](docs/HELP-CENTER-ANALYTICS.md)
4. Run `docker-compose up -d`
5. Access n8n at http://localhost:5678
6. Access Chatwoot at http://localhost:3000
7. Open analytics dashboard at `analytics-dashboard.html`

## 📋 Menu Options

The bot supports the following menu options:

- **0️⃣** - Help Center & Tutorials (YouTube videos)
- **1️⃣** - Order Status
- **2️⃣** - Shipping Information
- **3️⃣** - Returns & Exchanges
- **4️⃣** - Pricing & Products
- **5️⃣** - Account Issues
- **6️⃣** - Billing & Payments
- **7️⃣** - Product Availability
- **8️⃣** - Hours & Contact
- **9️⃣** - Speak with Human Agent

## Project Structure

- `message-handler.js` - Main bot logic with menu and analytics
- `n8n/workflows/` - n8n workflow definitions
- `config/` - Configuration files (Supabase, etc.)
- `chatwoot/config/` - Chatwoot configuration files
- `docs/` - Documentation
- `scripts/` - Helper scripts and database schemas
- `help-center.html` - Help center page with YouTube tutorials
- `analytics-dashboard.html` - Analytics visualization dashboard

## Documentation

- [Setup Guide](docs/SETUP.md) - Initial setup instructions
- [Workflow Documentation](docs/WORKFLOWS.md) - n8n workflows
- [Help Center & Analytics Guide](docs/HELP-CENTER-ANALYTICS.md) - New features setup
- [Multi-Inbox Setup](MULTI-INBOX-SETUP.md) - Configure multiple inboxes

## 📊 Analytics & Tracking

The bot tracks all user interactions including:
- Menu option selections
- Intent detection
- Escalations to human agents
- Sentiment analysis
- Hourly usage patterns
- Inbox performance metrics

Data is stored in Supabase and visualized in the analytics dashboard.

## 🎥 YouTube Integration

The help center integrates with the official Vitrinnea YouTube channel:
- https://www.youtube.com/@shopvitrinnea

Embedded tutorials help users self-serve common questions.

## License

MIT
