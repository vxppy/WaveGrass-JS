const fs = require('fs')
const lex = require('./lexer')

/**
 * @type { string }
 */
let file = ''

if(process.argv.length > 2) {
    file = process.argv[2]
} else {
    file = 'main.wg'
}

if(!file.endsWith('.wg')) {
    file += '.wg'
}


if(fs.existsSync(`./tests/${file}`)) {
    const readAble = fs.readFileSync(`./tests/${file}`, 'utf-8')
    lex(readAble, file)
} else {
    console.log('\nFile not found. Make sure it is in the tests folder with \x1b[1m.wg\x1b[0m extension\n')
}
