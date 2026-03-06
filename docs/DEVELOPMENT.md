# Development Guide

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite

### Setup
1. Run `./scripts/setup.sh` to install dependencies
2. Run `./scripts/dev.sh` to start both servers
3. Access the app at http://localhost:5173

### Backend Development
```bash
cd productivity_dashboard/backend
source ../../venv/bin/activate
python manage.py runserver```
### Frontend Development
```bash
cd productivity_dashboard/frontend
npm run dev```
### Project Structure
 - backend/ - Django REST API
 - frontend/ - React application
 - scripts/ - Automation scripts
 - docs/ - Documentation
