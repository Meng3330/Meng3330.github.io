'use strict';

/* Register wordcount helper — counts Chinese + English words */
hexo.extend.helper.register('wordcount', function(content) {
  if (!content) return 0;
  var text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
  return text.length;
});
