import AsyncParallelResultAllHook from '../src/AsyncParallelResultAllHook'

describe('AsyncParallelResultAllHook', () => {
    test('tap tapAsync callAsync', async () => {
        const hook = new AsyncParallelResultAllHook([])
        hook.tapAsync('test1', (cb) => {
            cb(null, 'test1')
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                cb(null, 'test2')
            }, 1000)
        })

        const res = await new Promise((resolve) => {
            hook.callAsync((_err: Error, _res: any) => {
                resolve(_res)
            })
        })

        expect(res).toEqual({
            test1: 'test1',
            test2: 'test2'
        })
    })

    test('tap tapAsync promise', async () => {
        const hook = new AsyncParallelResultAllHook([])
        hook.tapAsync('test1', (cb) => {
            cb(null, 'test1')
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                cb(null, 'test2')
            }, 1000)
        })

        const res = await hook.promise()

        expect(res).toEqual({
            test1: 'test1',
            test2: 'test2'
        })
    })

    test('tap tapPromise callAsync', async () => {
        const hook = new AsyncParallelResultAllHook([])
        hook.tapPromise('test1', () => {
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('test2')
                }, 1000)
            })
        })

        const res = await new Promise((resolve) => {
            hook.callAsync((_err: Error, _res: any) => {
                resolve(_res)
            })
        })

        expect(res).toEqual({
            test1: 'test1',
            test2: 'test2'
        })
    })

    test('tap tapPromise promise', async () => {
        const hook = new AsyncParallelResultAllHook([])
        hook.tapPromise('test1', () => {
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('test2')
                }, 1000)
            })
        })

        const res = await hook.promise()

        expect(res).toEqual({
            test1: 'test1',
            test2: 'test2'
        })
    })

    test('tap tapPromise promise error', async () => {
        const hook = new AsyncParallelResultAllHook([])
        hook.tapPromise('test1', () => {
            return Promise.reject('test1')
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('test2')
                }, 1000)
            })
        })

        let res = false
        try {
            await hook.promise()
        } catch (e) {
            res = true
        }

        expect(res).toEqual(true)
    })
})
