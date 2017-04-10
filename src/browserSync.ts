import browserSync = require('browser-sync');
import path = require('path');

const dist = path.join(__dirname, '../dist');

export function initServerOnDist(): browserSync.BrowserSyncInstance {
    const bs = browserSync.create('Dev server');
    bs.init({
        server: dist
    });

    return bs;
}
