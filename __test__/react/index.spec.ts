import { renderHook } from '@testing-library/react-hooks'
import { useState } from 'react'
import { SyncWaterfallHook } from '../../lib'
import { createTapableController } from '../../src'
import { SyncHook } from '../../src'

describe('React', () => {
    test('createTapableController tapHook', () => {
        const { tapHook, call } = createTapableController<{
            testOne: string
            testTwo: string
        }>('Test', {
            // @ts-ignore
            testOne: new SyncHook([]),
            // @ts-ignore
            testTwo: new SyncHook([])
        })

        let count = 1

        tapHook(
            {
                once: false,
                hook: 'testOne',
                mode: 'tap'
            },
            () => {
                count += 1
            }
        )

        call('testOne')

        expect(count).toEqual(2)
    })

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
        const { HooksNameMap, useTapable, call } = createTapableController<{
            testOne: string
            testTwo: string
        }>('Test', {
            // @ts-ignore
            testOne: new SyncWaterfallHook([]),
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
                    call(HooksNameMap.testOne)
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

    test('createTapableController removeTapHook', () => {
        const { tapHook, call, removeTapHook } = createTapableController<{
            testOne: string
            testTwo: string
        }>('Test', {
            // @ts-ignore
            testOne: new SyncHook([]),
            // @ts-ignore
            testTwo: new SyncHook([])
        })

        let count = 1

        const fn = () => {
            count += 1
        }

        tapHook(
            {
                once: false,
                hook: 'testOne',
                mode: 'tap'
            },
            fn
        )

        call('testOne')

        removeTapHook('testOne', 'tap', fn)

        call('testOne')

        expect(count).toEqual(2)
    })

    test('createTapableController useTapable waterfall', async () => {
        const { HooksNameMap, useTapable, call } = createTapableController<{
            testOne: string
            testTwo: string
        }>('Test', {
            // @ts-ignore
            testOne: new SyncWaterfallHook(['name'])
        })
        let state: any
        let setState: any
        let pass: string
        let invoke = false
        renderHook(() => {
            ;[state, setState] = useState('1')

            useTapable(
                {
                    hook: HooksNameMap.testOne,
                    mode: 'tap'
                },
                (name: string) => {
                    return name + state
                },
                [state]
            )

            if (!invoke) {
                invoke = true
                setState(2)

                setTimeout(() => {
                    pass = call(HooksNameMap.testOne, 'name')
                })
            }
        })

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            })
        })

        // @ts-ignore
        expect(pass).toBe('name2')
    })
})
