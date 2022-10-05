const { input } = require("./modules/input")
const { createObject, WaveGrassFunction, WaveGrassNumber, WaveGrassString, WaveGrassError, WaveGrassNull, WaveGrassObject } = require("./wavegrassObject")
const { wrap } = require("./wrap")

/**
 * @typedef { { type: string, value: any } } Token
 * @typedef { { type: string, value: string } } Operator
 * @typedef { { type: string, value?: Token[] | AST[], lhs?: Token, rhs?: Token[], function?: WaveGrassFunction, condition?: Token[], body?: AST[] } } AST
 */

const log = (args) => {
    process.stdout.write(`${args.positional.map(i => i.__string__()).join(args.key.sep?.__value_of__() ?? ' ')}${args.key.end?.__value_of__() ?? '\n'}`)
}

const _input = async (args) => {
    return new WaveGrassString(await input(args.positional[0].__value_of__(), args.key.encoding?.__value_of__() ?? 'utf-8'))
}

const unary = ['!', '_+', '__+', '_-', '__-', '~']

class Environment {
    /**
     * @type { string[] }
     */
    _stack = ['global']
    /**
     * @type { { [scope: string]: { [variable: string]: { ref: boolean, value: string | WaveGrassObject } } } }
     */
    _scopes = {
        'global': {
            log: {
                ref: false,
                value: new WaveGrassFunction('log', ['*', 'sep', 'end'], [], 'global', true, null, true, log)
            },
            input: {
                ref: false,
                value: new WaveGrassFunction('input', ['message'], [], 'global', true, null, true, _input)
            }
        }
    }

    constructor() { }

    /**
     * 
     * @param { string} val 
     * @returns { { ref: boolean, value: string | WaveGrassObject } }
     */
    getVariable(val) {
        for (let i = this._stack.length - 1; i > -1; i--) {
            if (val in this._scopes[this._stack[i]]) {
                return this._scopes[this._stack[i]][val]
            }
        }
    }

    /**
     * 
     * @param { string } val 
     * @returns { string }
     */
    getScope(val) {
        for (let i = this._stack.length - 1; i > -1; i--) {
            if (val in this._scopes[this._stack[i]]) {
                return this._stack[i]
            }
        }

        return this._stack[this._stack.length - 1]
    }

    /**
     * 
     * @param { Operator } opp 
     * @param { WaveGrassObject } rhs 
     * @param { WaveGrassObject } [lhs]
     * @returns { WaveGrassObject }
     */
    operate_opp(opp, rhs, lhs) {
        if (!unary.includes(opp.value) && !(lhs && rhs)) {
            throwError(new WaveGrassError('Syntax Error', 'Invalid operation', opp.col, opp.line))
        }

        let value = null
        if (opp.value == '+') {
            value = lhs.__add__(rhs);
            if (WaveGrassError.isError(value)) value = rhs.__r_add__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_add__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__add__(rhs)
        } else if (opp.value == '-') {
            value = lhs.__sub__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_sub__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_sub__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__sub__(lhs)
        } else if (opp.value == '_-') {
            value = new WaveGrassNumber(0).__sub__(lhs)
        } else if (opp.value == '_+') {
            value = new WaveGrassNumber(0).__add__(lhs)
        } else if (opp.value == '*') {
            value = lhs.__mul__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_mul__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_mul__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__mul__(lhs)

        } else if (opp.value == '/') {
            value = lhs.__div__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_div__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_div__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__div__(lhs)

        } else if (opp.value == '%') {
            value = lhs.__mod__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_mod__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_mod__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__mod__(lhs)
        } else if (opp.value == '!') {
            if (lhs.type == 'nf') {
                value = new WaveGrassBoolean(false)
            } else value = lhs.__not__()
        } else if (opp.value == '!!') {
            if (lhs.type == 'nf') {
                value = new WaveGrassBoolean(true)
            } else value = lhs.__bool__()
        } else if (opp.value == '~') {
            value = lhs.__b_not__()
        } else if (opp.value == '~~') {
            value = lhs.__b_not__().__b_not__()
        } else if (opp.value == '++') {
            lhs.__value = lhs.__add__(new WaveGrassNumber(1)).__value_of__()
            value = lhs
        } else if (opp.value == '_++') {
            let old_value = createObject(lhs.__type__(), lhs.__value_of__())
            lhs.__value = lhs.__add__(new WaveGrassNumber(1)).__value_of__()
            value = old_value
        } else if (opp.value == '--') {
            lhs.__value = lhs.__sub__(new WaveGrassNumber(1)).__value_of__()
            value = lhs
        } else if (opp.value == '_--') {
            let old_value = createObject(lhs.__type__(), lhs.__value_of__())
            lhs.__value = lhs.__sub__(new WaveGrassNumber(1)).__value_of__()
            value = old_value
        } else if (opp.value == '&') {
            value = lhs.__b_and__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_and__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_and__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_and__(lhs)
        } else if (opp.value == '^') {
            value = lhs.__b_xor__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_b_xor__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_xor__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_xor__(lhs)
        } else if (opp.value == '|') {
            value = lhs.__b_or__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_b_or__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_or__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_or__(lhs)
        } else if (opp.value == '<<') {
            value = lhs.__b_l_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_b_l_shift__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_l_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_l_shift__(lhs)
        } else if (opp.value == '>>') {
            value = lhs.__b_r_s_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_b_r_s_shift__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_r_s_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_r_s_shift__(lhs)
        } else if (opp.value == '>>>') {
            value = lhs.__b_r_us_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_b_r_us_shift__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_b_r_us_shift__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__b_r_us_shift__(lhs)
        } else if (opp.value == '&&') {
            value = lhs.__and__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_and__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_and__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__and__(lhs)
        } else if (opp.value == '||') {
            value = lhs.__or__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__r_or__(lhs)
            if (WaveGrassError.isError(value)) value = lhs.__r_or__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__or__(lhs)
        } else if (opp.value == '.') {
            value = lhs.__get_property__(rhs.value)

            if (typeof value == 'function') {
                value = new WaveGrassFunction(rhs.value, ['*n'], `<internal_${rhs.value}>`, WaveGrassError.file, true, lhs)
            }
            if (value instanceof WaveGrassObject) {

            } else {
                if (value.changeable !== null) value = value.value
                else value = createObject(typeof value, value)
            }
        } else if (opp.value == '===') {
            value = lhs.__strict_equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__strict_equals__(lhs)
        } else if (opp.value == '==') {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
        } else if (opp.value == '!=') {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)

            if (!WaveGrassError.isError(value)) {
                value = value.__not__()
            }
        } else if (opp.value == '!==') {
            value = lhs.__strict_equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__strict_equals__(lhs)

            if (!WaveGrassError.isError(value)) {
                value = value.__not__()
            }
        } else if (opp.value == '>') {
            value = lhs.__greater_than__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)
        } else if (opp.value == '<') {
            value = lhs.__less_than__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)
        } else if (opp.value == '>=') {
            value = lhs.__greater_than__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)

            if (value.__value_of__() == false) {
                value = lhs.__equals__(rhs)
                if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
            }
        } else if (opp.value == '<=') {
            value = lhs.__less_than__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)

            if (value.__value_of__() == false) {
                value = lhs.__equals__(rhs)
                if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
            }
        } else if (opp.value == 'in') {
            value = lhs.__in__(rhs)
        } else if (opp.value == 'of') {
            value = lhs.__of__(rhs)
        } else if (opp.value == 'as') {
            value = {
                type: 'as',
                lhs: lhs,
                rhs: rhs
            }
        } else {
            value = new WaveGrassNull()
        }

        if (WaveGrassError.isError(value)) {
            value.__col = opp.col
            value.__line = opp.line
            throwError(value)
        }

        return value
    }

    /**
     * 
     * @param { Token[] } tokens 
     * @returns { Promise<WaveGrassObject> }
     */
    async operate(tokens) {
        let value = []
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type == 'operator') {
                if (tokens[i].value == 'call') {
                    let v = value.pop()
                    if (v.__type != 'method') throw Error()
                    if (v.__native) {
                        value.push(await v.__native_function(await this.parseArgs(tokens[i].args)))
                    } else value.push(await this.execute({ type: 'call', function: v, args: await this.parseArgs(tokens[i].args) }))
                } else if (tokens[i].value == ':') {
                    return [tokens[0], value.pop()]
                } else {
                    value.push(this.operate_opp(tokens[i], value.pop(), value.pop()))
                }
            } else if (tokens[i].type == 'variable') {
                if (!tokens[i + 1] || !(tokens[i + 1].type == 'operator' && tokens[i + 1].value == '.')) {
                    if (!(tokens[tokens.length - 1].type == 'operator' && tokens[tokens.length - 1].value == ':' && i != tokens.length - 1)) {
                        let v = this.getVariable(tokens[i].value)
                        if (!v) {
                            throw Error()
                        }
                        value.push(v.value)
                    }
                } else {
                    value.push(tokens[i])
                }
            } else {
                value.push(createObject(tokens[i].type, tokens[i].value))
            }
        }

        return value[0]
    }

    /**
     * 
     * @param { Token[][] } args 
     * @returns { Promise<{ positional: WaveGrassObject[], key: { [val: string]: WaveGrassObject } }> }
     */
    async parseArgs(args) {
        let ag = {
            positional: [],
            key: {}
        }
        for (let i = 0; i < args.length; i++) {
            let v = await this.operate(args[i])
            if (v instanceof WaveGrassObject) ag.positional.push(v)
            else ag.key[v[0].value] = v[1]
        }
        return ag
    }

    /**
     * 
     * @param { AST } ast 
     * @returns { Promise<WaveGrassObject> } 
     */
    async execute(ast) {
        if (ast.type == 'expr') {
            return await this.operate(ast.value)
        } else if (ast.type == 'assignment') {
            let scope = this.getScope(ast.lhs.value)

            this._scopes[scope][ast.lhs.value] = {
                ref: false,
                value: await this.operate(ast.rhs)
            }
        } else if (ast.type == 'call') {
            let func = ast.function;
            if (func.__is_internal) {
                let statement = func.__statements;
                if (statement == '<internal___string__>') {
                    if (func.__belongs_to) {
                        return wrap({ '$': func.__belongs_to.__string__() })['$'];
                    } else {
                        return func.__string__()
                    }
                }
            }
        } else if (ast.type == 'if') {
            if ((await this.operate(ast.condition)).__bool__().__value_of__()) {
                let scope = `if${this._stack.length}`
                this._stack.push(scope)
                this._scopes[scope] = {}

                for (let i = 0; i < ast.body.length; i++) {
                    await this.execute(ast.body[i])
                }

                this._scopes[scope] = null
                this._stack.pop()
            }
        }
    }

    /**
     * 
     * @param { AST[] } asts 
     */
    async executeAll(asts) {
        let hoisted = []
        let normal = []
        for (let i = 0; i < asts.length; i++) {
            if (asts[i].type == 'hoist') {
                hoisted.push(asts[i].value)
            } else {
                normal.push(asts[i])
            }
        }

        for (let i = 0; i < hoisted.length; i++) {
            await this.execute(hoisted[i])
        }

        for (let i = 0; i < normal.length; i++) {
            await this.execute(normal[i])
        }
    }
}

module.exports = Environment