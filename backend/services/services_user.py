from database.supabase_client import get_supabase_client
from datetime import datetime

def create_or_update_user(user_id: str, email: str = None, display_name: str = None, avatar_url: str = None):
    """สร้างหรืออัพเดท user profile"""
    try:
        # ตรวจสอบว่ามี user อยู่แล้วหรือไม่
        existing_user = get_supabase_client().table("users").select("*").eq("id", user_id).limit(1).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            # อัพเดท user ที่มีอยู่แล้ว
            update_data = {
                "updated_at": datetime.now().isoformat()
            }
            
            if display_name is not None:
                update_data["display_name"] = display_name
            
            if avatar_url is not None:
                update_data["avatar_url"] = avatar_url
            
            result = get_supabase_client().table("users").update(update_data).eq("id", user_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return {"message": "Failed to update user"}
        else:
            # สร้าง user ใหม่
            user_data = {
                "id": user_id,
                "display_name": display_name or email or "ผู้ใช้",
                "avatar_url": avatar_url,
                "role": "user",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            result = get_supabase_client().table("users").insert(user_data).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return {"message": "Failed to create user"}
    except Exception as e:
        print(f"Error creating/updating user: {e}")
        return {"message": f"Error: {str(e)}"}

def get_user_by_id(user_id: str):
    """ดึงข้อมูล user ตาม ID"""
    try:
        result = get_supabase_client().table("users").select("*").eq("id", user_id).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "User not found"}
    except Exception as e:
        print(f"Error getting user: {e}")
        return {"message": f"Error: {str(e)}"}

def update_user_profile(user_id: str, display_name: str = None, avatar_url: str = None, detail: str = None):
    """อัพเดทข้อมูล user profile"""
    try:
        update_data = {
            "updated_at": datetime.now().isoformat()
        }
        
        if display_name is not None:
            update_data["display_name"] = display_name
        
        if avatar_url is not None:
            update_data["avatar_url"] = avatar_url
        
        if detail is not None:
            update_data["detail"] = detail
        
        result = get_supabase_client().table("users").update(update_data).eq("id", user_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {"message": "Failed to update user profile"}
    except Exception as e:
        print(f"Error updating user profile: {e}")
        return {"message": f"Error: {str(e)}"}

def delete_user(user_id: str):
    """ลบ user (ควรใช้อย่างระมัดระวัง)"""
    try:
        result = get_supabase_client().table("users").delete().eq("id", user_id).execute()
        return {"message": "User deleted successfully"}
    except Exception as e:
        print(f"Error deleting user: {e}")
        return {"message": f"Error: {str(e)}"}
