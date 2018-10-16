const { Article, Comment, init, sequalize, Database } = require('../db.ts');
const { DataWrapper } = require('../dataWrapper');

function makeComment(comment, parent, name = `${Math.random()}`, _ip = `${Math.random()}`) {
  return { comment, parent, name, _ip };
}

describe('db.comments', () => {
  let db;
  let articleId;
  beforeAll(() => init());
  beforeEach(async () => {
    db = new Database(new DataWrapper());
    const article = await Article.create({ id: '1' });
    articleId = article.id;
  });
  afterEach(() => sequalize.sync({ force: true }));

  it('creates a comment on an article', () => {
    const comment = makeComment('Hello world', articleId);
    const [ isSuccessful ] = db.submitComment(articleId, comment);
    expect(isSuccessful).toBeTruthy();
  });

  it('creates a comment on a comment', () => {
    const comment = makeComment('Hello world', articleId);
    const [ , commentId ] = db.submitComment(articleId, comment);
    const commentReply = makeComment('Hello universe', commentId);
    const [ isSuccessful, commentReplyId ] = db.submitComment(articleId, commentReply);
    const commentReplyResult = db.dataWrapper.findComment({ id: commentReplyId });

    expect(isSuccessful).toBeTruthy();
    expect(commentReplyResult.parent).toEqual(commentId);
  });
  it('creates a comment on a comment one level deep max', () => {
    const comment = makeComment('Hello world', articleId);
    const [ , commentId ] = db.submitComment(articleId, comment);
    const commentReply = makeComment('Hello universe', commentId);
    const [ , commentReplyId ] = db.submitComment(articleId, commentReply);
    const commentReplyReply = makeComment('Hello universe', commentReplyId);
    const [ isSuccessful, commentReplyReplyId ] = db.submitComment(articleId, commentReplyReply);

    const commentReplyReplyResult = db.dataWrapper.findComment({ id: commentReplyReplyId });

    expect(isSuccessful).toBeTruthy();
    expect(commentReplyReplyResult.parent).toEqual(commentId);
  });
  it.skip('fails to create a comment if honeypot field is filled', () => {});
  it('fails to create a comment if required fields are not specified', () => {
    const [ isSuccessful ] = db.submitComment(articleId, {
      comment: 'Hello world',
      parent: articleId,
    });
    expect(isSuccessful).toBeFalsy();
  });

  it('fails to create a comment if parent comment does not exist', () => {
    const [ isSuccessful ] = db.submitComment(
      articleId,
      makeComment('Hello world', 'non-existent-id'),
    );
    expect(isSuccessful).toBeFalsy();
  });

  it('fails to create a comment if comment length is more than 20000', () => {
    const [ isSuccessful ] = db.submitComment(
      articleId,
      makeComment(Array(20005).join('.'), articleId),
    );
    expect(isSuccessful).toBeFalsy();
  });

  it('fails to create a comment if comment length is more than 50', () => {
    const [ isSuccessful ] = db.submitComment(
      articleId,
      makeComment('Hello world', articleId, Array(55).join('.')),
    );
    expect(isSuccessful).toBeFalsy();
  });

  [
    'http://docs.sequelizejs.com',
    'https://docs.sequelizejs.com',
    'docs.sequelizejs.lt',
  ].forEach((link) => {
    it(`fails to create a comment if comment includes a basic link (${link})`, () => {
      const [ isSuccessful1 ] = db.submitComment(
        articleId,
        makeComment(`Hello ${link}`, articleId),
      );
      const [ isSuccessful2 ] = db.submitComment(
        articleId,
        makeComment('Hello world', articleId, `Hi ${link}`),
      );
      expect(isSuccessful1).toBeFalsy();
      expect(isSuccessful2).toBeFalsy();
    });
  });

  [
    '(http://docs.sequelizejs.com)',
    '_https://docs.sequelizejs.com',
    '<docs.sequelizejs.lt',
  ].forEach((link) => {
    it(`succeeds to create a comment if comment includes an escaped link (${link})`, () => {
      const [ isSuccessful1 ] = db.submitComment(
        articleId,
        makeComment(`Hello ${link}`, articleId),
      );
      const [ isSuccessful2 ] = db.submitComment(
        articleId,
        makeComment('Hello world', articleId, `Hi ${link}`),
      );
      expect(isSuccessful1).toBeTruthy();
      expect(isSuccessful2).toBeTruthy();
    });
  });

  it('prevents spamming comments to often: 1 every 10 min after 2 comments', () => {
    const comment1 = makeComment('Hello world', articleId, 'Name', '1234.4567');
    const comment2 = makeComment('Hello world', articleId, 'Name', '1234.4567');
    const comment3 = makeComment('Hello world', articleId, 'Name', '1234.4567');
    const [ isSuccessful1 ] = db.submitComment(articleId, comment1);
    const [ isSuccessful2 ] = db.submitComment(articleId, comment2);
    const [ isSuccessful3 ] = db.submitComment(articleId, comment3);
    const [ isSuccessful4 ] = db.submitComment(articleId, comment3);

    expect(isSuccessful1).toBeTruthy();
    expect(isSuccessful2).toBeTruthy();
    expect(isSuccessful3).toBeFalsy();
    expect(isSuccessful4).toBeFalsy();
  });

  it('retrieves a correctly nested structure of comments on an article', () => {
    const comment1 = makeComment('Hello world', articleId);
    const comment2 = makeComment('Hello mars', articleId);
    const [ , comment1Id ] = db.submitComment(articleId, comment1);
    const [ , comment2Id ] = db.submitComment(articleId, comment2);
    const commentReply = makeComment('Hello universe', comment2Id);
    const [ , comment3Id ] = db.submitComment(articleId, commentReply);

    const result = db.retrieveComments(articleId);
    expect(result[0]).toHaveProperty('id', comment1Id);
    expect(result[0]).toHaveProperty('comments', []);
    expect(result[1]).toHaveProperty('id', comment2Id);
    expect(result[1].comments[0].id).toEqual(comment3Id);
  });

  it("creates and article if supplied articleId doesn't match any article", () => {
    const comment = makeComment('Hello world', '999');
    const [ isSuccessful ] = db.submitComment('999', comment);

    expect(isSuccessful).toBeTruthy();
  });
});
