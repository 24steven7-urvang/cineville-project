import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';

mkdirSync('public', { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <!-- Achtergrond -->
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
  </defs>
  <rect width="180" height="180" fill="url(#bg)"/>

  <!-- Rode cirkel -->
  <circle cx="90" cy="90" r="52" fill="#dc2626"/>

  <!-- Film-rolletje symbool -->
  <!-- Grote ring -->
  <circle cx="90" cy="90" r="34" fill="none" stroke="white" stroke-width="6"/>
  <!-- Binnenste cirkel -->
  <circle cx="90" cy="90" r="12" fill="white"/>
  <!-- Sprocket holes: 6 kleine rechthoekjes rondom -->
  <rect x="87" y="50" width="6" height="10" rx="2" fill="white"/>
  <rect x="87" y="120" width="6" height="10" rx="2" fill="white"/>
  <rect x="50" y="87" width="10" height="6" rx="2" fill="white"/>
  <rect x="120" y="87" width="10" height="6" rx="2" fill="white"/>
  <rect x="60" y="60" width="10" height="6" rx="2" fill="white" transform="rotate(45 65 63)"/>
  <rect x="110" y="111" width="10" height="6" rx="2" fill="white" transform="rotate(45 115 114)"/>
  <rect x="109" y="60" width="10" height="6" rx="2" fill="white" transform="rotate(-45 114 63)"/>
  <rect x="60" y="111" width="10" height="6" rx="2" fill="white" transform="rotate(-45 65 114)"/>
</svg>
`;

// apple-touch-icon: 180x180
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('✓ public/apple-touch-icon.png');

// favicon: 32x32 (ook als PNG voor betere compatibiliteit)
await sharp(Buffer.from(svg)).resize(32, 32).png().toFile('public/favicon-32.png');
console.log('✓ public/favicon-32.png');

// Manifest icon 192x192
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icon-192.png');
console.log('✓ public/icon-192.png');

// Manifest icon 512x512
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icon-512.png');
console.log('✓ public/icon-512.png');

console.log('\nAlle iconen aangemaakt!');
