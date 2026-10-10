# RHYVIA Website

RHYVIA 中英文品牌网站，包含首页、座椅系列、核心科技、品牌实力和预约体验五个页面。

## 本地预览

在项目目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

打开 http://127.0.0.1:4173/ 。网站使用原生 HTML、CSS 和 JavaScript，无需前端依赖安装。

## 内容维护

- 首页：`dist/index.html`、`dist/app.js`、`dist/style.css`。
- 其余四页：编辑 `scripts/build_pages.py`，安装 Pillow 后运行 `python3 scripts/build_pages.py`，并提交生成的 HTML。
- 页面交互：`dist/site.js`、`dist/pages.css`。
- 公共效果：`dist/cursor.js`、`dist/ripple.js`。
- 语言选择：`dist/language.js`；显式链接参数 → 已保存的选择 → 浏览器偏好列表中最先匹配的中文或英文 → 英文。中文地区变体统一使用现有简体中文文案。自动匹配不写入存储，只有手动切换才保存；保留旧版本已有的语言记录。存储被禁用时仍可在当前页面切换。
- 图片：`dist/assets/`。
- 联系方式：`dist/site-config.js`。当前电话、邮箱和微信信息尚未配置，预约表单仅整理预约意向，不会向服务器提交或自动确认预约。

## GitHub Pages

向 `main` 推送后，GitHub Actions 会检查站内链接并自动发布 `dist`。发布脚本将路径适配到 Pages 子目录，本地预览文件保持原样。

```sh
python3 scripts/prepare_pages.py --base-path /rhyvia-website/
```

生成目录 `_site/` 无需提交。设置自定义域名时，构建会使用 GitHub Pages 提供的根路径。

品牌、图片及产品素材的权利归各自权利人所有；本仓库不提供素材再使用许可。

## 技术栈与运行要求

| 层面 | 当前实现 |
| --- | --- |
| 网站架构 | 原生多页面静态网站，5 个独立 HTML 页面；未使用 React、Vue、Next.js 或其他前端框架 |
| 页面结构 | HTML5、语义化标签、SVG 图标 |
| 样式和适配 | CSS3、Flexbox、Grid、媒体查询、CSS 变量、毛玻璃效果 |
| 交互语言 | JavaScript：导航、双语、产品相册、模式切换、预约意向整理 |
| 动效 | CSS 动画、requestAnimationFrame、IntersectionObserver、平滑视差 |
| 水波纹 | 自定义 Canvas 2D 水面模拟，不依赖 React Bits、WebGL 或 Three.js |
| 语言与偏好 | 浏览器语言检测、localStorage；不查询用户 IP，不申请定位权限 |
| 素材与字体 | 同站图片、系统字体，无运行时字体或第三方脚本 CDN 依赖 |
| 构建维护 | Python 3；生成内页时使用 Pillow，发布打包仅使用 Python 标准库 |
| 测试 | Node.js 内置测试运行器；生产服务器不需要 Node.js |
| 当前托管 | GitHub Pages + GitHub Actions，强制 HTTPS |
| 后端与数据库 | 当前没有；预约表单未接入实际发送服务 |

## 兼容范围与核验

目标为当前维护中的 Chrome、Edge、Safari、Firefox，以及 iOS Safari / Android Chrome。旧版 IE 不在支持范围。浏览器支持某项 API 不等于已经完成该浏览器真机测试。

- 代码检查：毛玻璃有 Safari 前缀与不透明背景回退；首屏和滚动区有 `vh` 回退；不支持进场观察时直接显示内容；弹窗滚动锁定不依赖 `:has()`；存储失败不阻断语言选择。
- 触摸设备不显示桌面自定义鼠标或水波纹；减少动态效果设置会停用水波纹和视差；剪贴板失败可手动复制。
- 自动测试覆盖语言优先级、地区变体、语言链接、无匹配、禁用存储和手动保存；运行 `node --test tests/language.test.cjs`。
- 本轮实际浏览器验证以 Chromium 内核为主；Safari、Firefox、iOS 和 Android 真机验收仍需在正式发布前完成，不能视为全平台已实测。
- 系统字体、日期选择器和部分模糊效果允许存在浏览器原生呈现差异。

## 迁移到海外服务器

当前网站可以直接部署到支持静态文件的海外服务器，不需要改写前端。Nginx 或 Caddy 均可；仓库附有 `deploy/Caddyfile.example`，尚未在海外服务器启用或验证。

1. 确定正式域名和服务器，将域名 DNS 指向目标服务器。
2. 只上传 `dist/` 内的文件到网站目录，例如 `/var/www/rhyvia`。根域名部署不使用 GitHub Pages 子目录打包结果，也不公开 `.git`、构建脚本、原始客户文件或配置密钥。
3. 为正式域名和使用中的 www 域名配置受信任的 TLS 证书及完整证书链，启用自动续期；HTTP 自动跳转 HTTPS。Caddy 可自动完成证书申请、续期和跳转，但要求正确 DNS、开放端口和可持久化证书目录。
4. 图片、脚本、样式及未来的预约 API 均使用 HTTPS / 同站相对路径，避免混合内容。未来启用 API 时须单独配置服务端验证和访问策略。
5. 正式切换前检查域名匹配、证书有效期及续期、HTTP 跳转、五页直达、图片加载、表单和主要设备浏览器；配置证书到期及可用性监测。

网站不会在普通浏览时主动请求通知、定位、摄像头或麦克风权限。用户主动打开 WhatsApp / 邮件应用或复制内容时，系统或浏览器仍可能显示其自身确认，网站不能保证或强行隐藏这些提示。受信任的 HTTPS 配置可避免常见证书和不安全连接警告，但无法承诺所有用户设备、企业网络和域名信誉系统永远不提示。

参考：[Caddy 自动 HTTPS](https://caddyserver.com/docs/automatic-https)、[GitHub Pages HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)、[MDN 浏览器语言](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)。
