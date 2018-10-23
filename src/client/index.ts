import initRouter from './router';
import initServiceWorker from './sw';
import enhanceComments from './comments';
import drawLikebox from './likebox';

if (window.fetch) {
  initRouter(enhanceComments, drawLikebox);
  initServiceWorker();
  enhanceComments();
  drawLikebox();
}
