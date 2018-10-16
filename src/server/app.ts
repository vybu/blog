import micro = require('micro');
import Busboy = require('busboy');
import escapeHtml = require('escape-html');
import { IncomingMessage, ServerResponse } from 'http';
import { initDb } from './initDb';

function getIp(req) {
  return req.connection.remoteAddress; // this will be needed to change to header under nginx
}

function sanitize(comment) {
  return {
    name: escapeHtml(comment.name),
    comment: escapeHtml(comment.comment),
    parent: comment.parent,
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
  const [isSuccessful, commentId] = await database.submitComment(articleId, commentData);
  return { isSuccessful, commentId };
}

async function parseFormData(req: IncomingMessage) {
  return await new Promise((resolve, reject) => {
    const formValues = {};
    const formParser = new Busboy({ headers: req.headers });
    formParser.on('field', (field, val) => (formValues[field] = val));
    formParser.on('finish', () => resolve(formValues));

    req.pipe(formParser);
  });
}
// TODO: trycatch
const server = hotArticleRebuilder =>
  micro(async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');

    const { method, url } = req;
    const like = url.match(/like\/([^/]+)/);
    const comment = url.match(/comments\/([^/]+)/);
    const ip = getIp(req);
    const articleId = like ? like[1] : comment ? comment[1] : null;

    const database = await initDb();

    if (!articleId) {
      return null;
    }

    if (like) {
      if (method === 'POST') {
        return await submitLike(articleId, ip, database);
      } else if (method === 'GET') {
        const likes = await database.retrieveLikes(articleId);
        const existingLike = await database.retrieveLikeForIp(ip);
        return { likes, existingLike };
      }
    } else if (comment) {
      if (method === 'POST') {
        console.info(req.headers['content-type']);
        let comment = {};
        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
          comment = await parseFormData(req);
          const result = await submitComment(articleId, ip, sanitize(comment), database);
          if (result.isSuccessful) {
            await hotArticleRebuilder(articleId);
          }
          res.setHeader('Location', req.headers.referer);
          return micro.send(res, 302);
        } else if (req.headers['content-type'] === 'application/json') {
          comment = await micro.json(req);
          const result = await submitComment(articleId, ip, sanitize(comment), database);
          if (result.isSuccessful) {
            hotArticleRebuilder(articleId);
          }
          return result;
        }
      } else if (method === 'GET') {
        return await database.retrieveComments(articleId);
      }
    }

    return {};
  });

export default server;
