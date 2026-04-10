const fs = require('fs');
const path = require('path');
const p = './src/pages';
const files = fs.readdirSync(p);
let modifiedCount = 0;
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    const fp = path.join(p, f);
    const content = fs.readFileSync(fp, 'utf8');
    if (content.includes('http://localhost:3002')) {
      fs.writeFileSync(fp, content.replace(/http:\/\/localhost:3002/g, 'https://contabilfacil-api.onrender.com'));
      modifiedCount++;
    }
  }
});
console.log('Modified ' + modifiedCount + ' files.');
