import AsyncSeriesHook from '../src/AsyncSeriesHook'

describe('AsyncSeriesHook', () => {
    test('tap tapAsync callAsync', async () => {
        const hook = new AsyncSeriesHook([])

        let res = ''
        hook.tapAsync('test1', (cb) => {
            res += 'test1'
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                res += 'test2'
                cb()
            }, 500)
        })

        await new Promise((resolve) => {
            hook.callAsync(() => {
                resolve()
            })
        })

        expect(res).toBe('test1test2')
    })

    test('tap tapAsync promise', async () => {
        const hook = new AsyncSeriesHook([])
        let res = ''
        hook.tapAsync('test1', (cb) => {
            res += 'test1'
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            setTimeout(() => {
                res += 'test2'
                cb()
            }, 500)
        })

        await hook.promise()

        expect(res).toBe('test1test2')
    })

    test('tap tapPromise callAsync', async () => {
        const hook = new AsyncSeriesHook([])

        let res = ''
        hook.tapPromise('test1', () => {
            res += 'test1'
            return Promise.resolve()
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    res += 'test2'
                    resolve('test2')
                }, 500)
            })
        })

        await new Promise((resolve) => {
            hook.callAsync((_err: Error, _res: any) => {
                resolve(_res)
            })
        })

        expect(res).toBe('test1test2')
    })

    test('tap tapPromise promise', async () => {
        const hook = new AsyncSeriesHook([])
        let res = ''
        hook.tapPromise('test1', () => {
            res += 'test1'
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    res += 'test2'
                    resolve('test2')
                }, 500)
            })
        })

        await hook.promise()

        expect(res).toBe('test1test2')
    })
})
