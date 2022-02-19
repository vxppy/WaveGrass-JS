const iterator = require("./iterator")
const throwError = require("./throwError")

const keyword = [
    "if", "else", "define", "catch", "try", "break", "return", "continue", "let", "const", "hoist"
]
const brackets_map = {
    '()': 0,
    '{}': 0,
    '[]': 0,
    '<>': 0,
}

const char_map = {
    't': '\t',
    's': '\s',
    '\\': '\\'
}

/**
 * 
 * @returns { number }
 */
const brackets_map_sum = () => {
    let sum = 0
    for (const i in brackets_map) {
        sum += brackets_map[i]
    }
    return sum
}

let brackets_map_key = Object.keys(brackets_map)


/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } delim
 * 
 * @returns { { type: 'string', value: string } }
 */
const parseString = (iterable, delim) => {
    let ret = []

    let prev
    while (iterable.next()) {
        let curr = iterable.next()

        if (curr == delim) {
            if (prev && prev != '\\') break
            else ret.push(curr)
        }

        if (curr != '\\') if (prev && prev == '\\') {
            ret.push(char_map[curr])
        } else ret.push(curr)
        iterable.move()

        prev = curr
    }

    iterable.move()
    ret = ret.join('')

    return { type: 'string', value: ret }
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current 
 * @param { boolean } [dot=false]
 * 
 * @returns { { type: 'number', value: number } }
 */
const parseNum = (iterable, current, dot = false) => {
    let ret = [current]

    while (iterable.next()) {
        let curr = iterable.next()
        if (!/[0-9]/.test(curr)) break

        if (dot) {
            if (curr == '.') throwError()
        } else {
            if (curr == '.') dot = true
        }

        ret.push(curr)
        iterable.move()
    }

    ret = ret.join('')
    ret = ret.includes('.') ? parseFloat(ret) : parseInt(ret)

    return { type: 'number', value: ret }
}
/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current 
 * 
 * @returns { { type: 'keyword' | 'variable' | 'boolean' , value: string } }
 */
const parseName = (iterable, current) => {
    let ret = [current]

    while (iterable.next()) {
        let curr = iterable.next()

        if (!/[a-zA-Z0-9]/.test(curr)) break

        ret.push(curr)
        iterable.move()
    }

    ret = ret.join('')

    let type;
    if (['true' | 'false'].includes(ret)) {
        type = 'boolean'
    } else if (keyword.includes(ret)) {
        type = 'keyword'
    } else type = 'variable'

    return { type: type, value: ret }
}

/**
 * @param { string } fileContent The content of the file being lexed
 * @returns { boolean }
 */
const lex = (fileContent) => {
    let iter = iterator(fileContent)
    /** @type { { type: string, value: string | number, depth?: number }[] } */
    let tokens = []

    while (iter.next()) {
        let curr = iter.next()
        iter.move()

        if (curr == '\n') {
            let next = ' ';
            while (next == ' ') {
                next = iter.next()
                if (next != ' ') break
                iter.move()
            }
            let prev = tokens[tokens.length - 1].value

            if (!('({[.'.includes(next) || prev == '=' || brackets_map_sum())) {
                tokens.push({ type: 'delim', value: ';' })
            }
        } else if (/[0-9]/.test(curr)) {
            tokens.push(parseNum(iter, curr))
        } else if (/[#_a-zA-Z]/.test(curr)) {
            tokens.push(parseName(iter, curr))
        } else if ('"\'`'.includes(curr)) {
            tokens.push(parseString(iter, curr))
        } else if (curr == '.') {
            if (/[0-9]/.test(iter.next())) {
                tokens.push(parseNum(iter, curr, true))
            } else {
                tokens.push({ type: 'symbol', value: '.' })
            }
        } else if (':?!@,'.includes(curr)) {
            tokens.push({ type: 'symbol', value: curr })
        } else if ('=' == curr) {
            if (iter.next() == '=') {
                tokens.push({ type: 'comparator', value: '==' })
                iter.move()
            } else {
                tokens.push({ type: 'symbol', value: '=' })
            }
        } else if ('+/-*^~'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=' })
                iter.move()
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('&|'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=' })
                iter.move()
            } else if (iter.next() == curr) {
                iter.move()
                if (iter.next() == '=') {
                    tokens.push({ type: 'assignment', value: curr + curr + '=' })
                    iter.move()
                } else {
                    tokens.push({ type: 'comparator', value: curr + curr })
                }
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('<>'.includes(curr)) {
            if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr })
                iter.move()
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('[{()}]'.includes(curr)) {
            let type = brackets_map_key.find(i => i.includes(curr))
            tokens.push({ type: 'bracket', value: curr, depth: curr == type[0] ? brackets_map[type]++ : --brackets_map[type] })
        }
    }

    if (tokens[tokens.length - 1].type != 'delim') tokens.push({ type: 'delim', value: ';' })
    console.log(tokens)

    //parsing after each token is lexed to support hoisting

    return true
}

module.exports = lex