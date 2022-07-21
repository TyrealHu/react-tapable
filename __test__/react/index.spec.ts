import { renderHook } from '@testing-library/react-hooks'
import { useState } from 'react'
import { createTapableController } from '../../src'
import { SyncHook } from '../../src'

describe('React', () => {
    test('createTapableController HooksNameMap', () => {
        const { HooksNameMap } = createTapableController('Test', {
            // @ts-ignore
            testOne: new SyncHook([]),
            // @ts-ignore
            testTwo: new SyncHook([])
        })

        expect(HooksNameMap).toEqual({ testOne: 'testOne', testTwo: 'testTwo' })
    })

    test('createTapableController useTapable', async () => {
        const { HooksNameMap, useTapable, tapableCall } = createTapableController<{
            testOne: string
            testTwo: string
        }>('Test', {
            // @ts-ignore
            testOne: new SyncHook([]),
            // @ts-ignore
            testTwo: new SyncHook([])
        })
        let state: any
        let setState: any
        let pass = 0
        let invoke = false
        renderHook(() => {
            ;[state, setState] = useState(1)

            useTapable(
                {
                    hook: HooksNameMap.testOne,
                    mode: 'tap'
                },
                () => {
                    pass = state
                },
                [state]
            )

            if (!invoke) {
                invoke = true
                setState(2)

                setTimeout(() => {
                    tapableCall(HooksNameMap.testOne)
                })
            }
        })

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            })
        })

        expect(pass).toBe(2)
    })
})
