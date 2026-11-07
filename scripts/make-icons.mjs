// Generates simple PNG icons (no image libraries needed): dark rounded square with a cyan "<>" glyph.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const r = size * 0.22;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const i = y * (size * 4 + 1) + 1 + x * 4;
      // rounded-rect mask
      const dx = Math.max(r - x, x - (size - 1 - r), 0), dy = Math.max(r - y, y - (size - 1 - r), 0);
      const inside = dx * dx + dy * dy <= r * r;
      let col = inside ? [15, 23, 42, 255] : [0, 0, 0, 0];
      // glyph: two chevrons and a slash, drawn as thick strokes
      const u = x / size, v = y / size, w = 0.07;
      const near = (ax, ay, bx, by) => {
        const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
        let t = ((u - ax) * (bx - ax) + (v - ay) * (by - ay)) / l2; t = Math.max(0, Math.min(1, t));
        return Math.hypot(u - (ax + t * (bx - ax)), v - (ay + t * (by - ay))) < w;
      };
      if (inside && (near(0.31, 0.34, 0.17, 0.5) || near(0.17, 0.5, 0.31, 0.66) || near(0.69, 0.34, 0.83, 0.5) || near(0.83, 0.5, 0.69, 0.66) || near(0.56, 0.25, 0.44, 0.75))) col = [56, 189, 248, 255];
      raw[i] = col[0]; raw[i + 1] = col[1]; raw[i + 2] = col[2]; raw[i + 3] = col[3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const s of [192, 512]) writeFileSync(new URL(`../public/icon-${s}.png`, import.meta.url), png(s));
writeFileSync(new URL('../build/icon.png', import.meta.url), png(1024));
console.log('icons written');
