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
- 图片：`dist/assets/`。
- 联系方式：`dist/site-config.js`。当前电话、邮箱和微信信息尚未配置，预约表单仅整理预约意向，不会向服务器提交或自动确认预约。

## GitHub Pages

向 `main` 推送后，GitHub Actions 会检查站内链接并自动发布 `dist`。发布脚本将路径适配到 Pages 子目录，本地预览文件保持原样。

```sh
python3 scripts/prepare_pages.py --base-path /rhyvia-website/
```

生成目录 `_site/` 无需提交。设置自定义域名时，构建会使用 GitHub Pages 提供的根路径。

品牌、图片及产品素材的权利归各自权利人所有；本仓库不提供素材再使用许可。
