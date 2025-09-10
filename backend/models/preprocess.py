thai_to_arabic = str.maketrans("๑๒๓๔๕๖๗๘๙๐","1234567890")
with open("backend/models/act_พระราชบัญญัติคุ้มครองแรงงานในงานประมง พ.ศ. 2562.txt", "r") as f:
    act = f.read()
    act = act.splitlines()
results = {}
i = 0
while i < len(act)-1:
    if act[i] == "---------------------":
        if act[i+1].startswith("มาตรา"):
            p, n = 1, 1
            i+=1
            act[i] = act[i].translate(thai_to_arabic)
            s = act[i][6:act[i].find(" ", 6)]
            while act[i] != "---------------------":
                if act[i][1:act[i].find(")", 1)].isdigit():
                    results[f"S{s},P{p},N{n}"] = act[i].translate(thai_to_arabic)
                    n+=1
                else:
                    results[f"S{s},P{p}"] = act[i].translate(thai_to_arabic)
                    p+=1
                    n=1
                i+=1
    i+=1
print(results)

with open("preprocess.txt","a") as f:
    for key, value in results.items():
        string = f"{key}:{value}\n"
        f.write(string)