const pluginTester = require('babel-plugin-tester').default
const babelPluginTransformUnicodeRegexpRuntime = require('./src/index.js')

const runtime = (str, flags = 'u') => `
  import _default from "regexpu-core";
  new RegExp(
    _default(${str}, "${flags}", {
      unicodeSetsFlag: "transform",
      unicodeFlag: "transform",
    }),
    "${flags.replace('u', '')}"
  );
`

pluginTester({
  plugin     : babelPluginTransformUnicodeRegexpRuntime,
  pluginName : 'babel-plugin-transform-unicode-regexp-runtime',
  snapshot   : false,
  tests: {
    // not change
    'not change literal without flag'             : '/Käse/;',
    'not change literal with ignoreCase flag'     : '/Käse/i;',
    'not change call without flag'                : 'RegExp("Käse");',
    'not change call with ignoreCase flag'        : 'RegExp("Käse", "i");',
    'not change constructor without flag'         : 'new RegExp("Käse");',
    'not change constructor with ignoreCase flag' : 'new RegExp("Käse", "i");',

    // examples where there is no unicode to replace, but because of the unicode flag it is changed to a literal without flag
    'remove unicode flag in literal'   : { code: '/blub/u;',                 output: '/blub/;' },
    'change call to literal'           : { code: 'RegExp("blub", "u");',     output: '/blub/;' },
    'change constructor to literal'    : { code: 'new RegExp("blub", "u");', output: '/blub/;' },

    // examples where unicode is actually replaced
    'replace unicode with literal'     : { code: '/Käse/u;',                 output: '/K\\xE4se/;' },
    'replace unicode with call'        : { code: 'RegExp("Käse", "u");',     output: '/K\\xE4se/;' },
    'replace unicode with constructor' : { code: 'new RegExp("Käse", "u");', output: '/K\\xE4se/;' },

    // argument, that can't be simplified at compile-time, but requires runtime replacement
    'replace call at runtime': {
      code   : 'RegExp(JSON.parse(JSON.stringify("Käse")), "u");',
      output : runtime('JSON.parse(JSON.stringify("Käse"))'),
    },
    'replace constructor at runtime': {
      code   : 'new RegExp(JSON.parse(JSON.stringify("Käse")), "u");',
      output : runtime('JSON.parse(JSON.stringify("Käse"))'),
    },

    // preserve ignoreCase flag at runtime
    'replace call at runtime with ignoreCase flag': {
      code   : 'RegExp(JSON.parse(JSON.stringify("Käse")), "ui");',
      output : runtime('JSON.parse(JSON.stringify("Käse"))', 'ui'),
    },
    'replace constructor at runtime with ignoreCase flag': {
      code   : 'new RegExp(JSON.parse(JSON.stringify("Käse")), "ui");',
      output : runtime('JSON.parse(JSON.stringify("Käse"))', 'ui'),
    },

    // combined expressions at runtime
    'replace call expression at runtime': {
      code   : 'RegExp("a" + JSON.parse(JSON.stringify("Käse")) + "b", "u");',
      output : runtime('"a" + JSON.parse(JSON.stringify("Käse")) + "b"'),
    },
    'replace constructor expression at runtime': {
      code   : 'new RegExp("a" + JSON.parse(JSON.stringify("Käse")) + "b", "u");',
      output : runtime('"a" + JSON.parse(JSON.stringify("Käse")) + "b"'),
    },
  },
})
