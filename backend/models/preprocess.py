import re

thai_to_arabic = str.maketrans("๑๒๓๔๕๖๗๘๙๐","1234567890")

with open("backend/models/act_พระราชบัญญัติคุ้มครองแรงงานในงานประมง พ.ศ. 2562.txt", "r", encoding="utf-8") as f:
    act = f.read()
    act = act.splitlines()

results = {}
i = 0
p, n = 1, 1
while i < len(act)-1:
    if act[i] == "---------------------":
        print(f"Skipping line {act[i]}: separator")
        i+=1
        continue
    act[i] = act[i].strip()
    if act[i].startswith("มาตรา"):
        p, n = 1, 1
        act[i] = act[i].translate(thai_to_arabic)
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
            text = act[i].translate(thai_to_arabic)
            if act[i][1:act[i].find(")", 1)].isdigit():
                key+=f",N{n}"
                p_n = p
                n+=1
            else:
                p+=1
                n=1
            if re.search(r'\(\d+\)', text[1:]):
                key += ",R:{"
                for m in re.finditer(r'\((\d+)\)', text):
                    idx = m.start()
                    refnum = int(m.group(1))
                    key += f"{idx}:\"S{s},P{p_n},N{refnum}\","
                key = key[:-1] + "}"
            results[key] = text
            i+=1
    else:
        results[f"S0,P{p}"] = act[i].translate(thai_to_arabic)
        p+=1
        i+=1
    print(f"Processed line {i}/{len(act)}: {act[i][:30]}...")
# print(results)

with open("backend/models/preprocess_พระราชบัญญัติคุ้มครองแรงงานในงานประมง พ.ศ. 2562.txt", "a", encoding="utf-8") as f:
    for key, value in results.items():
        string = f"{key};{value}\n"
        f.write(string)
