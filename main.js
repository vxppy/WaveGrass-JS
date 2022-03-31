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

const run = async () => {
    let path = await new Promise((resolve) => {
        fs.realpath(file, (error, path) => {
            resolve(error ? undefined : path)
        })
    })

    if(!path) {
        console.log('File not found. Make sure the file exists')
    } else {
        if(fs.statSync(path).isDirectory()) {
            path += '\\main.wg'

        }

        if(fs.existsSync(path)) await lex(fs.readFileSync(path, 'utf-8'), path)
        else console.log('File not found. Make sure the file exists')
    }
}

run()