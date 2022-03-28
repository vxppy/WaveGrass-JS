const execute = require("./execute")
const iterator = require("./iterator")
const throwError = require("./throwError")
const { WaveGrassError } = require("./wavegrassObjects")

/**
 * @typedef { { type: string, value: string | number, depth?: number, line: number, col: number } } Token
 */

const precedence = (token) => {
    if (!token) return -1

    let value = token.value

    switch (value) {
        case ':':
        case '=':
            return 10
        case '[':
            return 9
        case '**':
        case '++':
        case '--':
            return 8
        case '!':
        case '!!':
        case '~~':
        case '~':
            return 7
        case '*':
        case '/':
        case '%':
            return 6
        case '+':
        case '-':
            return 5
        case '<<':
        case '>>':
        case '>>>': 
            return 4
        case '&': 
        case '^':
        case '|':
            return 3
        case '===':
        case '==':
        case '!=':
        case '!==':
        case '<':
        case '>':
        case '>=':
        case '<=':
        case 'in':
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

    if (!iterable.next()) {
        throwError(new WaveGrassError('Syntax Error', `Expected a '${endat.value}'`, iterable.curr().col, iterable.curr().line))
    }
    return tokens
}

/**
 * 
 * @param { Token[] } array 
 */

const to_post_fix_notation = (array) => {
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
                    throwError(new WaveGrassError('EOF Error', 'Unexpected end of input', array[i + 1].col, array[i - 1].col))
                }

                array.splice(i, 3, {
                    type: 'call', value: array[i],
                    args: parse_params(array.splice(i + 2, foundIndex - i - 2))
                })
                i--
            } else result.push(token)
        } else if (token.type == 'bracket' && token.value == '(') {
            stack.push(token)
        } else if (token.type == 'bracket' && token.value == ')') {
            while (stack[stack.length - 1].value != '(' && stack[stack.length - 1] != token.depth) {
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
const parse_operators = (array) => {
    if (array.length < 1) return { token: 'missing' }
    if (array.length == 1) return array[0]
    return { type: 'operation', value: to_post_fix_notation(array) }
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
        if (tokens[i].value == ',') {
            let value = parse_operators(tokens.splice(0, i))

            params.push(value)
            tokens.shift()
            i = 0
        } else if (tokens[i].value == '(') {
            let i2 = -1
            for (let j = i + 1; j < tokens.length; j++) {
                if (tokens[j].value == ')' && tokens[j].depth == tokens[i].depth) {
                    i2 = j
                    break
                }
            }
            if (i2 == -1) {
                throwError(new WaveGrassError('EOF Error', 'Unexpected End of file', params[0].line, params[0].col))
            }

            if (tokens?.[i - 1] && (tokens[i - 1]?.operation == 'brackets' || ['variable', 'number', 'string'].includes(tokens[i - 1].type))) {
                tokens.splice(i - 1, 3,
                    {
                        type: 'call', value: tokens[i - 1],
                        args: parse_params(tokens.splice(i + 1, i2 - i - 1))
                    })
                i -= 2
            } else {
                tokens.splice(i, 2, parse_operators(tokens.splice(i + 1, i2 - i - 1)))
                i--
            }
            params.push(tokens.shift())
            tokens.shift()
            i = 0
        } else {
            i++
        }

        if (tokens[i]?.value == '.') {
            let r = parse_params(tokens.slice(i + 1, tokens.length))[0]
            params.push({ operation: { type: 'property' }, lhs: tokens.splice(i - 1, 1)[0], rhs: r })
            i--
        }

        if (!tokens.length) break

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
                throwError(new WaveGrassError('EOF Error', 'Unexpected End of File', params[0].line, params[0].col))
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
        if (tokens.length) {
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
            return to_ast(iterable, { type: curr.type, value: curr.value, line: curr.line, col: curr.col }, endat, depth)
        }
    } else if (curr.type == 'assignment') {
        if (!prev) throwError(new WaveGrassError('Syntax Error', 'Unexpected token \'=\'', curr.line, curr.col))

        /*TODO
            Implement, multi variable assignemnet
        */
        if (prev.type != 'variable') throwError(new WaveGrassError('TypeError', 'Can only assign values to a variable', prev.col, prev.line))
        if (curr.value == '=') {
            let next = parse_operators(accumulate_tokens(iterable, endat))
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: next }, endat, depth)
        } else if (curr.value == '->') {
            let next = parse_operators(accumulate_tokens(iterable, endat))
            return to_ast(iterable, { type: 'assignment2', lhs: prev, rhs: next }, endat, depth)
        } else {
            let next = parse_operators(accumulate_tokens(iterable, endat))
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
        } else if (curr.value == 'return') {
            return to_ast(iterable, { type: 'return', value: parse_operators(accumulate_tokens(iterable, endat)), line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'if') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))

            if (condition.token == 'missing' || (condition.type == 'operation' && !condition.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Expected a condition after the \`if\` token', curr.col + 2, curr.line))
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

            return to_ast(iterable, { type: 'if', condition: condition, positive: block }, endat, depth)
        } else if (curr.value == 'else') {
            if (!prev) {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', curr.line, curr.col))
            } else if (prev.type != 'if') {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', curr.line, curr.col))
            }

            if (!['{', 'if'].includes(iterable.next().value)) {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', iter.next().line, iter.next().col))
            }

            let condition = false
            if (iterable.next().value == 'if') {
                iterable.move()
                condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))
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
        } else if (curr.value == 'while') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))
            iterable.move()

            if (condition.token == 'missing' || (condition.type == 'operation' && !condition.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Expected a condition \`while\` token', curr.col + 5, curr.line))
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }
            return to_ast(iterable, { type: 'while', condition: condition, block: block }, endat, depth)
        } else if (curr.value == 'for') {
            let cond_data = accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth })

            if (!cond_data.length) {
                throwError(new WaveGrassError('Syntax Error', 'Expected tokens before the \'{\'', curr.col + 3, curr.line))
            }

            if (cond_data[0].type == 'bracket' && cond_data[0].value == '(') {
                let token = cond_data[cond_data.length - 1]
                if (token.type != 'bracket' || token.value != ')' || token.depth != cond_data[0].depth) {
                    throwError(new WaveGrassError('EOF Error', 'Unexpected End of Input', cond[0].col, cond[0].line))
                }
                cond_data = cond_data.splice(1, cond_data.length - 2)
            }

            cond_data = parse_params(cond_data)

            iterable.move()
            let [loopvar, cond, step] = [...cond_data]

            /*TODO
                Implement Second Type of For loop 
            */

            if (!loopvar || loopvar.token == 'missing' || (loopvar.type == 'operation' && !loopvar.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Missing variable for the loop', curr.col + 3, curr.line))
            }

            if (!cond || cond.token == 'missing' || (cond.type == 'operation' && !cond.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Missing condition for the loop', curr.col + 3, curr.line))
            }

            if (!step || step.token == 'missing' || (step.type == 'operation' && !step.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Missing change argument for the loop', curr.col + 3, curr.line))
            }

            if (loopvar.type == 'operation') {
                loopvar.value.splice(1, 1, loopvar.value[2], loopvar.value[1])

                let iter = iterator(loopvar.value)
                while (iter.next()) {
                    loopvar = to_ast(iter, null, endat, depth + 1)
                    iter.move()
                }
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'for', loopvar: loopvar, condition: cond, change: step, block: block }, endat, depth)
        } else if (curr.value == 'define') {

            let name = iterable.next()

            if (!name || name.type != 'variable') {
                throwError(new WaveGrassError('Syntax Error', 'Expected a variable after define', curr.col + 6, curr.line))
            }
            iterable.move()

            let arg_tokens = accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth })
            iterable.move()

            let args = []

            if (arg_tokens.length) {
                if(arg_tokens[0].value != '(') {
                    throwError(new WaveGrassError('Syntax Error', `Expected a '(' but instead got '${arg_tokens[0].value}'`, arg_tokens[0].col, arg_tokens[0].line))
                }
    
                if(arg_tokens[arg_tokens.length - 1].value != ')') {
                    throwError(new WaveGrassError('Syntax Error', `Expected a '(' but instead got '${arg_tokens[arg_tokens.length - 1].value}'`, arg_tokens[arg_tokens.length - 1].col, arg_tokens[arg_tokens.length - 1].line))
                }
    
                if(arg_tokens.pop().depth != arg_tokens.shift().depth) {
                    throwError(new WaveGrassError('Syntax Error', `Unmatched Parathesis`, curr.col, curr.line))
                }
                args = parse_params(arg_tokens).map(i => {
                    if (i.type != 'variable') throwError(new WaveGrassError(('TypeError', `Expected a variable but got <class ${i.type}>`, i.col, i.line)))
                    return i.value
                })
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'assignment', lhs: name, rhs: { type: 'method', args: args, statements: block } }, endat, depth)
        } else if (curr.value == 'break') {
            return to_ast(iterable, { type: 'break', line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'continue') {
            return to_ast(iterable, { type: 'continue', line: curr.line, col: curr.col }, endat, depth)
        }
    } else if (curr.type == 'operator') {
        if (curr.value == '++') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: '+' }, lhs: prev, rhs: { type: 'number', value: 1 } } }, endat, depth)
            }
        } else if (curr.value == '--') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { operation: { type: 'operator', value: '-' }, lhs: prev, rhs: { type: 'number', value: 1 } } }, endat, depth)
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
        let value = to_ast(iter, null, { type: 'delim', value: ';' }, 0, tokens.filedata)
        if (value) asts.push(value)
        iter.move()
    }

    execute(asts)
}

module.exports = parse
