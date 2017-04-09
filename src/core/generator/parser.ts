import MarkdownIt = require('markdown-it');
import markdownItHighlight = require('markdown-it-highlightjs');
import markdownItFootnote = require('markdown-it-footnote');
import mdMetaParser = require('markdown-yaml-metadata-parser');

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

export interface ParsedArticle {
    metaData: object,
    articleJson: object,
    articleHtml: string
}

export function parseArticle(articleSource: string): ParsedArticle {
    const { metadata: metaData, content } = mdMetaParser(articleSource);
    const articleHtml = md.render(content);

    return {
        metaData,
        articleHtml,
        articleJson: {}
    };
}
