import AsyncParallelHook from '../src/AsyncParallelHook'

describe('AsyncParallelHook', () => {
    test('tap tapAsync call', async () => {
        const hook = new AsyncParallelHook([])

        hook.tapAsync('test1', (cb) => {
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                cb()
            }, 1000)
        })

        let res = false
        try {
            hook.call()
        } catch (e) {
            res = true
        }

        expect(res).toBe(true)
    })

    test('tap tapAsync callAsync', async () => {
        const hook = new AsyncParallelHook([])

        let count = 0
        hook.tapAsync('test1', (cb) => {
            ++count
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                ++count
                cb()
            }, 1000)
        })

        await new Promise((resolve) => {
            hook.callAsync(() => {
                resolve()
            })
        })

        expect(count).toBe(2)
    })

    test('tap tapAsync promise', async () => {
        const hook = new AsyncParallelHook([])

        let count = 0
        hook.tapAsync('test1', (cb) => {
            ++count
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                ++count
                cb()
            }, 1000)
        })

        await hook.promise()

        expect(count).toBe(2)
    })

    test('tap tapPromise callAsync', async () => {
        const hook = new AsyncParallelHook([])
        let count = 0
        hook.tapPromise('test1', () => {
            ++count
            return Promise.resolve()
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    ++count
                    resolve()
                }, 1000)
            })
        })

        await new Promise((resolve) => {
            hook.callAsync(() => {
                resolve()
            })
        })

        expect(count).toBe(2)
    })

    test('tap tapPromise promise', async () => {
        const hook = new AsyncParallelHook([])
        let count = 0
        hook.tapPromise('test1', () => {
            ++count
            return Promise.resolve()
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    ++count
                    resolve()
                }, 1000)
            })
        })

        await hook.promise()

        expect(count).toBe(2)
    })
})
