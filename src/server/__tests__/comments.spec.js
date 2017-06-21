const { Article, Comment, init, sequalize } = require('../db');

function makeComment(comment, parent, name = `${Math.random()}`, _ip = `${Math.random()}`) {
    return { comment, parent, name, _ip };
}

describe('db.comments', () => {
    let articleId;
    beforeAll(() => init());
    beforeEach(async () => {
        const article = await Article.create({ id: 1 });
        articleId = article.id;
    });
    afterEach(() => sequalize.sync({ force: true }));

    it('creates a comment on an article', async () => {
        const comment = makeComment('Hello world', articleId);
        const [isSuccessfull] = await Article.submitComment(articleId, comment);
        expect(isSuccessfull).toBeTruthy();
    });

    it('creates a comment on a comment', async () => {
        const comment = makeComment('Hello world', articleId);
        const [, commentId] = await Article.submitComment(articleId, comment);
        const commentReply = makeComment('Hello universe', commentId);
        const [isSuccessfull, commentReplyId] = await Article.submitComment(articleId, commentReply);
        const commentReplyResult = await Comment.findById(commentReplyId);

        expect(isSuccessfull).toBeTruthy();
        expect(commentReplyResult.parent).toEqual(commentId);
    });
    it('creates a comment on a comment one level deep max', async () => {
        const comment = makeComment('Hello world', articleId);
        const [, commentId] = await Article.submitComment(articleId, comment);
        const commentReply = makeComment('Hello universe', commentId);
        const [, commentReplyId] = await Article.submitComment(articleId, commentReply);
        const commentReplyReply = makeComment('Hello universe', commentReplyId);
        const [isSuccessfull, commentReplyReplyId] = await Article.submitComment(articleId, commentReplyReply);

        const commentReplyReplyResult = await Comment.findById(commentReplyReplyId);

        expect(isSuccessfull).toBeTruthy();
        expect(commentReplyReplyResult.parent).toEqual(commentId);
    });
    it('fails to create a comment if honeypot field is filled', () => {});
    it('prevents spamming comments to often: 1 every 10 min after 2 comments', () => {});
    it('retrieves a correctly nested structure of comments on an article', () => {});
});
