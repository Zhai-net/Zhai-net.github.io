import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  site,
  navigation,
  footerNavigation,
  footerLinks,
  friendLinks,
  pages,
  cssSources,
  commonScriptSources,
  renderScriptSources
} from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const changedFiles = [];

const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const escapeHTML = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function indentBlock(value, spaces = 2) {
  const prefix = ' '.repeat(spaces);
  return value.trim().split('\n').map((line) => `${prefix}${line}`).join('\n');
}

function replaceTokens(template, values) {
  return template.replace(/{{([A-Z0-9_]+)}}/g, (match, key) => (
    Object.hasOwn(values, key) ? String(values[key]) : match
  ));
}

function externalAttributes(href) {
  return /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function renderHeader(activeNav) {
  const links = navigation.map((item) => {
    const active = item.key === activeNav;
    const classes = [item.className, active ? 'active' : ''].filter(Boolean).join(' ');
    const classAttribute = classes ? ` class="${classes}"` : '';
    const currentAttribute = active ? ' aria-current="page"' : '';
    return `        <a${classAttribute}${currentAttribute} href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a>`;
  }).join('\n');

  return `  <header class="site-header" id="top">
    <nav class="nav-wrap" aria-label="主导航">
      <a class="brand" href="index.html" aria-label="${escapeHTML(site.name)}首页">
        <img class="ustc-seal" src="assets/logos/ustcblue.png" alt="${escapeHTML(site.schoolName)}校徽" width="54" height="54" loading="eager" decoding="async" fetchpriority="high">
        <span class="brand-school">
          <img src="assets/logos/ustcnameblue.png" alt="${escapeHTML(site.schoolName)}" width="270" height="41" loading="eager" decoding="async">
          <small>${escapeHTML(site.schoolNameEn)}</small>
        </span>
        <span class="brand-divider" aria-hidden="true"></span>
        <span class="brand-lab">
          <strong>${escapeHTML(site.name)}</strong>
          <small>${escapeHTML(site.nameEn)}</small>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-controls="siteMenu" aria-expanded="false" aria-label="打开导航菜单">
        <span></span><span></span><span></span>
      </button>
      <div class="nav-menu" id="siteMenu">
${links}
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="切换深色或浅色模式" aria-pressed="false">
          <span class="theme-icon" aria-hidden="true">🌙</span>
          <span class="theme-label">深色</span>
        </button>
      </div>
    </nav>
  </header>`;
}

function renderLinkList(items) {
  return items.map((item) => `        <a href="${escapeHTML(item.href)}"${externalAttributes(item.href)}>${escapeHTML(item.label)}</a>`).join('\n');
}

function renderFooter() {
  const contactLinks = [
    { label: site.contactEmail, href: `mailto:${site.contactEmail}` },
    ...footerLinks
  ];
  return `  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-column footer-identity">
        <div class="footer-brand compact">
          <img src="assets/logos/ustcblue.png" alt="${escapeHTML(site.schoolName)}校徽" width="46" height="46" loading="lazy" decoding="async">
          <span>
            <strong>${escapeHTML(site.name)}</strong>
            <small>${escapeHTML(site.footerTagline)}</small>
          </span>
        </div>
        <p>${escapeHTML(site.footerDescription)}</p>
      </div>
      <div class="footer-column">
        <h2>网站导航</h2>
${renderLinkList(footerNavigation)}
      </div>
      <div class="footer-column">
        <h2>联系与链接</h2>
${renderLinkList(contactLinks)}
      </div>
      <div class="footer-column footer-friends">
        <h2>友情链接</h2>
${renderLinkList(friendLinks)}
      </div>
      <div class="footer-bottom">
        <span>© ${escapeHTML(site.copyrightYear)} ${escapeHTML(site.name)} 版权所有</span>
        <span>Last updated: <time datetime="${escapeHTML(site.lastUpdated)}" data-last-updated>${escapeHTML(site.lastUpdated)}</time></span>
      </div>
    </div>
  </footer>`;
}

function renderScripts(page) {
  const dataScripts = page.dataScripts
    .map((name) => `  <script defer src="assets/data/${name}.js"></script>`);
  const scripts = page.scripts
    .map((name) => `  <script defer src="assets/js/${name}.js"></script>`);
  return [...dataScripts, ...scripts].join('\n');
}

async function buildPage(pageKey, page) {
  const [documentTemplate, themeTemplate, commonUi, sourceContent] = await Promise.all([
    read('src/templates/document.html'),
    read('src/partials/theme-init.html'),
    read('src/partials/common-ui.html'),
    read(page.source)
  ]);

  const content = replaceTokens(sourceContent, {
    CONTACT_EMAIL: site.contactEmail,
    PUBLIC_URL: site.publicUrl,
    BUSUANZI_SRC: site.statistics.busuanziSrc,
    MAP_FRAME_SRC: site.statistics.mapFrameSrc
  });
  const themeInit = replaceTokens(themeTemplate, {
    THEME_STORAGE_KEY: site.themeStorageKey,
    THEME_LIGHT: site.themeColors.light,
    THEME_DARK: site.themeColors.dark
  });
  const html = replaceTokens(documentTemplate, {
    LANG: site.lang,
    DESCRIPTION: escapeHTML(page.description),
    TITLE: escapeHTML(page.title),
    THEME_LIGHT: site.themeColors.light,
    THEME_INIT: themeInit.trimEnd(),
    PAGE_KEY: pageKey,
    HEADER: renderHeader(page.activeNav),
    CONTENT: indentBlock(content, 2),
    COMMON_UI: commonUi.trimEnd(),
    FOOTER: renderFooter(),
    SCRIPTS: renderScripts(page)
  });
  return `${html.trim()}\n`;
}

async function bundleFiles(sourceFiles, banner, wrapper = false) {
  const contents = await Promise.all(sourceFiles.map(async (source) => {
    const body = (await read(source)).trim();
    return `// Source: ${source}\n${body}`;
  }));
  const combined = contents.join('\n\n');
  if (!wrapper) return `${banner}\n\n${combined}\n`;
  return `${banner}\n\n(() => {\n  'use strict';\n\n${indentBlock(combined, 2)}\n})();\n`;
}

async function writeGenerated(relativePath, content) {
  const destination = path.join(root, relativePath);
  let existing = null;
  try {
    existing = await readFile(destination, 'utf8');
  } catch (error) {
    existing = null;
  }
  if (existing === content) return;
  changedFiles.push(relativePath);
  if (!checkOnly) await writeFile(destination, content, 'utf8');
}

async function main() {
  for (const [pageKey, page] of Object.entries(pages)) {
    await writeGenerated(page.output, await buildPage(pageKey, page));
  }

  const css = await bundleFiles(
    cssSources,
    '/* GENERATED FILE. Edit src/css/*.css and run npm run build. */'
  );
  await writeGenerated('assets/css/global.css', css);

  const commonScript = await bundleFiles(
    commonScriptSources,
    '// GENERATED FILE. Edit src/js/common/*.js and run npm run build.',
    true
  );
  await writeGenerated('assets/js/common.js', commonScript);

  const renderScript = await bundleFiles(
    renderScriptSources,
    '// GENERATED FILE. Edit src/js/render/*.js and run npm run build.',
    true
  );
  await writeGenerated('assets/js/render.js', renderScript);

  const statisticsSource = await read('src/js/statistics.js');
  await writeGenerated(
    'assets/js/statistics.js',
    `// GENERATED FILE. Edit src/js/statistics.js and run npm run build.\n\n${statisticsSource.trim()}\n`
  );

  const runtimeSite = {
    lastUpdated: site.lastUpdated,
    labName: site.name,
    labNameEn: site.nameEn,
    footerDescription: site.footerDescription,
    contactEmail: site.contactEmail,
    publicUrl: site.publicUrl,
    themeStorageKey: site.themeStorageKey,
    themeColors: site.themeColors,
    statistics: site.statistics,
    links: site.links
  };
  await writeGenerated(
    'assets/data/site.js',
    `// GENERATED FILE. Edit site.config.mjs and run npm run build.\nwindow.ZHAI_SITE = ${JSON.stringify(runtimeSite, null, 2)};\n`
  );

  if (checkOnly && changedFiles.length) {
    console.error(`Generated files are out of date:\n${changedFiles.map((file) => `- ${file}`).join('\n')}`);
    process.exitCode = 1;
    return;
  }
  if (!checkOnly) {
    console.log(changedFiles.length ? `Built ${changedFiles.length} file(s).` : 'Build output is already current.');
  }
}

await main();
