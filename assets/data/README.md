# Data files

本目录用于维护网站内容数据。页面结构、视觉样式和交互逻辑分别放在 HTML、`assets/css/global.css`、`assets/js/*.js` 中，具体内容尽量集中在本目录，方便后续维护。

- `publications.js`：论文列表、年份、作者、期刊、卷号/页码、DOI、首页代表论文标记。论文页搜索和年份索引会自动读取这里的数据。
- `people.js`：课题组负责人、博士后、学生、毕业生等人员信息。首页成员区和 `people.html` 都会自动读取这里的数据。
- `news.js`：首页与新闻页时间轴条目。
- `gallery.js`：首页 Group Gallery 图片墙。
- `site.js`：站点名称、更新时间、外部链接、访问 IP 地图配置等站点级信息。

## 访问统计与 IP 地图

首页访问量使用不蒜子 PV/UV 脚本。IP 地图默认通过 `site.js` 中的 `visitorMap.endpoint` 获取当前访问 IP 的城市/国家并在小地图上标点。若后续使用 ClustrMaps、FlagCounter 等聚合访问地图服务，可把公开统计页链接填入：

```js
visitorMap: {
  enabled: true,
  endpoint: "https://ipwho.is/",
  aggregateMapUrl: "https://your-visitor-map-link.example"
}
```

这样首页会自动显示“查看聚合访问地图”按钮；不需要修改 `index.html`。

## 维护建议

1. 新增论文优先改 `publications.js`，保持字段 `year / authors / title / journal / detail / doi / doiUrl` 完整。
2. 新增成员优先改 `people.js`，保持 `id` 唯一，并尽量补充 `category / title / role / bio / email / image`。
3. 不建议直接在 HTML 中手写论文、人员和新闻列表，避免首页和子页面信息不一致。
4. 修改视觉风格时优先改 `assets/css/global.css`；修改渲染逻辑时优先改 `assets/js/render.js`；修改通用交互时优先改 `assets/js/common.js`。
