"""Builds blood-diamond-tracker.html: index.html with the CSS and local JS inlined,
so the whole app can be shared as one file. Run: python3 tools/build_single.py"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    '<style>\n' + (root / 'css/style.css').read_text() + '</style>')
for js in ('js/firebase-config.js', 'js/app.js'):
    html = html.replace(f'<script src="{js}"></script>',
                        '<script>\n' + (root / js).read_text() + '</script>')
(root / 'blood-diamond-tracker.html').write_text(html)
print('wrote blood-diamond-tracker.html')
