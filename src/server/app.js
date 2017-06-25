const micro = require('micro');
const { Article } = require('./db');

function getIp(req) {
    return req.connection.remoteAddress; // this will be needed to change to header under nginx
}

async function submitLike(articleId, _ip) {
    const timestamp = Date.now();
    const isSuccessful = await Article.submitLike(articleId, { _ip, timestamp });
    if (isSuccessful) return { isSuccessful, timestamp };
    return { isSuccessful, timestamp: null };
}

async function submitComment(articleId, ip, commentData) {
    commentData.timestamp = Date.now();
    commentData._ip = ip;
    const [isSuccessful, commentId] = await Article.submitComment(articleId, commentData);
    return { isSuccessful, commentId };
}
const server = micro(async req => {
    const { method, url } = req;
    const like = url.match(/like\/([^/]+)/);
    const comment = url.match(/comments\/([^/]+)/);
    const ip = getIp(req);

    if (like) {
        if (method === 'POST') {
            return await submitLike(like[1], ip);
        } else if (method === 'GET') {
            const likes = await Article.retrieveLikes(like[1]);
            const existingLike = await Article.retrieveLikeForIp(ip);
            return { likes, existingLike };
        }
    } else if (comment) {
        if (method === 'POST') {
            return await submitComment(comment[1], ip, await micro.json(req));
        } else if (method === 'GET') {
            return await Article.retrieveComments(comment[1]);
        }
    }
});

module.exports = server;
