const fs = require('fs')
const lex = require('./lexer')

/**
 * @type { string }
 */
let file = ''

if (process.argv.length > 2) {
    file = process.argv[2]
} else {
    file = 'main.wg'
}

let readAble;
if (/\w:/.test(file)) {
    if (fs.existsSync(`${file}`)) {
        readAble = fs.readFileSync(`${file}`, 'utf-8')
    }
} else {
    if (fs.existsSync(`./${file}`)) {
        readAble = fs.readFileSync(`./${file}`, 'utf-8')
    }
}

if (readAble) lex(readAble, file)
else {
    console.log('\nFile not found. Make sure the file exists')
}
