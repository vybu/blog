import { parseArticle } from './parser';
import { getArticles, saveToDist, cleanup, copyStaticFiles } from './fileOperator';
import TemplatesBuilder from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler'

import { ProcessedArticle, ParsedArticle, ArticleRaw } from './commonTypes';

export async function initGenerator() {

    const compiler = getJSAndCSSCompiler();
    const templatesBuilder = new TemplatesBuilder(compiler);
    
    await cleanup();
    copyStaticFiles();

    return async function generate() {

        const articles = await getArticles();
        const parsedArticles = articles.map(({ fileName, content }): ProcessedArticle =>
            Object.assign({}, { fileName, content, parsedArticle: parseArticle(content) }));

        for (let { fileName, parsedArticle } of parsedArticles) {
            await [
                saveToDist(fileName, 'html', await templatesBuilder.buildFullBlogPage(parsedArticle)),
                saveToDist(fileName, 'json', JSON.stringify(parsedArticle))
            ];
        }

        await saveToDist('index', 'html', await templatesBuilder.buildMainPage(parsedArticles)) // TODO maybe i don' need to await this, why block?
        // generate full blog pages,
        // save just contents + json,
        // generate front page
    }
}
