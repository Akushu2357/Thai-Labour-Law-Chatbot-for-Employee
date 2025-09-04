# Thai-Labour-Law-Chatbot-for-Employee
KMUTT CPE36 Senior project: Thai Labour Law Chatbot for Employee

## Project Overview

This project is a **full-stack web application** built with **React (frontend)** and **FastAPI (backend)**.  
It demonstrates clean architecture principles by separating frontend and backend responsibilities, and includes integration with Large Language Models (LLMs) for intelligent features.

### Architecture
- **Frontend (React, Netlify)** → Provides the user interface and communicates with the backend via REST APIs  
- **Backend (FastAPI, Render)** → Handles business logic, database operations, and LLM integration  
- **Database (PostgreSQL, Render)** → Stores user and application data  
- **LLM** → Integrated through a dedicated module, either via external APIs or a self-hosted model  

### Features
- User authentication and management  
- Responsive and interactive UI  
- RESTful API design with clear documentation  
- Scalable project structure for maintainability  
- Modular LLM integration for text-based tasks (Q&A, summarization, etc.)  