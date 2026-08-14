'use strict';

/* Register getRelatedPosts helper */
hexo.extend.helper.register('getRelatedPosts', function(post, options) {
  var config = hexo.theme.config;
  if (!config.post || !config.post.related_posts || !config.post.related_posts.enable) return [];

  var limit = (options && options.limit) || config.post.related_posts.limit || 3;
  var related = [];

  if (post.tags && post.tags.length) {
    hexo.locals.get('posts').each(function(p) {
      if (p._id === post._id) return;
      if (p.tags && p.tags.length) {
        var overlap = 0;
        post.tags.each(function(t) {
          if (p.tags.data.some(function(pt) { return pt._id === t._id; })) overlap++;
        });
        if (overlap > 0) related.push({ post: p, score: overlap });
      }
    });
    related.sort(function(a, b) { return b.score - a.score; });
  }

  /* Fallback: recent posts */
  if (!related.length) {
    hexo.locals.get('posts').sort('-date').each(function(p) {
      if (p._id !== post._id && related.length < limit) {
        related.push({ post: p, score: 0 });
      }
    });
  }

  return related.slice(0, limit).map(function(r) { return r.post; });
});
