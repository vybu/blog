import h = require('hyperscript');
import { html } from '../utils';
import { ParsedArticle, ProcessedArticle } from './commonTypes';
import { base, header, footer, articlesList } from '../../templates'


export default class TemplatesBuilder {
    private cache: { base?: Function };
    constructor(private jsAndCssCompiler: Function) {
        this.cache = {};
    }

    async buildFullBlogPage(parsedArticle: ParsedArticle) {
        return await this.base({body: parsedArticle.articleHtml});
    }

    async buildMainPage(parsedArticles: Array<ProcessedArticle>) {
        return await this.base({body: articlesList(parsedArticles)});        
    }

    async base(args: { body: string, head?: string }): Promise<string> {
        if (this.cache.base) {
            return this.cache.base(args);
        }

        const { js, css } = await this.jsAndCssCompiler();
        const jsResources = js.map(src => html(h('script', { src, async: true })));
        const cssResources = css.map(href => html(h('link', { href, async: true, rel: 'stylesheet' })));

        const f = this.cache.base = ({ head = '', body = '' }: { body: string, head?: string }) => {
            return base({
                head: `${jsResources} ${cssResources} ${head}`,
                body: `${header()} ${body} ${footer()}`
            });
        }

        return f(args);
    }
}
