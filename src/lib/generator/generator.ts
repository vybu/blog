import { parseArticle } from './parser';
import { getArticles, saveToDist, cleanup, copyStaticFiles } from './fileOperator';
import TemplatesBuilder from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler'

import { ProcessedArticle, ParsedArticle, ArticleRaw, PageJson, BuiltPage } from './commonTypes';

function saveTemplate(fileName, { fullPage, content }: BuiltPage) {
    const pageJson: PageJson = {
        renderedHtml: content
    };

    saveToDist(fileName, 'html', fullPage);
    saveToDist(fileName, 'json', JSON.stringify(pageJson));
}

export async function initGenerator() {

    const compiler = getJSAndCSSCompiler();
    const templatesBuilder = new TemplatesBuilder(compiler);

    await cleanup();
    copyStaticFiles();

    return async function generate() {
        const [articles]: [ArticleRaw[], void] = await Promise.all([getArticles(), templatesBuilder.precompileJsAndCss()]);
        
        const parsedArticles = articles.map(({ fileName, content }): ProcessedArticle =>
            Object.assign({}, { fileName, content, parsedArticle: parseArticle(content) }));

        for (let { fileName, parsedArticle } of parsedArticles) {
            saveTemplate(fileName, await templatesBuilder.buildFullBlogPage(parsedArticle));
        }

        saveTemplate('index', await templatesBuilder.buildMainPage(parsedArticles));
        saveTemplate('about', await templatesBuilder.buildAboutPage());
    }
}
