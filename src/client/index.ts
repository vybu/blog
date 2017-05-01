import initRouter from './router';
import drawLikebox from './likebox';
import initServiceWorker from './sw';

initRouter(drawLikebox);
drawLikebox();
initServiceWorker();
