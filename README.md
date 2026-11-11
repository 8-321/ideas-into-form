# 由意成形 · IDEAS INTO FORM

个人数字创意作品集网站。三章结构：**成象 / IMAGE**、**成声 / SOUND**、**成境 / EXPERIENCE**。所有页面为静态导出，可直接部署到任意静态托管。

## 快速启动

```bash
npm install
npm run dev        # http://localhost:3000
```

生产构建与本地预览：

```bash
npm run build      # 输出到 out/
npm start          # npx serve out -l 3000
```

要求：Node.js 20+。素材重建另需 **ffmpeg / ffprobe** 在 PATH 中。

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `npm run fonts` | 扫描页面用字，重新生成中文 WOFF2 子集；**新增中文文案后必须跑一次** |
| `npm run assets` | 从原始素材目录转码图片、视频、音频、PPT，写入 `src/content/media.json` |
| `npm run build` | Next.js 静态导出（`output: "export"`，`trailingSlash: true`） |
| `node scripts/audit.mjs` | 18 个视口截图 + 破图、控制台、失败请求检查 |
| `node scripts/interact.mjs` | 音频播放、放映室、PPT、灯箱、动效开关、18 个详情页、链接与媒体存在性检查 |
| `node scripts/reader-check.mjs` | 翻书模式、七种内容页转场、键盘 / 滚轮回翻、移动端、动效关闭与数字 / 倾斜动效检查 |
| `node scripts/motion-check.mjs` | 标题折页、CTA 磁吸、作品掠光、点击墨点与 MOTION OFF 检查 |`r`n| `npm run check:3d` | 真实浏览器验证 Three.js WebGL、5 张纹理、滚动/指针动效、移动端间距、减少动效与 WebGL 回退 |
| `node scripts/layout-check.mjs` | 5 个桌面宽度 × 4 个总览页的标题断行检查 |

`audit.mjs` / `interact.mjs` / `reader-check.mjs` / `motion-check.mjs` / `layout-check.mjs` 使用本机 Edge（`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`），端口分别为 3011 / 3013 / 3012 / 3014 / 3015；换机器时改脚本顶部常量。

## 内容结构

```
site/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 首页
│  │  ├─ image/page.tsx           01 成象
│  │  ├─ sound/page.tsx           02 成声
│  │  ├─ experience/page.tsx      03 成境
│  │  └─ work/[slug]/page.tsx     18 个作品详情（SSG）
│  ├─ components/                 导航、动效、灯箱、播放器、放映室、PPT 浏览
│  ├─ content/
│  │  ├─ media.json               素材清单（由 npm run assets 生成）
│  │  └─ works.ts                 作品文案、章节、分类与展示顺序
│  └─ types/
├─ public/
│  ├─ media/image|video|audio|ppt 转码后的站内素材
│  └─ fonts/                      中文子集与英文字体
├─ scripts/                       素材、字体、验收脚本
└─ out/                           静态导出结果（部署这个目录）
```

## 修改内容

- **作品文案 / 顺序**：编辑 `src/content/works.ts`。每个作品含 `slug`、`no`、`chapter`、标题、摘要、封面、`sections`（text / steps / gallery / note / placeholder / audio / film）。
- **素材**：原始文件放在仓库上一级的 `成象 IMAGE`、`成声 SOUND`、`成境 EXPERIENCE` 目录，然后运行 `npm run assets`。脚本顶部 `ROOT` 是绝对路径，移动项目后需同步修改。
- **强制重建**：PowerShell 执行 `$env:FORCE=1; npm run assets`，结束后 `Remove-Item Env:FORCE`。
- **钢琴 / 古筝封面**：专用封面位于 `成境 EXPERIENCE/影像创作/钢琴` 与 `古筝`，由素材脚本输出到 `public/media/image/filmCovers/`，在 `works.ts` 中以 `FILM_COVERS` 暴露。成境页主视觉、放映室节目首个画面、详情页封面使用该图；下方胶片条仍显示每段视频的真实画面，便于选片。
- **新增中文文案**：跑 `npm run fonts`，否则子集字体可能缺字。
- **占位规则**：缺素材时使用 `placeholder` section，页面明确显示「待上传作品素材」，不用网络图片或生成图冒充实拍作品。

## 设计执行书\n\n完整定位、视觉系统、图片/视频嵌入规范、Three.js 架构、性能预算与验收标准见 [`BRIEF.md`](./BRIEF.md)。\n\n## 动效与可访问性

- **原点档案（WebGL）**：`OriginArchive` 用 Three.js 把 5 件真实作品做成有纸张厚度的悬浮档案；滚动展开、指针阻尼视差，`Texture / Geometry / Material` 在卸载时释放。3D 包延迟加载，不进入首屏公共包；WebGL 失败时回退为 3 张真实图片。\n- **氛围背景**：`AmbientField` 使用单个全屏 Canvas，按成象 / 成声 / 成境切换纸纤维、唱片沟槽、片门光束三套粒子语言；DPR 上限 2，页面隐藏时暂停。
- **自定义光标**：`Cursor` 只在细指针设备启用，环形延迟跟随，链接 / 媒体 / 播放 / 拖拽显示不同标签；触屏与动效关闭时自动退回系统光标。
- **阅读版翻书**：作品详情由 `WorkBook` 提供全书目录、翻页阅读、方向键 / PageUp / PageDown / 滚轮 / 触屏翻页，打开时锁定滚动并暂停非当前页音视频。
- **分类型转场**：文本翻纸、过程卡片抬升、图像贴纸错峰、说明印章落下、占位蓝图展开、声音声纹上浮、影像幕布拉开；方向键前后翻页各有对应方向。
- **总览动效**：滚动进度、数字递增、作品卡指针倾斜、错峰入场；章节标题按语义行折页展开，主要 CTA 轻磁吸，作品图随指针产生掠光，点击光标散出细墨点。交互概念参考 React Bits 的 Fold Text / Magnet / Glare Hover / Click Spark，使用原生 React / CSS / Canvas 重写，不引入额外运行时依赖。
- 全站入场由 `data-reveal` + `IntersectionObserver` 驱动；右上角 `MOTION ON/OFF` 记忆在 `localStorage` 的 `iif-motion`，并同步尊重 `prefers-reduced-motion`。
- 页面切换使用圆形遮罩转场；站内链接统一走 `TransitionLink`。
- 图片均有 `alt`；灯箱、弹窗支持 ESC 关闭，放映室支持 ← → 切换。

## 部署

`npm run build` 后把 `out/` 整体上传到静态托管（Nginx、OSS、Vercel、GitHub Pages 均可）。站点使用相对根路径，部署在子目录时需在 `next.config.ts` 配置 `basePath` 并重新构建。

## 当前规模

- 静态页面 25 个（3 个章节页 + 18 个作品详情 + 首页等）
- 图片 254 张、视频 12 段、音频 5 条、演示文稿 4 份（46 页）\n- 首页首屏：Three.js 5 张真实纹理，桌面 / 移动 / 减少动效 / WebGL 回退四条路径全部有自动化验收
- 成象 16 个项目、成声 5 条音频、成境 11 段影像 + 4 份演示

## 验收基线

2026-11-11 全量检查：

- 18 个视口截图：0 破图、0 控制台错误、0 失败请求、0 横向溢出
- 18 个详情页：全部可访问；6 个内部链接 200；79 个媒体引用全部存在
- 音频真实播放、放映室打开即播并可切换、PPT 快速连点不越界、灯箱 98 张可翻页
- 翻书验收：7 种内容页分别命中 `leaf-text / steps / gallery / note / placeholder / audio / film` 动画；键盘、滚轮回翻、ESC、移动端与 MOTION OFF 全部通过
- 动效验收：标题折页从 `rotateX(-88deg)` 过渡到 `none`，磁吸位移约 `2.9px`，掠光跟随到约 `22%`，点击生成 5 个墨点并自动清理；MOTION OFF 下全部归零
- 排版验收：5 个桌面宽度 × 4 个总览页，30 个章节标题，无非预期折行\n- 3D 验收：WebGL 真实创建、5 张作品纹理、桌面 / 移动、0 溢出、减少动效静态帧、WebGL 回退全部通过；impeccable detect 0 违规
- 截图基线：`.shots/audit.json`、`.shots/reader-report.json`、`.shots/motion-report.json`、`.shots/layout-report.json`、`.shots/book-*.png`

## 公网发布

- 线上地址：https://8-321.github.io/
- 源码仓库：公开 `8-321/ideas-into-form`
- 成品仓库：公开 `8-321/8-321.github.io`（只放 `out/` 构建产物）

源码与成品分仓：成品站放在用户站点仓库 `8-321.github.io`，可以直接占用根域名 `https://8-321.github.io/`；源码仓库保留完整代码与素材。

更新线上站点：

```powershell
cd site
npm run build
robocopy out "D:/deploy/ideas-into-form-pages" /MIR /XD "D:/deploy/ideas-into-form-pages/.git"
if ($LASTEXITCODE -ge 8) { throw "robocopy failed" }
git -C "D:/deploy/ideas-into-form-pages" add -A
git -C "D:/deploy/ideas-into-form-pages" commit -m "deploy: update site"
git -C "D:/deploy/ideas-into-form-pages" push
```

若部署目录不存在，先克隆一次：

```powershell
git clone https://github.com/8-321/8-321.github.io.git "D:/deploy/ideas-into-form-pages"
```

注意：`robocopy` 退出码 `0` 表示无变化、`1` 表示成功复制，均属正常；`>= 8` 才是失败。