const throwError = require("./throwError")

class WaveGrassObject {

    constructor(value) {
        this.__value = value
        this.__type = 'Object'
        this.__properties = {
            toString: this.__string__
        }

        this.__mutable = false
    }

    __string__ = () => {
        return '[Object object]'
    }

    __len__ = () => {
        throwError()
    }

    __value_of__ = () => {
        return this.__value
    }

    __class__ = () => {
        return { type: 'class', value: this.constructor.name }
    }

    __name__ = () => {
        return { type: 'string', value: this.constructor.name }
    }

    __type__ = () => {
        return this.__type
    }

    /**
     * 
     * @param { WaveGrassObject } lval 
     * @param { WaveGrassObject } rval 
     * 
     * @returns { WaveGrassObject }
     */

    __add__ = rval => { }

    __r_add__ = rval => {
        return this.__add__(rval)
    }

    __sub__ = rval => { }

    __r_sub__ = rval => {
        return this.__sub__(rval)
    }

    __mul__ = rval => { }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __div__ = rval => { }

    __r_div__ = rval => {
        return this.__div__(rval)
    }

    __expo__ = rval => { }

    __r_expo__ = rval => { }

    __mod__ = rval => { }

    __r_mod__ = rval => { }

    __negate__ = () => { }

    __normal__ = () => { }

    __bool__ = () => { }

    __equals__ = rval => { }

    __greater_than__ = rval => { }

    __less_than__ = rval => { }

    __constructor__ = rval => this.constructor

    __b_and__ = rval => { }

    __r_b_and__ = rval => { }

    __b_or__ = rval => { }

    __r_b_or__ = rval => { }

    __b_xor__ = rval => { }

    __r_b_xor__ = rval => { }

    __b_not__ = rval => { }

    __b_l_shift__ = rval => { }

    __r_b_l_shift__ = rval => { }

    __b_r_s_shift__ = rval => { }

    __r_b_r_s_shift__ = rval => { }

    __b_r_us_shift = rval => { }

    __r_b_r_us_shift__ = rval => { }

    __iterator__ = rval => { }

    __get_property__ = name => {
        return this.__properties[name]
    }

    __set_property__ = (name, value) => {
        this.__properties[name] = value
    }
}


class WaveGrassNumber extends WaveGrassObject {
    static NaN = 'NaN'

    constructor(value) {
        super(value)
        this.__type = 'number'

        this.__properties = {
            toString: () => { }
        }

        this.__mutable = false
    }

    __string__ = () => {
        return `${this.__value_of__()}`
    }

    __add__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(this.__value_of__() + rval.__value_of__())
        } else return new WaveGrassError(`Cannot add a ${rval.__class__()} and <class number>`)
    }

    __r_add__ = rval => {
        return this.__add__(rval)
    }

    __sub__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(this.__value_of__() - rval.__value_of__())
        } else return new WaveGrassError(`Cannot subract a ${rval.__class__()} and <class number>`)
    }

    __r_sub__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(rval.__value_of__() - this.__value_of__())
        } else return new WaveGrassError(`Cannot subtract a ${rval.__class__()} and <class number>`)
    }

    __mul__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(this.__value_of__() * rval.__value_of__())
        } else return new WaveGrassError(`Cannot multiply a ${rval.__class__()} and <class number>`)
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }


    __div__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(this.__value_of__() / rval.__value_of__())
        } else return new WaveGrassError(`Cannot subract a ${rval.__class__()} and <class number>`)
    }

    __r_div__ = rval => {
        if (rval.__type__() == 'number') {
            return new WaveGrassNumber(rval.__value_of__() / this.__value_of__())
        } else return new WaveGrassError(`Cannot subtract a ${rval.__class__()} and <class number>`)
    }

    __equals__ = rval => {
        if (rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __strict_equals = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() < this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __less_than__ = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() > this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __bool__ = () => {
        if (this.__value == 0) return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __mod__ = rval => {
        return new WaveGrassNumber(this.__value_of__() % rval.__value_of__())
    }

    static parseInt = (n, radix = 10) => {
        return parseInt(n, radix)
    }
}

class WaveGrassString extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type = 'string'

        this.__mutable = false
    }

    __string__ = () => {
        return this.__value_of__()
    }

    __add__ = rval => {
        return new WaveGrassString(this.__string__() + rval.__string__())
    }

    __r_add__ = rval => {
        return new WaveGrassString(rval.__string__() + this.__string__())
    }

    __mul__ = rval => {
        return new WaveGrassString(this.__string__().repeat(WaveGrassNumber.parseInt(rval, 10)))
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __bool__ = () => {
        if (this.__value == '') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __iterator__ = () => {
        let index = 0
        return {
            next: () => {
                return { char: new WaveGrassString(this.__value[index]), index: new WaveGrassNumber(index++), finished: index == this.__value.length }
            }
        }
    }

}

class WaveGrassArray extends WaveGrassObject {

}

class WaveGrassFunction extends WaveGrassObject {
    constructor(name, args, statements, internal = false) {
        super(`[Function ${name}]`)
        this.__type = 'method'

        this.__name = name
        this.__args = args
        this.__statements = statements
        this.__is_internal = internal
    }

    __get_args__ = () => {
        return this.__args
    }

    __get_statements__ = () => this.__statements

    __internal__ = () => this.__is_internal
}

class WaveGrassBoolean extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type == 'boolean'

        this.__mutable = false
    }

    __bool__ = () => {
        return this
    }
}

class WaveGrassError extends WaveGrassObject {
    constructor(message) {
        super(message)
        this.__type = 'error'
    }

    static isError(value) {
        return value.constructor == WaveGrassError
    }
}

class WaveGrassNull extends WaveGrassObject {
    constructor() {
        super(null)
        this.__type = null
    }

    __bool__ = () => new WaveGrassBoolean(false)


    __add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        else if (rval.__type__() == 'string') return new WaveGrassString('null').__add__(rval)
    }

    __r_add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        else if (rval.__type__() == 'string') return rval.__add__(new WaveGrassString('null'))
    }
}

const getClassFromType = (obj) => {
    if (obj == 'number') return WaveGrassNumber
    else if (obj == 'string') return WaveGrassString
    else if (obj == 'array') return WaveGrassArray
    else if (obj == 'method') return WaveGrassFunction
    else if (obj == 'boolean') return WaveGrassBoolean

}
const createObject = (type, ...extra) => {
    if (['number', 'string', 'method', 'array'].includes(type)) {
        return new (getClassFromType(type))(...extra)
    }
}

const print = new WaveGrassFunction('print', ['*nargs', 'sep', 'end'], '<internal_print>', true)
const prompt = new WaveGrassFunction('prompt', ['prompt'], '<internal_prompt>', true)

module.exports = {
    WaveGrassObject, WaveGrassNumber, WaveGrassString,
    WaveGrassArray, WaveGrassBoolean, WaveGrassError,
    WaveGrassFunction, WaveGrassNull,
    createObject,
    print, prompt
}
