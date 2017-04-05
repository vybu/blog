import MarkdownIt = require('markdown-it');
import markdownItHighlight = require('markdown-it-highlightjs');
import markdownItFootnote = require('markdown-it-footnote');
import mdMetaParser = require('markdown-yaml-metadata-parser');

const state = {
    name: 'John Snow' // knows nothing
}

const a = () => {
    
}

const md = new MarkdownIt({
    html: true,
    xhtmlOut: true,
    breaks: true,
    langPrefix: 'true',
    linkify: true,
    typographer: true,
});

md
.use(markdownItFootnote)
.use(markdownItHighlight)


/* 
    Database is file system.

    parser(file.md) -> JSON <metadata, blog contents>, HTML of blog, HTML of blog post page, 
*/


interface ParsedArticle {
    metaData: object,
    articleJson: object,
    articleHtml: string
}

module.exports.parseArticle = function parseArticle(articleSource: string): ParsedArticle {
    const { metadata: metaData, content } = mdMetaParser(articleSource);
    const articleHtml = md.render(articleSource);

    return {
        metaData,
        articleHtml,
        articleJson: {}
    };
}
