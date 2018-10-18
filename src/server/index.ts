import getServer from './app';
// import { initHotArticleRebuilder } from '../lib/generator/hotArticleRebuilder';
import { serverPort } from '../lib/constants';

async function startApp() {
  // const hotArticleRebuilder = await initHotArticleRebuilder();
  getServer(() => {}).listen(serverPort);
}

startApp();
