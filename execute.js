const throwError = require("./throwError")

/**
 * @type { { [ scope: string ]: { map: Map, parent?: string }}}
 */
const scopes = {
    global: {
        map: new Map(),
        parent: null
    }
}
const operate = async (ast, scope) => {
    if(ast.operation.value == ':') {
        return { type: 'property', name: ast.lhs, value: ast.rhs }
    }

    if(ast.operation.value == '=') {
        if(ast.lhs.type != 'variable') {
            throwError()
        }

        let s = scope
        let found, value
        while(s) {
            found = scopes[scope].map.has(ast.lhs.value)
            if(!found) s = scopes[scope].parent
            else {
                if(ast.rhs.operation) {
                    scopes[scope].map.set(ast.lhs.value, await operate(ast.rhs))                    
                } else {
                    scopes[scope].map.set(ast.lhs.value, ast.rhs)    
                }
                value = scopes[scope].map.get(ast.lhs.value)
                break
            }
        }

        if(!found) throwError()
        return value
    }
}

const getValueOfVariable = (v, scope) => {
    let s = scope
    let value = null
    while(s) {
        value = scopes[s].map.get(v.value)
        if(!value) s = scopes[s].parent
        else break
    }
    return value ?? { type: 'nf' }
}

const run = async (ast, scope) => {
    if(ast.type == 'assignment') {
        scopes[scope].map.set(ast.lhs.value, ast.rhs)
    } else if(ast.type == 'call') {
        const params = []
        const positional_args = {}

        for(const i of ast.args) {
            if(i.operation) {
                let operated = await operate(i, scope)
                if(operated.type == 'property') {
                    positional_args[operated.name.value] = operated.value
                } else {
                    params.push(operated)
                }
            } else {
                if(i.type == 'variable') {
                    let value = getValueOfVariable(i, scope)
                    if(value.type == 'nf') {
                        throwError()
                    }
                    params.push(value)
                } else params.push(i)
            }
        }

        if(ast.value.value == 'log') {
            let sep = positional_args.sep?.value ?? ' '
            let end = positional_args.end?.value ?? '\n'
            process.stdout.write(`${params.map(i => i.value).join(sep)}${end}`)
        }
    }
}

/**
 * 
 * @param { import("./parser").Token[] } tokens 
 */
const execute = async (tokens, scope='global') => {
    let hoists = []
    for(let i = 0; i < tokens.length; i++) {
        if(tokens[i]?.type == 'hoist') {
            hoists.push(tokens.splice(i, 1)[0].value)
        }
    }

    for(const i of hoists) {
        await run(i, scope)
    }

    for(const i of tokens) {
        await run(i, scope)
    }
}

module.exports = execute