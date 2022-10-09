const { WaveGrassError } = require("./wavegrassObject")
const fs = require('fs')

/**
 * 
 * @param { WaveGrassError } name 
 */
const throwError = (name) => {
    const content = fs.readFileSync(WaveGrassError.fileStack[WaveGrassError.fileStack.length - 1], 'utf-8').split(/\r?\n/g)
    process.stdout.write(`${name.__line} | ${content[name.__line - 1]}
${' '.repeat(name.__col + (name.__line.toString() + ' | ').length)}^
${name.__title__()}: ${name.__value_of__()}
\t\x1b[38;5;8mat ${WaveGrassError.trace.length ? WaveGrassError.trace.reverse().slice(0, 10).join('\n\tat') : `${WaveGrassError.fileStack[WaveGrassError.fileStack.length - 1]}:${name.__line}:${name.__col}`}\x1b[0m`)
    process.exit(1)
}

module.exports = throwError
