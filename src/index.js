/**
 * Combines the following two babel plugins into one:
 * - @babel/plugin-transform-unicode-regex
 * - babel-plugin-transform-regexp-constructors
 *
 * And adds a runtime replacement of regular expressions.
 *
 * See https://github.com/babel/babel/issues/10523 for further details
 */

const rewritePattern = require('regexpu-core')
const { addDefault } = require('@babel/helper-module-imports')

const regexpuOptions = {
  unicodeSetsFlag : 'transform',
  unicodeFlag     : 'transform',
}

function babelfyOptions(t, options) {
  return t.objectExpression(Object.keys(options).map(key =>
    t.objectProperty(
      t.stringLiteral(key),
      (
        typeof options[key] === 'boolean'
        ? t.booleanLiteral(options[key])
        : t.stringLiteral(options[key])
      ),
    )
  ))
}

function convert(path, t) {
  const args = path.get('arguments')
  const evaluatedArgs = args.map((a) => a.evaluate())
  if (! evaluatedArgs[1] || ! evaluatedArgs[1].value || ! evaluatedArgs[1].value.includes('u')) { return }
  let pattern = evaluatedArgs[0]
  let flags   = evaluatedArgs[1].value

  if (pattern.confident) {
    return t.regExpLiteral(
      rewritePattern(pattern.value, flags, regexpuOptions),
      flags.replace('u', ''),
    )
  }
  else {
    const rewritePatternIdentifier = addDefault(path, 'regexpu-core')
    return t.newExpression(
      path.node.callee,
      [
        t.callExpression(
          rewritePatternIdentifier,
          [
            path.node.arguments[0],
            t.stringLiteral(flags),
            babelfyOptions(t, regexpuOptions),
          ],
        ),
        t.stringLiteral(flags.replace('u', '')),
      ],
    )
  }
}

function maybeReplaceRegExp(path, t) {
  if (! t.isIdentifier(path.node.callee, { name: 'RegExp' })) { return }
  const regexp = convert(path, t)
  if (regexp) {
    path.replaceWith(regexp)
  }
}

module.exports = function ({ types: t }) {
  return {
    name: 'transform-unicode-regexp-runtime',
    visitor: {
      RegExpLiteral({ node }) {
        if (! node.flags || ! node.flags.includes('u')) { return }
        node.pattern = rewritePattern(node.pattern, node.flags, regexpuOptions)
        node.flags = node.flags.replace('u', '')
      },
      NewExpression(path) {
        maybeReplaceRegExp(path, t)
      },
      CallExpression(path) {
        maybeReplaceRegExp(path, t)
      },
    },
  }
}
