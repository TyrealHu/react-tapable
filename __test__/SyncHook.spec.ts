import SyncHook from '../src/SyncHook'

describe('SyncHook', () => {
    test('tap count', () => {
        const hook = new SyncHook([])
        let count = 0
        hook.tap('test1', () => {
            count += 1
        })

        hook.tap('test2', () => {
            count += 1
        })

        hook.call()

        expect(count).toBe(2)
    })

    test('tap args', () => {
        const hook = new SyncHook(['name'])

        let tapArg = ''
        hook.tap('test1', (name) => {
            tapArg = name
        })

        hook.call('tyreal')

        expect(tapArg).toBe('tyreal')
    })

    test('tap context', () => {
        const hook = new SyncHook([])

        let contextName
        hook.tap({ context: true, name: 'test1' }, (context) => {
            context.name = 'test1'
        })

        hook.tap({ context: true, name: 'test2' }, (context) => {
            contextName = context.name + 'test2'
        })

        hook.call()

        expect(contextName).toBe('test1test2')
    })
})
