import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const entryPath = 'src/main.js';

const entry = fileURLToPath(
  new URL(`./${entryPath}`, import.meta.url),
);

const source = readFileSync(entry, 'utf8');

const userscriptHeader = source.match(
  /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/,
)?.[0];

if (!userscriptHeader) {
  throw new Error(`Userscript metadata header not found in ${entry}`);
}

const apacheLicenseBlock = `/*
Copyright 2025-2026 Dℝ∃wX

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/`;

export default defineConfig({
  plugins: [
    monkey({
      entry: entryPath,
      userscript: {
        // These values only initialize vite-plugin-monkey.
        // The final userscript header is injected verbatim from the header in src/main.js.
        name: 'Ultimate Text Selection Translator',
        match: ['*://*/*'],
      },
      generate: () => `${userscriptHeader}\n\n${apacheLicenseBlock}`,
      build: {
        fileName: 'UTST.user.js',
        autoGrant: false,
      },
    }),
  ],
  build: {
    minify: false,
    sourcemap: false,
    target: 'es2020',
  },
});