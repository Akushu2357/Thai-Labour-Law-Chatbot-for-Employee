from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from services.services_conversation import *

router = APIRouter(prefix="/conversations", tags=["conversations"])

class CreateRoomRequest(BaseModel):
    user_id: Optional[str] = None
    title: str = "การสนทนาใหม่"

class UpdateRoomRequest(BaseModel):
    title: Optional[str] = None
    is_archive: Optional[bool] = None

class AddMessageRequest(BaseModel):
    sender: str  # 'user' หรือ 'bot'
    message: str

# ===================== Chat Rooms =====================

@router.post("/rooms")
def create_room(request: CreateRoomRequest):
    """สร้างห้องสนทนาใหม่"""
    return create_chat_room(user_id=request.user_id, title=request.title)

@router.get("/rooms")
def get_rooms(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    include_archived: bool = Query(False, description="Include archived rooms")
):
    """ดึงรายการห้องสนทนาทั้งหมด"""
    return get_chat_rooms(user_id=user_id, include_archived=include_archived)

@router.get("/rooms/{room_id}")
def get_room(room_id: int):
    """ดึงข้อมูลห้องสนทนาตาม ID"""
    return get_chat_room_by_id(room_id)

@router.put("/rooms/{room_id}")
def update_room(room_id: int, request: UpdateRoomRequest):
    """อัพเดทข้อมูลห้องสนทนา"""
    return update_chat_room(room_id=room_id, title=request.title, is_archive=request.is_archive)

@router.delete("/rooms/{room_id}")
def delete_room(room_id: int):
    """ลบห้องสนทนา"""
    return delete_chat_room(room_id)

# ===================== Messages =====================

@router.post("/rooms/{room_id}/messages")
def add_message_to_room(room_id: int, request: AddMessageRequest):
    """เพิ่มข้อความในห้องสนทนา"""
    return add_message(room_id=room_id, sender=request.sender, message=request.message)

@router.get("/rooms/{room_id}/messages")
def get_room_messages(
    room_id: int,
    limit: int = Query(100, description="Maximum number of messages to return")
):
    """ดึงข้อความทั้งหมดในห้องสนทนา"""
    return get_messages(room_id=room_id, limit=limit)

@router.get("/rooms/{room_id}/history")
def get_room_history(room_id: int):
    """ดึงประวัติการสนทนาในรูปแบบที่พร้อมใช้กับ LLM"""
    return get_chat_history(room_id)
