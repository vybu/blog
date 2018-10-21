const rc = require('rc');
const pckg = require('./package.json');

const config = rc(pckg.name, {
  githubTokens: {
    secretToken: process.env.gHsecretToken,
    gistId: process.env.gHgistId,
  },
  buildTriggerHook: process.env.buildTriggerHook,
});

process.env.githubTokens = JSON.stringify(config.githubTokens);
process.env.buildTriggerHook = config.buildTriggerHook;
