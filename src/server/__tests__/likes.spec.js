const { Article, init, sequalize } = require('../db');

function makeLike(_ip = `${Math.random()}`, timestamp = Date.now()) {
    return { _ip, timestamp };
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

        const isSuccessful = await Article.submitLike(articleId, like1);
        const isSuccessful2 = await Article.submitLike(articleId, like2);
        expect(isSuccessful).toBeTruthy();
        expect(isSuccessful2).toBeTruthy();

        const likes = await Article.retrieveLikes(articleId);

        expect(likes[0]).toEqual({ timestamp: 1234456 });
        expect(likes[1]).toEqual({ timestamp: 1234457 });
    });

    it('prevents likes with same ip addresses', async () => {
        const like1 = makeLike('123.567.23');
        const like2 = makeLike('123.567.23');

        const isSuccessful = await Article.submitLike(articleId, like1);
        const isSuccessful2 = await Article.submitLike(articleId, like2);
        expect(isSuccessful).toBeTruthy();
        expect(isSuccessful2).toBeFalsy();
    });

    it('prevents likes with ', async () => {
        const like1 = makeLike('123.567.23');
        const like2 = makeLike('123.567.23');

        const isSuccessful = await Article.submitLike(articleId, like1);
        const isSuccessful2 = await Article.submitLike(articleId, like2);
        expect(isSuccessful).toBeTruthy();
        expect(isSuccessful2).toBeFalsy();
    });

    it('retrieves all likes on an article', async () => {
        const like1 = makeLike('123.567.23');
        const like2 = makeLike('123.567.23');
        const like3 = makeLike();

        await Article.submitLike(articleId, like1);
        await Article.submitLike(articleId, like2);
        await Article.submitLike(articleId, like3);

        const likes = await Article.retrieveLikes(articleId);

        expect(likes.length).toEqual(2);
    });

    it("creates and article if supplied articleId doesn't match any article", async () => {
        const like = makeLike('123.567.23');
        const isSuccessful = await Article.submitLike('999', like);
        expect(isSuccessful).toBeTruthy();
    });
});
