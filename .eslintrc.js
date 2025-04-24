module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable the rules causing issues in your project
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/no-unescaped-entities': 'off'
  }
};
