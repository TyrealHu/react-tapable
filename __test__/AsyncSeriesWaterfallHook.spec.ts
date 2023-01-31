import AsyncSeriesWaterfallHook from '../src/AsyncSeriesWaterfallHook'

describe('AsyncSeriesWaterfallHook', () => {
    test('tap count', async () => {
        const hook = new AsyncSeriesWaterfallHook(['count'])

        hook.tapAsync('test1', (_count: number, cb) => {
            _count += 1
            cb(null, _count)
        })

        hook.tapAsync('test2', (_count: number, cb) => {
            _count += 1
            cb(null, _count)
        })

        const count = await new Promise((resolve) => {
            hook.callAsync(0, (_err: Error, _count: number) => {
                resolve(_count)
            })
        })

        expect(count).toBe(2)
    })

    test('tap call', async () => {
        const hook = new AsyncSeriesWaterfallHook(['count'])

        hook.tapAsync('test1', (_count: number, cb) => {
            _count += 1
            cb(null, _count)
        })

        hook.tapAsync('test2', (_count: number, cb) => {
            _count += 1
            cb(null, _count)
        })

        let res = false
        try {
            hook.call()
        } catch (e) {
            res = true
        }
        expect(res).toBe(true)
    })

    test('error zero param', async () => {
        let res = false
        try {
            // @ts-ignore
            const _ = new AsyncSeriesWaterfallHook([])
        } catch (e) {
            res = true
        }
        expect(res).toBe(true)
    })

    test('tap waterfall object', async () => {
        const hook = new AsyncSeriesWaterfallHook(['options'])

        hook.tapAsync('test1', (_options, cb) => {
            _options.hooks.push('test1')

            cb(null, _options)
        })

        hook.tapAsync('test2', (_options, cb) => {
            _options.hooks.push('test2')

            cb(null, _options)
        })

        const options: { hooks: any[] } = await new Promise((resolve) => {
            hook.callAsync({ hooks: [] }, (_err: Error, _options: { hooks: any[] }) => {
                resolve(_options)
            })
        })

        expect(options.hooks).toEqual(['test1', 'test2'])
    })
})
