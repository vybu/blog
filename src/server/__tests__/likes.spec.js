const { Database } = require('../db.ts');
const { DataWrapper } = require('../dataWrapper');

function makeLike(_ip = `${Math.random()}`, timestamp = Date.now()) {
  return { _ip, timestamp };
}

describe.only('db.likes', async () => {
  let articleId;
  let db;
  beforeEach(async () => {
    db = new Database(new DataWrapper());
    const article = await db.getArticle('1');
    articleId = article.id;
  });

  it.only('adds a likes to an article', async () => {
    const like1 = makeLike('123.567.23', 1234456);
    const like2 = makeLike('123.567.24', 1234457);

    const isSuccessful = await db.submitLike(articleId, like1);
    const isSuccessful2 = await db.submitLike(articleId, like2);
    expect(isSuccessful).toBeTruthy();
    expect(isSuccessful2).toBeTruthy();

    const likes = await db.retrieveLikes(articleId);

    expect(likes[0]).toEqual(1234456);
    expect(likes[1]).toEqual(1234457);
  });

  it('prevents likes with same ip addresses', async () => {
    const like1 = makeLike('123.567.23');
    const like2 = makeLike('123.567.23');

    const isSuccessful = await db.submitLike(articleId, like1);
    const isSuccessful2 = await db.submitLike(articleId, like2);
    expect(isSuccessful).toBeTruthy();
    expect(isSuccessful2).toBeFalsy();
  });

  it('retrieves all likes on an article', async () => {
    const like1 = makeLike('123.567.23');
    const like2 = makeLike('123.567.23');
    const like3 = makeLike();

    await db.submitLike(articleId, like1);
    await db.submitLike(articleId, like2);
    await db.submitLike(articleId, like3);

    const likes = await db.retrieveLikes(articleId);

    expect(likes.length).toEqual(2);
  });

  it("creates and article if supplied articleId doesn't match any article", async () => {
    const like = makeLike('123.567.23');
    const isSuccessful = await db.submitLike('999', like);
    expect(isSuccessful).toBeTruthy();
  });
});
