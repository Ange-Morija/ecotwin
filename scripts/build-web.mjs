import { mkdir, copyFile, access, readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
await mkdir("web/vendor", { recursive: true });
const sdk = "web/vendor/xeokit-sdk.es.js";
await copyFile("node_modules/@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js", sdk);
const source = await readFile(sdk);
const compressed = gzipSync(source, { level: 9 });
await writeFile(`${sdk}.gz`, compressed);
await access("web/assets/model.xkt");
console.log(
  `SDK local : ${source.length} octets, gzip : ${compressed.length} octets. Modèle XKT disponible.`,
);
