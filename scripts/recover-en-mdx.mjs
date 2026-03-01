import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const allFiles = [];
walkDir(BLOG_DIR, (filePath) => {
    // Only process original Japanese files
    if (filePath.endsWith('.mdx') && !filePath.endsWith('.en.mdx')) {
        allFiles.push(filePath);
    }
});

for (const file of allFiles) {
    const enFilePath = file.replace(/\.mdx$/, '.en.mdx');
    let content = fs.readFileSync(file, 'utf-8');

    // 1. Frontmatter updates
    let updatedContent = content;
    const isLibrary = file.replace(/\\/g, '/').includes('romophic-library/lib');
    const isLibraryIndex = file.replace(/\\/g, '/').endsWith('romophic-library/index.mdx');

    // Remove BOM if present
    const hasBOM = updatedContent.charCodeAt(0) === 0xFEFF;
    if (hasBOM) {
        updatedContent = updatedContent.slice(1);
    }

    const endOfFrontmatter = updatedContent.indexOf('---', 3);
    if (updatedContent.startsWith('---') && endOfFrontmatter !== -1) {
        let frontmatter = updatedContent.slice(3, endOfFrontmatter);

        // Update lang
        frontmatter = frontmatter.replace(/lang:\s*'ja'/, "lang: 'en'");

        // If not library article, add [EN] prefix
        if (!isLibrary && !isLibraryIndex) {
            if (!frontmatter.includes('[EN]')) {
                frontmatter = frontmatter.replace(/title:\s*'(.*?)'/, "title: '[EN] $1'");
                frontmatter = frontmatter.replace(/title:\s*"(.*?)"/, "title: \"[EN] $1\"");
            }
        }

        let body = updatedContent.slice(endOfFrontmatter + 3);

        if (!isLibrary && !isLibraryIndex) {
            body = `\n\n> **Notice:** This is an English translation version which is currently under construction.\n\n` + body;
        } else if (isLibrary) {
            // Translate the library headers and specific common JP terms
            body = body.replace(/## 用途/g, '## Purpose');
            body = body.replace(/## 使い方/g, '## Usage');
            body = body.replace(/### 宣言/g, '### Declaration');
            body = body.replace(/## 実装/g, '## Implementation');
            body = body.replace(/## 計算量/g, '## Time Complexity');
            body = body.replace(/### 重み付き有向パスの追加/g, '### Add weighted directed edge');
            body = body.replace(/重み付き有向グラフを扱う./g, 'Handles weighted directed graphs.');
            body = body.replace(/最遠頂点を求める/g, 'Find the farthest vertex');
            body = body.replace(/木の直径を求める/g, 'Find the diameter of a tree');
        }

        // Specifically fix internal links to point to /en/blog/ across ALL english files for safety
        body = body.replace(/\]\(\/blog\//g, '](/en/blog/');

        updatedContent = '---' + frontmatter + '---' + body;

        if (hasBOM) {
            updatedContent = '\uFEFF' + updatedContent;
        }

        fs.writeFileSync(enFilePath, updatedContent, 'utf-8');
        console.log(`Recovered and translated: ${enFilePath}`);
    }
}
