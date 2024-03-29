# babel-plugin-transform-unicode-regexp-runtime [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/babel-plugin-transform-unicode-regexp-runtime.svg
[npm-url]: https://npmjs.org/package/babel-plugin-transform-unicode-regexp-runtime

This replaces regexp literals and constructors that contain the unicode flag at compile time or at runtime if needed.

## Installation

```sh
npm  install  --save-dev  babel-plugin-transform-unicode-regexp-runtime
```

## Usage

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [ "transform-unicode-regexp-runtime" ]
}
```

### Via CLI

```sh
babel  --plugins transform-unicode-regexp-runtime  script.js
```

### Via Node API

```javascript
require('@babel/core').transform('code', {
  plugins: [ 'transform-unicode-regexp-runtime' ],
})
```
