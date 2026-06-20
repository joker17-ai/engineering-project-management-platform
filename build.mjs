import { cpSync, mkdirSync, rmSync } from 'node:fs';

const outputDir = 'dist';
const staticFiles = ['index.html', 'database.html', 'styles.css', '.nojekyll', 'data'];
const sourceFiles = ['src/app.mjs', 'src/data.mjs', 'src/database.mjs'];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
mkdirSync(`${outputDir}/src`, { recursive: true });

for (const entry of staticFiles) {
  cpSync(entry, `${outputDir}/${entry}`, { recursive: true });
}

for (const entry of sourceFiles) {
  cpSync(entry, `${outputDir}/${entry}`);
}
