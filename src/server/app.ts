import * as querystring from 'querystring';
import escapeHtml = require('escape-html');
import { initDb } from './db/initDb';
import { triggerRebuild } from './netlifyRebuild';

function sanitize(comment) {
  return {
    name: comment.name && escapeHtml(comment.name),
    comment: comment.comment && escapeHtml(comment.comment),
    parent: comment.parent && comment.parent,
  };
}

async function submitLike(articleId, _ip, database) {
  const timestamp = Date.now();
  const isSuccessful = await database.submitLike(articleId, { _ip, timestamp });
  if (isSuccessful) return { isSuccessful, timestamp };
  return { isSuccessful, timestamp: null };
}

async function submitComment(articleId, ip, commentData, database) {
  commentData._ip = ip;
  const [ isSuccessful, commentId ] = await database.submitComment(articleId, commentData);
  return { isSuccessful, commentId };
}

const responseOk = (body: any = {}) => ({ statusCode: 200, body: JSON.stringify(body) });
const responseError = (body: any = {}) => ({ statusCode: 500, body: JSON.stringify(body) });

const server = async (event, context) => {
  try {
    const contentType = event.headers['content-type'];
    const method = event.httpMethod;
    const url = event.path;
    const like = url.match(/likes\/([^/]+)/);
    const comment = url.match(/comments\/([^/]+)/);
    const ip = event.headers['client-ip'];
    const articleId = like ? like[1] : comment ? comment[1] : null;

    const database = await initDb();

    if (!articleId) {
      return responseOk(null);
    }

    if (like) {
      if (method === 'POST') {
        return responseOk(await submitLike(articleId, ip, database));
      } else if (method === 'GET') {
        const likes = await database.retrieveLikes(articleId);
        const existingLike = await database.retrieveLikeForIp(ip);
        return responseOk({ likes, existingLike });
      }
    } else if (comment) {
      if (method === 'POST') {
        let comment = {};
        if (contentType === 'application/x-www-form-urlencoded') {
          comment = querystring.parse(event.body);
          const result = await submitComment(articleId, ip, sanitize(comment), database);
          if (result.isSuccessful) {
            await triggerRebuild();
          }
          return responseOk(
            'Your comment has been submitted, it will take a couple of moments to appear on site.',
          );
        } else if (contentType === 'application/json') {
          comment = JSON.parse(event.body);
          const result = await submitComment(articleId, ip, sanitize(comment), database);
          if (result.isSuccessful) {
            await triggerRebuild();
          }
          return responseOk(result);
        }
      } else if (method === 'GET') {
        return responseOk(await database.retrieveComments(articleId));
      }
    }

    return responseOk();
  } catch (error) {
    console.error({ error });
    return responseError();
  }
};

export default server;
