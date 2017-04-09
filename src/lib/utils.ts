import md5 = require('md5');

export function getHashFileNameFor(content: string, fileExtension: string): string {
    return `${md5(content)}.${fileExtension}`;
}
