"""Publish the verified site-wide lossless image delivery update; retain the previous release."""
from pathlib import Path
import urllib.request, hashlib, shutil, os, tempfile, time
from datetime import datetime, timezone
FILES = {'assets/brand-wave-original.lossless.webp': 'eab44c34ef8f7d507d4b795e1728674d142d96b78c7b553ac2c8acc7ebfe1349', 'assets/comfort-icon-original.lossless.webp': 'dc76aefbfa145fd9726f396a95b53d27081e95df44139b70793a781ab29d23a1', 'assets/digestion-icon-original.lossless.webp': '678855ba5fad1bb93f5d7e26cd08b35bfb92c4185cc203cb4b7f60b8cc3260b9', 'assets/exercise-icon-original.lossless.webp': 'd0ed8eb7a0a998b18a0fb1555b9da444e933be5f1292dc20ab8a330349430c19', 'assets/expertise-awards-en-20261019.lossless.webp': 'a56fde1a723cf5128d19596b0beabdec7e86109903218fa9a995c2b04da43e11', 'assets/expertise-certification-en-20261019.lossless.webp': 'a1f9b9716275e26ee2fc3684314c28a823e4f7332cd96f340475d345a6f67777', 'assets/expertise-factory-en-20261019.lossless.webp': '3d9b0a8f17bbca955df00bcb65cc1263e8b05fdb018fb39688ad3122583e03ab', 'assets/expertise-rocket-20261028.lossless.webp': 'b0b3ef8c492a42b7e830e40dc5f6248d9e6d6d387f9ae07e623bc7e05f949de2', 'assets/expertise-showroom-en-20261019.lossless.webp': '69b43f5fc3b084ad4eb7ce5aa0923cc30c999bec4e06ad07d9bedb3c34c8bb85', 'assets/home-icon-original.lossless.webp': 'fc162bdf6c2a7e818509aa23a347e0dae2a606ec2e08ed92a0b118e8ab48e67b', 'assets/precision-icon-original.lossless.webp': '475dcaa57591e42e35f90f3bfcb09b94241544f6e88a1ae8aac00545ab9f28ef', 'assets/sleep-icon-original.lossless.webp': '9779ba892f6932fe3adac81f4be81e31de0c6d6fd3848c7b0979ee4044d3fdab', 'assets/timer-icon-original.lossless.webp': '553b7fd9e089ab1859691b48db51063c95b38f8fba6f4e4ca0fc35d51034ee5c', 'assets/voice-icon-original.lossless.webp': '39e62dfcebd6f30cfcbf07b13ed2f336c2c55bb795850ada974ecf0d11902495', 'chairs/index.html': '3c382d5635940025c3cc4be860c1ba9715c2469d7b224ba41c27ad000f820fa1', 'experience/index.html': 'b8303c5a5150cd20ca1eaf41ccb941ff30350303de7cdc82e74cb1f72b425ac1', 'expertise.css': '89ac20c3a99eb77f80d95e88d6759d4f8457b700028a4c1722eefecb94b5643a', 'index.html': 'f81c8bb39f9da880d999f1e25055f62f7b5d719dcd0cfad43ce85c3dc28245b0', 'our-story/index.html': '83c86cede5f7470631f97fb530000f5f381d3365f46be58001a78ad1c7608e14', 'technology/index.html': 'cdf92137340d1b3d08205b0c33b88800dfdc7c674eb36fe57a8453efcb618a72'}
ALLOWED_PREVIOUS = {'chairs/index.html': ['1c116b2413abf8a235f7d4b14ca8e5bf525aa614be3b4e9f24561a25b2e4d76f'], 'experience/index.html': ['5b18b5ec38c00a6a979fcbe3920512a6fcc1d311959ca7ffd31a4676cd7aae1c'], 'expertise.css': ['7fce19ba7aea71e932c05eafbbea2611f01a49ea7a60c3d3548fd52ea1ea4da9', '89ac20c3a99eb77f80d95e88d6759d4f8457b700028a4c1722eefecb94b5643a'], 'index.html': ['f378bc708ba80a1631cfdde57be8f19f39c92109380b951f3cd1532355a598f7'], 'our-story/index.html': ['52bb1a38f87b60b13aed086f646d1f97cdd0043348a3d6f92140119a961b5841', 'be4be4916d4762810497f804ebfaafb0aab3fc19d3d6ca61e8df90ca79f9cef2'], 'technology/index.html': ['5954a66abcefb88f8d2fa2cb19c6515990e5313c92515da66390d4ed906bf9c5']}
base = Path('/var/www/rhyvia')
old = (base / 'current').resolve()
assert old.is_dir() and old.parent == base / 'releases', 'Unexpected website directory'
if all((old / name).is_file() and hashlib.sha256((old / name).read_bytes()).hexdigest() == digest for name, digest in FILES.items()):
    print('已经是最新版本，无需重复操作')
    raise SystemExit
assert all((old / name).is_file() and hashlib.sha256((old / name).read_bytes()).hexdigest() in hashes for name, hashes in ALLOWED_PREVIOUS.items()), '当前版本与预期不符，未修改网站'
with tempfile.TemporaryDirectory(prefix='rhyvia-images-') as temp:
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
    new = base / 'releases' / ('images-20261028-' + stamp)
    shutil.copytree(old, new)
    for name in FILES:
        target = new / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(staged / name, target)
        target.chmod(0o644)
    link = base / ('current-next-' + stamp)
    link.symlink_to(new)
    os.replace(link, base / 'current')
print('更新完成：全站无损图片与加载优先级优化已上线，旧版本已保留')
print('当前版本:', new)
print('旧版本:', old)
