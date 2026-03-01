import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFiles() {
    const allFiles = [];
    walkDir(BLOG_DIR, (filePath) => {
        if (filePath.endsWith('.mdx') && !filePath.endsWith('.en.mdx')) {
            allFiles.push(filePath);
        }
    });

    for (const file of allFiles) {
        let content = fs.readFileSync(file, 'utf-8');

        // Remove BOM if present
        const hasBOM = content.charCodeAt(0) === 0xFEFF;
        if (hasBOM) {
            content = content.slice(1);
        }

        if (content.startsWith('---')) {
            const endOfFrontmatter = content.indexOf('---', 3);
            if (endOfFrontmatter !== -1) {
                let frontmatter = content.slice(3, endOfFrontmatter);
                let modifiedJa = false;

                // 1. Add lang: 'ja' if not present
                if (!frontmatter.includes('lang:')) {
                    frontmatter = frontmatter.trim() + "\nlang: 'ja'\n";
                    let newContent = '---\n' + frontmatter + content.slice(endOfFrontmatter);
                    if (hasBOM) newContent = '\uFEFF' + newContent;
                    fs.writeFileSync(file, newContent, 'utf-8');
                    console.log(`Added lang: 'ja' to ${file}`);
                    content = newContent; // Update for translation step
                    if (hasBOM) content = content.slice(1); // remove for next step
                }
            }
        }

        // Read again to ensure we process translation properly
        const enFilePath = file.replace(/\.mdx$/, '.en.mdx');

        // Let's create or update English version. We will overwrite existing ones if we just created them with wrong data earlier.
        let enContent = content;
        const endOfFrontmatter = enContent.indexOf('---', 3);
        if (enContent.startsWith('---') && endOfFrontmatter !== -1) {
            let frontmatter = enContent.slice(3, endOfFrontmatter);

            // Replace lang: 'ja' with lang: 'en'
            frontmatter = frontmatter.replace(/lang:\s*'ja'/, "lang: 'en'");

            // Prefix title
            frontmatter = frontmatter.replace(/title:\s*'(.*?)'/, "title: '[EN] $1'");
            if (!frontmatter.includes('[EN]')) {
                frontmatter = frontmatter.replace(/title:\s*"(.*?)"/, "title: \"[EN] $1\"");
            }

            let bodyStart = endOfFrontmatter + 3;
            let newEnContent = '---\n' + frontmatter + enContent.slice(endOfFrontmatter, bodyStart) +
                `\n\n> **Notice:** This is an English translation version which is currently under construction.\n\n` +
                enContent.slice(bodyStart);

            if (hasBOM) newEnContent = '\uFEFF' + newEnContent;

            fs.writeFileSync(enFilePath, newEnContent, 'utf-8');
            console.log(`Created/Updated English version: ${enFilePath}`);
        }
    }
}

processFiles();
