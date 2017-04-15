import { ProcessedArticle } from '../lib/generator/commonTypes';

export function articlesList(articles: ProcessedArticle[]): string {
    return `
        <ul>
            ${articles.map(({ fileName, parsedArticle }) => (
            `<li>
                <a href="/${fileName}">${parsedArticle.metaData.title}</a>
                <p>${parsedArticle.metaData.summary}<p/>
            </li>`
        )).join('')}
        </ul>
`;
}
