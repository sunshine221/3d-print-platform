import { createServer } from 'https';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import next from 'next';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const key = readFileSync(resolve(__dirname, '../../certs/key.pem'));
const cert = readFileSync(resolve(__dirname, '../../certs/cert.pem'));

app.prepare().then(() => {
  createServer({ key, cert }, (req, res) => handle(req, res)).listen(port, hostname, () => {
    console.log(`  Frontend ready on https://localhost:${port}`);
  });
});
