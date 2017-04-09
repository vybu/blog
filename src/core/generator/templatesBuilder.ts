import { ParsedArticle } from'./parser';
import { base, header, footer, articlesList } from '../../templates'

export function buildFullBlogPage(fileName: string, parsedArticle: ParsedArticle) {
    return base(
        `${header()}
         ${parsedArticle.articleHtml}
         ${footer()}`
    )
}

function buildPageCore() {
}
