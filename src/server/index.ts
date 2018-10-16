import getServer from './app';
import { init } from './db';
import { initHotArticleRebuilder } from '../lib/generator/hotArticleRebuilder';
import { serverPort } from '../lib/constants';

async function startApp() {
  const [, hotArticleRebuilder] = await Promise.all([init(), initHotArticleRebuilder()]);
  getServer(hotArticleRebuilder).listen(serverPort);
}

startApp();
