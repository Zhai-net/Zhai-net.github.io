# Data files

本目录用于维护网站内容数据。页面结构、视觉样式和交互逻辑分别放在 HTML、`assets/css/global.css`、`assets/js/*.js` 中，具体内容尽量集中在本目录，方便后续维护。

- `publications.js`：论文列表、年份、作者、期刊、卷号/页码、DOI、首页代表论文标记。论文页搜索和年份索引会自动读取这里的数据。
- `people.js`：课题组负责人、博士后、学生、毕业生等人员信息。首页成员区和 `people.html` 都会自动读取这里的数据。
- `news.js`：首页与新闻页时间轴条目。
- `gallery.js`：首页 Group Gallery 图片墙。
- `site.js`：站点名称、更新时间、外部链接，以及旧版预览页的访问 IP 地图配置等站点级信息。

## 访问统计与全球访问地图

首页的不蒜子 PV/UV 和 MapMyVisitors 全球访问地图都由 `assets/js/statistics.js` 延后加载：只有当访问统计区域接近视口时，浏览器才会请求第三方脚本，避免页底统计与首屏图片、样式竞争网络资源。

- 不蒜子脚本地址配置在 `index.html` 的 `#site-statistics[data-busuanzi-src]`。
- MapMyVisitors 地址配置在 `index.html` 的 `[data-mapmyvisitors-src]`。
- `preview_render.html` 保留了基于 `site.js` 中 `visitorMap.endpoint` 的旧版 IP 定位预览，同样由 `statistics.js` 延后请求。

动态成员、毕业生与相册图片由 `assets/js/render.js` 输出，并统一使用浏览器原生 `loading="lazy"` 和异步解码。首屏校徽与校名图保持立即加载，页底及正文图片使用懒加载。

## 维护建议

1. 新增论文优先改 `publications.js`，保持字段 `year / authors / title / journal / detail / doi / doiUrl` 完整。
2. 新增成员优先改 `people.js`，保持 `id` 唯一，并尽量补充 `category / title / role / bio / email / image`。
3. 不建议直接在 HTML 中手写论文、人员和新闻列表，避免首页和子页面信息不一致。
4. 修改视觉风格时优先改 `assets/css/global.css`；修改内容渲染时改 `assets/js/render.js`；修改通用交互时改 `assets/js/common.js`；修改访问统计加载策略时改 `assets/js/statistics.js`。
