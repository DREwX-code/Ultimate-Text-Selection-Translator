import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const bundle = await readFile(new URL('../dist/UTST.user.js', import.meta.url), 'utf8');
const metadataHeaders = bundle.match(/^\/\/ ==UserScript==$/gm) || [];
const version = bundle.match(/^\/\/ @version\s+(.+)$/m)?.[1]?.trim();

if (metadataHeaders.length !== 1) {
    throw new Error(`Expected one userscript metadata header, received ${metadataHeaders.length}`);
}

if (version !== packageJson.version) {
    throw new Error(`Bundle version ${version || 'missing'} does not match package version ${packageJson.version}`);
}

for (const requiredField of ['@name', '@match', '@grant', '@connect']) {
    if (!bundle.includes(`// ${requiredField}`)) {
        throw new Error(`Missing userscript metadata field: ${requiredField}`);
    }
}
