import h = require('hyperscript');
import { html } from '../utils';
import { ParsedArticle, ProcessedArticle, BuiltPage } from './commonTypes';
import { base, articlesList } from '../../templates'

// TODO this now violates open/closed, should refactor so it's possible to add remove pages without changing generator.
// Should implement some sort of framework and specs about pages should be in templates, file structure/config.

export default class TemplatesBuilder {
    private cache: { base?: Function };
    constructor(private jsAndCssCompiler: Function) {
        this.cache = {};
    }

    async buildFullBlogPage(parsedArticle: ParsedArticle): Promise<BuiltPage> {
        return await this.assemble(parsedArticle.articleHtml);
    }

    async buildMainPage(parsedArticles: Array<ProcessedArticle>): Promise<BuiltPage> {
          return await this.assemble(articlesList(parsedArticles))      
    };

    async buildAboutPage(parsedArticles: Array<ProcessedArticle>): Promise<BuiltPage> {
        return await this.assemble(articlesList(parsedArticles))
    }

    async assemble(content: string): Promise<BuiltPage> {
        const fullPage = await this.base({ body: content });
        return {
            fullPage,
            content
        }
    }

    async base(args: { body: string, head?: string }): Promise<string> {
        if (this.cache.base) {
            // return this.cache.base(args); TODO for this to work, we cannot delete all dist files
        }

        const { js, css } = await this.jsAndCssCompiler();
        const jsResources = js.map(src => html(h('script', { src, async: true })));
        const cssResources = css.map(href => html(h('link', { href, async: true, rel: 'stylesheet' })));

        const f = this.cache.base = ({ head = '', body = '' }: { body: string, head?: string }) => {
            return base({
                head: `${jsResources} ${cssResources} ${head}`,
                body
            });
        }

        return f(args);
    }
}
