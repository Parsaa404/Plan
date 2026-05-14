const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

// The user wants titles and text to be fully right-aligned. 
// Let's ensure text align is explicitly right for FA.
c = c.replace(/textAlign:\s*"center"/g, 'textAlign: isFa ? "right" : "center"');
c = c.replace(/alignItems:\s*"center"/g, 'alignItems: isFa ? "flex-start" : "center"');

// Restore the root header to center since that usually looks good, or keep it right? 
// The user said "فارسی کلا راست چین باشه" (Persian entirely right aligned), so I will make the main header right-aligned too.

// Let's replace any lingering flex-start with flex-start but we already have RTL direction.
// Wait, if the root has direction: rtl, flex-start IS right aligned!
// If it's showing left-aligned for them, they might be viewing the flex box with `flexDirection: row-reverse` that was there before?
// No, they are complaining AFTER my changes.
// My changes made the root `alignItems: "center"`.
// Wait! `alignItems: "center"` on the root div means the `.maxWidth: 1100` container is centered.
// But the header inside the container has:
// `textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"`
// I will change the header to be right aligned.

fs.writeFileSync('src/App.tsx', c);
console.log('Done');
