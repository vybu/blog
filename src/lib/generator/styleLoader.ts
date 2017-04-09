import nodeSass = require('node-sass');
import path = require('path');
import fs = require('fs');

import { getHashFileNameFor } from '../utils';

const dist = path.join(__filename, '../../../dist');
const entryFile = path.join(__filename, '../../styles/main.scss');
const outputStyle = 'compressed';

export function buildCSS(): Promise<any> {

    return getFileNameHash()
        .then(([fileName, sourceMapName]) => {
            return new Promise((resolve, reject) => {
                nodeSass.render({
                    file: entryFile,
                    outputStyle,
                    sourceMap: sourceMapName
                }, (error, result) => {
                    if (error) {
                        console.error('Failed while parsing scss', error);
                        return reject(error);
                    }

                    fs.writeFile(
                        `${dist}/${fileName}`,
                        result.css.toString(),
                        'utf-8',
                        (err) => err ? reject(err) : resolve(fileName)
                    );
                    
                    fs.writeFile(
                        `${dist}/${sourceMapName}`,
                        result.map.toString(),
                        'utf-8',
                        (err) => err ? console.log('Failed to save css source maps') : console.log('Successfully saved css source maps')
                    );
                })
            });
        })

}

function getFileNameHash(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        nodeSass.render({
            file: entryFile,
            outputStyle
        }, (error, result) => {
            if (error) {
                console.error('Failed while parsing scss for name hash', error);
                return reject(error);
            }

            const hash = getHashFileNameFor(result.css.toString(), 'css');

            resolve([hash, `${hash}.map`]);
        })
    });
}
