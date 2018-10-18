import fetch from 'node-fetch';
import { triggerBuildHookUrl } from '../lib/constants';

export const triggerRebuild = () => {
  return fetch(triggerBuildHookUrl, { method: 'POST', body: '' });
};
