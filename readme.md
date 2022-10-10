### Local run
Make sure the node version is 14.14.0

```
npm i
npm start
```

http://127.0.0.1:3200/#/test

----------


https://github.com/open-wc/open-wc/issues/2443

vim node_modules/@open-wc/webpack-import-meta-loader/webpack-import-meta-loader.js
```
  if(!this.rootContext) {
    this.rootContext = this.options.context
  }
  var ctx = this.rootContext ? this.rootContext : this.options.context
  const relativePath = this.context.substring(
    this.context.indexOf(ctx) + ctx.length + 1,
    this.resource.lastIndexOf(path.sep) + 1,
  );

```


### ipfs
QmVHA8VHKMvhpWctG69YhJsiiugz2aEKqijqXb8Xcf6xk7