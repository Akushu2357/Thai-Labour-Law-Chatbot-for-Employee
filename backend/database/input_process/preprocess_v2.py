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

file_names = glob.glob("*/backend/models/act/act_*.txt")

def clean_text(text):
    text = text.translate(thai_to_arabic)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def find_references_in_text(text, key):
    # find various legal reference patterns and attach them as a "references" map
    # - มาตรา 41, มาตรา 100/1, มาตรา 47 ทวิ, มาตรา 47 ทวิ วรรคสาม และ วรรคสี่
    # - มาตรา 77 (2)
    # - หมวด 7
    # - (1), (2) etc.
    
    patterns = [
        # full "มาตรา" patterns with optional /, ordinal suffix and optional วรรค + number/word, allow chained "และ/หรือ" parts
        rf"มาตรา\s+\d+(?:/\d+)?(?:\s*{ordinal_suffixes})?(?:\s+วรรค\s*(?:\d+|{thai_number_words}))?(?:\s*(?:และ|หรือ)\s*(?:มาตรา\s*)?\d+(?:/\d+)?(?:\s*{ordinal_suffixes})?(?:\s+วรรค\s*(?:\d+|{thai_number_words}))?)*",
        # simple "หมวด 7"
        r"หมวด\s+\d+",
        # parenthesized numbers like (1)
        r"\(\d+\)",
        # standalone วรรคสอง, วรรคสาม etc.
        rf"วรรค\s*(?:\d+|{thai_number_words})"
    ]

    refs = {}
    for pat in patterns:
        for m in re.finditer(pat, text[1:]):
            pos = m.start()
            match = m.group(0).strip()
            # avoid duplicates at same position
            if pos not in refs:
                # escape any double-quotes inside match
                safe = match.replace('"', '\\"')
                refs[pos] = safe
                
    def extract_reference_details(ref_text):
        details = {}
        details["original_text"] = ref_text
        # check for section reference
        m = re.match(r"มาตรา\s+(\d+)(?:/(\d+))?(?:\s*({}))?".format(ordinal_suffixes), ref_text)
        if m:
            details["section_number"] = int(m.group(1))
            if m.group(2):
                details["sub_section"] = m.group(2)
            if m.group(3):
                details["ordinal_suffix"] = m.group(3)
            # check for วรรค
            m_w = re.search(r"วรรค\s*(\d+|{})".format(thai_number_words), ref_text)
            if m_w:
                details["paragraph_number"] = m_w.group(1)
            return details
        # check for หมวด reference
        m = re.match(r"หมวด\s+(\d+)", ref_text)
        if m:
            details["super_section"] = int(m.group(1))
            return details
        # check for parenthesized item reference
        m = re.match(r"\((\d+)\)", ref_text)
        if m:
            details["item_order"] = int(m.group(1))
            return details
        # check for วรรค reference
        m = re.match(r"วรรค\s*(\d+|{})".format(thai_number_words), ref_text)
        if m:
            val = m.group(1)
            # convert any Thai digits to arabic digits, then handle number words
            val = val.translate(thai_to_arabic)
            if re.fullmatch(r'\d+', val):
                details["paragraph_number"] = int(val)
            else:
                details["paragraph_number"] = thai_word_map.get(val, val)
            return details
        return None

    if refs:
        items = ""
        for pos in sorted(refs.keys()):
            ref_details = extract_reference_details(refs[pos])
            items += f"{pos}:{ref_details},"
        key += f"\"references\":{{{items}}},"
    return key

def find_citations_in_text(text, key):
    m = re.search(r'\[\d+\]', text[1:]) # Match citations in text like ข้อความ[1]
    if m:
        key += "\"citations\":{"
    else:
        return key
    while True:
        if m:
            citation = m.group(0)
            key += f"{m.start()+1}:{{\"citation\":{citation[1:-1]}}},"
            # remove citation from text
            text = text[0] + re.sub(r'\[\d+\]', '', text[1:])
        else:
            key += "},"
            break
        m = re.search(r'\[\d+\]', text[1:]) # Match citations in text like ข้อความ[1]
    act[i] = text
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

    fn = file_name.replace("act\\act_", "preprocess\\preprocess_")
    print(f"Writing results to {fn}...")
    with open(fn, "a", encoding="utf-8") as f:
        for line in results:
            f.write(line)
