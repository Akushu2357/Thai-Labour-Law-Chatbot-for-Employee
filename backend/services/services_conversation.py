from database.supabase_client import get_supabase_client
from datetime import datetime

def create_chat_room(user_id: str = None, title: str = "การสนทนาใหม่"):
    """สร้างห้องสนทนาใหม่"""
    try:
        room_data = {
            "title": title,
            "is_archive": False,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # เพิ่ม user_id ถ้ามี
        if user_id:
            room_data["user_id"] = user_id
        
        result = get_supabase_client().table("chat_rooms").insert(room_data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "Failed to create chat room"}
    except Exception as e:
        print(f"Error creating chat room: {e}")
        return {"message": f"Error: {str(e)}"}

def get_chat_rooms(user_id: str = None, include_archived: bool = False):
    """ดึงรายการห้องสนทนาทั้งหมด"""
    try:
        query = get_supabase_client().table("chat_rooms").select("*")
        
        # กรองตาม user_id ถ้ามี
        if user_id:
            query = query.eq("user_id", user_id)
        
        # กรองห้องที่ archive หรือไม่
        if not include_archived:
            query = query.eq("is_archive", False)
        
        result = query.order("updated_at", desc=True).execute()
        
        if result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error getting chat rooms: {e}")
        return {"message": f"Error: {str(e)}"}

def get_chat_room_by_id(room_id: int):
    """ดึงข้อมูลห้องสนทนาตาม ID"""
    try:
        result = get_supabase_client().table("chat_rooms").select("*").eq("id", room_id).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "Chat room not found"}
    except Exception as e:
        print(f"Error getting chat room: {e}")
        return {"message": f"Error: {str(e)}"}

def update_chat_room(room_id: int, title: str = None, is_archive: bool = None):
    """อัพเดทข้อมูลห้องสนทนา"""
    try:
        update_data = {"updated_at": datetime.now().isoformat()}
        
        if title is not None:
            update_data["title"] = title
        
        if is_archive is not None:
            update_data["is_archive"] = is_archive
        
        result = get_supabase_client().table("chat_rooms").update(update_data).eq("id", room_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "Failed to update chat room"}
    except Exception as e:
        print(f"Error updating chat room: {e}")
        return {"message": f"Error: {str(e)}"}

def delete_chat_room(room_id: int):
    """ลบห้องสนทนา (และข้อความทั้งหมดในห้อง)"""
    try:
        # ลบข้อความทั้งหมดในห้องก่อน
        get_supabase_client().table("chat_messages").delete().eq("room_id", room_id).execute()
        
        # ลบห้องสนทนา
        result = get_supabase_client().table("chat_rooms").delete().eq("id", room_id).execute()
        
        return {"message": "Chat room deleted successfully"}
    except Exception as e:
        print(f"Error deleting chat room: {e}")
        return {"message": f"Error: {str(e)}"}

def add_message(room_id: int, sender: str, message: str, metadata: dict = None):
    """เพิ่มข้อความในห้องสนทนา"""
    try:
        # เพิ่มข้อความ
        print(f"Adding message to room {room_id}: sender={sender}, message={message}, metadata={metadata}")
        message_data = {
            "room_id": room_id,
            "sender": sender,  # 'user' หรือ 'bot'
            "message": message,
            "metadata": metadata,
            "created_at": datetime.now().isoformat()
        }
        
        result = get_supabase_client().table("chat_messages").insert(message_data).execute()
        
        # อัพเดท updated_at ของห้องสนทนา
        get_supabase_client().table("chat_rooms").update({
            "updated_at": datetime.now().isoformat()
        }).eq("id", room_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "Failed to add message"}
    except Exception as e:
        print(f"Error adding message: {e}")
        return {"message": f"Error: {str(e)}"}

def get_messages(room_id: int, limit: int = 100):
    """ดึงข้อความทั้งหมดในห้องสนทนา"""
    try:
        result = get_supabase_client().table("chat_messages").select("*").eq(
            "room_id", room_id
        ).order("created_at", desc=False).limit(limit).execute()
        
        if result.data:
            return result.data
        return []
    except Exception as e:
        print(f"Error getting messages: {e}")
        return {"message": f"Error: {str(e)}"}

def get_chat_history(room_id: int):
    """ดึงประวัติการสนทนาทั้งหมดในรูปแบบที่พร้อมใช้กับ LLM"""
    try:
        messages = get_messages(room_id)
        
        if isinstance(messages, list):
            # แปลงเป็นรูปแบบที่ LLM ใช้
            history = []
            for msg in messages:
                history.append({
                    "role": msg["sender"],  # 'user' หรือ 'bot'
                    "content": msg["message"],
                    "metadata": msg.get("metadata", None)
                })
            return history
        return []
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []
