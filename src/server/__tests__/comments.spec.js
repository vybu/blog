const { Article, Comment, init, sequalize } = require('../db.ts');

function makeComment(comment, parent, name = `${Math.random()}`, _ip = `${Math.random()}`) {
    return { comment, parent, name, _ip };
}

describe('db.comments', () => {
    let articleId;
    beforeAll(() => init());
    beforeEach(async () => {
        const article = await Article.create({ id: '1' });
        articleId = article.id;
    });
    afterEach(() => sequalize.sync({ force: true }));

    it('creates a comment on an article', async () => {
        const comment = makeComment('Hello world', articleId);
        const [isSuccessful] = await Article.submitComment(articleId, comment);
        expect(isSuccessful).toBeTruthy();
    });

    it('creates a comment on a comment', async () => {
        const comment = makeComment('Hello world', articleId);
        const [, commentId] = await Article.submitComment(articleId, comment);
        const commentReply = makeComment('Hello universe', commentId);
        const [isSuccessful, commentReplyId] = await Article.submitComment(articleId, commentReply);
        const commentReplyResult = await Comment.findById(commentReplyId);

        expect(isSuccessful).toBeTruthy();
        expect(commentReplyResult.parent).toEqual(commentId);
    });
    it('creates a comment on a comment one level deep max', async () => {
        const comment = makeComment('Hello world', articleId);
        const [, commentId] = await Article.submitComment(articleId, comment);
        const commentReply = makeComment('Hello universe', commentId);
        const [, commentReplyId] = await Article.submitComment(articleId, commentReply);
        const commentReplyReply = makeComment('Hello universe', commentReplyId);
        const [isSuccessful, commentReplyReplyId] = await Article.submitComment(articleId, commentReplyReply);

        const commentReplyReplyResult = await Comment.findById(commentReplyReplyId);

        expect(isSuccessful).toBeTruthy();
        expect(commentReplyReplyResult.parent).toEqual(commentId);
    });
    it.skip('fails to create a comment if honeypot field is filled', () => {});
    it('fails to create a comment if required fields are not specified', async () => {
        const [isSuccessful] = await Article.submitComment(articleId, { comment: 'Hello world', parent: articleId });
        expect(isSuccessful).toBeFalsy();
    });

    it('fails to create a comment if parent comment does not exist', async () => {
        const [isSuccessful] = await Article.submitComment(articleId, makeComment('Hello world', 'non-existent-id'));
        expect(isSuccessful).toBeFalsy();
    });

    it('fails to create a comment if comment length is more than 20000', async () => {
        const [isSuccessful] = await Article.submitComment(articleId, makeComment(Array(20005).join('.'), articleId));
        expect(isSuccessful).toBeFalsy();
    });

    it('fails to create a comment if comment length is more than 50', async () => {
        const [isSuccessful] = await Article.submitComment(
            articleId,
            makeComment('Hello world', articleId, Array(55).join('.'))
        );
        expect(isSuccessful).toBeFalsy();
    });

    ['http://docs.sequelizejs.com', 'https://docs.sequelizejs.com', 'docs.sequelizejs.lt'].forEach(link => {
        it(`fails to create a comment if comment includes a basic link (${link})`, async () => {
            const [isSuccessful1] = await Article.submitComment(articleId, makeComment(`Hello ${link}`, articleId));
            const [isSuccessful2] = await Article.submitComment(
                articleId,
                makeComment('Hello world', articleId, `Hi ${link}`)
            );
            expect(isSuccessful1).toBeFalsy();
            expect(isSuccessful2).toBeFalsy();
        });
    });

    ['(http://docs.sequelizejs.com)', '_https://docs.sequelizejs.com', '<docs.sequelizejs.lt'].forEach(link => {
        it(`succeeds to create a comment if comment includes an escaped link (${link})`, async () => {
            const [isSuccessful1] = await Article.submitComment(articleId, makeComment(`Hello ${link}`, articleId));
            const [isSuccessful2] = await Article.submitComment(
                articleId,
                makeComment('Hello world', articleId, `Hi ${link}`)
            );
            expect(isSuccessful1).toBeTruthy();
            expect(isSuccessful2).toBeTruthy();
        });
    });

    it('prevents spamming comments to often: 1 every 10 min after 2 comments', async () => {
        const comment1 = makeComment('Hello world', articleId, 'Name', '1234.4567');
        const comment2 = makeComment('Hello world', articleId, 'Name', '1234.4567');
        const comment3 = makeComment('Hello world', articleId, 'Name', '1234.4567');
        const [isSuccessful1] = await Article.submitComment(articleId, comment1);
        const [isSuccessful2] = await Article.submitComment(articleId, comment2);
        const [isSuccessful3] = await Article.submitComment(articleId, comment3);
        const [isSuccessful4] = await Article.submitComment(articleId, comment3);

        expect(isSuccessful1).toBeTruthy();
        expect(isSuccessful2).toBeTruthy();
        expect(isSuccessful3).toBeFalsy();
        expect(isSuccessful4).toBeFalsy();
    });
    it('retrieves a correctly nested structure of comments on an article', async () => {
        const comment1 = makeComment('Hello world', articleId);
        const comment2 = makeComment('Hello mars', articleId);
        const [, comment1Id] = await Article.submitComment(articleId, comment1);
        const [, comment2Id] = await Article.submitComment(articleId, comment2);
        const commentReply = makeComment('Hello universe', comment2Id);
        const [, comment3Id] = await Article.submitComment(articleId, commentReply);

        const result = await Article.retrieveComments(articleId);
        expect(result[0]).toHaveProperty('id', comment1Id);
        expect(result[0]).toHaveProperty('comments', []);
        expect(result[1]).toHaveProperty('id', comment2Id);
        expect(result[1].comments[0].id).toEqual(comment3Id);
    });

    it("creates and article if supplied articleId doesn't match any article", async () => {
        const comment = makeComment('Hello world', '999');
        const [isSuccessful] = await Article.submitComment('999', comment);

        expect(isSuccessful).toBeTruthy();
    });
});
