// Generate PNG icons for Chrome extension
const fs = require("fs");
const zlib = require("zlib");

function makePNG(size) {
  const w = size, h = size;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihd = Buffer.alloc(13);
  ihd.writeUInt32BE(w, 0);
  ihd.writeUInt32BE(h, 4);
  ihd[8] = 8;  // bit depth
  ihd[9] = 6;  // RGBA
  ihd[10] = 0; // compression
  ihd[11] = 0; // filter
  ihd[12] = 0; // interlace
  const ihdr = makeChunk("IHDR", ihd);

  // Pixel data (RGBA)
  const raw = Buffer.alloc((w * 4 + 1) * h);
  const cx = w / 2, cy = h * 0.42, r = w * 0.35;

  for (let y = 0; y < h; y++) {
    const rowOff = y * (w * 4 + 1);
    raw[rowOff] = 0; // filter byte
    for (let x = 0; x < w; x++) {
      const o = rowOff + 1 + x * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let R = 0, G = 0, B = 0, A = 0;

      // Main circle - brand blue #00288e
      if (dist <= r) {
        R = 0; G = 40; B = 142; A = 255;

        // Inner ring 1
        if (dist > r * 0.62 && dist < r * 0.72) {
          R = 60; G = 120; B = 220; A = 255;
        }
        // Inner ring 2
        if (dist > r * 0.35 && dist < r * 0.45) {
          R = 80; G = 150; B = 240; A = 255;
        }
        // Center dot (white)
        if (dist < r * 0.18) {
          R = 255; G = 255; B = 255; A = 255;
        }
      }

      // Pin/pointer at bottom
      const pinTop = cy + r * 0.7;
      const pinBot = cy + r * 1.8;
      if (y >= pinTop && y <= pinBot) {
        const progress = (y - pinTop) / (pinBot - pinTop);
        const pinWidth = r * 0.5 * (1 - progress);
        if (Math.abs(dx) <= pinWidth) {
          R = 0; G = 40; B = 142; A = 255;
        }
      }

      // Subtle glow around circle
      if (dist > r && dist < r * 1.15 && A === 0) {
        const alpha = Math.max(0, 1 - (dist - r) / (r * 0.15));
        R = 0; G = 40; B = 142; A = Math.round(alpha * 80);
      }

      raw[o] = R;
      raw[o + 1] = G;
      raw[o + 2] = B;
      raw[o + 3] = A;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const combined = Buffer.concat([typeB, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(combined));
  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xEDB88320 : 0);
    }
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
[16, 48, 128].forEach(function(size) {
  const png = makePNG(size);
  fs.writeFileSync(__dirname + "/icon" + size + ".png", png);
  console.log("Created icon" + size + ".png (" + png.length + " bytes)");
});

console.log("Done! All PNG icons created.");
