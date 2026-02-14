from fastapi import APIRouter
from services.services_judgment import *

router = APIRouter(prefix="/judgments", tags=["judgments"])

@router.get("")
def get_library_judgments():
    judgments = get_all_judgments()
    return judgments

@router.get("/{judgment_id}")
def get_library_judgment_by_id(judgment_id: int):
    judgment = get_judgment_by_id(judgment_id)
    return judgment
