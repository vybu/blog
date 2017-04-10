import { ParsedArticle } from'./parser';
import { base, header, footer, articlesList } from '../../templates'
import { buildCSS } from './styleLoader'
import { buildJS } from './javascriptLoader'

export function buildFullBlogPage(fileName: string, parsedArticle: ParsedArticle) {
    buildJS();
    return base({
        body: `
         ${header()}
         ${parsedArticle.articleHtml}
         ${footer()}
         `
    });
}

function buildPageCore() {
    // build core with core, header, footer, include css and js files
    buildCSS().then(c => console.log(c))

}
