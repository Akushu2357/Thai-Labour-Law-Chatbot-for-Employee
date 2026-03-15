from fastapi import APIRouter, Header, Query, HTTPException
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
    metadata: Optional[dict] = None
# ===================== Chat Rooms =====================

@router.post("/rooms")
def create_room(request: CreateRoomRequest, authorization: Optional[str] = Header(None, alias="Authorization")):
    """สร้างห้องสนทนาใหม่"""
    result = create_chat_room(user_id=request.user_id, title=request.title, auth_token=authorization)
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to create chat room"))

@router.get("/rooms")
def get_rooms(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    include_archived: bool = Query(False, description="Include archived rooms"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """ดึงรายการห้องสนทนาทั้งหมด"""
    result = get_chat_rooms(user_id=user_id, include_archived=include_archived, auth_token=authorization)
    if isinstance(result, list):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to fetch chat rooms"))

@router.get("/rooms/{room_id}")
def get_room(room_id: int, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ดึงข้อมูลห้องสนทนาตาม ID"""
    result = get_chat_room_by_id(room_id, auth_token=authorization)
    if isinstance(result, dict) and result.get("id"):
        return result
    # If service returns an error message, map it to 404 when appropriate
    message = result.get("message") if isinstance(result, dict) else None
    if message and "not found" in message.lower():
        raise HTTPException(status_code=404, detail=message)
    raise HTTPException(status_code=500, detail=message or "Failed to fetch chat room")

@router.put("/rooms/{room_id}")
def update_room(room_id: int, request: UpdateRoomRequest, authorization: Optional[str] = Header(None, alias="Authorization")):
    """อัพเดทข้อมูลห้องสนทนา"""
    result = update_chat_room(room_id=room_id, title=request.title, is_archive=request.is_archive, auth_token=authorization)
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to update chat room"))

@router.delete("/rooms/{room_id}")
def delete_room(room_id: int, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ลบห้องสนทนา"""
    result = delete_chat_room(room_id, auth_token=authorization)
    if isinstance(result, dict) and result.get("message") and "deleted" in result.get("message").lower():
        return {"detail": result.get("message")}
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to delete chat room"))

@router.delete("/rooms/by-user/{user_id}")
def delete_rooms_by_user(user_id: str, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ลบห้องสนทนาทั้งหมดของผู้ใช้"""
    result = delete_chat_rooms_by_user(user_id, auth_token=authorization)
    if isinstance(result, dict) and result.get("message") and ("deleted" in result.get("message").lower() or result.get("deleted_room_count") is not None):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to delete user chat rooms"))

# ===================== Messages =====================

@router.post("/rooms/{room_id}/messages")
def add_message_to_room(
    room_id: int,
    request: AddMessageRequest,
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """เพิ่มข้อความในห้องสนทนา"""
    result = add_message(
        room_id=room_id,
        sender=request.sender,
        message=request.message,
        metadata=request.metadata,
        auth_token=authorization,
    )
    # inserted message should have an `id`
    if isinstance(result, dict) and result.get("id"):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to add message"))

@router.get("/rooms/{room_id}/messages")
def get_room_messages(
    room_id: int,
    limit: int = Query(100, description="Maximum number of messages to return"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
):
    """ดึงข้อความทั้งหมดในห้องสนทนา"""
    result = get_messages(room_id=room_id, limit=limit, auth_token=authorization)
    if isinstance(result, list):
        return result
    raise HTTPException(status_code=500, detail=result.get("message", "Failed to fetch messages"))

@router.get("/rooms/{room_id}/history")
def get_room_history(room_id: int, authorization: Optional[str] = Header(None, alias="Authorization")):
    """ดึงประวัติการสนทนาในรูปแบบที่พร้อมใช้กับ LLM"""
    result = get_chat_history(room_id, auth_token=authorization)
    if isinstance(result, list):
        return result
    raise HTTPException(status_code=500, detail="Failed to fetch chat history")
