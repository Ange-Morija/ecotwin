import { mkdir, copyFile, access } from 'node:fs/promises';
await mkdir('web/vendor', { recursive: true });
await copyFile('node_modules/@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js', 'web/vendor/xeokit-sdk.es.js');
await access('web/assets/model.xkt');
console.log('Frontend prêt : SDK Xeokit local figé et modèle XKT disponibles.');
