# 内容数据维护

本目录保存网站的可编辑内容数据。页面会通过 `assets/js/render.js` 自动渲染这些数据；不要在多个 HTML 页面中重复手写同一批成员、论文或新闻。

## 文件职责

- `people.js`：负责人、博士后、学生和毕业生信息；
- `publications.js`：论文作者、题目、期刊、年份、卷页和 DOI；
- `news.js`：首页和新闻页时间轴；
- `gallery.js`：首页图库；
- `site.js`：由 `site.config.mjs` 自动生成的运行时站点配置，**不要直接修改**。

## 成员字段

常用字段：

```text
id / name / nameEn / title / role / category / homepage
image / imageAlt / bio / shortBio / email
```

`category` 允许值：

```text
pi / postdoc / student / alumni
```

维护要求：

1. `id` 保持唯一且使用小写英文与连字符；
2. 图片路径必须指向仓库中真实存在的文件；
3. 首页最多展示 12 位非毕业成员和 14 位毕业生；
4. 不希望出现在首页的成员可设置 `homepage: false`；
5. 毕业生建议补充 `graduation` 和 `destination`。

## 论文字段

```text
year / authors / title / journal / detail / doi / doiUrl / featured
```

- `year` 使用整数；
- DOI 不包含 `https://doi.org/` 前缀；
- `doiUrl` 可省略，页面会根据 DOI 自动生成；
- `featured: true` 表示优先进入首页代表论文列表。

## 自动检查

在仓库根目录运行：

```bash
npm run validate
```

检查内容包括：成员 ID 重复、分类错误、邮箱格式、缺失图片、论文字段、重复 DOI、图库资源和新闻必填字段。
