const iterator = require("./iterator")
const throwError = require("./throwError")

/**
 * @typedef { { type: string, value: string | number, depth?: number } } Token
 */


/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { Token } endat 
 * 
 * @returns { Token[] }
 */
const accumulate_tokens = (iterable, endat) => {
    let tokens = []
    if (endat.depth) while (iterable.next()) {
        let curr = iterable.next()
        if (curr.type == endat.type && curr.value == endat.value && curr.depth == endat.depth) break

        tokens.push(curr)
        iterable.move()
    } else while (iterable.next()) {
        let curr = iterable.next()
        if (curr.type == endat.type && curr.value == endat.value) break

        tokens.push(curr)
        iterable.move()
    }

    return tokens
}

/**
 * 
 * @param { Token[]} tokens
 * @param { number } depth 
 * @returns  { Token[] }
 */
const parse_params = (tokens, depth) => {
    let params = []
    let i = 0;
    let new_depth = depth
    while (tokens.length) {
        if(tokens[i].value == '(') {
            new_depth++
        } else if(tokens[i].value == ')') {
            new_depth--
        } else if(tokens[i].value == ',') {
            if(new_depth == depth) {
                params.push(tokens.splice(0, i))
                tokens.shift()
            }
            i = -1
        }

        i++

        if(tokens.length - 1 == i) {
            params.push(tokens.splice(0, tokens.length))
        }
    }

    return params
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { ?Token } prev 
 * @param { Token } endat
 */
const to_ast = (iterable, prev = null, endat) => {
    let curr = iterable.next()
    if (!curr || (curr.type == endat.type && curr.value == endat.value)) return prev
    iterable.move()

    if (['variable', 'number', 'string', 'boolean'].includes(curr.type)) {
        if (!prev) {
            return to_ast(iterable, { type: curr.type, value: curr.value }, endat)
        }
    } else if (curr.type == 'assignment') {
        if (curr.value == '=') {
            if (!prev) throwError()
            let next = accumulate_tokens(iterable, endat)
            return to_ast(iterable, { type: 'assignment', rhs: prev, lhs: next }, endat)
        } else if (curr.value == '->') {
            if (!prev) throwError()
            let next = accumulate_tokens(iterable, endat)
            return to_ast(iterable, { type: 'assignment2', rhs: prev, lhs: next }, endat)
        }
    } else if (curr.type == 'bracket') {
        if (curr.value == '(') {   
            if (prev) {
                let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })
                iterable.move()
                return to_ast(iterable, { type: 'call', value: prev, args: parse_params(args, curr.depth) }, endat)
            }
        }
    } else if (curr.type == 'keyword') {
        if(curr.value == 'hoist') {
            return to_ast(iterable, { type: 'hoist', value: to_ast(iterable, null, endat) }, endat)   
        }
    }
}
/**
 * 
 * @param { Token[] } tokens 
 */
const parse = (tokens) => {
    let iter = iterator(tokens)

    while (iter.next()) {
        console.log(
            to_ast(iter, null, { type: 'delim', value: ';' })
            )
        iter.move()
    }
}

module.exports = parse