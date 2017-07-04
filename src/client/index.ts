import initRouter from './router';
import drawLikebox from './likebox';
import initServiceWorker from './sw';
import enhanceComments from './comments';

initRouter(drawLikebox);
drawLikebox();
initServiceWorker();
enhanceComments();
