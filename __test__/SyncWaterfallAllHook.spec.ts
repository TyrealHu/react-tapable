import SyncWaterfallAllHook from '../src/SyncWaterfallAllHook'

describe('SyncWaterfallAllHook', () => {
    test('tap count', () => {
        const hook = new SyncWaterfallAllHook(['count'])

        hook.tap('test1', (_count: number) => {
            return [++_count]
        })

        hook.tap('test2', (_count: number) => {
            return [++_count]
        })

        const [count] = hook.call(0)

        expect(count).toBe(2)
    })

    test('tap args', () => {
        const hook = new SyncWaterfallAllHook(['name'])

        let tapArg = ''
        hook.tap('test1', (name) => {
            tapArg = name
        })

        hook.call('tyreal')

        expect(tapArg).toBe('tyreal')
    })

    test('error zero param', async () => {
        let res = false
        try {
            // @ts-ignore
            const _ = new SyncWaterfallAllHook([])
        } catch (e) {
            res = true
        }
        expect(res).toBe(true)
    })

    test('tap waterfall object', () => {
        const hook = new SyncWaterfallAllHook(['options'])

        hook.tap('test1', (_options) => {
            _options.hooks.push('test1')

            return [_options]
        })

        hook.tap('test2', (_options) => {
            _options.hooks.push('test2')

            return [_options]
        })

        const [options] = hook.call({ hooks: [] })
        expect(options.hooks.toString()).toBe('test1,test2')
    })

    test('tap waterfall two arg', () => {
        const hook = new SyncWaterfallAllHook(['name', 'count'])

        hook.tap('test1', (_name, _count) => {
            _name += 'test1'
            _count += 1

            return [_name, _count]
        })

        hook.tap('test2', (_name, _count) => {
            _name += 'test2'
            _count += 1

            return [_name, _count]
        })

        const [name, count] = hook.call('', 0)
        expect(name).toBe('test1test2')
        expect(count).toBe(2)
    })
})
