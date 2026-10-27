"""Publish the verified RHYVIA THREE image update; retain the previous release."""
from pathlib import Path
import urllib.request, hashlib, shutil, os, tempfile, time
from datetime import datetime, timezone
FILES = {'assets/chair-three-alternate-20261027.lossless.webp': 'fdc29939fd14262dbed31f6928fdca97f6a4b23e8e94aab2a029c5b4ebd4a918', 'assets/chair-three-angle-20261027.lossless.webp': '8a7c8f030db4459eb4800d08e54be10e378df7d22d355d5b854ce5818afeaf57', 'assets/chair-three-front-20261027.lossless.webp': 'f2d303c5fb14672d409dd41688d6ac9f39d6491eddd548dd1ca739a26d87e7b6', 'assets/chair-three-reverse-20261027.lossless.webp': 'b4ba3be9dd186cac93731218384d3d7d6dc1a7025e0ac7882e4244c95e8bdeb5', 'assets/chair-three-scene-20261027.lossless.webp': '5f5cec6977ccab700a423611191318ea1eaed3b2eeb90f1f9d5a276f49145446', 'assets/chair-three-side-20261027.lossless.webp': 'b8ecc296642b875ef5545e1a881b246bc1c8c60e982d50beee2869ebe50d327d', 'chairs/index.html': '1c116b2413abf8a235f7d4b14ca8e5bf525aa614be3b4e9f24561a25b2e4d76f', 'experience/index.html': '5b18b5ec38c00a6a979fcbe3920512a6fcc1d311959ca7ffd31a4676cd7aae1c', 'our-story/index.html': 'be4be4916d4762810497f804ebfaafb0aab3fc19d3d6ca61e8df90ca79f9cef2', 'pages.css': '785f45c5f7f6900a9fe9e7dbea1b12ee02f5a4cfc5f9aa92a17b91a442d3423b', 'technology/index.html': '5954a66abcefb88f8d2fa2cb19c6515990e5313c92515da66390d4ed906bf9c5'}
base = Path('/var/www/rhyvia')
old = (base / 'current').resolve()
assert old.is_dir() and old.parent == base / 'releases', 'Unexpected website directory'
old_hash = hashlib.sha256((old / 'chairs/index.html').read_bytes()).hexdigest()
if all((old / name).is_file() and hashlib.sha256((old / name).read_bytes()).hexdigest() == digest for name, digest in FILES.items()):
    print('已经是最新版本，无需重复操作')
    raise SystemExit
assert old_hash == 'f3fde882c70b04f7dba0e3366931f51499cd67375514979c3ef1d78ab7d8fa11', '当前版本与预期不符，未修改网站'
with tempfile.TemporaryDirectory(prefix='rhyvia-three-') as temp:
    staged = Path(temp)
    for name, digest in FILES.items():
        for attempt in range(3):
            try:
                url = 'https://cross2114.github.io/rhyvia-website/' + name
                with urllib.request.urlopen(url, timeout=60) as response:
                    data = response.read()
                if name.endswith('.html'):
                    data = data.decode().replace('/rhyvia-website/', '/').encode()
                assert hashlib.sha256(data).hexdigest() == digest, '文件校验失败: ' + name
                break
            except Exception:
                if attempt == 2: raise
                time.sleep(2)
        target = staged / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        print('校验通过:', name, flush=True)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    new = base / 'releases' / ('cf4de67-' + stamp)
    shutil.copytree(old, new)
    for name in FILES:
        target = new / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(staged / name, target)
        target.chmod(0o644)
    link = base / ('current-next-' + stamp)
    link.symlink_to(new)
    os.replace(link, base / 'current')
print('更新完成：RHYVIA THREE 新图片已上线，旧版本已保留')
print('当前版本:', new)
print('旧版本:', old)
