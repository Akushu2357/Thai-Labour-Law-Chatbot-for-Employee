# Thai-Labour-Law-Chatbot-for-Employee
KMUTT CPE36 Senior project: Thai Labour Law Chatbot for Employee

## Project Overview

This repository contains a full-stack web application: a React frontend and a FastAPI backend. The app provides an LLM-powered chatbot focused on Thai labour law for employees.

### Architecture
- Frontend (React) — user interface and client logic
- Backend (FastAPI) — API, business logic, and LLM integration
- Database (PostgreSQL) — persistent storage for users and content

### Highlights
- Authentication and user management
- Responsive UI and modular React components
- Clean backend organization (routers, services, utils)
- Pluggable LLM integration for Q&A and summarization

## Getting Started
Follow these steps to run the project locally.

1. Backend (Python / FastAPI)

	- Create and activate a virtual environment, then install dependencies:

	```powershell
	python -m venv .venv
	.\.venv\Scripts\Activate.ps1
	pip install -r backend/requirements.txt
	```

	- Run the backend with uvicorn (from the `backend` folder):

	```powershell
	cd backend
	uvicorn main:app --reload
	```

	The API will be available at http://127.0.0.1:8000.

2. Frontend (React)

	- Install Node dependencies and start the dev server:

	```bash
	cd frontend
	npm install
	npm start
	```

	The frontend runs at http://localhost:3000 by default.

## Documentation
- Backend-specific notes: [backend/README.md](backend/README.md)
- Frontend-specific notes: [frontend/README.md](frontend/README.md)

## Contributing
Feel free to open issues or PRs. For local development, run backend and frontend concurrently and follow each subproject's README for details.

## License
This project was created for an academic senior project; check with the maintainers for reuse permissions.