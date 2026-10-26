"""Create pixel-exact WebP copies and update the site's image references.

Requires Pillow with libwebp. Originals stay untouched. Only smaller verified
outputs are used; JPEGs retain their existing compression and pixel data.
Run: python3 scripts/optimize_images.py
"""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
from PIL import Image, features

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'dist/assets'
MANIFEST = ROOT / 'scripts/lossless-images.json'
TEXT_SUFFIXES = {'.html', '.css', '.js'}


def optimize(path):
    target = path.with_name(path.stem + '.lossless.webp')
    with Image.open(path) as source:
        if source.mode not in {'RGB', 'RGBA', 'P', 'L', 'LA'} or getattr(source, 'n_frames', 1) != 1:
            return None
        # A non-sRGB PNG gamma cannot be copied into WebP. Leave such files alone.
        if 'gamma' in source.info and 'srgb' not in source.info and not source.info.get('icc_profile'):
            return None
        original = source.convert('RGBA')
        source.save(target, 'WEBP', lossless=True, quality=100, method=6, exact=True,
                    icc_profile=source.info.get('icc_profile', b''),
                    exif=source.info.get('exif', b''), xmp=source.info.get('xmp', b''))
        with Image.open(target) as decoded:
            if decoded.size != source.size or decoded.convert('RGBA').tobytes() != original.tobytes():
                target.unlink()
                raise ValueError(f'Pixel mismatch: {path.name}')
            if decoded.info.get('icc_profile') != source.info.get('icc_profile'):
                target.unlink()
                raise ValueError(f'Colour profile mismatch: {path.name}')
        before, after = path.stat().st_size, target.stat().st_size
        if after >= before:
            target.unlink()
            return None
        row = dict(source=path.name, optimized=target.name, width=source.width,
                   height=source.height, before_bytes=before, after_bytes=after,
                   rgba_sha256=hashlib.sha256(original.tobytes()).hexdigest(),
                   source_sha256=hashlib.sha256(path.read_bytes()).hexdigest())
        print(f'{path.name}: {before:,} -> {after:,} bytes; pixels identical', flush=True)
        return row


def main():
    texts = [p for p in (ROOT / 'dist').rglob('*') if p.suffix in TEXT_SUFFIXES]
    texts += [ROOT / 'scripts' / name for name in
              ['build_pages.py', 'bed_section.py', 'expertise_page.py']]
    content = '\n'.join(p.read_text() for p in texts)
    previous = json.loads(MANIFEST.read_text())['images'] if MANIFEST.exists() else []
    previous_names = {row['source'] for row in previous}
    candidates = [p for p in ASSETS.glob('*.png') if p.stat().st_size >= 65536
                  and (p.name in content or p.name in previous_names)]
    with ThreadPoolExecutor(max_workers=4) as pool:
        images = [row for row in pool.map(optimize, sorted(candidates)) if row]
    for path in texts:
        original = path.read_text()
        updated = original
        # Restore old mappings first, including assets that no longer get smaller.
        for row in previous:
            updated = updated.replace(row['optimized'], row['source'])
        for row in images:
            updated = updated.replace(row['source'], row['optimized'])
        if updated != original:
            path.write_text(updated)
    report = dict(codec='libwebp', version=features.version('webp'), lossless=True,
                  exact=True, method=6, resized=False, images=images)
    MANIFEST.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    before = sum(row['before_bytes'] for row in images)
    after = sum(row['after_bytes'] for row in images)
    print(f'TOTAL: {len(images)} images, {before:,} -> {after:,} bytes ({(1-after/before)*100:.1f}% smaller)', flush=True)


if __name__ == '__main__':
    main()
