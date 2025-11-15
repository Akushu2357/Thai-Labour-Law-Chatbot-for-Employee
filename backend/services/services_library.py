from database.supabase_client import get_supabase_client

def get_tags():
    tags = get_supabase_client().table("tags").select(
        "id, name, description"
    ).execute().data
    if tags:
        return tags
    return {"message": "No tags found"}

def get_all_acts():
    acts = get_supabase_client().table("acts").select(
        "id, title, preface, updated_at"
    ).execute().data
    if acts:
        for idx in range(len(acts)):
            act_tags = get_supabase_client().table("act_tags").select(
                "tag_id"
            ).eq("act_id", acts[idx]["id"]).execute().data
            acts[idx]["tags"] = [at["tag_id"] for at in act_tags]
        return acts
    return {"message": "No acts found"}

def get_books_by_act(act_id: int):
    books = get_supabase_client().table("act_books").select(
        "id, act_id, book_number, book_title"
    ).eq("act_id", act_id).execute().data
    if books:
        return books
    return {"message": "No books found for the given act_id"}

def get_groups_by_book(book_id: int):
    groups = get_supabase_client().table("act_groups").select(
        "id, act_id, book_id, group_number, group_title"
    ).eq("book_id", book_id).execute().data
    if groups:
        return groups
    return {"message": "No groups found for the given book_id"}

def get_super_sections_by_group(group_id: int):
    super_sections = get_supabase_client().table("act_super_sections").select(
        "id, act_id, group_id, super_number, super_title"
    ).eq("group_id", group_id).execute().data
    if super_sections:
        return super_sections
    return {"message": "No super sections found for the given group_id"}

def get_sections_by_super_section(super_section_id: int):
    sections = get_supabase_client().table("act_sections").select(
        "id, act_id, book_id, group_id, super_id, \
        section_number, sub_section, paragraph_number, item_order, \
        text_original, cross_references, external_citations"
    ).eq("super_id", super_section_id).order("id").execute().data
    if sections:
        for idx in range(len(sections)):
            citations = get_supabase_client().table("act_section_tags").select(
                "tag_id"
            ).eq("act_section_id", sections[idx]["id"]).execute().data
            sections[idx]["citations"] = [c["tag_id"] for c in citations]
        return sections
    return {"message": "No sections found for the given super_section_id"}