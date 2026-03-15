# FastAPI Backend

## Overview
This folder contains the FastAPI backend for the Thai Labour Law Chatbot. It exposes REST endpoints, integrates with the LLM layer, and handles database interactions.

## Layout (short)
- `llm/` — model connectors, prompt templates, embedding and response helpers
- `database/` — DB schema, migrations, and Supabase client
- `routers/` — API route definitions
- `services/` — business logic and data access
- `utils/` — helper utilities and auth
- `main.py` — FastAPI app entrypoint

## Requirements
Install Python dependencies from `requirements.txt` in this folder.

## Local development — Quick start
1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Configure environment variables:
- Create a `.env` file at the project root or set env vars in your environment. Typical variables include Supabase URL/KEY and any LLM/API keys used by the `llm/` module. Check `database/supabase_client.py` and `llm/` code for exact names.

4. Run the app (from the `backend` folder):

```powershell
cd backend
uvicorn main:app --reload
```

The API will be available at http://127.0.0.1:8000. Routers are mounted under their prefixes (see `routers/`).

## Tips
- Add a `/health` endpoint in `main.py` for readiness checks used by deploy platforms.
- To run unit tests (not included by default), add `pytest` and create a `tests/` folder.

## See also
- Project root README: [README.md](../README.md)
- Frontend README: [frontend/README.md](../frontend/README.md)