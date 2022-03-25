const throwError = (name, message, filedata, line, col) => {
    if (!message) {
        throw new Error()
    }

    process.stdout.write(`${line} | ${filedata.lines[line - 1]}
${' '.repeat(col + (line.toString() + '| ').length)}^
${name}: ${message}
\t\x1b[38;5;8mat ${filedata.file}\x1b[0m`)
process.exit(1)
}

module.exports = throwError
