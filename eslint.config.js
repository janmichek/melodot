import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'build',
      '*.tsbuildinfo',
      'node_modules',
      'generated.ts',
      'src/generated.ts',
      'typechain-types',
      'contracts',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'tailwind.config.ts',
      'postcss.config.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '.vercel',
      '.cache',
      '.turbo',
      'coverage',
      '.DS_Store',
      '*.log',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'warn',
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-closing-bracket-location': ['error', 'after-props'],
      'react/jsx-closing-tag-location': 'error',
      'react/jsx-max-props-per-line': ['error', {
        maximum: 1,
        when: 'multiline',
      }],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // General rules
      'semi': ['error', 'never'],
      'max-len': ['error', {
        code: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
      'no-console': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      // Disabled: CSS files need relative imports, and test files use relative imports for page objects
      'no-restricted-imports': 'off',
      'camelcase': ['error', {
        properties: 'never',
      }],
      'object-curly-spacing': ['error', 'never'],
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['warn', 'all'],
      'no-unused-expressions': 'warn',
    },
  }
);
