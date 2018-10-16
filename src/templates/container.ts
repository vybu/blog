import { ContainerIds, containerPrefix } from './constants';

export function container(content: string, containerId: ContainerIds, tag: string = 'div'): string {
  return `<${tag} id="${containerPrefix}${containerId}">${content}</${tag}>`;
}
