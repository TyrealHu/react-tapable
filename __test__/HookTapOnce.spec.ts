import SyncHook from '../src/SyncHook'

describe('SyncHook', () => {
    test('tap once', () => {
        const hook = new SyncHook([])
        let count = 0
        hook.tap({
            name: 'test1',
            once: true
        }, () => {
            count += 1
        })

        hook.tap('test2', () => {
            count += 1
        })

        hook.call()
        hook.call()

        expect(count).toBe(3)
    })
})
