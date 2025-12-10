from fastapi import APIRouter, Depends
from services.services_library import *

router = APIRouter(prefix="/libraries", tags=["libraries"])

@router.get("/acts")
def get_library_acts():
    acts = get_all_acts()
    return acts

@router.get("/tags")
def get_library_tags():
    tags = get_tags()
    return tags

@router.get("/acts/{act_id}/books")
def get_library_books(act_id: int):
    books = get_books_by_act(act_id)
    return books

@router.get("/books/{book_id}/groups")
def get_library_groups(book_id: int):
    groups = get_groups_by_book(book_id)
    return groups

@router.get("/groups/{group_id}/super_sections")
def get_library_super_sections(group_id: int):
    super_sections = get_super_sections_by_group(group_id)
    return super_sections

@router.get("/super_sections/{super_section_id}/sections")
def get_library_sections(super_section_id: int):
    sections = get_sections_by_super_section(super_section_id)
    return sections

@router.get("/sections/{act_id}/{section_number}")
def get_library_sections_by_number(act_id: int, section_number: str):
    sections = get_sections_by_act_and_number(act_id, section_number)
    return sections