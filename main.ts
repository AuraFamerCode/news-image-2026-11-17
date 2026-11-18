// news-image-20261117: the entered image is entry.png beside this file; the program copies it to
// /output/entry.png. The grader runs it twice with no network on Node 22, standard library only,
// and both runs must write the same bytes.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { closeSync, copyFileSync, mkdirSync, openSync, readSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1048576; // the gate's limit for the image
const imageUrl = new URL('./entry.png', import.meta.url);

// Read only the header bytes: the gate tells PNG from JPEG by the first bytes, and the size by the file itself.
const size = statSync(imageUrl).size;
const head = Buffer.alloc(8);
const fd = openSync(imageUrl, 'r');
try {
  readSync(fd, head, 0, head.length, 0);
} finally {
  closeSync(fd);
}
const isPng = head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
if (!isPng && !isJpeg) throw new Error('entry.png is neither a PNG nor a JPEG');
if (size > MAX_BYTES) throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES}-byte limit`);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'entry.png');
copyFileSync(imageUrl, outFile);
console.log(`wrote ${outFile} (${statSync(outFile).size} bytes, ${isPng ? 'PNG' : 'JPEG'})`);
