export default function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', {scope: './'}).then((registration) => {
            console.info('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.info('ServiceWorker registration failed: ', err);
        });
    }
}
