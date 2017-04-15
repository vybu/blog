const browserSync = require('browser-sync');
const path = require('path');

const dist = path.join(__dirname, '../dist');

module.exports = function initServerOnDist() {
    const bs = browserSync.create('Dev server');
    bs.init({
        server: {
            baseDir: dist,
            serveStaticOptions: {
                extensions: ['html']
            }
        },

    });

    return bs;
};
