const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

function updateImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      updateImports(fullPath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updatedContent = content.replace(
        /from ['"]\.\.\/context\/AuthContext['"]/g, 
        'from \'../../contexts/AuthContext\''
      );
      
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  });
}

updateImports(directory);
console.log('Import updates complete!');
