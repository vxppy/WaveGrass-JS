const iterator = require("./iterator")
const parse = require("./parser")
const throwError = require("./throwError")

const keyword = [
    "if", "else", "define", "catch", "try", "break", "return", "continue", "let", "const", "hoist", 'while', 'for'
]
const brackets_map = {
    '()': 0,
    '{}': 0,
    '[]': 0,
}

const char_map = {
    't': '\t',
    's': '\s',
    '\\': '\\'
}

// /**
//  * 
//  * @returns { number }
//  */
// const brackets_map_sum = () => {
//     let sum = 0
//     for (const i in brackets_map) {
//         sum += brackets_map[i]
//     }
//     return sum
// }

let brackets_map_key = Object.keys(brackets_map)


/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } delim
 * @param { string } [type='string']
 * @param { line } line
 * @param { line } col
 * 
 * @returns { { type: string, value: string } }
 */
const parseDelim = (iterable, delim, type = 'string', line, col, filedata) => {
    let ret = []
    let change = 0
    let prev
    while (iterable.next()) {
        change++
        let curr = iterable.next()

        if (curr == delim) {
            if (prev != '\\') break
            else ret.push(curr)
        }

        if (curr != '\\') if (prev && prev == '\\') {
            change++
            ret.push(char_map[curr])
        } else ret.push(curr)
        iterable.move()

        prev = curr
    }

    if (!iterable.next()) {
        throwError('EOF Error', 'Unexpected end of file', filedata, line, col)
    }
    // console.log(iterable.next())

    iterable.move()
    ret = ret.join('')

    return { data: { type: type, value: ret, line: line, col: col }, change: change }
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current 
 * @param { boolean } [dot=false]
 * @param { number } line
 * @param { number } col
 * 
 * @returns { { type: 'number', value: number, line: number, col: number } }
 */
const parseNum = (iterable, current, dot = false, line, col, filedata) => {
    let ret = [current]
    let change = 0

    while (iterable.next()) {
        let curr = iterable.next()
        change++
        if (!/[0-9]/.test(curr)) break

        if (dot) {
            if (curr == '.') {
                throwError('Syntax Error', 'Unexpected property accessor', filedata, line, col)
            }
        } else {
            if (curr == '.') dot = true
        }

        ret.push(curr)
        iterable.move()
    }

    ret = ret.join('')
    ret = ret.includes('.') ? parseFloat(ret) : parseInt(ret)

    return { data: { type: 'number', value: ret, line: line, col: col }, change: change }
}
/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current
 * @param { number } line
 * @param { number } col
 * 
 * @returns { { type: 'keyword' | 'variable' | 'boolean' , value: string, line: number, col: number } }
 */
const parseName = (iterable, current, line, col) => {
    let ret = [current]
    let change = 0

    while (iterable.next()) {
        let curr = iterable.next()
        change++

        if (!/[_a-zA-Z0-9]/.test(curr)) break

        ret.push(curr)
        iterable.move()
    }

    ret = ret.join('')

    let type;
    if (['true', 'false'].includes(ret)) {
        type = 'boolean'
    } else if (keyword.includes(ret)) {
        type = 'keyword'
    } else type = 'variable'

    return { data: { type: type, value: ret, line: line, col: col }, change: change }
}

/**
 * @param { string } fileContent The content of the file being lexed
 * @returns { boolean }
 */
const lex = (fileContent, file) => {
    let line = 1, col = 0
    let iter = iterator(fileContent)
    let filedata = {
        lines: fileContent.split('\n'),
        file: file
    }
    /** @type { import("./parser").Token[] } */
    let tokens = []

    while (iter.next()) {
        let curr = iter.next()
        iter.move()

        if (curr == '\n') {
            line++
            col = 1
            if (tokens.length) {
                let next = ' ';
                while (next == ' ') {
                    next = iter.next()
                    if (next != ' ') break
                    iter.move()
                }
                let prev = tokens[tokens.length - 1]

                if (!('({[.'.includes(next) || ['assigment', 'brackets', 'operator', 'comparator'].includes(prev.type) || ',.'.includes(prev.value) || brackets_map['()'] || brackets_map['[]'])) {
                    tokens.push({ type: 'delim', value: ';', line: line, col: col })
                }
            }
        } else if (/[0-9]/.test(curr)) {
            let value = parseNum(iter, curr, false, line, col, filedata)
            col += value.change
            tokens.push(value.data)
        } else if (/[#_a-zA-Z]/.test(curr)) {
            let value = parseName(iter, curr, line, col)
            col += value.change
            tokens.push(value.data)
        } else if ('"\'`'.includes(curr)) {
            let value = parseDelim(iter, curr, 'string', line, col, filedata)
            col += value.change
            tokens.push(value.data)
        } else if (curr == '.') {
            if (/[0-9]/.test(iter.next())) {
                let value = parseNum(iter, curr, true, line, col, filedata)
                col += value.change
                tokens.push(value.data)
            } else {
                tokens.push({ type: 'symbol', value: '.', line: line, col: col })
            }
        } else if (':?@,'.includes(curr)) {
            tokens.push({ type: 'symbol', value: curr, line: line, col: col })
        } else if ('=' == curr) {
            if (iter.next() == '=') {
                tokens.push({ type: 'comparator', value: '==', line: line, col: col })
                iter.move()
                col++
            } else {
                tokens.push({ type: 'assignment', value: '=', line: line, col: col })
            }
        } else if ('^~!'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('+*-%'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                iter.move()
                col++
            }
            else
                tokens.push({ type: 'operator', value: curr, line: line, col: col })
        } else if ('&|'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == curr) {
                iter.move()
                col++
                if (iter.next() == '=') {
                    tokens.push({ type: 'assignment', value: curr + curr + '=', line: line, col: col })
                    iter.move()
                    col++
                } else {
                    tokens.push({ type: 'comparator', value: curr + curr, line: line, col: col })
                }
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('<>'.includes(curr)) {
            if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == '=') {
                tokens.push({ type: 'comparator', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else {
                tokens.push({ type: 'comparator', value: curr, line: line, col: col })
            }
        } else if ('[{()}]'.includes(curr)) {
            let type = brackets_map_key.find(i => i.includes(curr))
            tokens.push({ type: 'bracket', value: curr, depth: curr == type[0] ? brackets_map[type]++ : --brackets_map[type], line: line, col: col })
        } else if (';' == curr) {
            tokens.push({ type: 'delim', value: curr, line: line, col: col })
        } else if ('/' == curr) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + curr + '=', line: line, col: col })
                iter.move()
                col++
            }
            else if (iter.next() == curr) {
                while (iter.next() != '\n') {
                    iter.move()
                }
                line++
                col = 0
                iter.move()
            } else if (iter.next() == '*') {
                while (true) {
                    col++
                    let curr = iter.next()
                    if (!curr) {
                        throwError('EOF Error', 'Unexpected end of file', filedata, line, col)
                    }
                    iter.move()
                    if (curr == '*' && iter.next() == '/') {
                        break
                    }

                    if (curr == '\n') {
                        line++
                        col = 0
                    }
                }
                col++
                iter.move()
            } else {
                tokens.push({ type: 'operator', value: '/', line: line, col: col })
            }
        } else if ('-' == curr) {
            if (iter.next() == '>') {
                iter.move()
                col++
                tokens.push({ type: 'assignment', value: '->', line: line, col: col })
            } else {
                tokens.push({ type: 'operator', value: curr, line: line, col: col })
            }
        }
        col++
    }

    if (tokens.length) {
        if (tokens[tokens.length - 1].type != 'delim') tokens.push({ type: 'delim', value: ';', line: line, col: col })
    }

    parse({ tokens: tokens, filedata: filedata })
    return true
}

module.exports = lex
