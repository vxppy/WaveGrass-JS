const throwError = require("./throwError")

class WaveGrassObject {

    constructor(value) {
        this.value = value
        this.type = 'Object'
    }

    __string__ = () => {
        return '[Object object]'
    }

    __len__ = () => {
        throwError()
    }

    __value_of__ = () => {
        return this.value
    }

    __class__ = () => {
        return { type: 'class', value: this.constructor.name }
    }

    __name__ = () => {
        return { type: 'string', value: this.constructor.name }
    }

    __type__ = () => {
        return this.type
    }

    /**
     * 
     * @param { WaveGrassObject } lval 
     * @param { WaveGrassObject } rval 
     * 
     * @returns { WaveGrassObject }
     */

    __add__ = rval => { }

    __r_add__ = rval => { }

    __sub__ = rval => { }

    __r_sub__ = rval => { }

    __mul__ = rval => { }

    __r_mul__ = rval => { }

    __div__ = rval => { }

    __r_div = rval => { }

    __negate__ = () => { }

    __normal__ = () => { }

    __bool__ = () => { }

    __equals__ = rval => { }

    __greater_than__ = rval => { }

    __less_than__ = rval => { }

    __constructor__ = rval => this.constructor

    __b_and__ = rval => { }

    __b_or__ = rval => { }

    __b_xor__ = rval => { }

    __b_not__ = rval => { }

    __b_l_shift__ = rval => { }

    __b_r_s_shift__ = rval => { }

    __b_r_us_shift = rval => { }

    __iterator__ = rval => { }

    __get_property__ = name => { }

    __set_property__ = (name, value) => { }
}


class WaveGrassNumber extends WaveGrassObject {
    static NaN = 'NaN'

    constructor(value) {
        super(value)
        this.type = 'number'
    }

    __string__ = () => {
        return `${this.__value_of__()}`
    }

    __add__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(this.__value_of__() + rval.__value_of__())
        } else return new WaveGrassError(`Cannot add a ${rval.__class__()} and <class number>`)
    }

    __r_add__ = rval => {
        return this.__add__(rval)
    }

    __sub__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(this.__value_of__() - rval.__value_of__())
        } else return new WaveGrassError(`Cannot subract a ${rval.__class__()} and <class number>`)
    }

    __r_sub__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(rval.__value_of__() - this.__value_of__())
        } else return new WaveGrassError(`Cannot subtract a ${rval.__class__()} and <class number>`)
    }

    __mul__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(this.__value_of__() * rval.__value_of__())
        } else return new WaveGrassError(`Cannot multiply a ${rval.__class__()} and <class number>`)
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }


    __div__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(this.__value_of__() / rval.__value_of__())
        } else return new WaveGrassError(`Cannot subract a ${rval.__class__()} and <class number>`)
    }

    __r_div__ = rval => {
        if (rval.type == 'number') {
            return new WaveGrassNumber(rval.__value_of__() / this.__value_of__())
        } else return new WaveGrassError(`Cannot subtract a ${rval.__class__()} and <class number>`)
    }

    __equals__ = rval => {
        if (rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return WaveGrassBoolean(false)
    }

    __strict_equals = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() > this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return WaveGrassBoolean(false)
    }

    __less_than__ = rval => {
        if (rval.__type__() == this.__type__() && rval.__value_of__() < this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return WaveGrassBoolean(false)
    }

    __bool__ = () => {
        if (this.value == 0) return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    static parseInt = (n, radix = 10) => {
        return parseInt(n, radix)
    }
}

class WaveGrassString extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.type = 'string'
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
        if (this.value == '') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

}

class WaveGrassArray extends WaveGrassObject {

}

class WaveGrassFunction extends WaveGrassObject {

}

class WaveGrassBoolean extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.type == 'boolean'
    }

    __bool__ = () => {
        return this
    }
}

class WaveGrassError extends WaveGrassObject {
    constructor(message) {
        super(message)
        this.type = 'error'
    }

    static isError(value) {
        return value.constructor == WaveGrassError
    }
}

const getClassFromType = (obj) => {
    if (obj == 'number') return WaveGrassNumber
    else if (obj == 'string') return WaveGrassString
    else if (obj == 'array') return WaveGrassArray
    else if (obj == 'method') return WaveGrassFunction
    else if (obj == 'boolean') return WaveGrassBoolean

}
const createObject = (type, value) => {
    if (['number', 'string', 'method', 'array'].includes(type)) {
        return new (getClassFromType(type))(value)
    }
}

module.exports = {
    WaveGrassObject, WaveGrassNumber, WaveGrassString, WaveGrassArray, WaveGrassBoolean, WaveGrassError, createObject
}