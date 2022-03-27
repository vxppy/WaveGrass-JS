/*
TODO
    Reframe all of this for ease of coding
*/

const throwError = require("./throwError")
const { createObject, WaveGrassObject, WaveGrassError, WaveGrassBoolean, WaveGrassNull, print, prompt } = require("./wavegrassObjects")
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

scopes['global'].map.set('print', print)
scopes['global'].map.set('prompt', prompt)


const toString = async (tokens, sep, scope, depth = 0) => {
    tokens = tokens.map(i => i instanceof WaveGrassObject ? i : createObject(i.type, i.value))
    let str = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == 'array') {
            str.push('[ ' + await toString(tokens[i].values, ', ', scope, depth + 1) + ' ]')
        } else {
            if (tokens[i].operation) {
                str.push((await operate(tokens[i], scope)).__value_of__())

            } else if (tokens[i].type == 'variable') {
                let value = getValueOfVariable(tokens[i], scope)
                if (value.type != 'nf') {
                    str.push(await toString([value], sep, scope, depth, filedata))
                }

            } else str.push(tokens[i].__value_of__())
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
 * @param { { type: 'comparator', value: string } } cond 
 * @param { { type: string, value: any } | WaveGrassObject } lhs 
 * @param { { type: string, value: any } | WaveGrassObject } rhs 
 * @param { string } scope 
 * @param { number } depth 
 * @param { { lines: string[], file: string } } filedata 
 * @returns { WaveGrassBoolean }
 */
const conditional_check = (cond, lhs, rhs, scope, depth = 0, filedata) => {
    if (lhs.type == 'variable') {
        lhs = getValueOfVariable(lhs, scope)
    }

    if (rhs.type == 'variable') {
        rhs = getValueOfVariable(rhs, scope)
    }

    if (!(lhs instanceof WaveGrassObject)) {
        lhs = createObject(lhs.type, lhs.value)
    }

    if (!(rhs instanceof WaveGrassObject)) {
        rhs = createObject(rhs.type, rhs.value)
    }


    if (cond.value == '==') {
        let value = lhs.__equals__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__equals__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (cond.value == '>') {
        let value = lhs.__greater_than__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (cond.value == '<') {
        let value = lhs.__less_than__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (cond.value == '>=') {
        let value = lhs.__greater_than__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()

        if (value.__value_of__() == false) {
            let value = lhs.__equals__(rhs)
            if (!value || WaveGrassError.isError(value)) value = rhs.__equals__(lhs)

            if (!value) throwError()
            else if (WaveGrassError.isError(value)) throwError()
            else return value
        }

        return value
    } else if (cond.value == '<=') {
        let value = lhs.__less_than__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()

        if (value.__value_of__() == false) {
            let value = lhs.__equals__(rhs)
            if (!value || WaveGrassError.isError(value)) value = rhs.__equals__(lhs)

            if (!value) throwError()
            else if (WaveGrassError.isError(value)) throwError()
            else return value
        }

        return value
    } else {
        lhs = to_truth_value(lhs, scope)
        rhs = to_truth_value(rhs, scope)

        if (cond.value == '&&') {
            return new WaveGrassBoolean(lhs.__bool__() && rhs.__bool__())
        } else if (cond.value == '||') {
            return new WaveGrassBoolean(lhs.__bool__() || rhs.__bool__())
        }
    }
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
 * @param { string } scope 
 * @param { number } depth 
 * @param { { lines: string[], file: string } } filedata 
 * @returns { WaveGrassObject }
 */
const operate_by_operation = (opp, lhs, rhs, scope, depth, filedata) => {
    if (opp.value == '=') {

    }

    if (lhs.type == 'variable') {
        lhs = getValueOfVariable(lhs, scope)
    }

    if (rhs.type == 'variable') {
        rhs = getValueOfVariable(rhs, scope)
    }

    if (!(lhs instanceof WaveGrassObject)) {
        lhs = createObject(lhs.type, lhs.value)
    }

    if (!(rhs instanceof WaveGrassObject)) {
        rhs = createObject(rhs.type, rhs.value)
    }

    if (opp.value == '+') {
        let value = lhs.__add__(rhs);
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_add__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_add__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__add__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (opp.value == '-') {
        let value = lhs.__sub__(rhs)
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_sub__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_sub__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__sub__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (opp.value == '*') {
        let value = lhs.__mul__(rhs)
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_mul__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_mul__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__mul__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (opp.value == '/') {
        let value = lhs.__div__(rhs)
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_div__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_div__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__div__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (opp.value == '%') {
        let value = lhs.__mod__(rhs)
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_mod__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_mod__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__mod__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    } else if (opp.value == '|') {
        let value = lhs.__b_or__(rhs)
        if (!value || WaveGrassError.isError(value)) value = lhs.__r_b_or__(rhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__r_b_or__(lhs)
        if (!value || WaveGrassError.isError(value)) value = rhs.__b_or__(lhs)

        if (!value) throwError()
        else if (WaveGrassError.isError(value)) throwError()
        return value
    }

    return new WaveGrassNull()
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
const operate = async (ast, scope, depth = 0, filedata) => {
    ast = structuredClone(ast)
    let values = []

    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type == 'operator') {
            let rhs = values.pop(), lhs = values.pop()
            values.push(operate_by_operation(ast[i], lhs, rhs, scope, depth, filedata))
        } else if (ast[i].type == 'comparator') {
            let rhs = values.pop(), lhs = values.pop()
            values.push(conditional_check(ast[i], lhs, rhs, scope, depth, filedata))
        } else {
            if (ast[i].type == 'call') {
                ast[i] = await run(ast[i], scope, depth, filedata)
            }

            values.push(ast[i])
        }
    }

    if (!(values[0] instanceof WaveGrassObject)) values[0] = createObject(values[0].type, values[0].value)
    return values[0]
}
// let values = []
// for(let i = 0; i < ast.length; i++) {
//     if(ast[i].type != 'operator') {
//         values.push(ast[i].splice())
//     }
// }
// // let value = null
// let i = 0
// while (ast.length > 1) {
//     if (ast[i].type == 'operator') {
//         console.log(ast, i)

//         ast[i - 2] = await operate_by_operation(ast[i], ast[i - 1], ast[i - 2], scope, depth, filedata)
//         i -= 2
//         console.log(ast, i)
//     }


//     i++
//     ast.pop()
// }

// return ast[0]
// if (ast.operation == 'brackets') {
//     return await operate(ast.value, scope, depth, filedata)
// }

// if (ast.operation == 'call') {
//     return await run(ast, scope, depth, filedata)
// }

// if (ast.operation.value == '!') {
//     if (ast.value.type == 'operation') {
//         ast.value = await operate(ast, scope, depth, filedata)
//     }

//     let value = to_truth_value(ast.value)
//     value.value = !value.value
//     return value
// }

// if (ast.operation.type == 'comparator') {
//     return await conditional_check(ast, scope, depth, filedata)
// }

// if (ast.lhs.operation) {
//     ast.lhs = await operate(ast.lhs, scope, depth, filedata)
// }

// if (ast.rhs.operation) {
//     ast.rhs = await operate(ast.rhs, scope, depth, filedata)
// }

// if (ast.operation.type == 'property') {
//     if (ast.lhs.type == 'variable') {
//         ast.lhs = getValueOfVariable(ast.lhs, scope)
//     }


//     if (!(ast.lhs instanceof WaveGrassObject)) {
//         ast.lhs = createObject(ast.lhs.type, ast.lhs.value)
//     }

//     let value = ast.lhs.__get_property__(ast.rhs.value)

//     if (!value || WaveGrassError.isError(value)) throwError()
//     return value
// }

// if (ast.lhs.type == 'variable') {
//     ast.lhs = getValueOfVariable(ast.lhs, scope)
// }

// if (ast.rhs.type == 'variable') {
//     ast.rhs = getValueOfVariable(ast.rhs, scope)
// }

// if (ast.lhs.type == 'call') {
//     ast.lhs = await run(ast.lhs, scope, depth, filedata)
// }

// if (ast.rhs.type == 'call') {
//     ast.rhs = await run(ast.rhs, scope, depth, filedata)
// }

// if (!(ast.lhs instanceof WaveGrassObject)) {
//     ast.lhs = createObject(ast.lhs.type, ast.lhs.value)
// }

// if (!(ast.rhs instanceof WaveGrassObject)) {
//     ast.rhs = createObject(ast.rhs.type, ast.rhs.value)
// }

// if (ast.operation.type == 'assignment') {
// } else if (ast.operation.value == '+') {
//     let value = ast.lhs.__add__(ast.rhs);

//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_add__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_add__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__add__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value

// } else if (ast.operation.value == '-') {
//     let value = ast.lhs.__sub__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_sub__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_sub__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__sub__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value
// } else if (ast.operation.value == '*') {
//     let value = ast.lhs.__mul__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_mul__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_mul__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__mul__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value
// } else if (ast.operation.value == '/') {
//     let value = ast.lhs.__div__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_div__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_div__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__div__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value
// } else if (ast.operation.value == '%') {
//     let value = ast.lhs.__mod__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_mod__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_mod__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__mod__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value
// } else if (ast.operation.value == '|') {
//     let value = ast.lhs.__b_or__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.lhs.__r_b_or__(ast.rhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__r_b_or__(ast.lhs)
//     if (!value || WaveGrassError.isError(value)) value = ast.rhs.__b_or__(ast.lhs)

//     if (!value) throwError()
//     else if (WaveGrassError.isError(value)) throwError()
//     return value
// }

// else if (ast.operation.value == ':') {
//     return { type: 'property', name: ast.lhs, value: ast.rhs }
// }

// if (ast.operation.value == '=') {
//     if (ast.lhs.__type != 'variable') {
//         throwError(`Syntax Error`, `'${ast.lhs.value}' is not a variable`, filedata, ast.lhs.line, ast.lhs.col)
//     }

//     let s = scope
//     let found, value
//     while (s) {
//         found = scopes[scope].map.has(ast.lhs.value)
//         if (!found) s = scopes[scope].parent
//         else {
//             if (ast.rhs.operation) {
//                 scopes[scope].map.set(ast.lhs.value, await operate(ast.rhs, s, depth, filedata))
//             } else {
//                 scopes[scope].map.set(ast.lhs.value, ast.rhs)
//             }
//             value = scopes[scope].map.get(ast.lhs.value)
//             break
//         }
//     }

//     if (!found) throwError(`Reference Error`, `'${ast.lhs.value}' is not defined`, filedata, ast.lhs.line, ast.lhs.col)
//     return value
// }
// }

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

const parse_params = async (tokens, scope, depth = 0, filedata) => {
    let args = []
    for (const i of tokens) {
        if (i.type == 'operation') {
            let operated = await operate(i.value, scope, depth, filedata)

            if (operated.type == 'property') {
                args[i.lhs.value] = operated.value
            } else {
                args.push(operated)
            }
        } else {
            if (i.type == 'variable') {
                let value = getValueOfVariable(i, scope)
                if (value.type == 'nf') {
                    throwError(`Reference Error`, `'${i.value}' is not defined`, filedata, i.line, i.col)
                }
                args.push(value)
            } else if (i.type == 'call') {
                args.push(await run(i, scope, depth, filedata))
            } else {
                if (i.type == 'array') {
                    for (let j = 0; j < i.values.length; j++) {
                        i[j] = await parse_params(i[j], scope, depth, filedata)
                    }
                } else args.push(i)
            }
        }
    }

    return args
}

const run = async (ast, scope, depth_value = 0, filedata) => {
    if (ast.type == 'assignment') {
        let scp = find_variable_scope(ast.lhs, scope, filedata)
        
        if (ast.rhs.type == 'operation') {
            let value = await operate(ast.rhs.value, scope, depth_value, filedata)
            if (!scp) scopes[scope].map.set(ast.lhs.value, value)
            else scopes[scp].map.set(ast.lhs.value, value)
        } else {
            if (ast.rhs.type == 'variable') {
                let value = getValueOfVariable(ast.rhs, scope)
                if (value.type == 'nf') {
                    throwError(`Reference Error`, `'${ast.lhs.value}' is not defined`, filedata, ast.lhs.line, ast.lhs.col)
                }
                if (!scp) scopes[scope].map.set(ast.lhs.value, structuredClone(value))
                else scopes[scp].map.set(ast.lhs.value, structuredClone(value))
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
            return ast.lhs
        }
    } else if (ast.type == 'call') {
        const func = getValueOfVariable(ast.value, scope)

        if (func.type == 'nf') {
            throwError(`Reference Error`, `'${ast.value.value}' is not defined`, filedata, ast.value.line, ast.value.col)
        } else if (func.__type != 'method') {
            throwError(`Reference Error`, `'${ast.value.value}' is not a method`, filedata, ast.value.line, ast.value.col)
        }

        let args = await parse_params(ast.args, scope, depth_value, filedata)

        if (func.__internal__()) {
            let internal_type = func.__get_statements__()
            if (internal_type == '<internal_print>') {
                let sep = args.sep?.__value_of__() ?? ' '
                let end = args.end?.__value_of__() ?? '\n'
                process.stdout.write(`${await toString(args, sep, scope)}${end}`)

                return new WaveGrassNull()
            } else if (internal_type == '<internal_prompt>') {
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
                ret_val = await run(i, lscope, depth_value + 1, filedata)
                if (ret_val) break
            }

            scopes[lscope] = undefined

            return ret_val ?? new WaveGrassNull()
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

        if ((await operate(ast.condition.value, scope, filedata)).__value_of__()) {
            for (const i of ast.positive) {
                let v = await run(i, lscope, depth_value + 1, filedata)
                if (v && v.type == 'break') break
            }
        } else {
            if (ast.negative) {
                if (Array.isArray(ast.negative)) {
                    for (const i of ast.negative) {
                        let v = await run(i, lscope, depth_value + 1, filedata)
                        if (v && v.type == 'break') break
                    }
                } else {
                    await run(ast.negative, lscope, depth_value + 1, filedata)
                }
            }
        }
        scopes[lscope] = undefined
    } else if (ast.type == 'for') {
        let lscope = 'for' + depth_value
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if (ast.loopvar.operation?.type == 'assignment') {
            ast.loopvar.type = ast.loopvar.operation.type
            ast.loopvar = await run(ast.loopvar, lscope, depth_value, filedata)
        }
        while ((conditional_check(ast.condition, lscope, filedata)).__value_of__()) {
            for (const i of ast.block) {
                let v = await run(i, lscope, depth_value + 1, filedata)
                if (v && v.type == 'break') break
            }

            await run(ast.change, lscope, depth_value, filedata)
        }

        scopes[lscope] = undefined

    } else if (ast.type == 'while') {
        let lscope = 'while' + depth_value
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }


        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }

        while ((await operate(ast.condition.value, scope, filedata)).__value_of__()) {
            for (const i of ast.block) {
                let v = await run(i, lscope, depth_value + 1, filedata)
                if (v && v.type == 'break') break
            }
        }
        scopes[lscope] = undefined
    } else if (ast.type == 'return') {
        return ast.value.operation ? await operate(ast.value, scope, depth_value, filedata) : ast.value
    } else if (ast.type == 'break') {
        return { type: 'break' }
    }

}

/**
 * 
 * @param { { asts: import("./parser").Token[], filedata: { lines: string[], name: string } } } tokens 
 */
const execute = async (tokens, scope = 'global', depth_value = 0) => {
    let hoists = []
    for (let i = 0; i < tokens.asts.length; i++) {
        if (tokens.asts[i]?.type == 'hoist') {
            hoists.push(tokens.asts.splice(i, 1)[0].value)
        }
    }

    for (const i of hoists) {
        await run(i, scope, depth_value, tokens.filedata)
    }

    for (const i of tokens.asts) {
        await run(i, scope, depth_value, tokens.filedata)
    }
}

module.exports = execute
