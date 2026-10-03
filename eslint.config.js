export default [
    {
        ignores: ['dist/**', 'node_modules/**']
    },
    {
        files: ['src/**/*.js', 'scripts/**/*.mjs', 'vite.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                AbortController: 'readonly',
                Blob: 'readonly',
                Event: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                console: 'readonly',
                GM: 'readonly',
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
                GM_xmlhttpRequest: 'readonly',
                GM_registerMenuCommand: 'readonly'
            }
        },
        rules: {
            'eqeqeq': 'error',
            'no-constant-binary-expression': 'error',
            'no-duplicate-imports': 'error',
            'no-empty': 'error',
            'no-shadow': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            'no-useless-catch': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-const': 'error'
        }
    }
];
