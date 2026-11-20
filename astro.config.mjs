// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // El sitio es estático: no hay nada que renderizar en servidor.
  output: 'static',
  // Un solo <head> y un solo bundle: el markup sale igual que el documento original.
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
});
