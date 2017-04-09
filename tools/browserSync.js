const browserSync = require('browser-sync').create('Dev server');
const path = require('path');

const dist = path.join(__dirname, '../dist');

browserSync.init({
    server: dist
});


browserSync.watch(dist).on('change', browserSync.reload);
