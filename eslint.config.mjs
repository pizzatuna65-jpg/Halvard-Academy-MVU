// Lightweight rules for handwritten JavaScript sources. Generated files are checked by tests/lint.cjs.
export default [{
  files: ['src/scripts/*.template.js', 'src/scripts/mood_gifts.js'],
  languageOptions: { ecmaVersion: 'latest' },
  rules: {
    'no-dupe-args': 'error',
    'no-duplicate-case': 'error',
    'no-func-assign': 'error',
    'no-unreachable': 'error',
    'valid-typeof': 'error',
  },
}];
