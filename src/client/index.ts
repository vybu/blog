import initRouter from './router';
import initServiceWorker from './sw';
import enhanceComments from './comments';
import drawLikebox from './likebox';

initRouter(enhanceComments, drawLikebox);
initServiceWorker();
enhanceComments();
drawLikebox();
