import os
import glob
from supabase import create_client, Client
from FlagEmbedding import BGEM3FlagModel
from pathlib import Path
from dotenv import load_dotenv

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


model = BGEM3FlagModel('BAAI/bge-m3', # model embeddig size 768
                       use_fp16=True) # Setting use_fp16 to True speeds up computation with a slight performance degradation

for file in glob.glob("backend/models/preprocess*.txt"):
    print(file)
    with open(file, "r", encoding="utf-8", errors="ignore") as f:
        act = f.read()
        act = act.splitlines()
    
    print(f"Uploading {file}...")
    preface = ''
    i=1
    while act[i].startswith("S0,P"):
        preface += act[i].split(";", 1)[1] + "\n"
        i += 1
    response_act = None
    try:
        response_act = (
            supabase.table("acts")
            .insert([
                {"title": act[0].split(";", 1)[1], "preface": preface}
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

    act_dict = {}
    for line in act[i:]:
        key, value = line.split(";", 1)
        act_dict[key] = value
        print(f"Inserting {key}...")
        section_number = key[1:key.find(",", 1)]
        paragraph_number = key[key.find("P")+1:key.find(",", key.find("P"))] if ",P" in key else None
        item_number = key[key.find("N")+1:key.find(",", key.find("N"))] if key.find(",N", key.find(",P"), key.find(",R")) != -1 else None
        if ",R:{" in key: # R:{17:"S16,P5,N1",25:"S16,P5,N4"}
            ref_str = key[key.find("R:{")+3:-1] 
            # Split on commas that are not inside quotes, e.g.:
            # 17:"S16,P5,N1",25:"S16,P5,N4" -> ['17:"S16,P5,N1"','25:"S16,P5,N4"']
            ref_parts = []
            current = ""
            in_quotes = False
            escape = False
            for ch in ref_str:
                if ch == '"' and not escape:
                    in_quotes = not in_quotes
                    current += ch
                elif ch == ',' and not in_quotes:
                    ref_parts.append(current.strip())
                    current = ""
                else:
                    current += ch
                # handle escape character (if any)
                if ch == "\\" and not escape:
                    escape = True
                else:
                    escape = False
            if current:
                ref_parts.append(current.strip())
            ref = {}
            text_embedding = value
            for part in reversed(ref_parts):
                idx, ref_key = part.split(":")
                ref_section_number = ref_key[2:ref_key.find(",", 1)]
                ref_paragraph_number = ref_key[ref_key.find("P")+1:ref_key.find(",", ref_key.find("P"))] if ",P" in ref_key else None
                ref_item_number = ref_key[ref_key.find("N")+1:-1] if ",N" in ref_key else None
                ref[int(idx)] = {
                    "section_number": int(ref_section_number),
                    "paragraph_number": int(ref_paragraph_number) if ref_paragraph_number else None,
                    "item_number": int(ref_item_number) if ref_item_number else None
                }
                print("act_dict:", act_dict)
                text_embedding = text_embedding.replace(text_embedding[int(idx):text_embedding.find(")", int(idx))+1], "\"" + act_dict[ref_key[1:-1]] + "\"")
            print("Text for embedding:", text_embedding)
        else:
            continue
        try:
            response_act_section = (
                supabase.table("act_sections")
                .insert([
                    {
                        "act_id": response_act.data[0]['id'],
                        "section_number": int(section_number),
                        "paragraph_number": int(paragraph_number) if paragraph_number else None,
                        "item_number": int(item_number) if item_number else None,
                        "text_original": value,
                        "text_preprocessed": value,
                        "ref": ref if ",R:{" in key else {},
                        "embedding": model.encode(text_embedding, batch_size=1)['dense_vecs'].tolist()
                    },
                ])
                .execute()
            )
        except Exception as exception:
            print("Exception:", exception)
            break