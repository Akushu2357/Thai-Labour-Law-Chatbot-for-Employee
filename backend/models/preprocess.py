import re
import glob

thai_to_arabic = str.maketrans("๑๒๓๔๕๖๗๘๙๐","1234567890")


file_names = glob.glob("*/backend/models/act/act_*.txt")

def clean_text(text):
    text = text.translate(thai_to_arabic)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

for file_name in file_names:
    print(f"Processing {file_name}...")
    with open(file_name, "r", encoding="utf-8") as f:
        act = f.read()
        act = act.splitlines()
    results = {}
    i = 0
    i_p, p, n, r = 1, 1, 1, 1
    while i < len(act)-1:
        if act[i] == "---------------------":
            i+=1
            continue
        elif act[i].startswith("มาตรา"):
            p, n = 1, 1
            act[i] = clean_text(act[i])
            # extract continuous digits starting at index 6
            s = ""
            idx = 6
            while idx < len(act[i]) and act[i][idx].isdigit():
                s += act[i][idx]
                idx += 1
            if not s:
                s = act[i][6:]
            while act[i] != "---------------------":
                key=f"S{s},P{p}"
                text = clean_text(act[i])
                if act[i][1:act[i].find(")", 1)].isdigit():
                    key+=f",N{n}"
                    p_n = p
                    n+=1
                else:
                    p+=1
                    n=1
                if re.search(r'\[\d+\]', text[1:]):
                    key += ",X:{"
                    for m in re.finditer(r'\[\d+\]', text[1:]):
                        idx = m.start()
                        refnum = m.group(0)[1:-1]
                        key += f"{idx}:\"R{refnum}\","
                    key = key[:-1] + "}"
                if re.search(r'\(\d+\)', text[1:]):
                    key += ",I:{"
                    for m in re.finditer(r'\((\d+)\)', text[1:]):
                        idx = m.start()
                        refnum = int(m.group(1))
                        key += f'{idx}:"S{s},P{p_n or 0},N{refnum}",'
                    key = key[:-1] + "}"
                results[key] = text
                i+=1
        elif act[i].startswith("["):
            act[i] = clean_text(act[i])
            results[f"S0,R{r}"] = act[i]
            r += 1
            i+=1
        else:
            results[f"S0,P{i_p}"] = clean_text(act[i])
            i_p+=1
            i+=1
        # print(f"Processed line {i}/{len(act)}: {act[i][:30]}...")
    # print(results)

    fn = file_name.replace("act\\act_", "preprocess\\preprocess_")
    print(f"Writing results to {fn}...")
    with open(fn, "a", encoding="utf-8") as f:
        for key, value in results.items():
            string = f"{key};{value}\n"
            f.write(string)
