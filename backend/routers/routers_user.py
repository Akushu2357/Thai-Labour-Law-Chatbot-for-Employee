from fastapi import APIRouter, Header, HTTPException
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
    date_of_birth: Optional[str] = None
    job_description: Optional[str] = None
    start_work_date: Optional[str] = None
    job_type_description: Optional[str] = None

# ===================== User Profile =====================

@router.post("/")
def create_user(request: CreateUserRequest, authorization: Optional[str] = Header(None, alias="Authorization")):
    """สร้างหรืออัพเดท user profile"""
    result = create_or_update_user(
        user_id=request.user_id,
        email=request.email,
        display_name=request.display_name,
        avatar_url=request.avatar_url,
        auth_token=authorization,
    )
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to create/update user"))

@router.get("/{user_id}")
def get_user(user_id: str, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ดึงข้อมูล user ตาม ID"""
    result = get_user_by_id(user_id, auth_token=authorization)
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=404, detail=result.get("message", "User not found"))

@router.put("/{user_id}")
def update_user(user_id: str, request: UpdateUserRequest, authorization: Optional[str] = Header(None, alias="Authorization")):
    """อัพเดทข้อมูล user profile"""
    result = update_user_profile(
        user_id=user_id,
        display_name=request.display_name,
        avatar_url=request.avatar_url,
        detail=request.detail,
        date_of_birth=request.date_of_birth,
        job_description=request.job_description,
        start_work_date=request.start_work_date,
        job_type_description=request.job_type_description,
        auth_token=authorization,
    )
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to update user profile"))

@router.delete("/{user_id}")
def delete_user_profile(user_id: str, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ลบ user profile"""
    result = delete_user(user_id, auth_token=authorization)
    if isinstance(result, dict) and result.get("message") and "deleted" in result.get("message").lower():
        return {"detail": result.get("message")}
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to delete user"))

# ===================== Job & Job Type Options =====================

@router.get("/options/jobs")
def get_jobs():
    """ดึงรายชื่อ job ทั้งหมด"""
    return get_all_jobs()

@router.get("/options/job-types")
def get_job_types():
    """ดึงรายชื่อ job_type ทั้งหมด"""
    return get_all_job_types()