import h = require('hyperscript');
import { html } from '../utils';
import { ParsedArticle, ProcessedArticle, BuiltPage } from './commonTypes';
import { base, articlesList, about, article } from '../../templates'

// TODO this now violates open/closed, should refactor so it's possible to add remove pages without changing generator.
// Should implement some sort of framework and specs about pages should be in templates, file structure/config.

export default class TemplatesBuilder {
    private jsResources: string;
    private cssResources: string;

    constructor(private jsAndCssCompiler: Function, private commitsCount: number) { }

    async precompileJsAndCss(): Promise<void> {
        const { js, css } = await this.jsAndCssCompiler();
        this.jsResources = js.map(src => html(h('script', { attrs: { src, async: true } })));
        this.cssResources = css.map(href => html(h('link', { attrs: { href, type: 'text/css', rel: 'stylesheet' } })));
    }

    async buildFullBlogPage(parsedArticle: ParsedArticle): Promise<BuiltPage> {
        return await this.assemble(article(parsedArticle));
    }

    async buildMainPage(parsedArticles: Array<ProcessedArticle>): Promise<BuiltPage> {
        return await this.assemble(articlesList(parsedArticles))
    };

    async buildAboutPage(): Promise<BuiltPage> {
        return await this.assemble(about())
    }

    async base(args: { body: string, head?: string }): Promise<string> {
        const f = ({ head = '', body = '' }: { body: string, head?: string }) => {
            return base({
                head: `${this.jsResources} ${this.cssResources} ${head}`,
                body,
                commitsCount: this.commitsCount
            });
        }

        return f(args);
    }

    private async assemble(content: string): Promise<BuiltPage> {
        const fullPage = await this.base({ body: content });
        return {
            fullPage,
            content
        }
    }
}
