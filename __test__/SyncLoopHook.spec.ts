import SyncLoopHook from '../src/SyncLoopHook'

describe('SyncLoopHook', () => {
    test('tap count', () => {
        const hook = new SyncLoopHook([])
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
        const hook = new SyncLoopHook(['name'])

        let tapArg = ''
        hook.tap('test1', (name) => {
            tapArg = name
        })

        hook.call('tyreal')

        expect(tapArg).toBe('tyreal')
    })

    test('tap context', () => {
        const hook = new SyncLoopHook([])

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

    test('tap tapAsync', () => {
        const hook = new SyncLoopHook([])

        let res = false
        try {
            hook.tapAsync()

            hook.callAsync()
        } catch (e) {
            res = true
        }

        expect(res).toBe(true)
    })

    test('tap tapPromise', () => {
        const hook = new SyncLoopHook([])

        let res = false
        try {
            hook.tapPromise()
            hook.promise()
        } catch (e) {
            res = true
        }

        expect(res).toBe(true)
    })

    test('tap loop count', () => {
        const hook = new SyncLoopHook([])
        let count = 0
        hook.tap('test1', () => {
            count += 1
            if (count <= 2) {
                return true
            }
        })

        hook.tap('test2', () => {
            count += 1
            if (count <= 5) {
                return true
            }
        })

        hook.call()

        expect(count).toBe(6)
    })
})
