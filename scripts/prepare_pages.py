"""Package the static site for GitHub Pages without changing local preview paths."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
ATTR = re.compile(r'''(\b(?:href|src|data-image|data-src-en|data-src-zh)\s*=\s*["'])/(?!/)''')


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        self.urls.extend(value for key, value in attrs
                         if key in {"href", "src", "data-image", "data-src-en", "data-src-zh"} and value)


def prepare(base_path):
    base_path = "/" + base_path.strip("/") + "/" if base_path.strip("/") else "/"
    if not re.fullmatch(r"/[A-Za-z0-9._/-]*", base_path) or ".." in base_path:
        raise ValueError("Invalid Pages base path")
    output = ROOT / "_site"
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(ROOT / "dist", output, ignore=shutil.ignore_patterns(".DS_Store"))
    pages = list(output.rglob("*.html"))
    for page in pages:
        page.write_text(ATTR.sub(lambda m: m[1] + base_path, page.read_text()))
    (output / ".nojekyll").touch()
    # Check navigation, scripts, styles, images and dynamically selected gallery images.
    checked = 0
    for page in pages:
        parser = References()
        parser.feed(page.read_text())
        page_url = "https://pages.example" + base_path + page.relative_to(output).as_posix()
        for reference in parser.urls:
            url = urlsplit(urljoin(page_url, reference))
            if url.netloc != "pages.example" or url.scheme != "https":
                continue
            if not url.path.startswith(base_path):
                raise ValueError(f"Link escapes project path: {page.name}: {reference}")
            target = output / unquote(url.path[len(base_path):])
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                raise FileNotFoundError(f"Broken link in {page}: {reference}")
            checked += 1
    print(f"Prepared {len(pages)} pages at {base_path}; verified {checked} local references.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-path", default="/")
    prepare(parser.parse_args().base_path)
