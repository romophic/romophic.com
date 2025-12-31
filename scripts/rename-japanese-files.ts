import fs from 'fs';
import path from 'path';

const DIR = 'src/content/blog/romophic-library/lib';

const MAPPINGS: Record<string, string> = {
  '二分探索': 'binary-search.mdx',
  '入出力高速化': 'fast-io.mdx',
  '約数列挙': 'divisor-enumeration.mdx',
  '素因数分解': 'prime-factorization.mdx',
  '繰り返し二乗法': 'binary-exponentiation.mdx',
};

async function renameFiles() {
  const files = fs.readdirSync(DIR);
  
  for (const file of files) {
    if (!file.endsWith('.mdx')) continue;
    
    // Check if filename contains non-ascii characters (assuming Japanese)
    // or simply check content to match title
    const filePath = path.join(DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const titleMatch = content.match(/title:\s*['"](.+?)['"]/);
    if (titleMatch) {
      const title = titleMatch[1];
      if (MAPPINGS[title]) {
        const newFilename = MAPPINGS[title];
        const newPath = path.join(DIR, newFilename);
        console.log(`Renaming ${file} (Title: ${title}) -> ${newFilename}`);
        fs.renameSync(filePath, newPath);
      }
    }
  }
}

renameFiles();
