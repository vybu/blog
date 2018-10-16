import { parseArticle } from './parser';
import { getArticles, saveFinalOutput, getGitCommitsCount } from './fileOperator';
import TemplatesBuilder from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler';
import { Article } from '../../server/db';
import { ProcessedArticle, ArticleRaw } from './commonTypes';

/**
 * To quickly rebuild and article page, we preload and pre-fetch all assets.
 * So when call to generate comes, it has to do as little work as possible and
 * only get latest likes and comments data.
 */
export async function initHotArticleRebuilder() {
  const commitsCount = await getGitCommitsCount();
  const compiler = getJSAndCSSCompiler();

  const templatesBuilder = new TemplatesBuilder(compiler, commitsCount);
  const [articles]: [ArticleRaw[], void] = await Promise.all([getArticles(), templatesBuilder.precompileJsAndCss()]);

  const parsedArticles = articles.reduce((result, { fileName, content }): { [key: string]: ProcessedArticle } => {
    const parsedArticle = parseArticle(content);
    const article = Object.assign({}, { fileName, content, parsedArticle });
    result[parsedArticle.metaData.id] = article;
    return result;
  }, {});

  return async function generate(articleId) {
    const [likes, comments] = await Promise.all([
      Article.retrieveLikes(articleId),
      Article.retrieveComments(articleId),
    ]);

    const { fileName, parsedArticle } = parsedArticles[articleId];
    const builtArticle = await templatesBuilder.buildFullBlogPage(parsedArticle, { likes, comments });
    saveFinalOutput(fileName, builtArticle);
    return builtArticle;
  };
}
