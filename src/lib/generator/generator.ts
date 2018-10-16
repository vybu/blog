import { parseArticle } from './parser';
import { getArticles, saveFinalOutput, cleanup, copyStaticFiles, getGitCommitsCount } from './fileOperator';
import TemplatesBuilder from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler';
import { ProcessedArticle, ArticleRaw } from './commonTypes';
import { initDb } from '../../server/initDb';

async function buildBlogPageAndSave(
  { fileName, parsedArticle, articlesReadersData }: ProcessedArticle,
  templatesBuilder: TemplatesBuilder,
) {
  saveFinalOutput(fileName, await templatesBuilder.buildFullBlogPage(parsedArticle, articlesReadersData));
}

export async function initGenerator() {
  const [commitsCount, database] = await Promise.all([getGitCommitsCount(), initDb(), cleanup()]);
  const compiler = getJSAndCSSCompiler();
  const templatesBuilder = new TemplatesBuilder(compiler, commitsCount);
  copyStaticFiles();

  return async function generate() {
    const [articles]: [ArticleRaw[], void] = await Promise.all([getArticles(), templatesBuilder.precompileJsAndCss()]);

    const parsedArticles = await Promise.all(
      articles.map(
        async ({ fileName, content }): Promise<ProcessedArticle> => {
          const parsedArticle = parseArticle(content);
          const [likes, comments] = await Promise.all([
            database.retrieveLikes(parsedArticle.metaData.id),
            database.retrieveComments(parsedArticle.metaData.id),
          ]);

          return Object.assign({}, { fileName, content, parsedArticle, articlesReadersData: { likes, comments } });
        },
      ),
    );

    for (let parsedArticle of parsedArticles) {
      buildBlogPageAndSave(parsedArticle, templatesBuilder);
    }

    const [mainPage, aboutPage] = await Promise.all([
      templatesBuilder.buildMainPage(parsedArticles),
      templatesBuilder.buildAboutPage(),
    ]);
    saveFinalOutput('index', mainPage);
    saveFinalOutput('about', aboutPage);
  };
}
