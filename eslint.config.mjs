import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginAstro from 'eslint-plugin-astro'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: ['dist/', 'dev-dist/', '.astro/', 'node_modules/', '.git/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx,astro}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    // React specific configuration
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      // Override/disable rules for Astro files if needed
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in Astro/modern React
      'react/prop-types': 'off', // We use TypeScript
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]
