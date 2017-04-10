import fs = require('fs');
import path = require('path');

import { initGenerator } from './lib/generator';
import { initServerOnDist } from './browserSync';

const isProdBuild = false;
const filesToWatch = [
    path.join(__dirname, '../articles'),
    path.join(__dirname, './styles'),
    path.join(__dirname, './lib/client')
];

const generator = initGenerator();

if (isProdBuild) {
    // run once
    generator();
} else {
    // watch
    const server = initServerOnDist();
    filesToWatch.forEach(f => fs.watch(f, (eventType) => {
        if (eventType === 'change') {
            generator().then(() => server.reload());
        }
    }))

    generator();    
}
