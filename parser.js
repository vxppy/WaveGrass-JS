/**
 * @typedef { { type: string, value: any } } Token
 * @typedef { { type: string, value: string } } Operator
 * @typedef { { type: string, value?: Token[] | AST[], lhs?: Token, rhs?: Token[], function?: WaveGrassFunction, condition?: Token[], body?: AST[] } } AST
 */

const throwError = require("./errors")
const { WaveGrassError } = require("./wavegrassObject")

const prec = {
    '.': 0,
    'call': 0,
    '**': 1,
    '*': 2,
    '/': 2,
    '+': 3,
    '-': 3,
    '&': 4,
    '|': 4,
    '^': 4,
    '~': 4,
    '==': 5,
    '>=': 5,
    '<=': 5,
    '<': 5,
    '>': 5,
    '!=': 5,
    '&&': 6,
    '||': 6,
    '(': -1,
    ':': 7
}

const VALUES = ['variable', 'number', 'string', 'boolean', 'call']

/**
 * 
 * @param { Token[] } tokens 
 * @returns { Token[] }
 */
const toPostFix = (tokens) => {
    let opp = []
    let value = []

    for (let i = 0; i < tokens.length; i++) {
        if (VALUES.includes(tokens[i].type)) {
            value.push(tokens[i])
        } else if (tokens[i].type == 'operator') {
            if(tokens[i].value == ':') {
                if(value.find(i => i.value == ':' && i.type == 'operator') || opp.find(i => i.value == ':' && i.type == 'operator')) throw Error()
            }

            while (opp[opp.length - 1] && prec[opp[opp.length - 1].value] <= prec[tokens[i].value]) {
                value.push(opp.pop())
            }
            opp.push(tokens[i])
        } else if (tokens[i].type == 'symbol') {
            if (tokens[i].value == '(') {
                if (tokens[i - 1] && VALUES.includes(tokens[i - 1].type)) {
                    let stk = []
                    let val = []
                    for (let j = i + 1; j < tokens.length; j++) {
                        if (tokens[j].type == 'symbol') {
                            if (tokens[j].value == '(') {
                                stk.push('(')
                            } else if (tokens[j].value == ')') {
                                if (!stk.length) {
                                    i = j
                                    break
                                }
                                else {
                                    stk.pop()
                                }
                            }
                        }
                        val.push(tokens[j])
                    }

                    while (opp[opp.length - 1] && prec[opp[opp.length - 1].value] <= prec['call']) {
                        value.push(opp.pop())
                    }
                    opp.push({ type: 'operator', value: 'call', args: parseParams(val) })
                } else opp.push(tokens[i])
            }
            if (tokens[i].value == ')') {
                while (opp.length && (opp[opp.length - 1].value != '(' && opp[opp.length - 1].type != 'symbol')) {
                    value.push(opp.pop())
                }
                opp.pop()
            }
        } 
    }

    while (opp.length) {
        value.push(opp.pop())
    }

    return value
}

/**
 * 
 * @param { Token[] } tokens 
 * @returns { { requestNextToken() => Token }}
 */
const semiLexer = (tokens) => {
    let i = 0;
    tokens.push({ type: 'delim' })
    return {
        requestNextToken() {
            return tokens[i++]
        }
    }
}

/**
 * 
 * @param { Token[] } tokens 
 * @returns { Token[][] }
 */
const parseParams = (tokens) => {
    let stk = []
    let args = []
    let temp = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == 'symbol') {
            if (tokens[i].value == '(') stk.push(tokens[i])
            else if (tokens[i].value == ')') {
                if (!stk.length) throw Error
                else stk.pop()
            } else if (tokens[i].value == ',') {
                if (!stk.length) {
                    i++
                    args.push(toPostFix(temp))
                    temp = []
                }
            }
        }
        temp.push(tokens[i])
    }

    if (temp.length) {
        args.push(toPostFix(temp))
    }

    return args
}

class Parser {
    _lexer
    _lastToken
    constructor(lexer) {
        this._lexer = lexer
    }

    /**
     * 
     * @param { Token } till 
     * @returns { Promise<Token[]> }
     */
    async collectTokens(till) {
        let tokens = []
        let token = await this._lexer.requestNextToken()

        let end = true

        if(till.value) {
            while (!(token.type == till.type && token.value == till.value)) {
                tokens.push(token)
                token = await this._lexer.requestNextToken()  
                if(token.type == 'EOF') {
                    end = false
                    break
                }
            }
        } else {
            while (token.type != till.type) {
                tokens.push(token)
                token = await this._lexer.requestNextToken()    
                if(!token) {
                    end = false
                    token = { type: 'delim' }
                    break
                }
            }
        }

        if(!end) throw Error()

        this._lastToken = token
        return this.removeExtraDelims(tokens)
    }

    /**
     * 
     * @param { Token[] } tokens 
     * @returns { Token[] }
     */
    removeExtraDelims(tokens) {
        let arr = []
        let delim = false
        let start = false

        for(let i = 0; i < tokens.length; i++) {
            if(tokens[i].type == 'delim') {
                if(start && !delim) {
                    arr.push(tokens[i])
                    delim = true 
                }
            } else {
                if(!start) start = true
                arr.push(tokens[i])
                if(delim) delim = false
            }
        }

        return arr
    }

    /**
     * 
     * @param { Token[] } tokens 
     * @returns { Promise<AST[]> }
     */
    async parseStatements(tokens) {
        let lexer = this._lexer
        this._lexer = semiLexer(tokens)

        let tree = await this.parseNext();
        let asts = []
        while(tree) {
            asts.push(tree)
            tree = await this.parseNext()
        }

        this._lexer = lexer
        return asts
    }

    /**
     * 
     * @param { Token } prev 
     * @returns { Promise<AST> } 
     */
    async parseNext(prev = null) {
        /**
         * @type { { type: string, value: any } }
         */
        let curr;

        if (this._lastToken) {
            if (this._lastToken.type == 'delim') {
                this._lastToken = null
                return prev
            } else {
                curr = this._lastToken
                this._lastToken = null
            }
        } else {
            curr = await this._lexer.requestNextToken()
        }

        if (curr.type == 'delim') {
            if(this._lastDelim) return await this.parseNext(prev)
            let nzt = await this._lexer.requestNextToken()
            if(prev && prev.type == 'if' && nzt.type == 'keyword' && nzt.value == 'else') {
                return await this.parseNext(prev)
            } else {
                this._lastToken = nzt
            }
            return prev
        }

        if (VALUES.includes(curr.type)) {
            curr.const = false
            if(prev) {
                if(prev.type == 'keyword') {
                    if(prev.value == 'let') {
                        curr.const = false
                    } else if(prev.value == 'const'){
                        curr.const = true
                    } else throwError(new WaveGrassError())

                    curr.def = true
                    return await this.parseNext(curr)
                } else {
                    throwError(new WaveGrassError())
                }
            } else return await this.parseNext(curr)
        }

        if (curr.type == 'assignment') {
            if (!prev) {
                throw Error()
            } else {
                if(curr.value) {
                    return await this.parseNext({ type: 'assignment', lhs: prev, rhs: [prev, ...toPostFix(await this.collectTokens({ type: 'delim' })), { type: 'operator', value: curr.value }] })
                }

                return await this.parseNext({ type: 'assignment', lhs: prev, rhs: toPostFix(await this.collectTokens({ type: 'delim' })) })
            }
        }

        if (curr.type == 'keyword') {
            if(curr.value == 'let' || curr.value == 'const') {
                return await this.parseNext(curr)
            }

            if(curr.value == 'if') {
                let condition = toPostFix(await this.collectTokens({ type: 'symbol', value: '{'}))
                this._lastToken = null
                let body = []

                let tokens = await this.collectTokens({ type: 'symbol', value: '}'})
                if(tokens.length) body = await this.parseStatements(tokens)

                if(this._lastToken) this._lastToken = null

                return this.parseNext({ type: 'if', condition: condition, body: body })
            }
            if(curr.value == 'else') {
                if(!prev || prev.type != 'if') throw Error()
                let next = await this._lexer.requestNextToken()

                if(next.type == 'keyword') {
                    this._lastToken = next;
                    let nxt = await this.parseNext()
                    prev.elsebody = [nxt]
                    return await this.parseNext(prev)
                }

                let tokens = await this.collectTokens({ type: 'symbol', value: '}'})

                let elsebody = []
                if(tokens.length) elsebody = await this.parseStatements(tokens)
                if(this._lastToken) this._lastToken = null

                prev.elsebody = elsebody
                return await this.parseNext(prev)
            }

            if(curr.value == 'while') {
                let condition = toPostFix(await this.collectTokens({ type: 'symbol', value: '{'}))
                this._lastToken = null
                let body = []
                let tokens = await this.collectTokens({ type: 'symbol', value: '}'})

                if(tokens.length) body = await this.parseStatements(tokens)
                if(this._lastToken) this._lastToken = null

                return this.parseNext({ type: 'while', condition: condition, body: body })
            }
        }
        
        if (curr.type == 'symbol' || curr.type == 'operator') {
            if (prev) {
                return this.parseNext({ type: 'expr', value: toPostFix([prev, curr, ...await this.collectTokens({ type: 'delim' })]) })
            } else {
                return this.parseNext({ type: 'expr', value: toPostFix([curr, ...await this.collectTokens({ type: 'delim' })]) })
            }
        }

        if(curr.type == 'EOF') {
            if(prev) { return prev }
            return { type: 'end' }
        }
    }
}

module.exports = Parser