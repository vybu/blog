const rc = require('rc');
const pckg = require('./package.json');

const config = rc(pckg.name, {
  githubTokens: {
    secretToken: process.env.gHsecretToken,
    gistId: process.env.gHgistId,
  },
});

process.env.githubTokens = JSON.stringify(config.githubTokens);
