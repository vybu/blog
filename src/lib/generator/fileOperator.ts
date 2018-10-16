import path = require('path');
import fs = require('fs');
import childProcess = require('child_process');
import glob = require('glob');
import rimraf = require('rimraf');

import { ArticleRaw, fileName, BuiltPage, PageJson } from './commonTypes';
import { dist, staticFilesPath } from '../constants';

const ARTICLES_GLOB = './src/articles/**/*.md';
const root = path.join(__dirname, '../../../');

export function getArticles(articlesGlob: string = ARTICLES_GLOB): Promise<ArticleRaw[]> {
  return new Promise((resolve, reject) => {
    glob(articlesGlob, { root }, (error, files) => {
      if (error) {
        reject(error);
      }
      resolve(
        files.map(file => ({
          fileName: getFileName(file),
          content: readFileAt(`${root}${file}`),
        })),
      );
    });
  });
}

function readFileAt(path: string): string {
  return fs.readFileSync(path, 'utf-8');
}

function getFileName(path: string): fileName {
  return path
    .split(/[\/\\]/g)
    .pop()
    .split('.')[0];
}

export function saveToDist(fileName: string, fileType: string, content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${dist}/${fileName}.${fileType}`, content, 'utf-8', error => {
      if (error) return reject(error);

      console.log(`Saved ${fileName}.${fileType} to ${dist}`);
      resolve();
    });
  });
}

export function saveFinalOutput(fileName, { fullPage, content }: BuiltPage) {
  const pageJson: PageJson = {
    renderedHtml: content,
  };

  saveToDist(fileName, 'html', fullPage);
  saveToDist(fileName, 'json', JSON.stringify(pageJson));
}

export function cleanup() {
  return new Promise((resolve, reject) => {
    rimraf(`${dist}/*!(.gitignore)`, error => {
      console.info('Cleaned up files');
      error ? reject(error) : resolve();
    });
  });
}

export function copyStaticFiles(): void {
  childProcess.exec(
    `cp -r ${staticFilesPath}/* ${dist}`,
    err => (err ? console.error(err) : console.info('Successfully copied static files')),
  );
}

export function getGitCommitsCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    childProcess.exec('git rev-list --all --count', (err: Error, stdout: string) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      console.info(`Successfully retrieved git commit count: ${stdout}`);
      resolve(parseInt(stdout));
    });
  });
}
