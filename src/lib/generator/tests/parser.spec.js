const blogPostExample = require('../../../../tests/fixtures/blogPostExample.js');
const { parseArticle } = require('../parser.ts');
const { getArticles } = require('../fileFinder.ts');

describe('parser#parseArticle', () => {
    it('parses correct document', () => {
        expect(parseArticle(blogPostExample)).toMatchSnapshot();
    });
});

describe('fileFinder#getArticles', () => {
    it('returns an array of matched files at given glob pattern', async() => {
        const articles = await getArticles('tests/**/*.md');
        expect(articles).toMatchSnapshot();
    });
});
