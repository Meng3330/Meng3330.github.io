'use strict';

/* Custom tag cloud helper with color support */
hexo.extend.helper.register('stardust_tagcloud', function(options) {
  var opts = options || {};
  var minFont = opts.min_font || 14;
  var maxFont = opts.max_font || 32;
  var unit = opts.unit || 'px';
  var amount = opts.amount || 40;
  var orderby = opts.orderby || 'name';
  var color = opts.color !== false;
  var tags = hexo.locals.get('tags').toArray();

  /* Sort */
  if (orderby === 'length') {
    tags.sort(function(a, b) { return b.posts.length - a.posts.length; });
  } else if (orderby === 'random') {
    tags.sort(function() { return Math.random() - 0.5; });
  } else {
    tags.sort(function(a, b) { return a.name.localeCompare(b.name); });
  }

  tags = tags.slice(0, amount);

  /* Count range */
  var counts = tags.map(function(t) { return t.posts.length; });
  var minCount = Math.min.apply(null, counts);
  var maxCount = Math.max.apply(null, counts);
  var range = maxCount - minCount || 1;

  var colors = ['#2563eb', '#8b5cf6', '#fbbf24', '#10b981', '#ef4444', '#3b82f6'];

  var html = '';
  tags.forEach(function(tag) {
    var size = minFont + ((tag.posts.length - minCount) / range) * (maxFont - minFont);
    var c = color ? colors[Math.floor(Math.random() * colors.length)] : '';
    html += '<a href="' + hexo.extend.helper.get('url_for').call(this, tag.path) + '"';
    html += ' style="font-size: ' + size.toFixed(1) + unit + ';' + (c ? 'color: ' + c : '') + '">';
    html += tag.name;
    html += '</a>';
  }.bind(this));

  return html;
});
