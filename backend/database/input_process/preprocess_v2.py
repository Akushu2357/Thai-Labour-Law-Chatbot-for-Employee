import re
import glob

thai_to_arabic = str.maketrans("๑๒๓๔๕๖๗๘๙๐","1234567890")
thai_number_words = r"(หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบ|สิบเอ็ด|สิบสอง)"
ordinal_suffixes = r"(ทวิ|ตรี|จัตวา|เบญจ|ฉ|สัปต|อัฏฐ|นพ|ทศ)"
thai_word_map = {
                    "หนึ่ง": 1, "สอง": 2, "สาม": 3, "สี่": 4, "ห้า": 5,
                    "หก": 6, "เจ็ด": 7, "แปด": 8, "เก้า": 9,
                    "สิบ": 10, "สิบเอ็ด": 11, "สิบสอง": 12
                }

file_names = glob.glob("../*/backend/database/input_process/act/act_*.txt")

def clean_text(text):
    text = text.translate(thai_to_arabic)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def find_references_in_text(text, key):
    # detect references like:
    # - มาตรา 41
    # - มาตรา 100/1
    # - มาตรา 47 ทวิ
    # - วรรคสาม (or วรรค 3)
    # - (2) or (ก)
    text = text[1:]
    ord_inner = ordinal_suffixes[1:-1] if ordinal_suffixes.startswith("(") and ordinal_suffixes.endswith(")") else ordinal_suffixes
    thai_nums_inner = thai_number_words[1:-1] if thai_number_words.startswith("(") and thai_number_words.endswith(")") else thai_number_words

    patterns = []
    # section with optional sub and optional ordinal suffix (capture suffix)
    patterns.append(("section", re.compile(rf"มาตรา\s+([0-9]+)(?:/([0-9]+))?(?:\s*({ord_inner}))?")))
    # paragraph: วรรค + thai-word or arabic number
    patterns.append(("paragraph", re.compile(rf"วรรค\s*({thai_nums_inner}|\d+)", flags=re.IGNORECASE)))
    # parenthesized reference like (2) or (ก)
    patterns.append(("parenthesis", re.compile(r'\(\s*([0-9]+|[ก-ฮ])\s*\)')))

    finds = []
    for typ, pat in patterns:
        for m in pat.finditer(text):
            # ignore a leading parenthesis that marks the start-of-line item (we don't want to treat that as an inline reference)
            if typ == "parenthesis" and m.start() == 0:
                continue
            info = {"type": typ, "pos": m.start(), "match": m.group(0)}
            if typ == "section":
                sec = m.group(1)
                sub = m.group(2)
                suffix = m.group(3) if m.lastindex and m.lastindex >= 3 else None
                ref = f"{sec}" + (f"/{sub}" if sub else "") + (f" {suffix}" if suffix else "")
                info["ref"] = ref
                info["section"] = int(sec)
                if sub:
                    info["sub_section"] = sub
                if suffix:
                    info["suffix"] = suffix
            elif typ == "paragraph":
                grp = m.group(1)
                # convert thai word to number if possible
                if grp.isdigit():
                    num = int(grp)
                else:
                    num = thai_word_map.get(grp, None)
                info["ref"] = str(num) if num is not None else grp
                if num is not None:
                    info["paragraph"] = num
            else:  # parenthesis
                val = m.group(1)
                info["ref"] = val
                info["item"] = val
            finds.append(info)

    if not finds:
        return key

    # sort by position and append to key
    finds.sort(key=lambda x: x["pos"])
    key += "\"references\":{"
    last_section = None
    for f in finds:
        # remember the most recent section so following refs (e.g., วรรค) can inherit it
        if f.get("type") == "section" and "section" in f:
            last_section = f["section"]

        pos = f["pos"]
        entry = f'{{"original_text":"{f["match"]}"'
        # include numeric fields when present
        if "section" in f:
            entry += f',"section_number":{f["section"]}'
        elif last_section is not None and typ in ("paragraph", "parenthesis"):
            # inherit previous section number for paragraphs/parenthesis if not specified
            entry += f',"section_number":{last_section}'

        if "sub_section" in f:
            entry += f',"sub_section":"{f["sub_section"]}"'
        if "suffix" in f:
            entry += f',"ordinal_suffix":"{f["suffix"]}"'
        if "paragraph" in f:
            entry += f',"paragraph_number":{f["paragraph"]}'
        if "item" in f:
            entry += f',"item_order":"{f["item"]}"'
        entry += "}"
        key += f'{pos+1}:{entry},'
    key += "},"
    return key

def find_citations_in_text(text, key):
    # Find all citations like [1] and record their positions (do not skip start)
    finds = list(re.finditer(r'\[(\d+)\]', text))
    if not finds:
        return key
    key += "\"citations\":{"
    for f in finds:
        citation_num = f.group(1)
        pos = f.start()
        key += f"{pos}:{{\"citation\":{citation_num}}},"
    # remove all citation markers from the text
    text = re.sub(r'\[\d+\]', '', text)
    act[i] = text
    key += "},"
    return key

def parse_book_key(text, key):
    global current_part, i_book
    m = re.match(r"บรรพ\s+([0-9]+)", text)
    book = m.group(1)
    key += f"\"book\":{book},"
    i_book = book
    current_part = f"\"book\":{book},"
    return key

def parse_group_key(text, key):
    global current_part, i_book, i_group
    m = re.match(r"ลักษณะ\s+([0-9]+)", text)
    group = m.group(1)
    key += f"\"book\":{i_book},\"group\":{group},"
    i_group = group
    current_part = f"\"book\":{i_book},\"group\":{group},"
    return key

def parse_super_section_key(text, key):
    global current_part, i_book, i_group, i_super
    m = re.match(r"หมวด\s+([0-9]+)", text)
    super_section = m.group(1)
    key += f"\"book\":{i_book},\"group\":{i_group},\"super_section\":{super_section},"
    i_super = super_section
    current_part = f"\"book\":{i_book},\"group\":{i_group},\"super_section\":{super_section},"
    return key

def parse_intro_key(key):
    global current_part, i_intro
    key += f"\"intro\":true,\"paragraph\":{i_intro},"
    i_intro += 1
    current_part = None
    return key

def parse_section_key(text, key):
    global current_part
    m = re.match(rf"มาตรา\s+([0-9]+)(?:/([0-9]+))?(?:\s*{ordinal_suffixes})?", text)
    section = m.group(1)
    sub_section = m.group(2) if m.group(2) else m.group(3) if m.group(3) else None
    key += f"\"book\":{i_book},\"group\":{i_group},\"super_section\":{i_super},\"section\":{section}," + (f"\"sub_section\":\"{sub_section}\"," if sub_section else "")
    current_part = f"\"book\":{i_book},\"group\":{i_group},\"super_section\":{i_super},\"section\":{section}," + (f"\"sub_section\":\"{sub_section}\"," if sub_section else "")
    return key

def parse_item_key(text, key):
    global current_part
    m = re.match(r'^\(\s*([ก-ฮ/\d]+)\s*\)', text)
    item = m.group(1)
    key += current_part + f"\"item\":\"{item}\","
    return key

def parse_citation_key(text, key):
    m = re.match(r'^\[(\d+)\]', text)
    if not m:
        return key
    citation = m.group(1)
    key = f"{{\"citation\":{citation}"
    return key

def connect_paragraphs(key, i):
    key += "};" + act[i] + r"\n"
    while act[i+1] != "---------------------":
        i+=1
        act[i] = clean_text(act[i])
        key += act[i] + r"\n"
    results.append(key[:-2] + "\n")
    i+=1
    return key, i

for file_name in file_names:
    print(f"Processing {file_name}...")
    with open(file_name, "r", encoding="utf-8") as f:
        act = f.read()
        act = act.splitlines()
    results = []
    i = 0
    i_intro, i_book, i_group, i_super, i_section = 0, 0, 0, 0, 0
    current_part = None
    while i < len(act)-1:
        if act[i] == "---------------------":
            paragraph_number = 1
            i+=1
            continue
        else:
            act[i] = clean_text(act[i])
            key = "{"
            # print(f"Processing line {i}: {act[i]}")
            if act[i].startswith("มาตรา"):
                key = parse_section_key(act[i], key)
            elif act[i].startswith("("):
                paragraph_number-=1
                key = parse_item_key(act[i], key)
            elif act[i].startswith("หมวด"):
                key = parse_super_section_key(act[i], key)
                key, i = connect_paragraphs(key, i)
                continue
            elif act[i].startswith("ลักษณะ"):
                key = parse_group_key(act[i], key)
                key, i = connect_paragraphs(key, i)
                continue
            elif act[i].startswith("บรรพ"):
                key = parse_book_key(act[i], key)
                key, i = connect_paragraphs(key, i)
                continue
            elif act[i].startswith("["):
                key = parse_citation_key(act[i], key)
                key += "};"
                results.append(key + act[i] + "\n")
                i+=1
                continue
            elif current_part is None:
                # Other introductory lines
                key = parse_intro_key(key)
                key += "};"
                results.append(key + act[i] + "\n")
                i+=1
                continue
            else:
                key += current_part
            key += f"\"paragraph\":{paragraph_number},"
            key = find_references_in_text(act[i], key)
            key = find_citations_in_text(act[i], key)
            key += "};"
            results.append(key + act[i] + "\n")
            paragraph_number += 1
            i+=1

    fn = file_name.replace("act\\act_", "preprocessv2\\preprocess_")
    print(f"Writing results to {fn}...")
    with open(fn, "a", encoding="utf-8") as f:
        for line in results:
            f.write(line)
