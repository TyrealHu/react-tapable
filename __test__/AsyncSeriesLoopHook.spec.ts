import AsyncSeriesLoopHook from '../src/AsyncSeriesLoopHook'

describe('AsyncSeriesLoopHook', () => {
    test('tap count', async () => {
        const hook = new AsyncSeriesLoopHook([])

        let num = 0
        hook.tapAsync('tap0', (cb) => {
            if (num++ < 1) {
                cb(null, false)
            } else {
                cb()
            }
        })
        hook.tapAsync('tap1', (cb) => {
            if (num++ < 5) {
                cb(null, false)
            } else {
                cb()
            }
        })

        await new Promise((resolve) => {
            hook.callAsync(() => {
                resolve()
            })
        })

        expect(num).toBe(7)
    })
})
