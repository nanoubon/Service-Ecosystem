import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/public/mockServiceWorker.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    // Mock rule: pages/components must go through src/api, never import mocks directly
    files: ['apps/enco-xp/src/pages/**', 'apps/enco-xp/src/components/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [
        { group: ['@enco/mocks', '@enco/mocks/*', '**/mocks', '**/mocks/**'], message: 'Use src/api instead of importing mocks.' },
      ] }],
    },
  },
  { files: ['**/*.config.{js,ts}'], languageOptions: { globals: globals.node } },
);
