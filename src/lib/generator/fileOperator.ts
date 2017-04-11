import path = require('path');
import fs = require('fs');
import glob = require('glob');
import rimraf = require('rimraf');

import { dist } from '../constants';

const ARTICLES_GLOB = './src/articles/**/*.md';
const root = path.join(__dirname, '../../../');

interface articleRaw {
    fileName: string,
    content: string
};

export function getArticles(articlesGlob: string = ARTICLES_GLOB): Promise<articleRaw[]> {
    return new Promise((resolve, reject) => {
        glob(articlesGlob, { root }, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files.map(file => ({
                fileName: getFileName(file),
                content: readFileAt(`${root}${file}`)
            })));
        });
    })
}

function readFileAt(path: string): string {
    return fs.readFileSync(path, 'utf-8');
}

function getFileName(path: string): string {
    return path.split(/[\/\\]/g).pop().split('.')[0];
}

export function saveToDist(fileName: string, fileType: string, content: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${dist}/${fileName}.${fileType}`, content, 'utf-8', (error) => {
            if (error) return reject(error);

            console.log(`Saved ${fileName} to ${dist}`);
            resolve();
        });
    })
}

export function cleanup() {
    return new Promise((resolve, reject) => {
        rimraf(`${dist}/*!(.gitignore)`, (error) => {
            console.info('Cleaned up files');
            error ? reject(error) : resolve()
        });
    })
}

