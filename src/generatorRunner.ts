import { initGenerator } from './lib/generator';
import '../config';

const shouldRebuild = process.env.LISTEN_MESSAGE;

initGenerator().then(generator => {
  function runGenerator() {
    generator().then(() => shouldRebuild && process.send('generated'));
  }

  if (shouldRebuild) {
    process.on('message', m => m === 'trigger' && runGenerator());
  }

  runGenerator();
});
