"""Apply verified lossless mappings and native loading hints without resizing images."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
MANIFEST = ROOT / 'scripts/image-delivery-audit-20261028.json'


class Attributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.attrs = dict(attrs)


def attribute(tag, key, value):
    pattern = re.compile(r'\s' + re.escape(key) + r'''=(?:"[^"]*"|'[^']*')''')
    tag = pattern.sub('', tag)
    return tag[:-1] + f' {key}="{escape(value, quote=True)}">'


def apply():
    rows = json.loads(MANIFEST.read_text())['images']
    mapping = {Path(row['path']).name: Path(row['optimized']).name
               for row in rows if row['path'] != row['optimized']}
    for page in DIST.rglob('*.html'):
        source = page.read_text()
        for old, new in mapping.items():
            source = source.replace(old, new)
        logo_count = 0
        def hints(match):
            nonlocal logo_count
            tag = match.group(); parser = Attributes(); parser.feed(tag)
            attrs = parser.attrs
            logo = 'brand-logo' in attrs.get('class', '').split()
            if logo:
                logo_count += 1
            critical = attrs.get('fetchpriority') == 'high' or (logo and logo_count == 1)
            tag = attribute(tag, 'decoding', 'async')
            tag = attribute(tag, 'loading', 'eager' if critical else 'lazy')
            if not critical:
                tag = attribute(tag, 'fetchpriority', 'low')
            return tag
        source = re.sub(r'<img\b[^>]*>', hints, source)
        page.write_text(source)


if __name__ == '__main__':
    apply()
