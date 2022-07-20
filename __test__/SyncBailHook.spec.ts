import SyncBailHook from '../src/SyncBailHook'

describe('SyncBailHook', () => {
    test('tap count', () => {
        const hook = new SyncBailHook([])
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
        const hook = new SyncBailHook(['name'])

        let tapArg = ''
        hook.tap('test1', (name) => {
            tapArg = name
        })

        hook.call('tyreal')

        expect(tapArg).toBe('tyreal')
    })

    test('tap return', () => {
        const hook = new SyncBailHook([])
        let count = 0
        hook.tap('test1', () => {
            count += 1
            return 'end'
        })

        hook.tap('test2', () => {
            count += 1
        })

        hook.call()

        expect(count).toBe(1)
    })

    test('tap context', () => {
        const hook = new SyncBailHook([])

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
