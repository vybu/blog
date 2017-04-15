import { ContainerIds, containerPrefix } from './constants';

export function container(content: string, containerId: ContainerIds): string {
    return `<div id="${containerPrefix}${containerId}">${content}</div>`;
}
