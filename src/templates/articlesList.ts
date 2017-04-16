import { ProcessedArticle } from '../lib/generator/commonTypes';
import { ContainerIds } from './constants';
import { a } from './elements';

export function articlesList(articles: ProcessedArticle[]): string {
    return `
        <ul>
            ${articles.map(({ fileName, parsedArticle }) => (
            `<li>
                ${a(ContainerIds.App, `/${fileName}`, parsedArticle.metaData.title)}
                <p>${parsedArticle.metaData.summary}<p/>
            </li>`
        )).join('')}
        </ul>
`;
}
