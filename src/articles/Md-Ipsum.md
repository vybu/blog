---
author: Vytenis Butkevicius
title: Md Impsum Generated
date: 2017-01-20
tags:
    - javascript
    - web
    - static-generator
---

**Pellentesque habitant morbi tristique** senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. _Aenean ultricies mi vitae est_. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, `commodo vitae`, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum  rutrum orci, sagittis tempus lacus enim ac dui. [Donec non enim](#) in turpis pulvinar facilisis. Ut felis.

```typescript

export function getArticles(articlesGlob: string = ARTICLES_GLOB): Promise<ArticleRaw[]> {
    return new Promise((resolve, reject) => {
        glob(articlesGlob, { root }, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files.map(file => ({
                fileName: getFileName(file),
                content: readFileAt(`${root}${file}`)
            })));
        });
    })
}

export async function initGenerator() {

    const compiler = getJSAndCSSCompiler();
    const templatesBuilder = new TemplatesBuilder(compiler);

    await cleanup();
    copyStaticFiles();

    return async function generate() {
        const [articles]: [ArticleRaw[], void] = await Promise.all([
            getArticles(),
            templatesBuilder.precompileJsAndCss()
        ]);
        
        const parsedArticles = articles.map(({ fileName, content }): ProcessedArticle =>
            Object.assign({}, { fileName, content, parsedArticle: parseArticle(content) }));

        for (let { fileName, parsedArticle } of parsedArticles) {
            saveTemplate(fileName, await templatesBuilder.buildFullBlogPage(parsedArticle));
        }

        saveTemplate('index', await templatesBuilder.buildMainPage(parsedArticles));
        saveTemplate('about', await templatesBuilder.buildAboutPage());
    }
}

```

Header Level 2
--------------

  1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
  2. Aliquam tincidunt mauris eu risus.


Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur  massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.

```js
function spawnProcess() {
    currentChildProcess = childProcess.fork(`${app}`);

    currentChildProcess.on('message', (m) => {
        if (m === 'generated') {
            server.reload();
        }
    });

    currentChildProcess.on('exit', () => {
        console.info('Killing app');
    });
}
```

### Header Level 3

  * Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
  * Aliquam tincidunt mauris eu risus. LOL


| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

~~hmxxss~~

```css
#header h1 a {
  display: block;
  width: 300px;
  height: 80px;
}
```


