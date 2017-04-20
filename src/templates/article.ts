import { ContainerIds, containerPrefix } from './constants';

export function article(content: string): string {
    return `<article class="blog-post">${content}</article>`;
}
