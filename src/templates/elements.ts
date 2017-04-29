import { getRouterLinkIdentifier, ContainerIds } from './constants';

export function a(containerId: ContainerIds, href: string, content: string, target: string = '_self') {
    return `<a ${containerId === ContainerIds.Noop ? '' : getRouterLinkIdentifier(containerId)} href="${href}" target="${target}">${content}</a>`
}
