import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inDir = "/public/photos";
const outDir = "/public/photos/thumbs";

fs.mkdir(outDir, { recursive: true });

const files = fs
 .readdirSync(inDir)
 .filter((f) => /^photo\d+\.(webp|jpg|jpeg|png)$/i.test(f));

for (const f of files) {
    const input = path.join(inDir, f);
    const output = path.join(outDir, f.replace(/\.(jpg|jpeg|png)$/i, ".webp").replace(/\.webp$/i));

    await sharp(input)
     .resize({ width: 600, withoutEnlargement: true })
     .webp({ quality: 72 })
     .toFile(output);
console.log("thumb:", output)     
}