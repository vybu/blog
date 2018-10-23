// # router
// add events listeners on all tags that have routing param
// on mousedown start fetching the [href].json
// on mouseup change url to [href]
// on mouseup if fetching is done render it into [container], else wait until done and then render into [container]
// for rendered content in [container] repeat

import { routerLinkIdentifier, ContainerIds, containerPrefix } from '../templates/constants';
import { ParsedArticle, PageJson } from '../lib/generator/commonTypes';

// TODO: thoughrouly test
// TODO: could do caching for recurring visits to same route.

const ROUTER_LINKS_SELECTOR = `a[${routerLinkIdentifier}]`;

type innerHTML = string;

interface RoutingInfo {
  containerId: ContainerIds;
  href: string;
}

interface HistoryState {
  containerId: ContainerIds;
  innerHTML;
}

interface ContentPromises {
  [key: string]: { then: Function };
}

const JSONFetchMap = {
  '/': '/index',
};

const contentPromises: ContentPromises = {};
let navigationListeners: Function[] = [];

function getJSON(href: string): Promise<any> {
  return fetch(`${href}.json`).then((r) => {
    if (r.status === 200) {
      return r.json();
    } else {
      throw new Error(r.statusText);
    }
  });
}

function getRoutingInfo(element: Element): RoutingInfo {
  return {
    containerId: parseInt(element.getAttribute(routerLinkIdentifier)),
    href: element.getAttribute('href'),
  };
}

function getContainerElement(containerId: ContainerIds): Element {
  return document.getElementById(`${containerPrefix}${containerId}`);
}

function changeUrlTo(
  { href, containerId }: RoutingInfo,
  innerHTML: innerHTML,
  replace: boolean = false,
): void {
  const historyState: HistoryState = {
    containerId,
    innerHTML,
  };

  if (replace) {
    window.history.replaceState(historyState, href, href);
  } else {
    window.history.pushState(historyState, href, href);
  }
}

function handleHistoryChange({ containerId, innerHTML }: HistoryState): void {
  const container = getContainerElement(containerId);

  if (container) {
    container.innerHTML = innerHTML;
    initRouterForAllSelector(containerId);

    navigationListeners.forEach((l) => l());
  } else {
    window.location.reload();
  }
}

function startFetchingJson({ href }: RoutingInfo): EventListenerOrEventListenerObject {
  return () => {
    contentPromises[href] = {
      then(handler) {
        const h = JSONFetchMap[href] ? JSONFetchMap[href] : href;
        getJSON(h).then(handler).catch((err) => console.error(err));
      },
    };
  };
}

function jsonLoadHandler(r: PageJson) {
  return r.renderedHtml;
}

function displayedFetchedContent(
  { href, containerId }: RoutingInfo,
  jsonLoadHandler,
): EventListenerOrEventListenerObject {
  return () =>
    contentPromises[href] &&
    contentPromises[href].then((r) => {
      const innerHTML = jsonLoadHandler(r);
      changeUrlTo({ href, containerId }, innerHTML);
      handleHistoryChange({ containerId, innerHTML });
    });
}

function initRouter(routerLinksSelector: string, jsonLoadHandler: Function): void {
  Array.from(document.querySelectorAll(routerLinksSelector)).forEach((element) => {
    const routingInfo = getRoutingInfo(element);

    element.addEventListener('mousedown', startFetchingJson(routingInfo));
    element.addEventListener('mouseup', displayedFetchedContent(routingInfo, jsonLoadHandler));
    element.addEventListener('click', (ev) => ev.preventDefault());
  });
}

function setPushStateForInitialLoad() {
  const container = getContainerElement(ContainerIds.App);

  if (container) {
    changeUrlTo(
      { href: window.location.pathname, containerId: ContainerIds.App },
      container.innerHTML,
      true,
    );
  } else {
    changeUrlTo({ href: window.location.pathname, containerId: ContainerIds.Noop }, '', true);
  }
}

function initRouterForAllSelector(specificContainerId: ContainerIds | null): void {
  let containerSelector = '';
  if (specificContainerId !== null) {
    containerSelector = `#${containerPrefix}${specificContainerId} `;
  }
  initRouter(`${containerSelector}${ROUTER_LINKS_SELECTOR}`, jsonLoadHandler);
}

export default function init(...listeners: Function[]) {
  window.addEventListener('popstate', (e: { state: HistoryState }) => handleHistoryChange(e.state));
  initRouterForAllSelector(null);
  setPushStateForInitialLoad();
  navigationListeners = navigationListeners.concat(listeners);
}
