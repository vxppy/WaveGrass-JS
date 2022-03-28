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

    __add__ = rval => { return new WaveGrassError(`TypeError`, `Can't add two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`) }

    __r_add__ = rval => {
        return this.__add__(rval)
    }

    __sub__ = rval => {
        return new WaveGrassError('TypeError', `Can't subtract two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_sub__ = rval => {
        return this.__sub__(rval)
    }

    __mul__ = rval => {
        return new WaveGrassError('TypeError', `Can't multiply two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __div__ = rval => {
        return new WaveGrassError('TypeError', `Can't divide two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_div__ = rval => {
        return this.__div__(rval)
    }

    __expo__ = rval => {
        return new WaveGrassError('TypeError', `Can't raise <class ${this.__type__()}> to the power of <class ${rval.__type__()}>`)
    }

    __r_expo__ = rval => {
        return this.__expo__(rval)
    }

    __mod__ = rval => {
        return new WaveGrassError('TypeError', `Can't find the remainder between <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_mod__ = rval => {
        return this.__mod__(rval)
    }

    __negate__ = () => {
        return new WaveGrassError('TypeError', `Can't negate object of type <class ${this.__type__()}>`)
    }

    __normal__ = () => {
        return new WaveGrassError('TypeError', `Can't normalize object of type <class ${this.__type__()}>`)
    }

    __not__ = () => {
        if (this.__bool__().__value_of__()) return new WaveGrassBoolean(false)
        return new WaveGrassBoolean(true)
    }

    __bool__ = () => {
        if (this.__value) return new WaveGrassBoolean(true)
        return new WaveGrassBoolean(false)
    }

    __equals__ = rval => {
        if (this.__type__() == rval.__type__() && this.__value_of__() == rval.__value_of__()) return new WaveGrassBoolean(true)
        return new WaveGrassBoolean(false)
    }

    __strict_equals__ = rval => {
        if (this.__type__() == rval.__type__() && rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        return new WaveGrassError('TypeError', `Can't compare <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __less_than__ = rval => {
        return new WaveGrassError('TypeError', `Can't compare <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __constructor__ = rval => this.constructor

    __b_and__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_and__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_or__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_or__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_xor__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_xor__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_not__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_l_shift__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_l_shift__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_r_s_shift__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_r_s_shift__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __b_r_us_shift = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    __r_b_r_us_shift__ = rval => {
        return new WaveGrassError('Unimplemented', `This operator is not implemented`)
    }

    /**
     * 
     * @returns { WaveGrassNull | { next: () => { value: WaveGrassObject, index: WaveGrassNumber, finished: WaveGrassBoolean } } }
     */
    __iterator__ = () => {
        return new WaveGrassNull()
    }

    __get_property__ = name => {
        return this.__properties[name]
    }

    __set_property__ = (name, value) => {
        this.__properties[name] = value
    }

    __in__ = rval => {
        let iter = this.__iterator__()
        if (iter.__value_of__ && iter.__value_of__() == null) {
            return new WaveGrassError('TypeError', `<class ${this.__type__()}> is not iterable`)
        } else {
            let iter = this.__iterator__()
            let value = iter.next()
            while (!value.finished.__value_of__()) {
                if (value.value.__equals__(rval)) return new WaveGrassBoolean(true)
                value = iter.next()
            }
        }
        return new WaveGrassBoolean(false)
    }
}


class WaveGrassNumber extends WaveGrassObject {
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
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() + rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __sub__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() - rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __r_sub__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(rval.__value_of__() - this.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __mul__ = rval => {
        let old_type = rval.__type__(), old_value = rval.__value_of__()
        rval = WaveGrassNumber.parseInt(rval, 10)

        if(old_type == 'string' && isNaN(rval.__value_of__())) {
            if(this.__value_of__() != 'NaN') return new WaveGrassString(old_value.repeat(this.__value_of__()))
        }
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() * rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __div__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() / rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __r_div__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(rval.__value_of__() / this.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __equals__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == 'NaN' && this.__value_of__() != 'NaN') {
            return new WaveGrassBoolean(true)
        } else if (rval.__value_of__() != 'NaN' && this.__value_of__() == 'NaN') {
            return new WaveGrassBoolean(false)
        }
        else if (rval.__value_of__() < this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __less_than__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == 'NaN' && this.__value_of__() != 'NaN') {
            return new WaveGrassBoolean(true)
        } else if (rval.__value_of__() != 'NaN' && this.__value_of__() == 'NaN') {
            return new WaveGrassBoolean(false)
        }
        else if (rval.__value_of__() > this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __bool__ = () => {
        if (this.__value_of__() == 0 || this.__value_of__() == 'NaN') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __mod__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() % rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __r_mod__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(rval.__value_of__() % this.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __expo__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() ** rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __r_expo__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(rval.__value_of__() ** this.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    static parseInt = (n, radix = 10) => {
        if (!n.__type__()) return new WaveGrassNumber(0)

        if (n.__type__() == 'number') return n

        if (n.__type__() == 'boolean') return new WaveGrassNumber(n.__value_of__() ? 1 : 0)

        let v = parseInt(n.__value_of__(), radix)
        return new WaveGrassNumber(v)
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
        return new WaveGrassString(this.__string__().repeat(WaveGrassNumber.parseInt(rval, 10).__value_of__()))
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __bool__ = () => {
        if (this.__value == '') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __not__ = () => {
        if (this.__bool__().__value_of__()) return new WaveGrassBoolean(false)
        return new WaveGrassBoolean(true)
    }

    __iterator__ = () => {
        let index = 0
        return {
            next: () => {
                return { value: new WaveGrassString(this.__value[index]), index: new WaveGrassNumber(index++), finished: new WaveGrassBoolean(!(index == this.__value.length)) }
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

    __name__ = () => new WaveGrassString(this.__name)

    __get_args__ = () => {
        return this.__args
    }

    __get_statements__ = () => this.__statements

    __internal__ = () => this.__is_internal
}

class WaveGrassBoolean extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type = 'boolean'
        this.__mutable = false
    }

    __bool__ = () => {
        return this
    }

    __add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return new WaveGrassString(this.__value_of__().toString()).__add__(rval)
        new WaveGrassError('TypeError', `Cannot add <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return rval.__add__(new WaveGrassString(this.__value_of__().toString()))
        new WaveGrassError('TypeError', `Cannot add <class ${rval.__type__()}> and <class ${this.__type__()}>`)
    }
}

class WaveGrassError extends WaveGrassObject {
    static trace = []
    static file = ''
    static lines = []

    constructor(title, message, col, line) {
        super(message)
        this.__title = title
        this.__type = 'error'

        this.__col = col
        this.__line = line
    }

    static isError(value) {
        return value.constructor == WaveGrassError
    }

    __title__ = () => this.__title
}

class WaveGrassNull extends WaveGrassObject {
    constructor() {
        super(null)
        this.__type = null
    }

    __bool__ = () => new WaveGrassBoolean(false)

    __add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return new WaveGrassString('null').__add__(rval)
        new WaveGrassError('TypeError', `Cannot add <class ${this.__type__()}> and <class ${rval.__type__()}>`)

    }

    __r_add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return rval.__add__(new WaveGrassString('null'))
        new WaveGrassError('TypeError', `Cannot add <class ${rval.__type__()}> and <class ${this.__type__()}>`)
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
    if (['number', 'string', 'method', 'array', 'boolean'].includes(type)) {
        return new (getClassFromType(type))(...extra)
    }
}

const print = new WaveGrassFunction('print', ['*nargs', 'sep', 'end'], '<internal_print>', true)
const prompt = new WaveGrassFunction('prompt', ['prompt'], '<internal_prompt>', true)
const parseNum = new WaveGrassFunction('parseNum', ['value', 'base'], '<internal_to_num>', true)
const _isNaN = new WaveGrassFunction('isNaN', ['value'], '<internal_isNaN>', true)


module.exports = {
    WaveGrassObject, WaveGrassNumber, WaveGrassString,
    WaveGrassArray, WaveGrassBoolean, WaveGrassError,
    WaveGrassFunction, WaveGrassNull,
    createObject,
    print, prompt, parseNum, _isNaN
}
