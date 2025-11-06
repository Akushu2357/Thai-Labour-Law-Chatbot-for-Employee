# FastAPI Project Example

## Project Overview
This project is a **FastAPI-based web application** that demonstrates a clean project structure by separating models, schemas, routers, services, and utilities.

## Structure
llm/           -> Contains all logic related to Large Language Models, including model connectors, prompt templates, and processing pipelines.
database/       -> Defines request and response schemas
routers/       -> Handles API routes
services/      -> Business logic and database interactions
utils/         -> Utility functions (e.g., hashing, validation)
dependencies.py -> Shared dependencies for routes
main.py         -> Application entry point
README.md       -> Project documentation

## Requirements
See `requirements.txt` for the exact Python packages required to run the backend.

## Install & run (local development)
1. Create a virtual environment and activate it:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the app with auto-reload:

```powershell
uvicorn main:app --reload
```

The API will be served at http://127.0.0.1:8000. The root endpoint `/` returns a welcome message. Routers are mounted under `/acts` (e.g. `/acts/sections/{section_id}`).

## Health check
Add a simple health or readiness endpoint to `main.py` (recommended) to let orchestrators detect service availability.

## Next steps (suggested)
- Add `requirements.txt` (done)
- Add `.env.example` (showing variable names only)
- Add simple tests (pytest) and a basic GitHub Action to run lint/tests on PRs
- Add `pre-commit` hooks (black, ruff/isort)