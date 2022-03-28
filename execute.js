/*
TODO
    Reframe all of this for ease of coding
*/

const throwError = require("./throwError")
const { createObject, WaveGrassObject, WaveGrassError, WaveGrassBoolean, WaveGrassNull, print, prompt, WaveGrassNumber } = require("./wavegrassObjects")
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

const breakable = ['for', 'while']
let globalDepth = 3

scopes['global'].map.set('print', print)
scopes['global'].map.set('prompt', prompt)

const unary = ['!', '~', '!!', '~~']

const toString = async (tokens, sep, scope, depth = 0) => {
    tokens = tokens.map(i => i instanceof WaveGrassObject ? i : createObject(i.type, i.value))
    let str = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] == 'array') {
            str.push('[ ' + await toString(tokens[i].values, ', ', scope, depth + 1) + ' ]')
        } else {
            if (tokens[i].operation) {
                str.push((await operate(tokens[i], scope)).__value_of__())

            } else if (tokens[i].type == 'variable') {
                let value = getValueOfVariable(tokens[i], scope)
                if (value.type != 'nf') {
                    str.push(await toString([value], sep, scope, depth))
                }

            } else str.push(tokens[i].__value_of__())
        }
    }

    return str.join(sep)
}

/**
 * 
 * @param { { type: 'comparator', value: string } } cond 
 * @param { { type: string, value: any } | WaveGrassObject } lhs 
 * @param { { type: string, value: any } | WaveGrassObject } rhs 
 * @returns { WaveGrassBoolean }
 */
const conditional_check = (cond, lhs, rhs) => {
    let value = null;
    if (cond.value == '===') {
        value = lhs.__strict_equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__strict_equals__(lhs)
    } else if (cond.value == '==') {
        value = lhs.__equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
    } else if (cond.value == '>') {
        value = lhs.__greater_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)
    } else if (cond.value == '<') {
        value = lhs.__less_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)
    } else if (cond.value == '>=') {
        value = lhs.__greater_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)

        if (value.__value_of__() == false) {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
        }
    } else if (cond.value == '<=') {
        value = lhs.__less_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)

        if (value.__value_of__() == false) {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
        }
    } else if (cond.value == '&&') {
        value = WaveGrassBoolean(lhs.__bool__().__value_of__() && rhs.__bool__().__value_of__())
    } else if (cond.value == '||') {
        value = new WaveGrassBoolean(lhs.__bool__().__value_of__() || rhs.__bool__().__value_of__())
    } else {
        value = new WaveGrassBoolean(false)
    }

    if (WaveGrassError.isError(value)) {
        value.__col = opp.col
        value.__line = opp.line
        throwError(value)
    }

    return value
}

/*
TODO
    Implement all operations
*/

/**
 * 
 * @param { { type: 'operator', value: string } } opp 
 * @param { { type: string, value: any } | WaveGrassObject } lhs 
 * @param { { type: string, value: any } | WaveGrassObject } rhs 
 * @returns { WaveGrassObject }
 */
const operate_by_operation = (opp, lhs, rhs) => {

    let value = null
    if (opp.value == '+') {
        value = lhs.__add__(rhs);
        if (WaveGrassError.isError(value)) value = lhs.__r_add__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_add__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__add__(rhs)

    } else if (opp.value == '-') {
        value = lhs.__sub__(rhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_sub__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_sub__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__sub__(lhs)
    } else if (opp.value == '*') {
        value = lhs.__mul__(rhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_mul__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_mul__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__mul__(lhs)

    } else if (opp.value == '/') {
        value = lhs.__div__(rhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_div__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_div__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__div__(lhs)

    } else if (opp.value == '%') {
        value = lhs.__mod__(rhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_mod__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_mod__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__mod__(lhs)
    } else if (opp.value == '!') {
        value = lhs.__not__()
    } else if (opp.value == '!!') {
        value = lhs.__bool__()
    } else if (opp.value == '~') {
        value = lhs.__b_not__()
    } else if (opp.value == '~~') {
        value = lhs.__b_not__().__b_not__()
    } else if (opp.value == '++') {
        if (rhs) {
            let old_value = createObject(rhs.__type__(), rhs.__value_of__())
            rhs.__value = rhs.__add__(new WaveGrassNumber(1)).__value_of__()
            return old_value
        }

        if (lhs) {
            lhs.__value = lhs.__add__(new WaveGrassNumber(1)).__value_of__()
            return lhs
        }
    } else if (opp.value == '--') {
        if (rhs) {
            let old_value = createObject(rhs.__type__(), rhs.__value_of__())
            rhs.__value = rhs.__sub__(new WaveGrassNumber(1)).__value_of__()
            return old_value
        }

        if (lhs) {
            lhs.__value = lhs.__sub__(new WaveGrassNumber(1)).__value_of__()
            return lhs
        }
    } else if (cond.value == '&') {
        value == lhs.__b_and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_and__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_and__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_and__(lhs)
    } else if (cond.value == '^') {
        value == lhs.__b_xor__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_xor__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_xor__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_xor__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_xor__(lhs)
    } else if (cond.value == '|') {
        value = lhs.__b_or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_or__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_or__(lhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_or__(lhs)
    } else {
        value = new WaveGrassNull()
    }

    if (WaveGrassError.isError(value)) {
        value.__col = opp.col
        value.__line = opp.line
        throwError(value)
    }
    return value

    // return 
}

/*
TODO
    Implement and clear this
*/

/**
 * 
 * @param { { type: string, value: any }[] } ast 
 * @param { string } scope 
 * @param { number } depth 
 * @param { { lines: string[], file: string } } filedata 
 * @returns { Promise<WaveGrassObject> }
 */
const operate = async (ast, scope, depth = 0) => {
    ast = structuredClone(ast)
    let values = []

    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type == 'operator') {
            if (unary.includes(ast[i].value)) {
                let value = values.pop()
                values.push(operate_by_operation(ast[i], value))
            } else {
                let rhs = values.pop(), lhs = values.pop()
                values.push(operate_by_operation(ast[i], lhs, rhs))
            }
        } else if (ast[i].type == 'comparator' || ast[i].type == 'keyword') {
            if (unary.includes(ast[i].value)) {
            } else {
                let rhs = values.pop(), lhs = values.pop()
                values.push(conditional_check(ast[i], lhs, rhs))
            }
        } else if (ast[i].type == 'symbol') {
            if (ast[i].value == ':') {
                let rhs = values.pop(), lhs = values.pop()
                values.push({ type: 'property', lhs: lhs, rhs: rhs })
            }
        } else {
            if (ast[i].type == 'call') {
                ast[i] = await run(ast[i], scope, depth)
            } else if (ast[i].type == 'variable') {
                if (ast[i + 2]) {
                    if (ast[i + 2].value != ':') {
                        ast[i] = getValueOfVariable(ast[i], scope)
                        if (!(ast[i] instanceof WaveGrassObject)) ast[i] = createObject(ast[i].type, ast[i].value)
                    }
                } else {
                    ast[i] = getValueOfVariable(ast[i], scope)
                    if (!(ast[i] instanceof WaveGrassObject)) ast[i] = createObject(ast[i].type, ast[i].value)
                }
            } else {
                if (!(ast[i] instanceof WaveGrassObject)) ast[i] = createObject(ast[i].type, ast[i].value)
            }

            values.push(ast[i])
        }
    }

    return values[0]
}

/**
 * 
 * @param { { type: 'variable', value: string } } v 
 * @param { string } scope 
 * @returns { WaveGrassObject }
 */
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

/**
 * 
 * @param { string } start 
 * @param  { string[] } values 
 */
const find_scope_that_matches = (start, ...values) => {
    let s = start

    while (s) {
        if (values.find(i => s.startsWith(i))) {
            return s
        }

        s = scopes[s].parent
    }
    return
}

const parse_params = async (tokens, scope, depth = 0) => {
    let args = []
    for (const i of tokens) {
        if (i.type == 'operation') {
            let operated = await operate(i.value, scope, depth)
            if (operated.type) {
                if (operated.type == 'property') {
                    if (operated.rhs.type == 'variable') {
                        let value = getValueOfVariable(i, scope)

                        if (value.type == 'nf') {
                            throwError(`Reference Error`, `'${i.value}' is not defined`, i.line, i.col)
                        }

                        args[operated.lhs.value] = value
                    } else {
                        if (!(operated.rhs instanceof WaveGrassObject)) {
                            operated.rhs = createObject(operated.rhs.type, operated.rhs.value)
                        }

                        args[operated.lhs.value] = operated.rhs

                    }
                }
            } else args.push(operated)
        } else {
            if (i.type == 'variable') {
                let value = getValueOfVariable(i, scope)

                if (value.type == 'nf') {
                    throwError(new WaveGrassError(`Reference Error`, `'${i.value}' is not defined`, i.line, i.col))
                }

                args.push(value)
            } else if (i.type == 'call') {
                args.push(await run(i, scope, depth))
            } else {
                if (i.type == 'array') {
                    for (let j = 0; j < i.values.length; j++) {
                        i[j] = await parse_params(i[j], scope, depth)
                    }
                } else if (i.token == 'missing') {
                    args.push(new WaveGrassNull())
                } else {
                    if (!(i instanceof WaveGrassObject)) args.push(createObject(i.type, i.value))
                    else args.push(i)
                }
            }
        }
    }
    return args
}

/**
 * 
 * @param { { type: string, [x:string]: {} } } ast 
 * @param { string } scope 
 * @param { number } depth_value 
 * @returns 
 */
const run = async (ast, scope, depth_value = 0) => {
    ast = structuredClone(ast)

    if (ast.type == 'assignment') {
        let scp = find_variable_scope(ast.lhs, scope)

        if (ast.rhs.type == 'operation') {
            let value = await operate(ast.rhs.value, scope, depth_value)
            if (!scp) scopes[scope].map.set(ast.lhs.value, value)
            else scopes[scp].map.set(ast.lhs.value, value)
        } else {
            if (ast.rhs.type == 'variable') {
                let value = getValueOfVariable(ast.rhs, scope)
                if (value.type == 'nf') {
                    throwError(new WaveGrassError(`Reference Error`, `'${ast.lhs.value}' is not defined`, ast.lhs.line, ast.lhs.col))
                }

                if (value.__type__() == 'method') {
                    if (!scp) scopes[scope].map.set(ast.lhs.value, createObject(value.__type__(), ast.lhs.value, value.__get_args__(), value.__get_statements__(), value.__internal__()))
                    else scopes[scp].map.set(ast.lhs.value, createObject(value.__type__(), ast.lhs.value, value.__get_args__(), value.__get_statements__(), value.__internal__()))
                } else {
                    if (!scp) scopes[scope].map.set(ast.lhs.value, createObject(value.__type__(), value.__value_of__()))
                    else scopes[scp].map.set(ast.lhs.value, createObject(value.__type__(), value.__value_of__()))
                }
            } else if (ast.rhs.type == 'call') {
                let val = await run(ast.rhs, scope, depth_value)
                val = createObject(val.type, val.value)
                if (!scp) scopes[scope].map.set(ast.lhs.value, val)
                else scopes[scp].map.set(ast.lhs.value, val)
            } else {
                if (ast.rhs.type == 'method') {
                    if (!scp) scopes[scope].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.lhs.value, ast.rhs.args, ast.rhs.statements))
                    else scopes[scp].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.lhs.value, ast.rhs.args, ast.rhs.statements))
                } else {
                    if (!scp) scopes[scope].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.rhs.value))
                    else scopes[scp].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.rhs.value))
                }
            }
        }

        return ast.lhs
    } else if (ast.type == 'assignment2') {
        let scp = find_variable_scope(ast.lhs, scope)
        if (ast.rhs.type == 'operation') {
            let value = await operate(ast.rhs.value, scope, depth_value)
            if (!scp) scopes[scope].map.set(ast.lhs.value, value)
            else scopes[scp].map.set(ast.lhs.value, value)
        } else {
            if (ast.rhs.type == 'variable') {
                let value = getValueOfVariable(ast.rhs, scope)
                if (value.type == 'nf') {
                    throwError(new WaveGrassError(`Reference Error`, `'${ast.lhs.value}' is not defined`, ast.lhs.line, ast.lhs.col))
                }

                if (!scp) scopes[scope].map.set(ast.lhs.value, value)
                else scopes[scp].map.set(ast.lhs.value, value)
            } else if (ast.rhs.type == 'call') {
                let val = await run(ast.rhs, scope, depth_value)
                val = createObject(val.type, val.value)

                if (!scp) scopes[scope].map.set(ast.lhs.value, val)
                else scopes[scp].map.set(ast.lhs.value, val)
            } else {
                if (!scp) scopes[scope].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.rhs.value))
                else scopes[scp].map.set(ast.lhs.value, createObject(ast.rhs.type, ast.rhs.value))
            }
        }
    } else if (ast.type == 'call') {
        const func = getValueOfVariable(ast.value, scope)

        WaveGrassError.trace.push(`at ${func.__name__().__value_of__()} (${WaveGrassError.file}:${ast.value.line}:${ast.value.col})`)

        if (func.type == 'nf') {
            throwError(new WaveGrassError(`Reference Error`, `'${ast.value.value}' is not defined`, ast.value.line, ast.value.col))
        } else if (func.__type != 'method') {
            throwError(new WaveGrassError(`Reference Error`, `'${ast.value.value}' is not a method`, ast.value.line, ast.value.col))
        }

        let args = await parse_params(ast.args, scope, depth_value)

        if (func.__internal__()) {
            let internal_type = func.__get_statements__()
            if (internal_type == '<internal_print>') {
                let sep = args.sep?.__value_of__() ?? ' '
                let end = args.end?.__value_of__() ?? '\n'
                process.stdout.write(`${await toString(args, sep, scope)}${end}`)

                WaveGrassError.trace.pop()
                return new WaveGrassNull()
            } else if (internal_type == '<internal_prompt>') {
                WaveGrassError.trace.pop()
                return createObject('string', await input(await toString(params, '', scope)))
            }
        } else {
            let lscope = `${func.name}${depth_value}`
            scopes[lscope] = {
                parent: scope,
                map: new Map()
            }

            let params = func.__get_args__()

            for (const i in args) {
                if (isNaN(i)) {
                    let index = params.indexOf(i)
                    if (index !== null) {
                        scopes[lscope].map.set(i, args[i])
                        params.splice(index, 1)
                    }
                }
            }

            for (let i = 0; i < params.length; i++) {
                scopes[lscope].map.set(params[i], args[i] ?? new WaveGrassNull())
            }

            let ret_val;
            for (const i of func.__get_statements__()) {
                ret_val = await run(i, lscope, depth_value + 1)
                if (ret_val) break
            }
            scopes[lscope] = undefined

            WaveGrassError.trace.pop()
            return ret_val.value ?? new WaveGrassNull()
        }
    } else if (ast.type == 'if') {
        let lscope = 'if' + depth_value
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }

        let br = false, cont = false, ret = false
        if ((await operate(ast.condition.value, scope)).__value_of__()) {
            for (const i of ast.positive) {
                let v = await run(i, lscope, depth_value + 1)
                if (v) {
                    if (v.type == 'break') {
                        br = true
                        break
                    } else if (v.type == 'continue') {
                        cont = true
                        break
                    } else if (v.type == 'return') {
                        ret = v.value
                        break
                    }
                }
            }
        } else {
            if (ast.negative) {
                if (Array.isArray(ast.negative)) {
                    for (const i of ast.negative) {
                        let v = await run(i, lscope, depth_value + 1)
                        if (v) {
                            if (v.type == 'break') {
                                br = true
                                break
                            } else if (v.type == 'continue') {
                                cont = true
                                break
                            } else if (v.type == 'return') {
                                ret = v.value
                                break
                            }
                        }
                    }

                } else {
                    let v = await run(ast.negative, lscope, depth_value + 1)
                    if (v) {
                        if (v.type == 'break') {
                            br = true
                        } else if (v.type == 'continue') {
                            cont = true
                        } else if (v.type == 'return') {
                            ret = v.value
                        }
                    }
                }
            }

        }

        scopes[lscope] = undefined

        if (br) return { type: 'break' }
        if (cont) return { type: 'continue' }
        if (ret) return ret
    } else if (ast.type == 'for') {
        let lscope = 'for' + depth_value

        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if (ast.loopvar.type == 'assignment') {
            ast.loopvar = await run(ast.loopvar, lscope, depth_value)
        }

        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }

        let out = false, ret = false
        while ((await operate(ast.condition.value, lscope)).__value_of__()) {
            for (const i of ast.block) {
                let v = await run(i, lscope, depth_value + 1)
                if (v) {
                    if (v.type == 'break') {
                        out = true
                        break
                    } else if (v.type == 'continue') {
                        break
                    } else if (v.type == 'return') {
                        ret = v.value
                        break
                    }
                }
            }

            if (out) break
            await operate(ast.change.value, lscope, depth_value)
        }

        scopes[lscope] = undefined

        if (ret) return ret.value
    } else if (ast.type == 'while') {
        let lscope = 'while' + depth_value
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }

        let out = false, ret = false
        while ((await operate(ast.condition.value, scope)).__value_of__()) {
            for (const i of ast.block) {
                let v = await run(i, lscope, depth_value + 1)
                if (v) {
                    if (v.type == 'break') {
                        out = true
                        break
                    } else if (v.type == 'continue') {
                        break
                    } else if (v.type == 'return') {
                        ret = v.value
                        break
                    }
                }
            }

            if (out) break
        }
        scopes[lscope] = undefined

        if (ret) return ret.value
    } else if (ast.type == 'return') {
        let s = scope
        while (s) {
            if (['for', 'while', 'if'].find(i => s.startsWith(i))) s = scopes[s].parent

            if (s == 'global') throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'return\'', ast.line, ast.col))
            else break
        }


        return { type: 'return', value: ast.value.type == 'operation' ? await operate(ast.value.value, scope, depth_value) : ast.value }
    } else if (ast.type == 'break') {
        let br = find_scope_that_matches(scope, ...breakable)

        if (!br) {
            throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'break\'', ast.line, ast.col))
        }

        return { type: 'break' }
    } else if (ast.type == 'continue') {
        let br = find_scope_that_matches(scope, ...breakable)

        if (!br) {
            throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'continue\'', ast.line, ast.col))
        }

        return { type: 'continue' }
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
            i--
        }
    }

    for (const i of hoists) {
        await run(i, scope, depth_value, tokens.filedata)
    }

    for (const i of tokens) {
        await run(i, scope, depth_value, tokens.filedata)
    }
}

module.exports = execute
