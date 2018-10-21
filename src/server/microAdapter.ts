import '../../config';
import { ServerResponse, IncomingMessage } from 'http';
import micro = require('micro');
import Busboy = require('busboy');
import { serverPort } from '../lib/constants';
import app from './app';

const log = (...args) => console.log(`microAdapter`, ...args);

async function parseFormData(req: IncomingMessage) {
  return await new Promise((resolve, reject) => {
    let formValues = '';
    const formParser = new Busboy({ headers: req.headers });
    formParser.on('field', (field, val) => {
      if (formValues.length > 0) {
        formValues += '&';
      }
      formValues += `${field}=${val}`;
    });
    formParser.on('finish', () => resolve(formValues));

    req.pipe(formParser);
  });
}

micro(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  let body;
  try {
    body =
      req.headers['content-type'] === 'application/json'
        ? JSON.stringify(await micro.json(req))
        : await parseFormData(req);
  } catch (e) {
    body = '';
  }
  log({ body, });
  const result = await app(
    {
      httpMethod: req.method,
      path: req.url,
      headers: {
        'client-ip': req.connection.remoteAddress,
        'content-type': req.headers['content-type'],
      },
      body,
    },
    {},
  );

  if (result.statusCode === 200) {
    return result.body;
  } else if (result.statusCode === 501) {
    return micro.send(res, 501);
  }
}).listen(serverPort);
