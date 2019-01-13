---
author: Vytenis Butkevicius
title: Getting rid of lodash duplication in your bundle
date: 2019-01-13
id: 3
---

TDLR; your bundle is probably infested by lodashes, use [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) to diagnose, and [externalize-lodash](https://github.com/vybu/externalize-lodash) to get rid of duplicates.

___________________

At work we have had this issue for a while, where lodash would get bundled, although we
have it specified as external in webpack.

(Externals is a way to tell webpack which packages it should exclude from bundle, as they will be available as globals on a window object. It can make sense to do this if you expect user to have the package already loaded and cached. Or you want to reduce library duplication like in case of lodash.)

```js
{
  ...,
  externals: {
    react: 'React',
    react-dom: 'ReactDOM',
    ...
    lodash: '_', // tells webpack not to bundle any imports/requires from 'lodash'
  }
}

```

You would expect that this config is enough to exclude lodash from your bundle, but it's not as it covers only 1/5 of the lodash importing cases.

As a result we have a situation where we load webpack from cdn, but it's also **include it inside our bundle and not once, but multiple times!** This adds wasted time for fetching and parsing the bundle - we have achieved the opposite of our goal.

## Why this happens

Lodash has many different ways in which you can import it. In your code you might use one way, but a library you depend on will import it another way, other library will import it in yet another way.

```js
// possible ways to import get
import { get } from 'lodash'
import { get } from 'lodash-es'
import get from 'lodash/get'
import get from 'lodash-es/get'
import get from 'lodash.get'
```

The externals configuration that we have, matches only the first case, while other cases from webpack`s point of view are different libraries.

So for example a file like this:
```js
import { get } from 'lodash';
import slashGet from 'lodash/get';
import esSlashGet from 'lodash-es/get';
import { get as esGet } from 'lodash-es';
import omit from 'lodash.omit';
import slashOmit from 'lodash/omit';
import esSlashOmit from 'lodash-es/omit';
import isEmpty from 'lodash.isempty';

const a = { b: 1 };

get(a, 'b');
slashGet(a, 'b');
esGet(a, 'b');
esSlashGet(a, 'b');
omit(a, [ 'b' ]);
slashOmit(a, [ 'b' ]);
esSlashOmit(a, [ 'b' ]);
isEmpty(a);
```

bundled with webpack where `lodash` is specified as external would produce a bundle like this:

![Lodash duplication](/images/lodash-bloat.jpg)

That's 12kB gziped + we would load the full sized lodash from CDN as external, which is also [another 24.2 kB](https://bundlephobia.com/result?p=lodash@4.17.11).

## How to solve this

Webpack supports passing a [function](https://webpack.js.org/configuration/externals/#function) to externals configuration. Using this, we can define a function that covers all of the possible import scenarios.

```js

const mapLowerCaseToCamelCase = {
  ...
  assignin: 'assignIn',
  assigninwith: 'assignInWith',
  ...
}

function externalizeLodash(context, request, callback) {
  if (request.startsWith('lodash')) {
    // covers import/require 'lodash' and import 'lodash-es'
    if (request === 'lodash' || request === 'lodash-es') {
      return callback(null, '_');
      // covers import/require from 'lodash.get' and other methods
    } else if (request[6] === '.') {
      const method = request.split('.')[1];
      // we must map methods to camelCase because that's how they are exposed on lodash object, when loaded externally
      return callback(null, '_.' + mapLowerCaseToCamelCase[method] || method);
      // covers import/require 'lodash/get' and import 'lodash-es/get'
    } else if (request[6] === '/' || request[9] === '/') {
      return callback(null, '_.' + request.split('/')[1]);
    }
  }
  callback();
};


```

and use it like this

```js
{
  ...,
  externals: [{
    react: 'React',
    react-dom: 'ReactDOM',
    ...
    },
    externalizeLodash,
  ]
}

```
That's it, we have removed the pesky lodash duplicates from our bundle. If you also want to make your bundle leaner and thus your user happier, I move the `externalizeLodash` function into a package (https://github.com/vybu/externalize-lodash) or you can simply copy paste the solution. However be ware of the risks outline below.

### UMD and other build targets

If you are building your bundle as UMD module, you will need an additional helper to make this work. Webpack will try to use externalized functions like `_.omit` directly from window as `window["_.omit"]`, so having lodash as `_` global is not enough, you need to expose all of lodash function directly on window.

```js
// exposing each lodash property on window 
Object.keys(_).forEach(key => {
  var keyName = '_.' + key;
  var keyNameLower = keyName.toLowerCase();
  window[key] = window[key] || _[key];
  window[keyNameLower] = window[keyNameLower] || _[key];
})
```

Below is an example of what webpack generates when build target is *umd*.
Pay attention to how it either tries to require `"_.isEmpty"` in commonjs context, or tries to access the
`"_.isEmpty"` directly from root (which will be a window object inside a browser). Neither of which is valid and will fail.

```js
// UMD target output
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_.isEmpty"));
	else if(typeof define === 'function' && define.amd)
		define(["_", "_.isEmpty", "_.omit", "_.get"], factory);
	else if(typeof exports === 'object')
		exports["hello"] = factory(require("_.isEmpty"));
	else
		root["hello"] = factory(root["_.isEmpty"]);
})
```

And this is a relevant module initialization part when target is default (iife). 
As we can see it accesses `isEmpty` from a global object, which will work fine if we have lodash
loaded globally.

```js
// default (iife) target output
[
  function(e, t) {
    e.exports = _.isEmpty;
  },
  ...
]
```

I haven't checked all of the build targets that webpack supports, but they might have same issue as umd.

### Other risks

There is also a risk that some of you dependencies use different versions of lodash and throughout the versions lodash has added, removed, and renamed it's utilities.

**To be safe you should test you application after externalizing dependency this way to asses that it still functions the same way**.

## Is it worth it

As it turns out there is a risk to break your app using this method, as my solution doesn't handle different lodash versions and also has troubles with umd build. For us this worked, our test suite caught issue with umd, but after fixing that everything works fine. In the end we shaved off a sizable chunk of bundle size without breaking anything.
