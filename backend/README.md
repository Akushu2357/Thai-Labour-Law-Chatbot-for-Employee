# FastAPI Project Example

## Project Overview
This project is a **FastAPI-based web application** that demonstrates a clean project structure by separating models, schemas, routers, services, and utilities.

## Structure
llm/           -> Contains all logic related to Large Language Models, including model connectors, prompt templates, and processing pipelines.
models/        -> Contains database models
schemas/       -> Defines request and response schemas
routers/       -> Handles API routes
services/      -> Business logic and database interactions
utils/         -> Utility functions (e.g., hashing, validation)
dependencies.py -> Shared dependencies for routes
main.py         -> Application entry point
README.md       -> Project documentation

## How to Run
1. Install dependencies:
```bash
   pip install fastapi uvicorn
```
2. Run the server:
```bash
   uvicorn main:app --reload
```