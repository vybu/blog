import { ProcessedArticle } from '../lib/generator/commonTypes';
import { ContainerIds } from './constants';
import { a } from './elements';

function sortArticlesDesc(articles: ProcessedArticle[]) {
  articles.sort((a1, a2) =>
    new Date(a2.parsedArticle.metaData.date).getTime() - new Date(a1.parsedArticle.metaData.date).getTime(),
  );
}

export function articlesList(articles: ProcessedArticle[]): string {
  sortArticlesDesc(articles);
  return `
        <ul class="articles">
            ${articles
              .map(
                ({ fileName, parsedArticle }) =>
                  `<li>
                <h2 class="title">${a(
                  ContainerIds.App,
                  `/${fileName}`,
                  parsedArticle.metaData.title,
                )}</h2>
                <div class="date">${parsedArticle.metaData.date}</div>
                <p class="summary">${parsedArticle.metaData.summary}<p/>
            </li>`,
              )
              .join('')}
        </ul>
`;
}
