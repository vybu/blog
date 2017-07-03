import { parseArticle } from './parser';
import { getArticles, saveFinalOutput, cleanup, copyStaticFiles, getGitCommitsCount } from './fileOperator';
import TemplatesBuilder from './templatesBuilder';
import { getJSAndCSSCompiler } from './jsAndCssCompiler';
import { Article, init } from '../../server/db';
import { ProcessedArticle, ParsedArticle, ArticleRaw, ArticlesReadersData, PageJson, BuiltPage } from './commonTypes';

const fakeComments = [
    {
        id: '1781d4e6-4242-43fa-8056-43cb6c1ba3be',
        _ip: '::ffff:127.0.0.1',
        name: 'me',
        comment: 'sup',
        parent: '1',
        createdAt: '2017-06-25 18:42:42.439 +00:00',
        updatedAt: '2017-06-25 18:42:42.504 +00:00',
        articleId: '1',
        comments: []
    },
    {
        id: '1eb9a90e-9e1d-4e22-b2e9-9e81a34e19c6',
        _ip: '::ffff:127.0.0.1',
        name: 'me',
        comment: 'sup',
        parent: '1',
        createdAt: '2017-06-25 18:45:13.681 +00:00',
        updatedAt: '2017-06-25 18:45:13.743 +00:00',
        articleId: '1',
        comments: []
    },
    {
        id: '2bd26701-8f42-423d-97b4-f873f446928e',
        _ip: '::ffff:127.0.0.1',
        name: '',
        comment: 'asas',
        parent: '1',
        createdAt: '2017-06-27 04:46:24.803 +00:00',
        updatedAt: '2017-06-27 04:46:24.838 +00:00',
        articleId: '1',
        comments: [
            {
                id: '47158085-2442-44b3-92e9-69e8998cda1f',
                _ip: '::ffff:127.0.0.1',
                name: ':(',
                comment: 'asas',
                parent: '2bd26701-8f42-423d-97b4-f873f446928e',
                createdAt: '2017-06-27 04:57:43.892 +00:00',
                updatedAt: '2017-06-27 04:57:43.917 +00:00',
                articleId: '1',
                comments: []
            }
        ]
    }
];

const fakeLikes = {
    likes: [],
    existingLike: null
};

async function buildBlogPageAndSave(
    { fileName, parsedArticle, articlesReadersData }: ProcessedArticle,
    templatesBuilder: TemplatesBuilder
) {
    saveFinalOutput(fileName, await templatesBuilder.buildFullBlogPage(parsedArticle, articlesReadersData));
}

export async function initGenerator() {
    const [commitsCount] = await Promise.all([getGitCommitsCount(), init(), cleanup()]);
    const compiler = getJSAndCSSCompiler();
    const templatesBuilder = new TemplatesBuilder(compiler, commitsCount);
    copyStaticFiles();

    return async function generate() {
        const [articles]: [ArticleRaw[], void] = await Promise.all([
            getArticles(),
            templatesBuilder.precompileJsAndCss()
        ]);

        const parsedArticles = await Promise.all(
            articles.map(async ({ fileName, content }): Promise<ProcessedArticle> => {
                const parsedArticle = parseArticle(content);
                const [likes, comments] = await Promise.all([
                    Article.retrieveLikes(parsedArticle.metaData.id),
                    Article.retrieveComments(parsedArticle.metaData.id)
                ]);

                return Object.assign(
                    {},
                    { fileName, content, parsedArticle, articlesReadersData: { likes, comments } }
                );
            })
        );

        for (let parsedArticle of parsedArticles) {
            buildBlogPageAndSave(parsedArticle, templatesBuilder);
        }

        const [mainPage, aboutPage] = await Promise.all([
            templatesBuilder.buildMainPage(parsedArticles),
            templatesBuilder.buildAboutPage()
        ]);
        saveFinalOutput('index', mainPage);
        saveFinalOutput('about', aboutPage);
    };
}
