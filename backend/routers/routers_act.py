from fastapi import APIRouter, Depends
from database.schema import ActSection
from services.services_act_sections import get_section_by_id, get_sections_by_act_id, get_section_by_act_and_section_number, get_sections_by_act_and_keyword, get_sections_by_book_id, get_sections_by_group_id, get_sections_by_super_section_id, get_supabase_client

router = APIRouter(prefix="/sections", tags=["act_sections"])

@router.get("/by/section_id/{section_id}", response_model=ActSection)
def read_section(section_id: int):
    section = get_section_by_id(section_id)
    if section:
        return section
    return {"message": "Section not found"}

@router.get("/by/section_id/{section_id}", response_model=ActSection)
def read_section(section_id: int):
    section = get_section_by_id(section_id)
    if section:
        return section
    return {"message": "Section not found"}

@router.get("/by/act_id/{act_id}")
def read_sections_by_act_id(act_id: int):
    sections = get_sections_by_act_id(act_id)
    if sections:
        return sections
    return {"message": "No sections found for this act"}

@router.get("/by/act_id/{act_id}/section_number/{section_number}")
def read_section_by_act_and_section_number(act_id: int, section_number: str):
    section = get_section_by_act_and_section_number(act_id, section_number)
    if section:
        return section
    return {"message": "Section not found with the given act ID and section number"}

@router.get("/test")
def test_function():
    return {"message": "Test function executed successfully."}