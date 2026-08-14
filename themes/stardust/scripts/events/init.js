'use strict';

/* Theme initialization — merge default config */
hexo.extend.filter.register('before_generate', function() {
  var defaults = {
    loading: {
      enable: true,
      particle_count: 60,
      duration: 3000
    },
    starfield: {
      enable: true,
      particle_count: 120,
      speed: 0.3,
      max_line_dist: 100,
      meteor_interval: 8000
    },
    nav: {
      display_title: true,
      logo: '/img/favicon.ico'
    },
    sidebar: {
      enable: true,
      author: { enable: true },
      categories: { enable: true, limit: 8 },
      tags: { enable: true, limit: 20 },
      recent_posts: { enable: true, limit: 5 },
      archives: { enable: true, limit: 8 }
    },
    float_actions: { scroll_top: true, toc: true, share: true, comment: true },
    home: {
      hero_title: '星尘图书馆',
      hero_subtitle: '收集世间所有的思想与星光',
      featured_count: 3,
      latest_count: 10,
      category_cards: 6
    },
    post: {
      toc: { enable: true, number: true, depth: 4 },
      copyright: { enable: true, license: 'CC BY-NC-SA 4.0', license_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
      related_posts: { enable: true, limit: 3 },
      meta: { date: true, updated: true, categories: true, tags: true, wordcount: true, readtime: true }
    },
    dark_mode: { enable: true, auto: true, dark_start: 19, dark_end: 7 },
    footer: { since: 2025, copyright: true, runtime: true },
    comments: { enable: false },
    easter_eggs: { konami: true, meteor_count: 30 },
    pwa: { enable: false }
  };

  var config = hexo.theme.config;
  hexo.theme.config = Object.assign({}, defaults, config);
});
