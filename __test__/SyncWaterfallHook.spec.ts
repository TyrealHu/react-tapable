import SyncWaterfallHook from '../src/SyncWaterfallHook'

describe('SyncWaterfallHook', () => {
    test('tap count', () => {
        const hook = new SyncWaterfallHook(['count'])

        hook.tap('test1', (_count: number) => {
            return ++_count
        })

        hook.tap('test2', (_count: number) => {
            return ++_count
        })

        const count = hook.call(0)

        expect(count).toBe(2)
    })

    test('tap args', () => {
        const hook = new SyncWaterfallHook(['name'])

        let tapArg = ''
        hook.tap('test1', (name) => {
            tapArg = name
        })

        hook.call('tyreal')

        expect(tapArg).toBe('tyreal')
    })

    test('tap waterfall object', () => {
        const hook = new SyncWaterfallHook(['options'])

        hook.tap('test1', (_options) => {
            _options.hooks.push('test1')

            return _options
        })

        hook.tap('test2', (_options) => {
            _options.hooks.push('test2')

            return _options
        })

        const options = hook.call({ hooks: [] })
        expect(options.hooks.toString()).toBe('test1,test2')
    })
})
