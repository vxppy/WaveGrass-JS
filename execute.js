const throwError = require("./throwError")
const input = require('./modules/input/main').input

/**
 * @type { { [ scope: string ]: { map: Map, parent?: string }}}
 */
const scopes = {
    global: {
        map: new Map(),
        parent: null
    }
}

let globalDepth = 3

scopes['global'].map.set('print', { value: { 'variable': 'print' }, type: 'method', args: [], positional_args: ['end', 'sep'], catchgroups: ['nargs'], statements: ['<internal_print>'] })
scopes['global'].map.set('prompt', { value: { 'variable': 'prompt' }, type: 'method', args: [], positional_args: ['color'], catchgroups: ['nargs'], statements: ['<internal_prompt>'] })

const toString = async (tokens, sep, scope, depth = 0) => {
    let str = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == 'array') {
            str.push('[ ' + await toString(tokens[i].values, ', ', scope, depth + 1) + ' ]')
        } else {
            if (tokens[i].operation) {
                str.push((await operate(tokens[i], scope)).value)

            } else if (tokens[i].type == 'variable') {
                let value = getValueOfVariable(tokens[i], scope)
                if (value.type != 'nf') {
                    str.push(await toString([value], sep, scope, depth))
                }

            } else str.push(tokens[i].value)
        }
    }

    return str.join(sep)
}

/**
 * 
 * @param {*} condition 
 * @param { string } scope 
 * @returns { {type: 'boolean', value: boolean} }
 */
const to_truth_value = (value, scope) => {
    if (value.type == 'variable') value = getValueOfVariable(value, scope)

    if (value.type == 'nf') {
        return { type: 'boolean', value: false }
    }

    if (value.type == 'number') {
        if (value.value == 0 || value.value == NaN) return { type: 'boolean', value: false }
        else return { type: 'boolean', value: true }
    } else if (value.type == 'string') {
        if (value.value == '') return { type: 'boolean', value: false }
        else return { type: 'boolean', value: true }
    } else if (value.type == 'array') {
        if (value.length == 0) return { type: 'boolean', value: false }
        else return { type: 'boolean', value: true }
    } else if (value.type == 'boolean') return value

    else return { type: 'boolean', value: true }
}
/**
 * 
 * @param {*} condition 
 * @param { string } scope 
 * @returns { Promise<{type: 'boolean', value: boolean}> }
 */
const conditional_check = async (condition, scope) => {

    if (condition.operation?.value == '!') {
        return await operate(condition, scope)
    }

    if (!condition.operation) {
        return to_truth_value(condition, scope)
    }

    if (condition.lhs.operation) {
        if (condition.lhs.operation.type == 'comparator') condition.lhs = await conditional_check(condition.lhs, scope)
        else condition.lhs = await operate(condition.lhs, scope)
    }

    if (condition.rhs.operation) {
        if (condition.rhs.operation.type == 'comparator') condition.rhs = await conditional_check(condition.rhs, scope)
        else condition.rhs = await operate(condition.lhs, scope)
    }

    if (condition.operation.value == '==') {
        if (condition.lhs.type == condition.rhs.type && condition.lhs.value == condition.rhs.value) {
            return { type: 'boolean', value: true }
        } else {
            return { type: 'boolean', value: false }
        }
    } else if (condition.operation.value == '>') {
        if (condition.lhs.type == condition.rhs.type && condition.lhs.value > condition.rhs.value) {
            return { type: 'boolean', value: true }
        } else {
            return { type: 'boolean', value: false }
        }
    } else if (condition.operation.value == '<') {
        if (condition.lhs.type == condition.rhs.type && condition.lhs.value < condition.rhs.value) {
            return { type: 'boolean', value: true }
        } else {
            return { type: 'boolean', value: false }
        }
    } else if (condition.operation.value == '>=') {
        if (condition.lhs.type == condition.rhs.type && condition.lhs.value >= condition.rhs.value) {
            return { type: 'boolean', value: true }
        } else {
            return { type: 'boolean', value: false }
        }
    } else if (condition.operation.value == '<=') {
        if (condition.lhs.type == condition.rhs.type && condition.lhs.value <= condition.rhs.value) {
            return { type: 'boolean', value: true }
        } else {
            return { type: 'boolean', value: false }
        }
    } else {
        condition.lhs = to_truth_value(condition.lhs, scope)
        condition.rhs = to_truth_value(condition.rhs, scope)

        if (condition.operation.value == '&&') {
            if (condition.rhs.value == true && condition.rhs.value == true) {
                return { type: 'boolean', value: true }
            } else {
                return { type: 'boolean', value: false }
            }
        } else if (condition.operation.value == '||') {
            if (condition.rhs.value == true || condition.rhs.value == true) {
                return { type: 'boolean', value: true }
            } else {
                return { type: 'boolean', value: false }
            }
        }
    }
}
const operate = async (ast, scope, depth = 0) => {
    
    if (ast.type == 'call') {
        return await run(ast, scope, depth)
    }

    if (ast.operation == 'brackets') {
        return await operate(ast.value)
    }

    if (ast.operation.value == '!') {
        if (ast.value.type == 'operation') {
            ast.value = await operate(ast, scope)
        }

        let value = to_truth_value(ast.value)
        value.value = !value.value
        return value
    }
    // console.log(ast)

    if (ast.lhs.operation) {
        ast.lhs = await operate(ast.lhs, scope, depth)
    }

    if (ast.rhs.operation) {
        ast.rhs = await operate(ast.rhs, scope, depth)
    }

    if (ast.lhs.type == 'variable') {
        ast.lhs = getValueOfVariable(ast.lhs, scope, depth)
    }

    if (ast.rhs.type == 'variable') {
        ast.rhs = getValueOfVariable(ast.rhs, scope, depth)
    }

    if (ast.operation.value == '+') {
        if (ast.lhs.type == 'string' || ast.lhs.type == 'string') {
            return { type: 'string', value: ast.lhs.value + ast.rhs.value }
        }

        if (ast.lhs.type == 'number' && ast.rhs.type == 'number') {
            return { type: 'number', value: ast.lhs.value + ast.rhs.value }
        }
    }

    else if (ast.operation.value == '-') {
        if (ast.lhs.type == 'string' || ast.lhs.type == 'string') {
            throwError()
        }

        if (ast.lhs.type == 'number' && ast.rhs.type == 'number') {
            return { type: 'number', value: ast.lhs.value - ast.rhs.value }
        }
    }

    else if (ast.operation.value == '*') {
        if (ast.lhs.type == 'string' && ast.lhs.type == 'string') {
            throwError()
        }

        if ((ast.lhs.type == 'string' && ast.rhs.type == 'number') || (ast.rhs.type == 'string' && st.lhs.type == 'number')) {
            return { type: 'string', value: ast.lhs.type == 'string' ? ast.lhs.value.repeat(ast.rhs.value) : ast.rhs.value.repeat(ast.lhs.value) }
        }

        if (ast.lhs.type == 'number' && ast.rhs.type == 'number') {
            return { type: 'number', value: ast.lhs.value * ast.rhs.value }
        }
    } else if (ast.operation.value == '/') {
        if (ast.lhs.type == 'string' || ast.lhs.type == 'string') {
            throwError()
        }

        if (ast.lhs.type == 'number' && ast.rhs.type == 'number') {
            return { type: 'number', value: ast.lhs.value / ast.rhs.value }
        }
    }

    if (ast.operation.value == ':') {
        return { type: 'property', name: ast.lhs, value: ast.rhs }
    }

    if (ast.operation.value == '=') {
        if (ast.lhs.type != 'variable') {
            throwError()
        }

        let s = scope
        let found, value
        while (s) {
            found = scopes[scope].map.has(ast.lhs.value)
            if (!found) s = scopes[scope].parent
            else {
                if (ast.rhs.operation) {
                    scopes[scope].map.set(ast.lhs.value, await operate(ast.rhs))
                } else {
                    scopes[scope].map.set(ast.lhs.value, ast.rhs)
                }
                value = scopes[scope].map.get(ast.lhs.value)
                break
            }
        }

        if (!found) throwError()
        return value
    }
}

const getValueOfVariable = (v, scope) => {
    let s = scope
    let value = null
    while (s) {
        value = scopes[s].map.get(v.value)
        if (!value) s = scopes[s].parent
        else break
    }
    return value ?? { type: 'nf' }
}

/**
 * 
 * @param { { type: 'variable', value: string } } v 
 * @param { string } scope 
 * @returns { string }
 */
const find_variable_scope = (v, scope) => {
    let s = scope
    while (s) {
        if (!scopes[s].map.get(v.value)) s = scopes[s].parent
        else break
    }
    return s
}

const parse_params = async (tokens, scope) => {
    const params = []
    const positional_args = {}
    for (const i of tokens) {
        if (i.operation) {
            let operated = await operate(i, scope)
            if (operated.type == 'property') {
                positional_args[operated.name.value] = operated.value
            } else {
                params.push(operated)
            }
        } else {
            if (i.type == 'variable') {
                let value = getValueOfVariable(i, scope)
                if (value.type == 'nf') {
                    throwError()
                }
                params.push(value)
            } else {
                if (i.type == 'array') {
                    for (let j = 0; j < i.values.length; j++) {
                        i[j] = await parse_params(i[j], scope).params
                    }
                } else params.push(i)
            }
        }
    }

    return {
        params: params,
        positional_args: positional_args
    }
}

const run = async (ast, scope, depth_value = 0) => {
    if (ast.type == 'assignment') {
        let scp = find_variable_scope(ast.lhs, scope)
        if (ast.rhs.operation) {
            if(!scp) scopes[scope].map.set(ast.lhs.value, await operate(ast.rhs, scope))
            else scopes[scp].map.set(ast.lhs.value, await operate(ast.rhs, scope))
        } else
            if (ast.rhs.type == 'variable') {
                let value = getValueOfVariable(ast.rhs, scope)
                if (value.type == 'nf') {
                    throwError()
                }
                if(!scp) scopes[scope].map.set(ast.lhs.value, JSON.parse(JSON.stringify(value)))
                else scopes[scp].map.set(ast.lhs.value, JSON.parse(JSON.stringify(value)))
            } else if (ast.rhs.type == 'call') {
                if(!scp) scopes[scope].map.set(ast.lhs.value, await run(ast.rhs, scope, depth_value))
                else scopes[scp].map.set(ast.lhs.value, JSON.parse(JSON.stringify(value)))
            } else { 
                if(!scp) scopes[scope].map.set(ast.lhs.value, ast.rhs)
                else scopes[scp].map.set(ast.lhs.value, ast.rhs)
            }
    } else if (ast.type == 'call') {
        const func = getValueOfVariable(ast.value, scope)

        if (func.type == 'nf') {
            throwError()
        } else if (func.type != 'method') {
            throwError()
        }


        let args = await parse_params(ast.args, scope)
        let positional_args = args.positional_args
        let params = args.params

        if (func.statements[0] == '<internal_print>') {
            let sep = positional_args.sep?.value ?? ' '
            let end = positional_args.end?.value ?? '\n'
            process.stdout.write(`${await toString(params, sep, scope)}${end}`)
            return { type: 'null', value: 'null' }

        } else if (func.statements[0] == '<internal_prompt>') {
            // let color = 'white'
            return { type: 'string', value: await input(await toString(params, '', scope)) }

        }
    } else if (ast.type == 'if') {
        let lscope = 'if' + depth_value
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if ((await conditional_check(ast.condition, scope)).value) {
            await execute(ast.positive, lscope, depth_value + 1)
        } else {
            if (ast.negative) {
                if (Array.isArray(ast.negative)) {
                    await execute(ast.negative, lscope, depth_value + 1)
                } else {
                    await run(ast.negative, lscope, depth_value + 1)
                }
            }
        }

        scopes[lscope] = undefined
    }
}

/**
 * 
 * @param { import("./parser").Token[] } tokens 
 */
const execute = async (tokens, scope = 'global', depth_value = 0) => {
    let hoists = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i]?.type == 'hoist') {
            hoists.push(tokens.splice(i, 1)[0].value)
        }
    }

    for (const i of hoists) {
        await run(i, scope, depth_value)
    }

    for (const i of tokens) {
        await run(i, scope, depth_value)
    }
}

module.exports = execute