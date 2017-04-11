import fs = require('fs');
import path = require('path');

import { initGenerator } from './lib/generator';


const generator = initGenerator();

function runGenerator() {
    generator().then(() => process.send('generated'));
}

process.on('message', m => m === 'trigger' && runGenerator());

runGenerator();
