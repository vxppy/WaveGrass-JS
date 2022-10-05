const createReadStream = require('./syncReadable')

const MAX_READ_SIZE = 1024
const KEYWORDS = ['let', 'const', 'if', 'else', 'for', 'while', 'do', 'define', 'break', 'hoist']
const BOOLEANS = ['true', 'false']

class Lexer {
    /**
     * @type { string }
     */
    _buffer = ''
    /**
     * @type { { read: (size: number) => Promise<str> } }
     */
    _reader
    /**
     * @type { number }
     */
    _readpos = 0
    /**
     * @type { string }
     */
    _lastchar = null

    _buffering = false

    /**
     * 
     * @param { string } filename 
     */
    constructor(filename) {
        this._reader = createReadStream(filename)
    }


    /**
     * @returns { Promise<{ type: str, value: any }> }
     */
    async requestNextToken() {
        if(this._lastchar) {
            let chr = this._lastchar
            this._lastchar = null
            return chr
        }
        if (!this._buffer && this._buffer != '') {
            this._lastchar = { type: 'EOF' }
            return { type: 'delim' }
        }
        if (this._readpos == this._buffer.length) {
            await this._fillBuffer()

            if (!this._buffer) {
                this._lastchar = { type: 'EOF' }
                return { type: 'delim' }
            }
        }

        let currCode = this._buffer.charCodeAt(this._readpos)

        while (currCode == 32 || currCode == 9) {
            this._readpos++
            currCode = this._buffer.charCodeAt(this._readpos)

            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
            }

            if (!this._buffer) { 
                this._lastchar = { type: 'EOF' }
                return { type: 'delim' }
            }
        }
        if (currCode == 10) {
            this._readpos++
            if (!this._buffering || this._readpos == this._buffer.length) return { type: 'delim' }
            else return await this.requestNextToken();
        }
        if (currCode > 48 && currCode < 58) {
            return { type: 'number', value: await this._parseNum() }
        } if (currCode == 34 || currCode == 39) {
            return { type: 'string', value: await this._parseString() }
        } if ((currCode > 64 && currCode < 91) || (currCode > 96 && currCode < 123) || currCode == 95) {
            let val = await this._parseName()
            if (KEYWORDS.includes(val)) {
                this._buffering = true
                return { type: 'keyword', value: val }
            }
            return { type: BOOLEANS.includes(val) ? 'boolean' : 'variable', value: val }
        } if (currCode == 61) {
            this._readpos++

            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
                if (!this._buffer) return { type: 'assignment' }
            } 

            if(this._buffer[this._readpos] == '=') {
                this._readpos++
                return { type: 'operator', value: '==' }
            }

            return { type: 'assignment' }
        }

        let curr = this._buffer[this._readpos]

        if ('+-/*'.includes(curr)) {
            this._readpos++

            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()

                if (!this._buffer) return { type: 'operator', value: curr }
            }

            if (this._buffer[this._readpos] == curr) {
                this._readpos++
                return { type: 'operator', value: `${curr}${curr}` }
            }

            if (this._buffer[this._readpos] == '=') {
                this._readpos++
                return { type: 'operator', value: `${curr}=` }
            }

            return { type: 'operator', value: curr }
        }

        if (curr == ':') {
            this._readpos++
            return { type: 'operator', value: ':' }
        }

        if (curr == '.') {
            this._readpos++
            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
                if (!this._buffer) return { type: 'operator', value: curr }
            }

            if (this._buffer[this._readpos] == curr) {
                this._readpos++
                if (this._readpos == this._buffer.length) {
                    await this._fillBuffer()

                    if (!this._buffer) throw Error()
                }

                if (this._buffer[this._readpos] == curr) {
                    this._readpos++

                    return { type: 'operator', value: '...' }
                }

                throw Error()
            }
            return { type: 'operator', value: curr }
        } else if (curr == '{') {
            this._readpos++
            if (this._buffering) {
                this._buffering = false
            }

            return { type: 'symbol', value: curr }
        }
        return { type: 'symbol', value: this._buffer[this._readpos++] }
    }

    async _fillBuffer() {
        this._buffer = await this._reader.read(MAX_READ_SIZE)
        if (this._buffer) this._buffer = this._buffer.replace(/\r\n/g, '\n')
        this._readpos = 0
    }

    async _parseNum() {
        let currCode = this._buffer.charCodeAt(this._readpos)

        let num = 0
        while ((currCode > 47 && currCode < 58) || (currCode == 78)) {
            num = num * 10 + currCode - 48

            this._readpos++
            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
            }
            if (!this._buffer) break;
            currCode = this._buffer.charCodeAt(this._readpos)
        }

        return num
    }

    async _parseString() {
        let delim = this._buffer[this._readpos]
        let str = []
        this._readpos++
        while (this._buffer[this._readpos] != delim) {
            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
            }

            if (!this._buffer) {
                throw new Error('oops')
            }

            str.push(this._buffer[this._readpos])
            this._readpos++
        }

        this._readpos++
        if (this._readpos > this._buffer) await this._fillBuffer()
        return str.join('')
    }

    async _parseName() {
        let currCode = this._buffer.charCodeAt(this._readpos)

        let str = []
        while ((currCode > 48 && currCode < 58) || (currCode > 64 && currCode < 91) || (currCode > 96 && currCode < 123) || currCode == 95) {
            str.push(this._buffer[this._readpos])

            this._readpos++
            if (this._readpos == this._buffer.length) {
                await this._fillBuffer()
            }

            if (!this._buffer) break;
            currCode = this._buffer.charCodeAt(this._readpos)
        }

        return str.join('')
    }

    isEOF() {
        return this._reader.closed()
    }
}

module.exports = Lexer