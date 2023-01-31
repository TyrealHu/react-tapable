import AsyncSeriesBailHook from '../src/AsyncSeriesBailHook'

describe('AsyncSeriesBailHook', () => {
    test('tap tapAsync callAsync', async () => {
        const hook = new AsyncSeriesBailHook([])
        hook.tapAsync('test1', (cb) => {
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            cb(null, 'test2')
        })

        const res = await new Promise((resolve) => {
            hook.callAsync((_err: Error, _res: any) => {
                resolve(_res)
            })
        })

        expect(res).toBe('test2')
    })

    test('tap tapAsync promise', async () => {
        const hook = new AsyncSeriesBailHook([])
        hook.tapAsync('test1', (cb) => {
            cb()
        })

        hook.tapAsync('test2', (cb) => {
            cb(null, 'test2')
        })

        const res = await hook.promise()

        expect(res).toBe('test2')
    })

    test('tap tapPromise call', async () => {
        const hook = new AsyncSeriesBailHook([])
        hook.tapPromise('test1', () => {
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return Promise.resolve('test2')
        })

        let res = false
        try {
            hook.call()
        } catch (e) {
            res = true
        }

        expect(res).toBe(true)
    })

    test('tap tapPromise callAsync', async () => {
        const hook = new AsyncSeriesBailHook([])
        hook.tapPromise('test1', () => {
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return Promise.resolve('test2')
        })

        const res = await new Promise((resolve) => {
            hook.callAsync((_err: Error, _res: any) => {
                resolve(_res)
            })
        })

        expect(res).toBe('test1')
    })

    test('tap tapPromise promise', async () => {
        const hook = new AsyncSeriesBailHook([])
        hook.tapPromise('test1', () => {
            return Promise.resolve('test1')
        })

        hook.tapPromise('test2', () => {
            return Promise.resolve('test2')
        })

        const res = await hook.promise()

        expect(res).toBe('test1')
    })
})
