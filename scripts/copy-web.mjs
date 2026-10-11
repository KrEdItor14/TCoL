import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('.');
const web = resolve(root, 'www');
const androidWeb = resolve(root, 'android/app/src/main/assets/public');

await rm(web, { recursive: true, force: true });
await mkdir(web, { recursive: true });

// Keep generated Capacitor assets in lockstep with the web bundle. Android
// does not read the repository root directly; it packages this directory.
await rm(androidWeb, { recursive: true, force: true });
await mkdir(androidWeb, { recursive: true });

for (const entry of ['index.html', 'css', 'js', 'data', 'img']) {
  await cp(resolve(root, entry), resolve(web, entry), { recursive: true });
  await cp(resolve(root, entry), resolve(androidWeb, entry), { recursive: true });
}

console.log('Web bundles prepared in ./www and ./android/app/src/main/assets/public');
