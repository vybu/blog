import path = require('path');
import fs = require('fs');
import glob = require('glob');
import rimraf = require('rimraf');

import { dist } from '../constants';

const DIST_LOCATION = path.join(__dirname, '../../../dist');
const ARTICLES_GLOB = 'articles/**/*.md';
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

export function saveToDist(fileName: string, fileType: string, content: string) {
    fs.writeFile(`${DIST_LOCATION}/${fileName}.${fileType}`, content, 'utf-8', () => {
        console.log(`Saved ${fileName} to ${DIST_LOCATION}`);
    });
}

export function cleanup() {
    return new Promise((resolve, reject) => {
        rimraf(dist, (error) => {
            console.info('Cleaned up files');
            error ? reject(error) : resolve()
        });
    })
}

