import initRouter from './router';
import initServiceWorker from './sw';
import enhanceComments from './comments';

initRouter(enhanceComments);
initServiceWorker();
enhanceComments();
