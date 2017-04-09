import { ParsedArticle } from'./parser';
import { base, header, footer, articlesList } from '../../templates'
import { buildCSS } from './styleLoader'

export function buildFullBlogPage(fileName: string, parsedArticle: ParsedArticle) {

buildCSS().then(c => console.log(c))

    return base({
        body: `
         ${header()}
         ${parsedArticle.articleHtml}
         ${footer()}
         `
    });
}

function buildPageCore() {
}
