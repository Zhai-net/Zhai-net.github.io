import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { pages, site } from '../site.config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

function report(condition, message, collection = errors) {
  if (!condition) collection.push(message);
}

function stripCommentsAndStrings(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``');
}

function validateBalancedBraces(source, label) {
  const clean = stripCommentsAndStrings(source);
  let depth = 0;
  for (const character of clean) {
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth < 0) break;
  }
  report(depth === 0, `${label}: unbalanced braces`);
}

async function validateJavaScript(relativePath) {
  const source = await read(relativePath);
  try {
    new vm.Script(source, { filename: relativePath });
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
  }
  report(!/console\.log\(/.test(source), `${relativePath}: remove console.log before publishing`, warnings);
}

async function validateHtml(relativePath) {
  const html = await read(relativePath);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  report(duplicateIds.length === 0, `${relativePath}: duplicate id(s): ${duplicateIds.join(', ')}`);
  report(/<html\s[^>]*lang="zh-CN"/.test(html), `${relativePath}: missing lang="zh-CN"`);
  report((html.match(/<main\b/g) || []).length === 1, `${relativePath}: expected exactly one <main>`);
  report((html.match(/<h1\b/g) || []).length === 1, `${relativePath}: expected exactly one <h1>`);
  report(/<meta\s+name="description"\s+content="[^"]+"/.test(html), `${relativePath}: missing meta description`);
  report(!/class=""/.test(html), `${relativePath}: contains empty class attribute`, warnings);
  report(!/{{[A-Z0-9_]+}}/.test(html), `${relativePath}: contains an unresolved build token`);

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  images.forEach((tag, index) => report(/\salt="[^"]*"/.test(tag), `${relativePath}: image ${index + 1} has no alt attribute`));

  const externalBlankLinks = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((match) => match[0]);
  externalBlankLinks.forEach((tag) => {
    report(/rel="[^"]*noopener[^"]*"/.test(tag), `${relativePath}: target="_blank" link lacks noopener`);
  });

  const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of localReferences) {
    if (/^(?:https?:|mailto:|tel:|#|data:|javascript:)/i.test(reference)) continue;
    const filePart = reference.split('#')[0].split('?')[0];
    if (!filePart) continue;
    try {
      await access(path.join(root, filePart));
    } catch (error) {
      errors.push(`${relativePath}: missing local resource ${filePart}`);
    }
  }
}

async function loadData(relativePath, globalName) {
  const source = await read(relativePath);
  const context = { window: {} };
  vm.createContext(context);
  new vm.Script(source, { filename: relativePath }).runInContext(context);
  return context.window[globalName];
}

async function validateData() {
  const [people, publications, gallery, news] = await Promise.all([
    loadData('assets/data/people.js', 'ZHAI_PEOPLE'),
    loadData('assets/data/publications.js', 'ZHAI_PUBLICATIONS'),
    loadData('assets/data/gallery.js', 'ZHAI_GALLERY'),
    loadData('assets/data/news.js', 'ZHAI_NEWS')
  ]);

  report(Array.isArray(people), 'people.js: ZHAI_PEOPLE must be an array');
  report(Array.isArray(publications), 'publications.js: ZHAI_PUBLICATIONS must be an array');
  report(Array.isArray(gallery), 'gallery.js: ZHAI_GALLERY must be an array');
  report(Array.isArray(news), 'news.js: ZHAI_NEWS must be an array');

  const ids = new Set();
  for (const [index, person] of people.entries()) {
    report(Boolean(person.name), `people.js[${index}]: missing name`);
    report(['pi', 'postdoc', 'student', 'alumni'].includes(person.category), `people.js[${index}]: invalid category ${person.category}`);
    if (person.id) {
      report(!ids.has(person.id), `people.js: duplicate id ${person.id}`);
      ids.add(person.id);
    }
    if (person.email) report(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email), `people.js[${index}]: invalid email ${person.email}`);
    if (person.image) {
      try { await access(path.join(root, person.image)); }
      catch (error) { errors.push(`people.js[${index}]: missing image ${person.image}`); }
    }
  }

  const dois = new Set();
  for (const [index, publication] of publications.entries()) {
    report(Boolean(publication.title), `publications.js[${index}]: missing title`);
    report(Boolean(publication.authors), `publications.js[${index}]: missing authors`);
    report(Boolean(publication.journal), `publications.js[${index}]: missing journal`);
    report(Number.isInteger(publication.year), `publications.js[${index}]: year must be an integer`);
    if (publication.doi) {
      report(/^10\.\d{4,9}\/.+/.test(publication.doi), `publications.js[${index}]: suspicious DOI ${publication.doi}`, warnings);
      report(!dois.has(publication.doi.toLowerCase()), `publications.js: duplicate DOI ${publication.doi}`);
      dois.add(publication.doi.toLowerCase());
    }
  }

  for (const [index, item] of gallery.entries()) {
    report(Boolean(item.title && item.image && item.alt), `gallery.js[${index}]: title, image and alt are required`);
    try { await access(path.join(root, item.image)); }
    catch (error) { errors.push(`gallery.js[${index}]: missing image ${item.image}`); }
  }

  for (const [index, item] of news.entries()) {
    report(Boolean(item.date && item.title), `news.js[${index}]: date and title are required`);
  }

  report(/^\d{4}-\d{2}-\d{2}$/.test(site.lastUpdated), 'site.config.mjs: lastUpdated must use YYYY-MM-DD');
  report(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail), 'site.config.mjs: invalid contactEmail');
}

for (const page of Object.values(pages)) await validateHtml(page.output);
await validateJavaScript('assets/js/common.js');
await validateJavaScript('assets/js/render.js');
await validateJavaScript('assets/js/statistics.js');
validateBalancedBraces(await read('assets/css/global.css'), 'assets/css/global.css');
await validateData();

if (warnings.length) console.warn(`Warnings (${warnings.length}):\n${warnings.map((message) => `- ${message}`).join('\n')}`);
if (errors.length) {
  console.error(`Validation failed (${errors.length}):\n${errors.map((message) => `- ${message}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Validation passed.');
}
