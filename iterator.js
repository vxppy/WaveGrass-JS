/**
 * 
 * @param { Array|string} iterable 
 * @returns { { next: () => T, curr: () => T, move: () => T , prev: () => T } }
 */

const iterator = (iterable) => {
    let index = 0
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