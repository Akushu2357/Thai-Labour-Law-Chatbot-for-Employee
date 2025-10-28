import os
import glob
import time
from supabase import create_client, Client
from FlagEmbedding import BGEM3FlagModel
from pathlib import Path
from dotenv import load_dotenv
import json
import re
import ast

# Load .env from project root (two levels up from backend/models/upload.py)
env_path = Path(__file__).resolve().parents[2] / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()  # fallback to default search

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
print("Supabase client created.")

model = BGEM3FlagModel('BAAI/bge-m3', # model embeddig size 1024
                       use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation

def get_sturctured_params(text):
    param_str = text.split(";", 1)[0]
    # remove trailing commas before } or ]
    param_str_clean = re.sub(r',\s*(?=[}\]])', '', param_str).strip()
    # Try strict JSON first
    try:
        return json.loads(param_str_clean)
    except json.JSONDecodeError:
        # Fallback to parsing Python literals like single-quoted dicts using ast.literal_eval
        try:
            return ast.literal_eval(param_str_clean)
        except Exception:
            # Try to fix common case where a nested JSON object is embedded as a double-quoted string
            # e.g.  ... "references":{12:"{"text":"..."}}
            # Convert occurrences of :"{...}" into :'{...}' so ast.literal_eval can parse it
            try:
                fixed = re.sub(r':\s*"(\{.*?\})"', r": '\1'", param_str_clean)
                return ast.literal_eval(fixed)
            except Exception:
                # As a last resort, try replacing single quotes with double quotes and parse as JSON
                try:
                    return json.loads(param_str_clean.replace("'", '"'))
                except Exception as e:
                    # Raise a clearer error for debugging
                    raise ValueError(f"Failed to parse params: {param_str_clean}") from e

for file in glob.glob("*/backend/models/preprocess/preprocess_*.txt"):
    print(file)
    with open(file, "r", encoding="utf-8", errors="ignore") as f:
        act = f.read()
        act = act.splitlines()
    
    print(f"Uploading {file}...")
    preface = ''
    i=1
    while get_sturctured_params(act[i]).get("intro") == True:
        preface += act[i].split(";", 1)[1] + "\n"
        i += 1
    response_act = None
    try:
        response_act = (
            supabase.table("acts")
            .insert([
                {"title": file[file.find("preprocess_") + len("preprocess_"):file.find(".txt")], "preface": preface}
            ])
            .execute()
        )
        print("Response:", response_act)
    except Exception as exception:
        print("Exception:", exception)

    # If act insertion failed, skip inserting its sections to avoid NameError
    if not response_act or not getattr(response_act, "data", None) or not response_act.data:
        print(f"Skipping sections for {file} because act insertion failed.")
        continue
    
    response_act_books = supabase.table("act_books").insert([
        {"act_id": response_act.data[0]['id'], "book_number": 0, "book_title": "Default Book"}
    ]).execute()
    response_act_groups = supabase.table("act_groups").insert([
        {"act_id": response_act.data[0]['id'], "book_id": response_act_books.data[0]['id'], "group_number": 0, "group_title": "Default Group"}
    ]).execute()
    response_act_super_sections = supabase.table("act_super_sections").insert([
        {"act_id": response_act.data[0]['id'], "group_id": response_act_groups.data[0]['id'], "super_number": 0, "super_title": "Default Super Section"}
    ]).execute()
    act_dict = {}
    for line in act[i:]:
        params, text = line.split(";", 1)
        params_dict = get_sturctured_params(line)
        act_dict[str(params_dict)] = text
        print(f"Inserting {params_dict}...")
        try:
            if params_dict.get("paragraph"):
                response_act_sections = supabase.table("act_sections").insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "book_id": response_act_books.data[0]['id'],
                        "group_id": response_act_groups.data[0]['id'],
                        "super_id": response_act_super_sections.data[0]['id'],
                        "section_number": params_dict.get("section"),
                        "sub_section": params_dict.get("sub_section"),
                        "paragraph_number": params_dict.get("paragraph"),
                        "item_order": params_dict.get("item"),
                        "text_original": text,
                        "text_preprocessed": text,
                        "embedding": model.encode(text, batch_size=1)['dense_vecs'].tolist(),
                        "cross_references": params_dict.get("references", {}),
                        "external_citations": params_dict.get("citation", {}),
                    },
                ]).execute()
            elif params_dict.get("super_section"):
                response_act_super_sections = supabase.table("act_super_sections").insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "group_id": response_act_groups.data[0]['id'],
                        "super_number": params_dict.get("super_section"),
                        "super_title": text
                    },
                ]).execute()
            elif params_dict.get("group"):
                response_act_groups = supabase.table("act_groups").insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "book_id": response_act_books.data[0]['id'],
                        "group_number": params_dict.get("group"),
                        "group_title": text
                    },
                ]).execute()
            elif params_dict.get("book"):
                response_act_books = supabase.table("act_books").insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "book_number": params_dict.get("book"),
                        "book_title": text
                    },
                ]).execute()
            elif params_dict.get("citation"):
                response_citation = supabase.table("citations").insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "ref_number": params_dict.get("citation"),
                        "text_original": text,
                    },
                ]).execute()
            else:
                print(f"Unknown params: {params_dict}")
        except Exception as exception:
            print("Exception:", exception)
            print("Text:", text)
            print("Params:", params_dict)
            break
    time.sleep(120)  # brief pause between files to avoid overwhelming the database