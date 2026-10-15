import { createApp } from './app.js';
import { loadConfig } from './config.js';

const { port } = loadConfig();

createApp().listen(port, () => {
  process.stdout.write(`BFF listening on http://localhost:${port}\n`);
});
