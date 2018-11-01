import fetch from 'node-fetch/lib/index.js';
import { triggerBuildHookUrl } from '../lib/constants';

export const triggerRebuild = () => {
  return fetch(triggerBuildHookUrl, { method: 'POST', body: '' });
};
