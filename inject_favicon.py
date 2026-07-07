import os

files = ['index.html', 'music.html', 'dashboard.html', 'login.html']
favicon_tag = '  <link rel="icon" type="image/svg+xml" href="/favicon.svg">\n'

for f in files:
    path = os.path.join('frontend', f)
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'rel="icon"' in content: continue
    
    # Insert after <head> or meta charset
    if '<meta charset="UTF-8">' in content:
        content = content.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + favicon_tag)
    elif '<head>' in content:
        content = content.replace('<head>', '<head>\n' + favicon_tag)
        
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Added favicon to {f}")
