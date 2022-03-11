const iterator = require("./iterator")
const throwError = require("./throwError")

/**
 * @typedef { { type: string, value: string | number, depth?: number } } Token
 */

const precedence = {
    5: ['('],
    4: ['!'],
    3: ['*', '/'],
    2: ['+', '-'],
    1: ['&&', '||'],
}


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
 * @param { Token[] } array 
 */
const parse_operators = (array) => {
    if(array.length == 0) {
        return []
    }
    if(array.length == 1) {
        return array[0]
    }
    let oper = 5
    while (oper) {
        let i = 0
        while (i < array.length) {
            if (precedence[oper].includes(array[i].value)) {
                if (array[i].value == '(') {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].value == ')' && array[j].depth == array[i].depth) {
                            i2 = j
                            break
                        }
                    }
                    if (i2 == -1) {

                    }

                    if (array?.[i - 1] && (array[i - 1]?.operation == 'brackets' || ['variable', 'number', 'string'].includes(array[i - 1].type))) {                        
                        array.splice(i - 1, 3,
                            {
                                operation: 'call', variable: array[i - 1],
                                params: parse_params(array.splice(i + 1, i2 - i - 1))
                            })
                        i--
                    } else {
                        array.splice(i, 2, {
                            operation: 'brackets',
                            value: parse_operators(array.splice(i + 1, i2 - i - 1))
                        })
                    }


                } else if (array[i].value == '!') {

                } else {
                    if (!array[i - 1]) {

                    } else if (!array[i + 1]) {

                    } else {
                        array.splice(i - 1, 3, { operation: array[i], rhs: array[i - 1], lhs: array[i + 1] })
                        i--
                    }
                }
            }
            i++
        }
        oper--
    }

    return array[0]
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
        if (tokens[i].value == '(') {
            new_depth++
        } else if (tokens[i].value == ')') {
            new_depth--
        } else if (tokens[i].value == ',') {
            if (new_depth == depth) {
                params.push(parse_operators(tokens.splice(0, i)))
                tokens.shift()
            }
            i = -1
        }

        i++

        if (tokens.length - 1 == i) {
            params.push(parse_operators(tokens.splice(0, tokens.length)))
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
            let next = parse_operators(accumulate_tokens(iterable, endat))
            return to_ast(iterable, { type: 'assignment', rhs: prev, lhs: next }, endat)
        } else if (curr.value == '->') {
            if (!prev) throwError()
            let next = accumulate_tokens(iterable, endat)
            return to_ast(iterable, { type: 'assignment2', rhs: prev, lhs: next }, endat)
        }
    } else if (curr.type == 'bracket') {
        let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })

        if (curr.value == '(') {
            let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })
            iterable.move()

            if (prev) {
                return to_ast(iterable, { type: 'call', value: prev, args: parse_params(args, curr.depth) }, endat)
            }
        }
    } else if (curr.type == 'keyword') {
        if (curr.value == 'hoist') {
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
            // JSON.stringify(
                to_ast(iter, null, { type: 'delim', value: ';' })
                // , null, '\t').replace(/"(\w+)":/g, '$1:')
        )
        iter.move()
    }
}

module.exports = parse