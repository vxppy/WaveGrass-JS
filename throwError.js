const throwError = (message, filedata, line, col) => {
    if (!message) {
        process.stdout.write(`Error`)
        process.exit(1)
    }

    process.stdout.write(`${line} | ${filedata.lines[line - 1]}
${' '.repeat(col + line.toString().length + '| '.length)}^
${message}
\tat ${filedata.file}`)
process.exit(1)
}

module.exports = throwError