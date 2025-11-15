import os
from fastapi import FastAPI
import uvicorn
from routers import routers_act, routers_help, routers_section
from fastapi.middleware.cors import CORSMiddleware

# Main application: do not initialize external clients at import-time.

app = FastAPI(title="Thai Labour Law - Supabase-backed API")
origins = [
    "http://localhost:3000",  # React dev
    "https://thai-labour-law-chatbot-for-employee.netlify.app",  # Production front-end
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # อนุญาต origin
    allow_credentials=True,
    allow_methods=["*"],            # GET, POST, PUT, DELETE, ...
    allow_headers=["*"],            # Authorization, Content-Type, ...
)

# Include routers
app.include_router(routers_act.router, prefix="/api", tags=["api"])
app.include_router(routers_section.router, prefix="/api", tags=["api"])
app.include_router(routers_help.router, prefix="", tags=["help"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Thai Labour Law API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))

    uvicorn.run(app, host="0.0.0.0", port=port)

