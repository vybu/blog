const createGitHubApi = require('@octokit/rest');

export const serialize = (data, initial = {}) => {
  return Object.entries(data).reduce((result, [key, value]: [string, any[]]) => {
    value.forEach(obj => {
      result[`${key}::${obj.__id}`] = {
        content: JSON.stringify(obj),
      };
    });
    return result;
  }, initial);
};
export const deserialize = (data, initial = { articles: [], likes: [], comments: [] }) => {
  return Object.entries(data).reduce((result, [key, value]: [string, { content: any }]) => {
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
  gistId: string;
  secretToken: string;
  api: any;

  constructor({ gistId, secretToken }) {
    this.gistId = gistId;
    this.secretToken = secretToken;
    this.api = createGitHubApi();

    this.api.authenticate({
      type: 'token',
      token: secretToken,
    });
  }

  async getData() {
    const result = await this.api.gists.get({ gist_id: this.gistId });
    return deserialize(result.data.files);
  }

  async setData(data) {
    await this.api.gists.edit({ gist_id: this.gistId, files: serialize(data) });
  }
}
