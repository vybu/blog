import { getCurrentArticleId, persist, retrieve } from './lib';
import { PersistObject } from './commonTypes';
// sorted by timestamp
const FAKE_DATA: string[] = [
    '',
    '',
    '',
    '',
];

let likesCount = 0;
let hasReaderLiked = false;


function el(tag: string, className: string = '', innerHTML: string = null): HTMLElement {
    const e = document.createElement(tag);
    e.className = className;
    if (innerHTML) {
        e.innerHTML = innerHTML;
    }
    return e;
}

function createLikeNumberText(): [HTMLElement, Function] {
    const e = el('span', 'lb-likes');

    const updateText = () => {
        if (likesCount === 0 ) {
        }
        else if (likesCount === 1) {
            e.innerText = hasReaderLiked ? 'You and 1 other person liked this post' : '1 person liked this post';
        } else {
            e.innerText = hasReaderLiked ? `You and ${likesCount} other people liked this post` : `${likesCount} people liked this post`;
        }
    }
    updateText();

    return [e, updateText];
}


function initLikeAdder(unitContainer: HTMLElement, updateLikesCountText: Function) {
    const likeBtn = el('a', 'lb-like', '+');
    unitContainer.appendChild(likeBtn);
    likeBtn.addEventListener('click', function addUnit() {
        const timestamp = Date.now();
        hasReaderLiked = true;
        unitContainer.appendChild(el('div', 'lb-unit is-personal'));
        likeBtn.removeEventListener('click', addUnit);
        unitContainer.removeChild(likeBtn);
        updateLikesCountText();
        persist(getCurrentArticleId(), { hasReaderLiked: true, timestamp });
        // sendToServer
    });
}

function getHasReaderLiked(): boolean {
    const o = retrieve(getCurrentArticleId());
    if (o) {
        return o.hasReaderLiked === true;
    }

    return false;
}

// TODO: Add global + in non mobile readers, add hover effect with explanations, think of creative way to present 0 likes;
export default function drawLikebox() {
    const target = document.querySelector('.lb');
    if (getCurrentArticleId() === null || !target) return;

    // fetch.then
    likesCount = FAKE_DATA.length;
    hasReaderLiked = getHasReaderLiked();

    const likeBoxContainer = el('div', 'lb-container');
    const unitContainer = el('div', 'lb-unit-container');
    const textContainer = el('div', 'lb-text-container')
    
    const [likesCountTextElement, updateLikesCountText] = createLikeNumberText();

    FAKE_DATA.forEach(d => unitContainer.appendChild(el('div', 'lb-unit')));

    !hasReaderLiked && initLikeAdder(unitContainer, updateLikesCountText);

    likeBoxContainer.appendChild(el('div', 'lb-floating', '+'));
    textContainer.appendChild(likesCountTextElement);
    likeBoxContainer.appendChild(textContainer);
    likeBoxContainer.appendChild(unitContainer);
    target.appendChild(likeBoxContainer);
}
