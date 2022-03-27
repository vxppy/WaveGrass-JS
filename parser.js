const execute = require("./execute")
const iterator = require("./iterator")
const throwError = require("./throwError")

/**
 * @typedef { { type: string, value: string | number, depth?: number, line: number, col: number } } Token
 */

const precedence = (token) => {
    if (!token) return -1

    let value = token.value

    switch (value) {
        case ':':
        case '=':
            return 8
        case '[':
            return 7
        case '**':
        case '++':
        case '--':
            return 6
        case '!':
            return 5
        case '*':
        case '/':
        case '%':
            return 4
        case '+':
        case '-':
            return 3
        case '==':
        case '!=':
        case '<':
        case '>':
        case '>=':
        case '<=':
            return 2
        case '&&':
        case '||':
            return 1
    }

    return -1
}
const non_operator_types = ['number', 'string', 'array', 'boolean', 'call', 'variable']

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { Token } endat 
 * 
 * @returns { Token[] }
 */
const accumulate_tokens = (iterable, endat) => {
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

const to_post_fix_notation = (array, filedata) => {
    let stack = []
    let result = []

    for (let i = 0; i < array.length; i++) {
        let token = array[i]

        if (non_operator_types.includes(token.type)) {
            if (array[i + 1] && array[i + 1].type == 'bracket' && array[i + 1].value == '(') {
                let foundIndex = -1
                for (let j = i + 2; j < array.length; j++) {
                    if (array[j].type == 'bracket' && array[j].value == ')' && array[j].depth == array[i + 1].depth) {
                        foundIndex = j
                    }
                }

                if (!foundIndex) {
                    throwError()
                }

                array.splice(i, 3, {
                    type: 'call', value: array[i],
                    args: parse_params(array.splice(i + 2, foundIndex - i - 2), filedata)
                })
                i--
            } else result.push(token)
        } else if (token.type == 'bracket' && token.value == '(') {
            stack.push(token)
        } else if (token.type == 'bracket' && token.value == ')') {
            while (stack[stack.length - 1].value != '(' && stack[stack.length -  1] != token.depth) {
                result.push(stack.pop())
            }
            stack.pop()
        } else {
            while (stack.length && precedence(token) <= precedence(stack[stack.length - 1])) {
                result.push(stack.pop())
            }
            stack.push(token)
        }
    }

    while (stack.length) {
        result.push(stack.pop())
    }

    return result
}
const parse_operators = (array, filedata) => {
    if(array.length < 1) return []
    if(array.length == 1) return array[0]
    return { type: 'operation', value: to_post_fix_notation(array, filedata) }
}

/**
 * 
 * @param { Token[]} tokens
 * @param { number } depth 
 * @returns  { Token[] }
 */
const parse_params = (tokens, filedata) => {
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
                throwError('EOF Error', 'Unexpected End of file', filedata, params[0].line, params[0].col)
            }

            if (tokens?.[i - 1] && (tokens[i - 1]?.operation == 'brackets' || ['variable', 'number', 'string'].includes(tokens[i - 1].type))) {
                tokens.splice(i - 1, 3,
                    {
                        type: 'call', value: tokens[i - 1],
                        args: parse_params(tokens.splice(i + 1, i2 - i - 1), filedata)
                    })
                i--
            } else {
                tokens.splice(i, 2, parse_operators(tokens.splice(i + 1, i2 - i - 1), filedata))
            }
            params.push(tokens.shift())
            i = 0
        } else if (tokens[i].value == ',') {
            params.push(parse_operators(tokens.splice(0, i), filedata))
            tokens.shift()
            i = 0
        }


        if (tokens[i]?.value == '.') {
            let r = parse_params(tokens.slice(i + 1, tokens.length))[0]
            params.push({ operation: { type: 'property' }, lhs: tokens.splice(i - 1, 1)[0], rhs: r })
            i--
        }
        i++

        if (!tokens.length) break

        if (tokens.length - 1 <= i) {
            params.push(parse_operators(tokens.splice(0, tokens.length), filedata))
        }
    }

    return params
}

const parse_array = (tokens, filedata) => {
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
                throwError('EOF Error', 'Unexpected End of File', filedata, params[0].line, params[0].col)
            }

            tokens.splice(i, 2, {
                type: 'array',
                values: parse_array(tokens.splice(i + 1, i2 - i - 1), filedata)
            })

            params.push(tokens.shift())
            i = -1

        } else if (tokens[i].value == ',') {
            params.push(parse_operators(tokens.splice(0, i), filedata))
            tokens.shift()
            i = -1
        }

        i++
        if (tokens.length) {
            if (tokens.length - 1 <= i) {
                params.push(parse_operators(tokens.splice(0, tokens.length), filedata))
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
const to_ast = (iterable, prev = null, endat, depth = 0, filedata) => {
    let curr = iterable.next()
    if (!curr || (curr.type == endat.type && curr.value == endat.value)) return prev
    iterable.move()

    if (['variable', 'number', 'string', 'boolean'].includes(curr.type)) {
        if (!prev) {
            return to_ast(iterable, { type: curr.type, value: curr.value }, endat, depth, filedata)
        }
    } else if (curr.type == 'assignment') {
        if (!prev) throwError('Syntax Error', 'Unexpected token \'=\'', filedata, curr.line, curr.col)
        if (curr.value == '=') {
            let next = parse_operators(accumulate_tokens(iterable, endat), filedata)
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: next }, endat, depth, filedata)
        } else if (curr.value == '->') {
            let next = accumulate_tokens(iterable, endat, filedata)
            return to_ast(iterable, { type: 'assignment2', lhs: prev, rhs: next }, endat, depth, filedata)
        } else {
            let next = parse_operators(accumulate_tokens(iterable, endat), filedata)
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: curr.value[0] }, lhs: prev, rhs: next } }, endat, depth, filedata)
        }
    } else if (curr.type == 'bracket') {
        let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })
        if (curr.value == '(') {
            iterable.move()
            if (prev) {
                return to_ast(iterable, { type: 'call', value: prev, args: parse_params(args, curr.depth, filedata) }, endat, depth, filedata)
            }
        }
    } else if (curr.type == 'keyword') {
        if (curr.value == 'hoist') {
            return to_ast(iterable, { type: 'hoist', value: to_ast(iterable, null, endat, depth, filedata) }, endat, depth, filedata)
        } else if (curr.value == 'return') {
            return to_ast(iterable, { type: 'return', value: parse_operators(accumulate_tokens(iterable, endat), filedata) }, endat, depth, filedata)
        } else if (curr.value == 'if') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }), filedata)
            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1, filedata)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'if', condition: condition, positive: block }, endat, depth, filedata)
        } else if (curr.value == 'else') {
            if (!prev) {
                throwError('Syntax Error', 'Unexpected else token', filedata, curr.line, curr.col)
            } else if (prev.type != 'if') {
                throwError('Syntax Error', 'Unexpected else token', filedata, curr.line, curr.col)
            }

            if (!['{', 'if'].includes(iterable.next().value)) {
                throwError('Syntax Error', 'Unexpected else token', filedata, iter.next().line, iter.next().col)
            }

            let condition = false
            if (iterable.next().value == 'if') {
                iterable.move()
                condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }), filedata)
            }

            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })

            iterable.move()

            let iter = iterator(tokens)
            let block = []

            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1, filedata)
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
                return to_ast(iterable, prev, endat, depth, filedata)
            } else {
                return to_ast(iterable, { ...prev, negative: condition ? { type: 'if', condition: condition, positive: block } : block }, endat, depth, filedata)

            }
        } else if (curr.value == 'while') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }), filedata)
            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1, filedata)
                if (ast) block.push(ast)
                iter.move()
            }
            return to_ast(iterable, { type: 'while', condition: condition, block: block }, endat, depth, filedata)
        } else if (curr.value == 'for') {
            let cond_data = accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth })

            if (cond_data[0].type == 'bracket' && cond_data[0].value == '(') {
                let token = cond_data[cond_data.length - 1]
                if (token.type != 'bracket' || token.value != ')' || token.depth != cond_data[0].depth) {
                    throwError()
                }
                cond_data = cond_data.splice(1, cond_data.length - 2)
            }

            cond_data = parse_params(cond_data, filedata)

            iterable.move()

            let [loopvar, cond, step] = [...cond_data]

            if(loopvar.type == 'operation') {
                loopvar.value.splice(1, 1, loopvar.value[2], loopvar.value[1])

                let iter = iterator(loopvar.value)
                while (iter.next()) {
                    loopvar = to_ast(iter, null, endat, depth + 1, filedata)
                    iter.move()
                }
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1, filedata)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'for', loopvar: loopvar, condition: cond, change: step, block: block }, endat, depth, filedata)
        } else if (curr.value == 'define') {

            let name = iterable.next()
            iterable.move()

            let args = []
            if (iterable.next().value == '(') {
                iterable.move()
                args = parse_params(accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: depth }), filedata).map(i => {
                    if (i.type != 'variable') throwError()
                    return i.value
                })
                iterable.move()
            }

            if (iterable.next().value != '{') {
                throwError()
            }

            iterable.move()
            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1, filedata)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'assignment', lhs: name, rhs: { type: 'method', args: args, statements: block } }, endat, depth, filedata)
        } else if (curr.value == 'break') {
            return to_ast(iterable, { type: 'break' }, endat, depth, filedata)
        }
    } else if (curr.type == 'operator') {
        if (curr.value == '++') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: '+' }, lhs: prev, rhs: { type: 'number', value: 1 } } }, endat, depth, filedata)
            }
        } else if (curr.value == '--') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: '-' }, lhs: prev, rhs: { type: 'number', value: 1 } } }, endat, depth, filedata)
            }
        }
    }
}
/**
 * 
 * @param { { tokens: Token[], filedata: { lines: string[], name: string } } tokens 
 */
const parse = (tokens) => {
    let iter = iterator(tokens.tokens)
    let asts = []
    while (iter.next()) {
        let value = to_ast(iter, null, { type: 'delim', value: ';' }, 0, tokens.filedata)
        if (value) asts.push(value)
        iter.move()
    }
    execute({ asts: asts, filedata: tokens.filedata })
}

module.exports = parse
