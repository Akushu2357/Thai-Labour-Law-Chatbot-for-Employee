from fastapi import APIRouter, Depends

router = APIRouter(prefix="/help", tags=["help"])

@router.get("/")
def help_info():
    return {
        "endpoints": {
            "/": "Welcome message.",
            "/health": "Health check endpoint.",
            "/api": "API endpoints.",
            "/llm": "LLM chatbot endpoints.",
            # "/auth": "Authentication endpoints.",
        }
    }

@router.get("/api")
def help_api():
    return {
        "endpoints": {
            "/acts": "Endpoints related to acts.",
            "/sections": "Endpoints related to act sections.",
            "/libraries": "Endpoints related to library resources."
        }
    }

@router.get("/api/sections")
def help_sections():
    return {
        "endpoints": {
            "/by/section_id/{section_id}": "Get section by its ID.",
            "/by/act_id/{act_id}": "Get sections by act ID.",
            "/by/book_id/{book_id}": "Get sections by book ID.",
            "/by/group_id/{group_id}": "Get sections by group ID.",
            "/by/super_section_id/{super_section_id}": "Get sections by super section ID.",
            "/by/act_id/{act_id}/section_number/{section_number}": "Get section by act ID and section number.",
            "/by/act_id/{act_id}/search/{keyword}": "Get sections by act ID and keyword.",
            "/search/{keyword}": "Search sections by keyword."
        }
    }
    
@router.get("/api/acts")
def help_acts():
    return {
        "endpoints": {
            "/by/act_id/{act_id}": "Get act by its ID.",
            "/": "Get all acts.",
            "/by/act_name/{act_name}": "Get act by its name.",
            "/search/{keyword}": "Search acts by keyword.",
            "/books/by/act_id/{act_id}": "Get books by act ID.",
            "/books/by/book_id/{book_id}": "Get book by its ID.",
            "/books/by/act_id/{act_id}/book_number/{book_number}": "Get book by act ID and book number.",
            "/books/search/{keyword}": "Search books by keyword.",
            "/groups/by/book_id/{book_id}": "Get groups by book ID.",
            "/groups/by/group_id/{group_id}": "Get group by its ID.",
            "/groups/by/act_id/{act_id}/group_number/{group_number}": "Get group by act ID and group number.",
            "/groups/search/{keyword}": "Search groups by keyword.",
            "/super_sections/by/act_id/{act_id}": "Get super sections by act ID.",
            "/super_sections/by/group_id/{group_id}": "Get super sections by group ID.",
            "/super_sections/by/super_section_id/{super_section_id}": "Get super section by its ID.",
            "/super_sections/by/act_id/{act_id}/super_section_number/{super_section_number}": "Get super section by act ID and super section number.",
            "/super_sections/search/{keyword}": "Search super sections by keyword."
        }
    }

@router.get("/api/libraries")
def help_libraries():
    return {
        "endpoints": {
            "/acts": "Get all acts in the library.",
            "/tags": "Get all tags.",
            "/acts/{act_id}/books": "Get books for an act.",
            "/books/{book_id}/groups": "Get groups for a book.",
            "/groups/{group_id}/super_sections": "Get super sections for a group.",
            "/super_sections/{super_section_id}/sections": "Get sections for a super section.",
            "/sections/{act_id}/{section_number}": "Get section by act ID and section number."
        }
    }
    
@router.get("/llm")
def help_llm():
    return {
        "endpoints": {
            "/chat": "Endpoint for chat with LLM.",
            "/chat_stream": "Endpoint for streaming chat with LLM."
        }
    }