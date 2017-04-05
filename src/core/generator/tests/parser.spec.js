const blogPostExample = require('../../../../tests/fixtures/blogPostExample.js');
const { parseArticle } = require('../parser.ts');

describe('parser', () => {
    it('parses correct document', () => {
        console.log(parseArticle(blogPostExample));
    });
});
