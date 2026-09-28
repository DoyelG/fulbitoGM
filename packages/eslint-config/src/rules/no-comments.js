'use strict'

const DIRECTIVE_PATTERN = /^\s*(eslint-disable|eslint-enable|eslint-env|eslint\b|global\b)/

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow comments; code should be self-explanatory',
    },
    schema: [],
    messages: {
      unexpected: 'Unexpected comment. Write self-explanatory code instead of explaining it in a comment.',
    },
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode ?? context.getSourceCode()
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === 'Shebang' || comment.type === 'Hashbang') continue
          if (DIRECTIVE_PATTERN.test(comment.value)) continue
          context.report({ node: comment, messageId: 'unexpected' })
        }
      },
    }
  },
}
