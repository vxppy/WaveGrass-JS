const fs = require('fs')
/**
 * 
 * @param { string } path 
 * @param { string } encoding
 * @returns { { read: (size: number) => Promise<string>, close: () => Promise<boolean>, end: () => boolean } }
 */
const createReadStream = (path, encoding = 'utf-8') => {
    const stream = fs.createReadStream(path, { encoding: encoding })

    process.once('SIGINT', (e) => {
        stream.close()
        process.exit(1)
    })
    return {
        read: async (size) => {
            return new Promise(res => {
                stream.once('readable', () => {
                    let data = stream.read(size)
                    while (!data) {
                        size--
                        if (size == 0) break
                        data = stream.read(size)
                    }

                    if (data === null) stream.close()
                    res(data)
                })
            })
        },
        close: async () => {
            return new Promise(res => {
                if (!stream.closed) stream.close(_ => _ ? res(false) : res(true))
                else res(false)
            })
        },
        closed: () => stream.closed
    }
}

module.exports = createReadStream