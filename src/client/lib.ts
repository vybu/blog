import { PersistObject } from './commonTypes';

export function getCurrentArticleId() {
    const article = document.querySelector('article.blog-post');
    return article ? article.id : null;
}

export function persist(id: string | number, data: object) {
    const idS = `${id}`
    const o = localStorage.getItem(idS);
    if (o) {
        try {
            const d = JSON.parse(o);
            localStorage.setItem(idS, JSON.stringify(Object.assign(d, data)));
        } catch (e) { }
    } else {
        localStorage.setItem(idS, JSON.stringify(data));
    }
}

export function retrieve(id: string | number): PersistObject | null {
    const o =  localStorage.getItem(`${id}`);
    return o ? JSON.parse(o) : null;
}
