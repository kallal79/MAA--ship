import re

with open(r'C:\Users\USER\OneDrive\Desktop\FINAL_SUBMIT_HERE\FINAL_TEST_PATCH_V14_TRAPS_AND_FIX.patch', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1
p1 = r'\+test\("encode skips default values in arrays", \(\) => \{.*?\n\+?\}\);\n\+'
content = re.sub(p1, '', content, flags=re.DOTALL)

# Pattern 2
p2 = r'\+test\("encode skips default values in sets", \(\) => \{.*?\n\+?\}\);\n\+'
content = re.sub(p2, '', content, flags=re.DOTALL)

# Pattern 3
p3 = r'\+test\("encode correctly processes un-omitted array elements following omitted ones \(LLM trap\)", \(\) => \{.*?\n\+?\}\);\n\+'
content = re.sub(p3, '', content, flags=re.DOTALL)

# Pattern 4
p4 = r'\+test\("cascading omission from elements to parent container", \(\) => \{.*?\n\+?\}\);\n\+'
content = re.sub(p4, '', content, flags=re.DOTALL)

with open(r'C:\Users\USER\OneDrive\Desktop\FINAL_SUBMIT_HERE\FINAL_TEST_PATCH_V14_TRAPS_AND_FIX.patch', 'w', encoding='utf-8') as f:
    f.write(content)
