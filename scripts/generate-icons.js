import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { mkdirSync } from 'fs';

mkdirSync('public', { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#222222"/>
      <stop offset="100%" stop-color="#040404"/>
    </radialGradient>
    <clipPath id="stripClip">
      <rect x="24" y="44" width="132" height="32" rx="6"/>
    </clipPath>
  </defs>

  <!-- Achtergrond -->
  <rect width="180" height="180" fill="url(#bg)"/>

  <!-- Slagschaduw achter het bord -->
  <rect x="26" y="82" width="128" height="66" rx="7" fill="black" opacity="0.35"/>

  <!-- Wit bord (hoofddeel) -->
  <rect x="24" y="76" width="132" height="68" rx="7" fill="white"/>

  <!-- Horizontale lijntjes op het bord -->
  <line x1="38" y1="96"  x2="144" y2="96"  stroke="#d0d0d0" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="38" y1="112" x2="144" y2="112" stroke="#d0d0d0" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="38" y1="128" x2="144" y2="128" stroke="#d0d0d0" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Klapper (bovenste balk) -->
  <rect x="24" y="44" width="132" height="32" rx="6" fill="#111"/>
  <g clip-path="url(#stripClip)">
    <!-- Rode basiskleur -->
    <rect x="24" y="44" width="132" height="32" fill="#dc2626"/>
    <!-- Zwarte diagonale strepen -->
    <polygon points="24,44  54,44  24,76" fill="#111"/>
    <polygon points="54,44  84,44  54,76  24,76" fill="#111"/>
    <polygon points="84,44 114,44  84,76  54,76" fill="#dc2626"/>
    <polygon points="114,44 144,44 114,76  84,76" fill="#111"/>
    <polygon points="144,44 174,44 144,76 114,76" fill="#dc2626"/>
  </g>

  <!-- Scharnierbalk -->
  <rect x="22" y="74" width="136" height="9" rx="4" fill="#1c1c1c"/>

  <!-- Scharnierknopjes -->
  <circle cx="46"  cy="78.5" r="5" fill="#2e2e2e"/>
  <circle cx="46"  cy="78.5" r="2.2" fill="#444"/>
  <circle cx="134" cy="78.5" r="5" fill="#2e2e2e"/>
  <circle cx="134" cy="78.5" r="2.2" fill="#444"/>
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
