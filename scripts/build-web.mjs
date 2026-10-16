import {
  mkdir,
  copyFile,
  access,
  readFile,
  writeFile,
  cp,
} from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { build } from "vite";
await mkdir("web/vendor", { recursive: true });
const sdk = "web/vendor/xeokit-sdk.es.js";
await copyFile("node_modules/@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js", sdk);
const source = await readFile(sdk);
const compressed = gzipSync(source, { level: 9 });
await writeFile(`${sdk}.gz`, compressed);
await access("web/assets/model.xkt");
await build({ configFile: "vite.config.ts" });
for (const folder of ["assets", "js", "styles", "vendor", "public"]) {
  await cp(`web/${folder}`, `web/dist/${folder}`, {
    recursive: true,
    filter: (path) => !path.endsWith(".ifc"),
  });
}
console.log(
  `Frontend React construit. SDK : ${source.length} octets, gzip : ${compressed.length} octets. IFC source conservé hors distribution.`,
);
