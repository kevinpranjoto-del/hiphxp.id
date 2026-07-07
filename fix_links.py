import os
for f in ['frontend/index.html', 'frontend/music.html', 'frontend/dashboard.html', 'frontend/login.html']:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    content = content.replace('href="#', 'href="/#')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
