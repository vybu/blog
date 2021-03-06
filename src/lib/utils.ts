import * as md5 from 'md5';

export function getHashFileNameFor(content: string, fileExtension: string): string {
  return `${md5(content)}.${fileExtension}`;
}

export function html(h) {
  return h.outerHTML;
}
