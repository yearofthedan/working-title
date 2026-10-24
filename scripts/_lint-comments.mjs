import { definePlugin, defineRule } from 'vite-plus/lint/plugins';

const prefixes = ['shortcut: ', 'help: ', '@ts-expect-error', 'oxlint-disable', '@type'];
const workaround = /^workaround: https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+/;

const allowed = (text) =>
  workaround.test(text) || prefixes.some((prefix) => text.startsWith(prefix));

const rule = defineRule({
  meta: {
    messages: {
      prefix:
        'A comment is allowed only with one of the prefixes the comments rule lists: shortcut:, workaround: with its issue link, help:, or a directive a tool reads (https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/rules/comments.md).',
    },
  },
  create(context) {
    return {
      Program(node) {
        for (const comment of context.sourceCode.getAllComments()) {
          const text = comment.value
            .replace(/^[\s*]+/, '')
            .split('\n')[0]
            .trim();
          if (!allowed(text)) {
            context.report({ node, loc: comment.loc, messageId: 'prefix' });
          }
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: 'comments' },
  rules: { 'allowed-prefix': rule },
});
