const fs = require('fs')
const postcss = require('postcss')
const atImport = require('postcss-import')
const pcss = fs.readFileSync('./src/style.pcss', 'utf8')

postcss()
  .use(atImport())
  .process(pcss, {
    from: './src/style.pcss',
  })
  .then((result) => {
    const output = result.css
    console.log(output)
  })

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
