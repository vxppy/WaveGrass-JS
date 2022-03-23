const execute = require("./execute")
const iterator = require("./iterator")
const throwError = require("./throwError")

/**
 * @typedef { { type: string, value: string | number, depth?: number } } Token
 */

const precedence = {
    7: [':', '='],
    6: ['(', '['],
    5: ['!'],
    4: ['*', '/'],
    3: ['+', '-'],
    2: ['==', '!=', '>', '<', '>=', '<='],
    1: ['&&', '||']
}


/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { Token } endat 
 * 
 * @returns { Token[] }
 */
const accumulate_tokens = (iterable, endat, depth) => {
    let tokens = []
    if (endat.depth !== null) while (iterable.next()) {

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
    if (array.length == 0) {
        return []
    }
    if (array.length == 1) {
        return array[0]
    }
    let oper = 7
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
                                type: 'call', value: array[i - 1],
                                args: parse_params(array.splice(i + 1, i2 - i - 1))
                            })
                        i--
                    } else {
                        array.splice(i, 2, {
                            operation: 'brackets',
                            value: parse_operators(array.splice(i + 1, i2 - i - 1))
                        })
                    }
                } else if (array[i].value == '[') {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].value == ']' && array[j].depth == array[i].depth) {
                            i2 = j
                            break
                        }
                    }
                    if (i2 == -1) {

                    }

                    array.splice(i, 2, {
                        type: 'array',
                        values: parse_array(array.splice(i + 1, i2 - i - 1))
                    })

                } else if (array[i].value == '!') {
                    if(array[i + 1].value == '(') {
                        for (let j = i + 2; j < array.length; j++) {
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
                            array.splice(i + 1, 2, {
                                operation: 'brackets',
                                value: parse_operators(array.splice(i + 1, i2 - i - 1))
                            })
                        }
                        array.slice(i, 2, { operation: array[i], value: array[i + 1]})
                    } else array.splice(i, 2, { operation: array[i], value: array[i + 1]})
                    i--
                } else {
                    if (!array[i - 1]) {

                    } else if (!array[i + 1]) {

                    } else {
                        array.splice(i - 1, 3, { operation: array[i], lhs: array[i - 1], rhs: array[i + 1] })
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
const parse_params = (tokens) => {
    let params = []
    let i = 0;
    while (tokens.length) {
        if (tokens[i].value == '(') {
            let i2 = -1
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].value == ')' && tokens[j].depth == tokens[i].depth) {
                    i2 = j
                    break
                }
            }
            if (i2 == -1) {

            }

            if (tokens?.[i - 1] && (tokens[i - 1]?.operation == 'brackets' || ['variable', 'number', 'string'].includes(tokens[i - 1].type))) {
                tokens.splice(i - 1, 3,
                    {
                        operation: 'call', variable: tokens[i - 1],
                        params: parse_params(tokens.splice(i + 1, i2 - i - 1))
                    })
                i--
            } else {
                tokens.splice(i, 2, {
                    operation: 'brackets',
                    value: parse_operators(tokens.splice(i + 1, i2 - i - 1))
                })
            }
            params.push(tokens.shift())
            i = 0
        } else if (tokens[i].value == ',') {
            params.push(parse_operators(tokens.splice(0, i)))
            tokens.shift()
            i = 0
        }

        i++

        if(!tokens.length) break

        if (tokens.length - 1 <= i) {
            params.push(parse_operators(tokens.splice(0, tokens.length)))
        }
    }

    return params
}

const parse_array = (tokens) => {
    let params = []
    let i = 0;
    while (tokens.length) {
        if (tokens[i].value == '[') {
            let i2 = -1
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].value == ']' && tokens[j].depth == tokens[i].depth) {
                    i2 = j
                    break
                }
            }
            if (i2 == -1) {

            }

            tokens.splice(i, 2, {
                type: 'array',
                values: parse_array(tokens.splice(i + 1, i2 - i - 1))
            })

            params.push(tokens.shift())
            i = -1
        
        } else if (tokens[i].value == ',') {
            params.push(parse_operators(tokens.splice(0, i)))
            tokens.shift()
            i = -1
        }

        i++
        if(tokens.length) {
            if (tokens.length - 1 <= i) {
                params.push(parse_operators(tokens.splice(0, tokens.length)))
            }
        }

    }

    params = params.filter(i => !Array.isArray(i))

    return params
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { ?Token } prev 
 * @param { Token } endat
 */
const to_ast = (iterable, prev = null, endat, depth = 0) => {
    let curr = iterable.next()
    if (!curr || (curr.type == endat.type && curr.value == endat.value)) return prev
    iterable.move()

    if (['variable', 'number', 'string', 'boolean'].includes(curr.type)) {
        if (!prev) {
            return to_ast(iterable, { type: curr.type, value: curr.value }, endat, depth)
        }
    } else if (curr.type == 'assignment') {
        if(!prev) throwError()
        if (curr.value == '=') {
            let next = parse_operators(accumulate_tokens(iterable, endat, depth))
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: next }, endat, depth)
        } else if (curr.value == '->') {
            let next = accumulate_tokens(iterable, endat, depth)
            return to_ast(iterable, { type: 'assignment2', lhs: prev, rhs: next }, endat, depth)
        } else {
            let next = parse_operators(accumulate_tokens(iterable, endat, depth))
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: curr.value[0] }, lhs: prev, rhs: next } }, endat, depth)
        }
    } else if (curr.type == 'bracket') {
        let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })
        if (curr.value == '(') {
            iterable.move()
            if (prev) {
                return to_ast(iterable, { type: 'call', value: prev, args: parse_params(args, curr.depth) }, endat, depth)
            }
        }
    } else if (curr.type == 'keyword') {
        if (curr.value == 'hoist') {
            return to_ast(iterable, { type: 'hoist', value: to_ast(iterable, null, endat, depth) }, endat, depth)
        }

        if (curr.value == 'if') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))
            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'if', condition: condition, positive: block }, endat, depth)
        }

        if (curr.value == 'else') {
            if (!prev) {
                throwError()
            } else if (prev.type != 'if') {
                throwError()
            }

            if (!['{', 'if'].includes(iterable.next().value)) {
                throwError()
            }

            let condition = false
            if (iterable.next().value == 'if') {
                iterable.move()
                condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth}))
            }

            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })

            iterable.move()

            let iter = iterator(tokens)
            let block = []

            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            if (prev.negative) {
                let p = prev.negative
                while (true) {
                    if (p.negative) p = p.negative
                    else break
                }

                p.negative = condition ? { condition: condition, positive: block } : block
                return to_ast(iterable, prev, endat, depth)
            } else {
                return to_ast(iterable, { ...prev, negative: condition ? { type: 'if', condition: condition, positive: block } : block }, endat, depth)

            }
        }
    }
}
/**
 * 
 * @param { Token[] } tokens 
 */
const parse = (tokens) => {
    let iter = iterator(tokens)
    let asts = []
    while (iter.next()) {
        asts.push(to_ast(iter, null, { type: 'delim', value: ';' }))
        iter.move()
    }

    execute(asts)
}

module.exports = parse