const fs = require('fs');
const postcss = require('postcss');
const atImport = require('postcss-import');
const pcss = fs.readFileSync('./src/style.pcss', 'utf8');

postcss().use(atImport()).process(pcss, {
  from: './src/style.pcss',
});

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    //require('autoprefixer')
  ],
};
