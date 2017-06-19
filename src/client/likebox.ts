import { getCurrentArticleId, persist, retrieve } from './lib';
import { PersistObject } from './commonTypes';

type UnitsData = number[];

// sorted by timestamp
const FAKE_DATA: UnitsData = [];

let likesCount = 0;
let readerLikedTimestamp: number | boolean = false;

function el(tag: string, className: string = '', innerHTML: string = null, props: Object = null): HTMLElement {
    const e = document.createElement(tag);
    e.className = className;
    if (innerHTML) {
        e.innerHTML = innerHTML;
    }

    if (props) {
        Object.keys(props).forEach(p => (e[p] = props[p]));
    }
    return e;
}

function createLikeNumberText(): [HTMLElement, Function] {
    const e = el('span', 'lb-likes');

    const updateText = () => {
        if (likesCount === 0) {
            e.innerText = readerLikedTimestamp ? 'You liked this post' : 'Be first to like this post!';
        } else if (likesCount === 1) {
            e.innerText = readerLikedTimestamp ? 'You and 1 other person liked this post' : '1 person liked this post';
        } else {
            e.innerText = readerLikedTimestamp
                ? `You and ${likesCount} other people liked this post`
                : `${likesCount} people liked this post`;
        }
    };
    updateText();

    return [e, updateText];
}

function initLikeAdder(unitContainer: HTMLElement, updateLikesCountText: Function) {
    const likeBtn = el('a', 'lb-like', '+');
    likeBtn.title = 'Click to like this post';
    unitContainer.appendChild(likeBtn);
    likeBtn.addEventListener('click', function addUnit() {
        const timestamp = Date.now();
        readerLikedTimestamp = true;
        unitContainer.appendChild(el('div', 'lb-unit is-personal'));

        likeBtn.removeEventListener('click', addUnit);
        unitContainer.removeChild(likeBtn);
        updateLikesCountText();
        persist(getCurrentArticleId(), { hasReaderLiked: true, timestamp });
        // sendToServer
    });
}

function addUnits(unitContainer: HTMLElement, unitsData: UnitsData, readerLikedTimestamp) {
    unitsData.forEach(u =>
        unitContainer.appendChild(
            el('div', `lb-unit ${readerLikedTimestamp === u ? 'is-personal' : ''}`, null, {
                title: `${readerLikedTimestamp === u ? 'You' : 'Someone'} liked this at ${new Date(
                    u,
                ).toLocaleString()}`,
            }),
        ),
    );
}

function getHasReaderLiked(): boolean | number {
    const o = retrieve(getCurrentArticleId());
    if (o) {
        return o.hasReaderLiked === true ? o.timestamp : false;
    }

    return false;
}

export default function drawLikebox() {
    const target = document.querySelector('.lb');
    if (getCurrentArticleId() === null || !target) return;

    // fetch.then
    likesCount = FAKE_DATA.length;
    readerLikedTimestamp = getHasReaderLiked();

    const likeBoxContainer = el('div', 'lb-container');
    const unitContainer = el('div', 'lb-unit-container');
    const textContainer = el('div', 'lb-text-container');

    const [likesCountTextElement, updateLikesCountText] = createLikeNumberText();

    addUnits(unitContainer, FAKE_DATA, readerLikedTimestamp);

    !readerLikedTimestamp && initLikeAdder(unitContainer, updateLikesCountText);

    textContainer.appendChild(likesCountTextElement);
    likeBoxContainer.appendChild(textContainer);
    likeBoxContainer.appendChild(unitContainer);
    target.appendChild(likeBoxContainer);
}

// TODO:
// Refactor this so it can function without DOM and can be used for server-side rendering. And so code doesn't look like shit.
// Server side render with refactored version
