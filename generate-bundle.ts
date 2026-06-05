import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'src', 'codeBundle.ts');

const allowedExtensions = ['.ts', '.tsx', '.html', '.css', '.json', '.js', '.example'];
const ignoredDirs = ['node_modules', 'dist', '.git', '.aistudio', 'assets'];
const ignoredFiles = ['package-lock.json', 'src/codeBundle.ts'];

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(rootDir, fullPath);

    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoredDirs.includes(file)) {
        getFilesRecursively(fullPath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (
        allowedExtensions.includes(ext) &&
        !ignoredFiles.includes(relativePath) &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.spec.ts')
      ) {
        fileList.push(relativePath);
      }
    }
  }
  return fileList;
}

function generateBundle() {
  console.log('Scanning files...');
  const files = getFilesRecursively(rootDir);
  console.log(`Found ${files.length} source files.`);

  const bundle: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    bundle[file] = content;
  }

  // Write to src/codeBundle.ts
  const outputContent = `// Automatically generated file. Do not edit directly.
export const codeBundle: Record<string, string> = ${JSON.stringify(bundle, null, 2)};
`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, outputContent, 'utf-8');
  console.log('Successfully generated src/codeBundle.ts!');
}

generateBundle();
