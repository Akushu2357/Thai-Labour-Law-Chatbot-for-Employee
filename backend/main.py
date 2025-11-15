from fastapi import FastAPI
from routers import routers_act, routers_help, routers_section

# Main application: do not initialize external clients at import-time.

app = FastAPI(title="Thai Labour Law - Supabase-backed API")

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