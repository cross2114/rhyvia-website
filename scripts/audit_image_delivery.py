"""Audit every statically declared image, including language variants and CSS URLs."""
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'}
URL_ATTRIBUTES = {'src', 'href', 'data-image', 'data-src-en', 'data-src-zh'}
SET_ATTRIBUTES = {'srcset', 'imagesrcset'}


def collect(root=DIST):
    references = defaultdict(set)
    def record(url, page, context):
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path:
            return
        target = root / unquote(parsed.path.lstrip('/')) if parsed.path.startswith('/') else page.parent / unquote(parsed.path)
        target = target.resolve()
        if target.suffix.lower() in IMAGE_EXTENSIONS:
            references[target].add(str(page.relative_to(root)) + ':' + context)
    class Parser(HTMLParser):
        def handle_starttag(self, tag, attrs):
            for key, value in attrs:
                if value and key in URL_ATTRIBUTES:
                    record(value, self.page, key)
                elif value and key in SET_ATTRIBUTES:
                    for candidate in value.split(','):
                        record(candidate.strip().split()[0], self.page, key)
    for page in root.rglob('*.html'):
        parser = Parser(); parser.page = page; parser.feed(page.read_text())
    for page in root.glob('*.css'):
        for url in re.findall(r'''url\(["']?([^\)"']+)''', page.read_text()):
            record(url, page, 'css')
    return references


def audit(root=DIST):
    from PIL import Image
    rows = []
    for path, uses in collect(root).items():
        if not path.is_file():
            raise FileNotFoundError(path)
        if path.suffix.lower() == '.svg':
            continue
        with Image.open(path) as image:
            image.load()
            rows.append({'path': str(path.relative_to(root.resolve())), 'bytes': path.stat().st_size,
                         'size': list(image.size), 'uses': sorted(uses)})
    return sorted(rows, key=lambda row: row['bytes'], reverse=True)


if __name__ == '__main__':
    rows = audit()
    print(json.dumps({'images': rows, 'unique_bytes': sum(row['bytes'] for row in rows),
                      'over_1mb': sum(row['bytes'] > 1000000 for row in rows)}, indent=2))
