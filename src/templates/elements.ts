import { getRouterLinkIdentifier, ContainerIds } from './constants';

export function a(containerId: ContainerIds, href: string, content: string) {
    return `<a ${containerId === ContainerIds.Noop ? '' : getRouterLinkIdentifier(containerId)} href="${href}">${content}</a>`
}
