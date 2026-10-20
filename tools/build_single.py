"""Builds blood-diamond-tracker.html: index.html with the CSS and local JS inlined,
so the whole app can be shared as one file. Run: python3 tools/build_single.py"""
import base64
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    '<style>\n' + (root / 'css/style.css').read_text() + '</style>')
for js in ('js/splash.js', 'js/firebase-config.js', 'js/app.js'):
    html = html.replace(f'<script src="{js}"></script>',
                        '<script>\n' + (root / js).read_text() + '</script>')
for img, mime in (('assets/hokai-logo.webp', 'image/webp'), ('assets/favicon.png', 'image/png')):
    data = base64.b64encode((root / img).read_bytes()).decode()
    for ref in (f'"{img}"', f'"../{img}"'):   # from the HTML and from the CSS
        html = html.replace(ref, f'"data:{mime};base64,{data}"')
(root / 'blood-diamond-tracker.html').write_text(html)
print('wrote blood-diamond-tracker.html')
