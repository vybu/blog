import fetch from 'node-fetch/lib/index.js';

export const serialize = (data, initial = {}) => {
  return Object.entries(data).reduce((result, [ key, value ]: [string, any[]]) => {
    value.forEach((obj) => {
      result[`${key}::${obj.__id}`] = {
        content: JSON.stringify(obj),
      };
    });
    return result;
  }, initial);
};
export const deserialize = (data, initial = { articles: [], likes: [], comments: [] }) => {
  return Object.entries(data).reduce((result, [ key, value ]: [string, { content: any }]) => {
    if (key === 'placeholder') {
      return result;
    }
    const objKey = key.split('::')[0];
    if (!result[objKey]) {
      result[objKey] = [];
    }

    result[objKey].push(JSON.parse(value.content));
    return result;
  }, initial);
};
export class GithubGistDriver {
  private githubApi = 'https://api.github.com';

  gistId: string;
  secretToken: string;

  constructor({ gistId, secretToken }) {
    this.gistId = gistId;
    this.secretToken = secretToken;
  }

  async getData() {
    console.info('Retrieving data from gist');
    const result = await fetch(`${this.githubApi}/gists/${this.gistId}`, {
      method: 'GET',
      headers: { Authorization: `token ${this.secretToken}` },
    }).then((r) => {
      console.log(`Retrieving data from gist status ${r.status}`);
      return r.json();
    });
    return deserialize(result.files);
  }

  async setData(data) {
    return await fetch(`${this.githubApi}/gists/${this.gistId}`, {
      method: 'PATCH',
      body: JSON.stringify({ files: serialize(data) }),
      headers: { Authorization: `token ${this.secretToken}` },
    }).then((r) => {
      console.log(`Patching gist status ${r.status}`);
      return r.json();
    });
  }
}
