const fs = require('fs')
const lex = require('./lexer')

/**
 * @type { string }
 */
let file = ''
const version = 'v0.1.2-beta'

if (process.argv.length > 2) {
    if (process.argv[2].startsWith('-')) {
        let token = process.argv[2]
        if (token[1] == 'v' || token.toLowerCase() == '--version') console.log(version)
        if (token == '--node-version') console.log(process.version)
    }
    else file = process.argv[2]
} else {
    file = 'main.wg'
}

const run = async () => {
    let path = await new Promise((resolve) => {
        fs.realpath(file, (error, path) => {
            resolve(error ? undefined : path)
        })
    })

    if (!path) {
        console.error('File not found. Make sure the file exists')
    } else {
        if (fs.statSync(path).isDirectory()) {
            path += '\\main.wg'

        }

        if (fs.existsSync(path)) await lex(fs.readFileSync(path, 'utf-8'), path)
        else console.error('File not found. Make sure the file exists')
    }
}

if (file) run()