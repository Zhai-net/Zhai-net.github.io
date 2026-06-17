export const site = {
  lang: 'zh-CN',
  name: '翟志刚课题组',
  nameEn: 'Zhigang Zhai Research Group',
  schoolName: '中国科学技术大学',
  schoolNameEn: 'University of Science and Technology of China',
  footerTagline: 'Experimental Fluid Mechanics · USTC',
  footerDescription: '面向实验流体力学、流动稳定性和激波动力学的基础与应用基础研究。',
  contactEmail: 'sanjing@ustc.edu.cn',
  publicUrl: 'https://zhai-net.github.io',
  lastUpdated: '2026-06-17',
  copyrightYear: 2026,
  themeStorageKey: 'zhai-lab-theme',
  themeColors: {
    light: '#f7f5f1',
    dark: '#0c1220'
  },
  statistics: {
    busuanziSrc: 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js',
    mapFrameSrc: 'assets/mapmyvisitors.html'
  },
  links: {
    ustcProfile: 'https://faculty.ustc.edu.cn/zhaizhigang/zh_CN/index.htm',
    googleScholar: 'https://scholar.google.com/citations?hl=zh-CN&user=wJDRPKAAAAAJ',
    researchGate: 'https://www.researchgate.net/profile/Zhigang-Zhai',
    ustc: 'https://www.ustc.edu.cn/',
    schoolOfEngineeringScience: 'https://ses.ustc.edu.cn/main.htm',
    departmentOfModernMechanics: 'https://mech.ustc.edu.cn/main.htm',
    luoXisheng: 'https://staff.ustc.edu.cn/~xluo/',
    siTing: 'https://faculty.ustc.edu.cn/tsi/zh_CN/index.htm'
  }
};

export const navigation = [
  { key: 'about', label: '简介', href: 'index.html#about' },
  { key: 'research', label: '研究', href: 'index.html#research' },
  { key: 'publications', label: '论文', href: 'publications.html' },
  { key: 'people', label: '成员', href: 'people.html' },
  { key: 'news', label: '时间轴', href: 'news.html' },
  { key: 'join', label: '加入我们', href: 'index.html#join', className: 'nav-contact' }
];

export const footerNavigation = [
  { label: '简介', href: 'index.html#about' },
  { label: '研究方向', href: 'index.html#research' },
  { label: '论文', href: 'publications.html' },
  { label: '成员', href: 'people.html' },
  { label: '时间轴', href: 'news.html' }
];

export const footerLinks = [
  { label: 'USTC 个人主页', href: site.links.ustcProfile },
  { label: 'Google Scholar', href: site.links.googleScholar },
  { label: 'ResearchGate', href: site.links.researchGate }
];

export const friendLinks = [
  { label: '中国科学技术大学主页', href: site.links.ustc },
  { label: '工程科学学院主页', href: site.links.schoolOfEngineeringScience },
  { label: '近代力学系主页', href: site.links.departmentOfModernMechanics },
  { label: '罗喜胜教授主页', href: site.links.luoXisheng },
  { label: '司廷教授主页', href: site.links.siTing }
];

export const pages = {
  index: {
    output: 'index.html',
    source: 'src/pages/index.html',
    title: '翟志刚课题组 | Zhigang Zhai Research Group',
    description: '翟志刚课题组主页：实验流体力学、流动稳定性、激波动力学与界面不稳定性研究。',
    activeNav: '',
    dataScripts: ['site', 'publications', 'people', 'gallery', 'news'],
    scripts: ['render', 'statistics', 'common']
  },
  preview: {
    output: 'preview_render.html',
    source: 'src/pages/index.html',
    title: '翟志刚课题组 | Zhigang Zhai Research Group',
    description: '翟志刚课题组主页预览。',
    activeNav: '',
    dataScripts: ['site', 'publications', 'people', 'gallery', 'news'],
    scripts: ['render', 'statistics', 'common']
  },
  people: {
    output: 'people.html',
    source: 'src/pages/people.html',
    title: '成员 | 翟志刚课题组',
    description: '翟志刚课题组成员页面。',
    activeNav: 'people',
    dataScripts: ['site', 'people'],
    scripts: ['render', 'common']
  },
  publications: {
    output: 'publications.html',
    source: 'src/pages/publications.html',
    title: '论文 | 翟志刚课题组',
    description: '翟志刚课题组论文列表，按年份分类并提供 DOI 跳转。',
    activeNav: 'publications',
    dataScripts: ['site', 'publications'],
    scripts: ['render', 'common']
  },
  news: {
    output: 'news.html',
    source: 'src/pages/news.html',
    title: '新闻时间轴 | 翟志刚课题组',
    description: '翟志刚课题组新闻与学术动态。',
    activeNav: 'news',
    dataScripts: ['site', 'news'],
    scripts: ['render', 'common']
  }
};

export const cssSources = [
  'src/css/00-foundation.css',
  'src/css/10-home-layout.css',
  'src/css/20-subpages.css',
  'src/css/30-publications-career.css',
  'src/css/40-interactions.css',
  'src/css/50-people-footer.css',
  'src/css/60-media-performance.css',
  'src/css/70-polish-accessibility.css'
];

export const commonScriptSources = [
  'src/js/common/utils.js',
  'src/js/common/navigation.js',
  'src/js/common/theme.js',
  'src/js/common/scroll-ui.js',
  'src/js/common/cursor-particles.js',
  'src/js/common/flow-background.js',
  'src/js/common/lightbox.js',
  'src/js/common/person-cards.js',
  'src/js/common/reveal.js',
  'src/js/common/section-navigator.js',
  'src/js/common/publications.js',
  'src/js/common/email-copy.js',
  'src/js/common/hash-links.js',
  'src/js/common/main.js'
];

export const renderScriptSources = [
  'src/js/render/utils.js',
  'src/js/render/people.js',
  'src/js/render/gallery.js',
  'src/js/render/news.js',
  'src/js/render/publications.js',
  'src/js/render/site-meta.js',
  'src/js/render/main.js'
];
