setupEnvVariables();
const { default: api } = require('../app');
const nock = require('nock');

const createEvent = (
  { httpMethod = 'GET', body = '', path, contentType = 'application/json' } = {},
) => ({
  httpMethod,
  path: `/.netlify/functions/${path}`,
  headers: {
    'client-ip': '1.2.3.4.5.6',
    'content-type': contentType,
  },
  body,
});

function setupEnvVariables() {
  process.env.githubTokens = JSON.stringify({
    secretToken: 'secretToken1',
    gistId: 'gistId2',
  });
  process.env.buildTriggerHook = 'https://example.com';
}

describe('api', () => {
  describe('comments', () => {
    it('returns comments', async () => {
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {
          'comments::commentId': {
            content: JSON.stringify({ __id: '123', parent: '1', __articleId: '333' }),
          },
          'articles::1': { content: JSON.stringify({ id: '1', __id: '333' }) },
        },
      });
      const { statusCode, body } = await api(createEvent({ path: 'comments/1' }), {});

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual([
        { __id: '123', parent: '1', __articleId: '333', comments: [] },
      ]);
    });
    it('returns empty comments if article does not exist', async () => {
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({ path: 'comments/SOME_NOT_EXISTING_ID' }),
        {},
      );

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual([]);
    });
    it('creates comment for JSON post', async () => {
      nock('https://example.com').post('/').reply(200, {
        files: {},
      });
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      nock('https://api.github.com').patch('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({
          httpMethod: 'POST',
          path: 'comments/1',
          body: JSON.stringify({
            name: 'Vytenis',
            comment: 'This is reply',
            parent: '1',
          }),
        }),
        {},
      );

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toHaveProperty('isSuccessful', true);
      expect(JSON.parse(body)).toHaveProperty('commentId');
    });
    it('creates comment for form post', async () => {
      nock('https://example.com').post('/').reply(200, {
        files: {},
      });
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      nock('https://api.github.com').patch('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({
          httpMethod: 'POST',
          path: 'comments/1',
          body: 'name=Vytenis&comment=this&parent=1',
          contentType: 'application/x-www-form-urlencoded',
        }),
        {},
      );

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toBe(
        'Your comment has been submitted, it will take a couple of moments to appear on site.',
      );
    });
    it('fails to create comment if missing "comment" property', async () => {
      nock('https://example.com').post('/').reply(200, {
        files: {},
      });
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      nock('https://api.github.com').patch('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({
          httpMethod: 'POST',
          path: 'comments/1',
          body: JSON.stringify({
            name: 'Vytenis',
            parent: '1',
          }),
        }),
        {},
      );

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toHaveProperty('isSuccessful', false);
      expect(JSON.parse(body)).toHaveProperty('commentId', null);
    });
  });

  describe('likes', () => {
    it('returns likes', async () => {
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {
          'likes::likeId': {
            content: JSON.stringify({
              __id: '123',
              _ip: '1.2.3.4.5.6',
              __articleId: '333',
              timestamp: 1234567,
            }),
          },
          'articles::1': { content: JSON.stringify({ id: '1', __id: '333' }) },
        },
      });
      const { statusCode, body } = await api(createEvent({ path: 'likes/1' }), {});

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ existingLike: 1234567, likes: [ 1234567 ] });
    });
    it('returns empty likes if none exist', async () => {
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(createEvent({ path: 'likes/1' }), {});

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ existingLike: null, likes: [] });
    });
    it('returns empty likes if article does not exist', async () => {
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(createEvent({ path: 'likes/NON_EXISTING_ID' }), {});

      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toEqual({ existingLike: null, likes: [] });
    });
    it('submits like', async () => {
      nock('https://example.com').post('/').reply(200);
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {},
      });
      nock('https://api.github.com').patch('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({
          httpMethod: 'POST',
          path: 'likes/1',
        }),
        {},
      );
      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toHaveProperty('isSuccessful', true);
      expect(JSON.parse(body)).toHaveProperty('timestamp');
    });
    it('fails to submit like if already liked', async () => {
      nock('https://example.com').post('/').reply(200);
      nock('https://api.github.com').get('/gists/gistId2').reply(200, {
        files: {
          'likes::likeId': {
            content: JSON.stringify({
              __id: '123',
              _ip: '1.2.3.4.5.6',
              __articleId: '333',
              timestamp: 1234567,
            }),
          },
          'articles::1': { content: JSON.stringify({ id: '1', __id: '333' }) },
        },
      });
      nock('https://api.github.com').patch('/gists/gistId2').reply(200, {
        files: {},
      });
      const { statusCode, body } = await api(
        createEvent({
          httpMethod: 'POST',
          path: 'likes/1',
        }),
        {},
      );
      expect(statusCode).toBe(200);
      expect(JSON.parse(body)).toHaveProperty('isSuccessful', false);
      expect(JSON.parse(body)).toHaveProperty('timestamp', null);
    });
  });
});
