/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const MorePreset = definePreset(Aura, {
  primitive: {
    fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  options: {
    cssLayer: false
  },
  semantic: {
    borderRadius: {
      xsmall: '1px',
      small: '1.5px',
      medium: '2px',
      large: '3px',
      xlarge: '4px',
    },
    primary: {
      50: '#f1f4f7',
      100: '#d4dde6',
      200: '#b7c7d6',
      300: '#9ab1c5',
      400: '#7d9ab4',
      500: '#6E8FAC',
      600: '#63819b',
      700: '#4d6478',
      800: '#374856',
      900: '#212b34',
      950: '#161d22',
    },
    error: {
      50: '#fbf1f1',
      100: '#f7e3e3',
      200: '#eec8c8',
      300: '#e6acac',
      400: '#dd9191',
      500: '#d57575',
      600: '#aa5e5e',
      700: '#804646',
      800: '#552f2f',
      900: '#2b1717',
      950: '#1a0d0d',
    },
    success: {
      50: '#f2faf9',
      100: '#c9e5d1',
      200: '#a5d3b3',
      300: '#81c195',
      400: '#5db076',
      500: '#4BA767',
      600: '#3c8652',
      700: '#2d643e',
      800: '#1e4329',
      900: '#0f2115',
      950: '#08110b',
    },
    warn: {
      50: '#fcf7f0',
      100: '#f8eee0',
      200: '#f1ddc1',
      300: '#ebcca2',
      400: '#e4bb83',
      500: '#ddaa64',
      600: '#b18850',
      700: '#85663c',
      800: '#584428',
      900: '#2c2214',
      950: '#1a140c',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8f9fa',
          100: '#f1f1f1',
          200: '#e2e2e2',
          300: '#c6c6c6',
          400: '#a9a9a9',
          500: '#8d8d8d',
          600: '#707070',
          700: '#5a5a5a',
          800: '#434343',
          900: '#2d2d2d',
          950: '#1a1a1a',
        },
      },
    },
  },
});
