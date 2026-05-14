const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
c = c.replace(/flexDirection:\s*isFa\s*\?\s*"row-reverse"\s*:\s*"row"/g, 'flexDirection: "row"');
c = c.replace(/color:\s*C\.gold\s*-\s*,\s*direction:\s*"rtl"/g, 'color: C.gold');
// Also fix any other alignment that might be wrong, such as `justifyContent: isFa ? "flex-start" : "space-between"`
// Wait, the main issue is row-reverse. Let's just fix row-reverse.
fs.writeFileSync('src/App.tsx', c);
console.log("Fixed RTL directions");
