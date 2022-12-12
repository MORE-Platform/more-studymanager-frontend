const fs = require('fs')
const postcss = require('postcss')
const atImport = require('postcss-import')
const pcss = fs.readFileSync('./src/style.pcss', 'utf8')

postcss()
  .use(atImport())
  .process(pcss, {
    from: './src/style.pcss',
  })

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
