import { getCurrentArticleId, persist, retrieve, urlBase } from './lib';
import { PersistObject } from './commonTypes';
import { getLikesText } from '../templates/likebox';

// likebox is rendered SSR
// this script either removes the like button if user has already liked post (localstorage) and marks users like as red
// or it adds listener to like button and submits like with ajax and adds red like to box

interface ServerPostResponse extends Response {
  isSuccessful: boolean;
  timestamp: string;
}

function el(htmlString): ChildNode {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

async function sendToServer(
  articleId: string,
): Promise<{ isSuccessful: boolean; timestamp?: string }> {
  try {
    const r = await (<Promise<ServerPostResponse>>fetch(`${urlBase}/likes/${articleId}`, {
      method: 'POST',
      body: '',
      mode: 'cors',
      headers: new Headers({
        'content-type': 'application/json',
      }),
    }));
    if (r.status === 200) {
      return r.json();
    }
    return { isSuccessful: false };
  } catch (e) {
    return { isSuccessful: false };
  }
}

function getExistingLikes() {
  return document.querySelectorAll('.lb-container .lb-unit');
}

function getUnitContainer() {
  return document.querySelector('.lb-container .lb-unit-container');
}

function getLikeBtn() {
  return document.querySelector('a.lb-like');
}

function updateLikesCountText() {
  const existingLikes = getExistingLikes().length - 1; // subtract own like
  document.querySelector('.lb-likes').innerHTML = getLikesText(existingLikes, true);
}

function initLikeAdder() {
  const articleId = getCurrentArticleId();
  const unitContainer = getUnitContainer();
  const likeBtn = getLikeBtn();
  likeBtn.addEventListener('click', function addUnit(ev) {
    ev.preventDefault();
    unitContainer.appendChild(el('<div class="lb-unit is-personal"></div>'));

    likeBtn.removeEventListener('click', addUnit);
    unitContainer.removeChild(likeBtn);
    updateLikesCountText();

    sendToServer(articleId).then((response) => {
      console.log('save like', response);
      if (response.isSuccessful) {
        persist(getCurrentArticleId(), { hasReaderLiked: true, timestamp: response.timestamp });
      }
    });
  });
}

function markReadersLike(readersTimestamp) {
  let hasMarked;
  const existingLikes = getExistingLikes();
  existingLikes.forEach((likeUnit) => {
    if (likeUnit.getAttribute('data-t') == readersTimestamp) {
      likeUnit.classList.add('is-personal');
      hasMarked = true;
    }
  });

  if (!hasMarked) {
    // this means that like is not yet in HTML (rebuild lag)
    const unitContainer = getUnitContainer();
    unitContainer.appendChild(el('<div class="lb-unit is-personal"></div>'));
  }

  getUnitContainer().removeChild(getLikeBtn());
  updateLikesCountText();
}

function getHasReaderLiked(): false | number {
  const o: PersistObject = retrieve(getCurrentArticleId());
  return o && o.hasReaderLiked === true ? o.timestamp : false;
}

export default function drawLikebox() {
  const target = document.querySelector('.lb-container');
  if (getCurrentArticleId() === null || !target) return;

  const readerLikedTimestamp: number | false = getHasReaderLiked();
  if (readerLikedTimestamp) {
    markReadersLike(readerLikedTimestamp);
  } else {
    initLikeAdder();
  }
}
