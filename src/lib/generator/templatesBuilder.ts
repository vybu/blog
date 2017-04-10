import { ParsedArticle } from './parser';
import { base, header, footer, articlesList } from '../../templates'
import { getJSAndCSSCompiler } from './jsAndCssCompiler'


class TemplatesBuilder {
    constructor(private jsAndCssCompiler: Function) {

    }

    static getResourceTag(
        tagName: 'script' | 'link',
        src: string,
        { async = false, rel = null }: { async?: boolean, rel?: string | null }): string {

        const relVal = rel ? `rel="${rel}"` : '';
        const asyncVal = async ? 'async' : '';
        const tagOpen = `<${tagName} ${tagName === 'script' ? 'src' : 'href'}="${src}" ${asyncVal} ${relVal}>`
        const tagClose = tagName === 'script' ? `</${tagName}>` : ''
        return `${tagOpen}${tagClose}`
    }
}

export async function buildFullBlogPage(fileName: string, parsedArticle: ParsedArticle) {
    const compiler = getJSAndCSSCompiler();

    const { js, css } = await compiler();

    const jsResources = js.map(j => getResourceTag('script', j, { async: true }));
    const cssResources = css.map(c => getResourceTag('link', c, { async: true, rel: 'stylesheet' }));

    return base({
        head: `
            ${jsResources}
            ${cssResources}
        `,
        body: `
         ${header()}
         ${parsedArticle.articleHtml}
         ${footer()}
         `
    });
}

function buildPageCore() {
    // build core with core, header, footer, include css and js files
}

function getResourceTag(
    tagName: 'script' | 'link',
    src: string,
    { async = false, rel = null }: { async?: boolean, rel?: string | null }): string {

    const relVal = rel ? `rel="${rel}"` : '';
    const asyncVal = async ? 'async' : '';
    const tagOpen = `<${tagName} ${tagName === 'script' ? 'src' : 'href'}="${src}" ${asyncVal} ${relVal}>`
    const tagClose = tagName === 'script' ? `</${tagName}>` : ''
    return `${tagOpen}${tagClose}`
}
