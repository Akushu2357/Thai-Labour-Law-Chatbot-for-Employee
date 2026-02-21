from typing import Optional

from database.supabase_client import get_supabase_client, get_supabase_client_with_auth


def normalize_token(auth_token: Optional[str]) -> Optional[str]:
    if not auth_token:
        return None
    if auth_token.lower().startswith("bearer "):
        return auth_token[7:].strip()
    return auth_token


def get_user_client(auth_token: Optional[str]):
    token = normalize_token(auth_token)
    if token:
        return get_supabase_client_with_auth(token)
    return get_supabase_client()
