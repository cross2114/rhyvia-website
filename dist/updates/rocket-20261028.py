"""Publish the verified rocket loading and hover fix; retain the previous release."""
from pathlib import Path
import urllib.request, hashlib, shutil, os, tempfile, time
from datetime import datetime, timezone
FILES = {'assets/expertise-rocket-20261028.lossless.webp': 'b0b3ef8c492a42b7e830e40dc5f6248d9e6d6d387f9ae07e623bc7e05f949de2', 'expertise.css': '89ac20c3a99eb77f80d95e88d6759d4f8457b700028a4c1722eefecb94b5643a', 'our-story/index.html': '52bb1a38f87b60b13aed086f646d1f97cdd0043348a3d6f92140119a961b5841'}
base = Path('/var/www/rhyvia')
old = (base / 'current').resolve()
assert old.is_dir() and old.parent == base / 'releases', 'Unexpected website directory'
old_hash = hashlib.sha256((old / 'our-story/index.html').read_bytes()).hexdigest()
if all((old / name).is_file() and hashlib.sha256((old / name).read_bytes()).hexdigest() == digest for name, digest in FILES.items()):
    print('已经是最新版本，无需重复操作')
    raise SystemExit
assert old_hash == 'be4be4916d4762810497f804ebfaafb0aab3fc19d3d6ca61e8df90ca79f9cef2', '当前版本与预期不符，未修改网站'
with tempfile.TemporaryDirectory(prefix='rhyvia-rocket-') as temp:
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
    new = base / 'releases' / ('rocket-20261028-' + stamp)
    shutil.copytree(old, new)
    for name in FILES:
        target = new / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(staged / name, target)
        target.chmod(0o644)
    link = base / ('current-next-' + stamp)
    link.symlink_to(new)
    os.replace(link, base / 'current')
print('更新完成：火箭图片加载与悬浮动画修复已上线，旧版本已保留')
print('当前版本:', new)
print('旧版本:', old)
