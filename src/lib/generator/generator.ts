import { parseArticle, ParsedArticle } from'./parser';
import { getArticles, saveToDist } from './fileOperator';
import { buildFullBlogPage } from './templatesBuilder';        


generate();

async function generate() {
    const articles = await getArticles();
    const parsedArticles = articles.map(({fileName, content}): [string, ParsedArticle] => [fileName, parseArticle(content)]);
    parsedArticles.forEach(([fileName, content]) => saveToDist(fileName, 'html', buildFullBlogPage(fileName, content)));
    // generate full blog pages,
    // save just contents + json,
    // generate front page
    console.log(parsedArticles);
}
