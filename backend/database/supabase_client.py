import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Lazy-initialized Supabase client. Calling get_supabase_client() will create
# and cache the client on first use. This avoids failing at import time if
# environment variables are not yet available.
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    # Load environment variables from .env (if present)
    load_dotenv()

    url: Optional[str] = os.environ.get("SUPABASE_URL")
    key: Optional[str] = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in environment to use Supabase client")

    _supabase_client = create_client(url, key)
    return _supabase_client