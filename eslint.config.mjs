import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import eslintConfigPrettier from "eslint-config-prettier/flat"
import vitest from '@vitest/eslint-plugin';
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    ignores: [
      '.git',
      '.github',
      '.idea',
      'node_modules',
      'dist',
      'docker',
      'openapi',
      'docs',
      'src/generated-sources',
      '**/*.gitignore',
    ],
  },
  {
    files: ['**/*.vue', '**/*.ts', '**/*.js'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: eslintPluginVue,
      vitest,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
      maxWarnings: 0,
    },
    // Custom rules
    rules: {
      eqeqeq: 'error',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'vue/no-mutating-props': 'off',
      'vue/attribute-hyphenation': [
        'error',
        'always',
        {
          ignore: ['headerClass'], // primevue AccordionTab does not fully support kebap-case props (#1263)
        },
      ],
    },
  },
);
