import { parseArticle, ParsedArticle } from './parser';
import { getArticles, saveToDist, cleanup } from './fileOperator';
import { buildFullBlogPage } from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler'


initGenerator();

export function initGenerator() {

    const compiler = getJSAndCSSCompiler();


    return async function generate() {
        await cleanup();

        const articles = await getArticles();
        const parsedArticles = articles.map(({ fileName, content }): [string, ParsedArticle] => [fileName, parseArticle(content)]);
        for (let [fileName, content] of parsedArticles) {
            await saveToDist(fileName, 'html', await buildFullBlogPage(fileName, content));
        }
        // generate full blog pages,
        // save just contents + json,
        // generate front page
        console.log(parsedArticles);
    }
}

