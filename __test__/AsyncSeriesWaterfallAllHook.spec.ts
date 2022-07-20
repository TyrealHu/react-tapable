import AsyncSeriesWaterfallAllHook from '../src/AsyncSeriesWaterfallAllHook'

describe('AsyncSeriesWaterfallAllHook', () => {
    test('tap count', async () => {
        const hook = new AsyncSeriesWaterfallAllHook(['count'])

        hook.tapAsync('test1', (_count: number, cb) => {
            _count += 1
            cb(null, [_count])
        })

        hook.tapAsync('test2', (_count: number, cb) => {
            _count += 1
            cb(null, [_count])
        })

        const [count]: any[] = await new Promise((resolve) => {
            hook.callAsync(0, (_err: Error, _count: any[]) => {
                resolve(_count)
            })
        })

        expect(count).toBe(2)
    })

    test('tap waterfall object', async () => {
        const hook = new AsyncSeriesWaterfallAllHook(['name', 'count'])

        hook.tapAsync('test1', (_name, _count, cb) => {
            _count += 1
            _name += 'test1'

            cb(null, [_name, _count])
        })

        hook.tapAsync('test2', (_name, _count, cb) => {
            _count += 1
            _name += 'test2'

            cb(null, [_name, _count])
        })

        const [name, count]: any[] = await new Promise((resolve) => {
            hook.callAsync('', 0, (_err: Error, arr: any[]) => {
                resolve(arr)
            })
        })

        expect(name).toBe('test1test2')
        expect(count).toBe(2)
    })
})
