const { Article, init, sequalize } = require('../db');

function makeLike(ip = `${Math.random()}`, timestamp = Date.now()) {
    return { ip, timestamp };
}

describe('db.likes', () => {
    let articleId;
    beforeAll(() => init());
    beforeEach(async () => {
        const article = await Article.create({ id: '1' });
        articleId = article.id;
    });
    afterEach(() => sequalize.sync({ force: true }));

    it('adds a likes to an article', async () => {
        const like1 = makeLike('123.567.23', 1234456);
        const like2 = makeLike('123.567.24', 1234457);

        const isSuccessfull = await Article.submitLike(articleId, like1.timestamp, like1.ip);
        const isSuccessfull2 = await Article.submitLike(articleId, like2.timestamp, like2.ip);
        expect(isSuccessfull).toBeTruthy();
        expect(isSuccessfull2).toBeTruthy();

        const likes = await Article.retrieveLikes(articleId);

        expect(likes[0]).toEqual(like1);
        expect(likes[1]).toEqual(like2);
    });

    it('prevents likes with same ip addresses', async () => {
        const like1 = makeLike('123.567.23');
        const like2 = makeLike('123.567.23');

        const isSuccessfull = await Article.submitLike(articleId, like1.timestamp, like1.ip);
        const isSuccessfull2 = await Article.submitLike(articleId, like2.timestamp, like2.ip);
        expect(isSuccessfull).toBeTruthy();
        expect(isSuccessfull2).toBeFalsy();
    });
    it('retrieves all likes on an article', async () => {
        const like1 = makeLike('123.567.23');
        const like2 = makeLike('123.567.23');
        const like3 = makeLike();

        await Article.submitLike(articleId, like1.timestamp, like1.ip);
        await Article.submitLike(articleId, like2.timestamp, like2.ip);
        await Article.submitLike(articleId, like3.timestamp, like3.ip);

        const likes = await Article.retrieveLikes(articleId);

        expect(likes.length).toEqual(2);
    });
});
