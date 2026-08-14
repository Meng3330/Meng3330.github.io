'use strict';

/* Note tag — compatible with Butterfly's {% note %} syntax */
const postNote = (args, content) => {
  const validStyles = ['flat', 'modern', 'simple', 'disabled'];
  const validTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger'];

  let style = 'simple';
  let type = 'default';
  let icon = '';

  args.forEach(arg => {
    if (validStyles.includes(arg)) style = arg;
    else if (validTypes.includes(arg)) type = arg;
    else if (arg.startsWith('fa')) icon = `<i class="note-icon ${arg}"></i>`;
  });

  const iconHtml = icon ? icon : '';
  const rendered = hexo.render.renderSync({ text: content, engine: 'markdown' });

  return `<div class="stardust-note stardust-note--${style} stardust-note--${type}">${iconHtml}${rendered}</div>`;
};

hexo.extend.tag.register('note', postNote, { ends: true });
hexo.extend.tag.register('subnote', postNote, { ends: true });
