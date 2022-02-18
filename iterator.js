/**
 * @typedef {{ next: () => string | T,
 *  curr: () => string | T,
 *  move: () => string | T,
 *  prev: () => string | T }} IterableReturn 
 */

/**
 * @template T
 * @param { string | Array<T> } iterable 
 * @returns { IterableReturn }
 */
const iterator = (iterable) => {
    let index = -1
    return {
        next() {
            return iterable[index + 1]
        },
        curr() {
            return iterable[index]
        },
        move() {
            return iterable[index++]
        },
        prev() {
            return iterable[index - 1]
        }
    }
}

module.exports = iterator