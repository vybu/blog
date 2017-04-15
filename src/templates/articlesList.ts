import { ProcessedArticle } from '../lib/generator/commonTypes';
import { getRouterLinkIdentifier, ContainerIds } from './constants';

export function articlesList(articles: ProcessedArticle[]): string {
    return `
        <ul>
            ${articles.map(({ fileName, parsedArticle }) => (
            `<li>
                <a ${getRouterLinkIdentifier(ContainerIds.App)} href="/${fileName}">${parsedArticle.metaData.title}</a>
                <p>${parsedArticle.metaData.summary}<p/>
            </li>`
        )).join('')}
        </ul>
`;
}
