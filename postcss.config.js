import fs from 'fs';
import postcss from 'postcss';
import atImport from 'postcss-import';
import tailwindcssNesting from 'tailwindcss/nesting/index.js';
import tailwindCss from 'tailwindcss';
const pcss = fs.readFileSync('./src/style.pcss', 'utf8');

postcss().use(atImport()).process(pcss, {
  from: './src/style.pcss',
});

export default {
  plugins: [atImport, tailwindcssNesting, tailwindCss],
};
