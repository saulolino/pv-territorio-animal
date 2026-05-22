import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// SVG icon: fundo verde PV com uma pata branca estilizada
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2d7a1f"/>
  <!-- Pata estilizada em branco -->
  <!-- Dedo 1 -->
  <ellipse cx="170" cy="175" rx="40" ry="52" fill="white"/>
  <!-- Dedo 2 -->
  <ellipse cx="256" cy="148" rx="40" ry="52" fill="white"/>
  <!-- Dedo 3 -->
  <ellipse cx="342" cy="175" rx="40" ry="52" fill="white"/>
  <!-- Palma central -->
  <ellipse cx="256" cy="300" rx="90" ry="80" fill="white"/>
  <!-- Dedo polegar esquerdo -->
  <ellipse cx="152" cy="270" rx="35" ry="48" fill="white"/>
  <!-- Dedo polegar direito -->
  <ellipse cx="360" cy="270" rx="35" ry="48" fill="white"/>
</svg>`;

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const svgBuffer = Buffer.from(svgIcon);

for (const size of SIZES) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(ROOT, `public/icons/icon-${size}x${size}.png`));
  console.log(`✓ icon-${size}x${size}.png`);
}

console.log("Icons gerados com sucesso.");
