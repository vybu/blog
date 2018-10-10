const { DataWrapper } = require('../dataWrapper');

describe('DataWrapper', () => {
  let dataWrapper;
  beforeEach(() => {
    dataWrapper = new DataWrapper();
  });
  it('creates article', () => {
    dataWrapper.createArticle({ id: '1' });
    const data = dataWrapper.getData();
    expect(data.likes).toEqual([]);
    expect(data.comments).toEqual([]);
    expect(data.articles).toHaveLength(1);
    expect(data.articles[0]).toHaveProperty('__id');
    expect(data.articles[0]).toHaveProperty('createdAt');
    expect(data.articles[0].id).toBe('1');
  });
  it('creates like', () => {
    dataWrapper.createLike({ timestamp: 123, _ip: '123.456' });
    const data = dataWrapper.getData();
    expect(data.articles).toEqual([]);
    expect(data.comments).toEqual([]);
    expect(data.likes).toHaveLength(1);
    expect(data.likes[0]).toHaveProperty('__id');
    expect(data.likes[0]).toHaveProperty('createdAt');
    expect(data.likes[0].timestamp).toBe(123);
    expect(data.likes[0]._ip).toBe('123.456');
  });
  it('creates comment', () => {
    dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    const data = dataWrapper.getData();
    expect(data.articles).toEqual([]);
    expect(data.likes).toEqual([]);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0]).toHaveProperty('__id');
    expect(data.comments[0]).toHaveProperty('createdAt');
    expect(data.comments[0].id).toBe('123');
    expect(data.comments[0]._ip).toBe('456');
    expect(data.comments[0].name).toBe('name');
    expect(data.comments[0].comment).toBe('comment');
    expect(data.comments[0].parent).toBe('parentId');
  });
  it('returns article by id', () => {
    const article = dataWrapper.createArticle({ id: '1' });
    expect(dataWrapper.findArticleById('1')).toBe(article);
  });
  it('returns likes', () => {
    const like1 = dataWrapper.createLike({ timestamp: 123, _ip: '123.456' });
    const like2 = dataWrapper.createLike({ timestamp: 456, _ip: '123.456' });
    const likes = dataWrapper.findLikes({ _ip: '123.456' });
    expect(likes[0]).toBe(like1);
    expect(likes[1]).toBe(like2);
  });
  it('returns like', () => {
    const like1 = dataWrapper.createLike({ timestamp: 123, _ip: '123.456' });
    dataWrapper.createLike({ timestamp: 456, _ip: '123.456' });
    const like = dataWrapper.findLike({ _ip: '123.456' });
    expect(like).toBe(like1);
  });
  it('returns comments', () => {
    const comment1 = dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    const comment2 = dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    const comments = dataWrapper.findComments({ parent: 'parentId' });
    expect(comments[0]).toBe(comment1);
    expect(comments[1]).toBe(comment2);
  });
  it('returns comment', () => {
    const comment1 = dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    const comment = dataWrapper.findComment({ parent: 'parentId' });
    expect(comment).toBe(comment1);
  });
  it('adds like to article', () => {
    const article = dataWrapper.createArticle({ id: '1' });
    const like = dataWrapper.createLike({ timestamp: 123, _ip: '123.456' });
    dataWrapper.addLikeToArticle(article, like);
    expect(dataWrapper.findLike(like)).toHaveProperty('__articleId', article.__id);
  });
  it('adds comment to article', () => {
    const article = dataWrapper.createArticle({ id: '1' });
    const comment = dataWrapper.createComment({
      id: '123',
      _ip: '456',
      name: 'name',
      comment: 'comment',
      parent: 'parentId',
    });
    dataWrapper.addCommentToArticle(article, comment);
    expect(dataWrapper.findComment(comment)).toHaveProperty('__articleId', article.__id);
  });
});
