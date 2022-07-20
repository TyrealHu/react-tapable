import AsyncParallelBailHook from '../src/AsyncParallelBailHook'

describe('AsyncParallelBailHook', () => {
    test('tap tapAsync callAsync', async () => {
        const hook = new AsyncParallelBailHook([])
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

        expect(res).toBe('test1')
    })

    test('tap tapAsync promise', async () => {
        const hook = new AsyncParallelBailHook([])
        hook.tapAsync('test1', (cb) => {
            cb(null, 'test1')
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                cb(null, 'test2')
            }, 1000)
        })

        const res = await hook.promise()

        expect(res).toBe('test1')
    })

    test('tap tapPromise callAsync', async () => {
        const hook = new AsyncParallelBailHook([])
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

        expect(res).toBe('test1')
    })

    test('tap tapPromise promise', async () => {
        const hook = new AsyncParallelBailHook([])
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

        expect(res).toBe('test1')
    })
})
