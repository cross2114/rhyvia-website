"""Fail packaging for unreviewed oversized images, missing files or delivery regressions."""
from html.parser import HTMLParser
from pathlib import Path
import json
from audit_image_delivery import collect, DIST, ROOT


def check():
    rows = json.loads((ROOT / 'scripts/image-delivery-audit-20261028.json').read_text())['images']
    reviewed = {row['optimized']: row['after_bytes'] for row in rows if row['after_bytes'] > 1000000}
    obsolete = {row['path'] for row in rows if row['path'] != row['optimized']}
    oversized = []
    for path in collect():
        assert path.is_file(), f'Missing image: {path}'
        name = str(path.relative_to(DIST.resolve()))
        assert name not in obsolete, f'Image bypasses verified lossless alternative: {name}'
        if path.stat().st_size > 1000000:
            assert name in reviewed and path.stat().st_size <= reviewed[name], f'Unreviewed image exceeds 1 MB: {name}'
            oversized.append(name)
    class Parser(HTMLParser):
        def __init__(self):
            super().__init__(); self.logo_count = 0; self.heroes = []
        def handle_starttag(self, tag, attrs):
            a = dict(attrs)
            if tag == 'img':
                assert a.get('decoding') == 'async', 'Missing asynchronous image decoding'
                if 'brand-logo' in a.get('class', '').split(): self.logo_count += 1
                if a.get('fetchpriority') == 'high':
                    assert a.get('loading') == 'eager', 'Hero must not be lazy-loaded'
                    self.heroes.append(a['src'])
                elif not ('brand-logo' in a.get('class', '').split() and self.logo_count == 1):
                    assert a.get('loading') == 'lazy' and a.get('fetchpriority') == 'low', 'Noncritical image competes with hero'
    for page in DIST.rglob('*.html'):
        parser = Parser(); parser.feed(page.read_text())
    print(f'Image delivery checks passed. {len(oversized)} reviewed images remain over 1 MB to preserve exact pixels and dimensions.')


if __name__ == '__main__': check()
