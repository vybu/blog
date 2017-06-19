import MarkdownIt = require('markdown-it');
import markdownItHighlight = require('markdown-it-highlightjs');
import markdownItFootnote = require('markdown-it-footnote');
import mdMetaParser = require('markdown-yaml-metadata-parser');
import moment = require('moment');

import { ParsedArticle, MetaData } from './commonTypes';

const md = new MarkdownIt({
    html: true,
    xhtmlOut: true,
    breaks: true,
    langPrefix: 'lang-',
    linkify: true,
    typographer: true,
});

md.use(markdownItFootnote).use(markdownItHighlight);

function addSummary(metaData: MetaData, content: string): void {
    if (!metaData.summary) {
        // take first paragraph
        metaData.summary = 'TODO should take first paragraph from content';
    }
}

function formatDate(metaData: MetaData): void {
    metaData.date = moment(metaData.date).format('MMM DD, YYYY');
}

export function parseArticle(articleSource: string): ParsedArticle {
    const { metadata: metaData, content } = mdMetaParser(articleSource);
    const articleHtml = md.render(content);

    addSummary(metaData, content);
    formatDate(metaData);

    return {
        metaData,
        articleHtml,
    };
}
