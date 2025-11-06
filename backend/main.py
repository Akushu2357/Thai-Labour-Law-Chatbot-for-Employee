from fastapi import FastAPI
from routers import acts_router

# Main application: do not initialize external clients at import-time.

app = FastAPI(title="Thai Labour Law - Supabase-backed API")

# Include routers
app.include_router(acts_router.router, prefix="/acts", tags=["acts"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Thai Labour Law API"}