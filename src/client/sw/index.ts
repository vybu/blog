export default function initServiceWorker() {
  if (process.env.NODE_ENV !== 'production') {
    return navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: './' }).then(
      registration => {
        console.info('ServiceWorker registration successful with scope: ', registration.scope);
      },
      function(err) {
        console.info('ServiceWorker registration failed: ', err);
      },
    );
  }
}
