const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src/content/blog/romophic-library');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // index.mdx: ./lib/Foo -> /blog/romophic-library/lib/Foo
  if (filePath.endsWith('index.mdx')) {
    content = content.replace(/\]\(\.\/lib\//g, '](/blog/romophic-library/lib/');
  } 
  // lib/*.mdx: ./Foo -> /blog/romophic-library/lib/Foo
  else if (filePath.includes(path.join('romophic-library', 'lib'))) {
    content = content.replace(/\]\(\.\//g, '](/blog/romophic-library/lib/');
  }

  // Handle ../STL... case specifically in index.mdx
  if (filePath.endsWith('index.mdx')) {
      content = content.replace(/\]\(\.\.\/STL/g, '](/blog/STL');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.mdx')) {
      processFile(fullPath);
    }
  }
}

traverse(rootDir);
