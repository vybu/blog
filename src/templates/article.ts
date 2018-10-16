import { ContainerIds, containerPrefix } from './constants';
import { ParsedArticle, ArticlesReadersData } from '../lib/generator/commonTypes';
import { commentsContainer } from './comments/commentsContainer';

export function article(article: ParsedArticle, articlesReadersData: ArticlesReadersData): string {
  return `<article id="${article.metaData.id}" class="blog-post">
                <h1 class="blog-post-title">${article.metaData.title}</h1>
                <div class="blog-post-date">${article.metaData.date}</div>
                ${article.articleHtml}
                <div class="lb"></div>
                ${commentsContainer(articlesReadersData.comments, article.metaData.id)}
            </article>`;
}
