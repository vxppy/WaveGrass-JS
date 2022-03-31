const { WaveGrassError } = require("./wavegrassObjects")

/**
 * 
 * @param { WaveGrassError } name 
 */
const throwError = (name) => {
    if(!name) throw Error()

    process.stdout.write(`${name.__line} | ${WaveGrassError.lines[name.__line - 1]}
${' '.repeat(name.__col + (name.__line.toString() + ' | ').length)}^
${name.__title__()}: ${name.__value_of__()}
\t\x1b[38;5;8mat ${WaveGrassError.trace.length ? WaveGrassError.trace.reverse().slice(0, 10).join('\n\tat') : `${WaveGrassError.file}:${name.__line}:${name.__col}`}\x1b[0m`)
    process.exit(1)
}

module.exports = throwError
