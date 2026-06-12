import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react },
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Cuenta los componentes usados en JSX como "usados" (evita falsos no-unused-vars).
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      // Permite catch vacíos intencionales (fallos de carga silenciosos).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Reglas heurísticas de react-hooks v7 → advertencias, no errores.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
])
