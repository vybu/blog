import { GithubGistDriver } from './githubGistDriver';
import { DataWrapper } from './dataWrapper';
import { Database } from './db';

export const initDb = async () => {
  const config = JSON.parse(process.env.githubTokens);
  const githubGistDriver = new GithubGistDriver({
    gistId: config.gistId,
    secretToken: config.secretToken,
  });
  const initialData = await githubGistDriver.getData();
  const dataWrapper = new DataWrapper({ initialData, persistData: githubGistDriver.setData });
  return new Database(dataWrapper);
};
