from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.services_user import *

router = APIRouter(prefix="/users", tags=["users"])

class CreateUserRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UpdateUserRequest(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    detail: Optional[str] = None

# ===================== User Profile =====================

@router.post("/")
def create_user(request: CreateUserRequest):
    """สร้างหรืออัพเดท user profile"""
    return create_or_update_user(
        user_id=request.user_id,
        email=request.email,
        display_name=request.display_name,
        avatar_url=request.avatar_url
    )

@router.get("/{user_id}")
def get_user(user_id: str):
    """ดึงข้อมูล user ตาม ID"""
    return get_user_by_id(user_id)

@router.put("/{user_id}")
def update_user(user_id: str, request: UpdateUserRequest):
    """อัพเดทข้อมูล user profile"""
    return update_user_profile(
        user_id=user_id,
        display_name=request.display_name,
        avatar_url=request.avatar_url,
        detail=request.detail
    )

@router.delete("/{user_id}")
def delete_user_profile(user_id: str):
    """ลบ user profile"""
    return delete_user(user_id)
