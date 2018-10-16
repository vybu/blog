export enum ContainerIds {
  App,
  Noop,
}

export const containerPrefix = 'container';
export const routerLinkIdentifier = 'data-rli';

export function getRouterLinkIdentifier(containerId: ContainerIds) {
  return `${routerLinkIdentifier}="${containerId}"`;
}
