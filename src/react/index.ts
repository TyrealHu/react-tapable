import { useEffect } from 'react'
import Hook from '../Hook'
import { ControllerMap, getGlobalId } from './global'
import type { UserTapableOptions } from './types'
import { ControllerHooks } from './types'
import { getNormalizedTapableOptions, ModeTypeMap, throwError } from './utils'

function useTapable<HooksMap>(
    selector: string,
    rawOptions: UserTapableOptions<HooksMap>,
    rawFn: (...args: any[]) => any,
    rawUseAliasArr?: any[]
) {
    const { hook, context, fn, useAliasArr, name, type, mode, once } =
        getNormalizedTapableOptions<HooksMap>(selector, rawOptions, rawFn, rawUseAliasArr)

    useEffect(() => {
        hook[mode](
            {
                context,
                name,
                once
            },
            fn
        )

        return () => {
            hook._deleteTapHook(type, fn)
        }
    }, [...useAliasArr])
}

export class Controller<HooksMap> {
    public name: string
    public hooks: ControllerHooks<HooksMap>
    public count: Record<string, number>

    constructor(name: string, hooks: ControllerHooks<HooksMap>) {
        this.name = name
        this.hooks = hooks
        this.count = Object.keys(hooks).reduce((pre, cur) => {
            pre[cur] = 0
            return pre
        }, {} as Record<string, number>)
    }

    call(hooksName: keyof HooksMap, ...args: any[]): any {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        return hook.call(...args)
    }

    callAsync(hooksName: keyof HooksMap, ...args: any[]): any {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        return hook.callAsync(...args)
    }

    promise(hooksName: keyof HooksMap, ...args: any[]): Promise<any> {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        return hook.promise(...args)
    }

    getHook(key: keyof HooksMap): Hook | undefined {
        if (this.hooks.hasOwnProperty(key)) {
            return this.hooks[key]
        }

        return undefined
    }

    getHooksNameMap(): Record<string, string> {
        if (!this.hooks) {
            return {}
        }
        const map: Record<string, string> = {}
        Object.keys(this.hooks).reduce((pre, cur) => {
            pre[cur] = cur
            return pre
        }, map)

        return map
    }

    getHookTapName(hook: string) {
        return `${this.name}:${hook}`
    }

    tapHook(
        rawOptions: {
            once?: boolean
            hook: keyof HooksMap
            context?: boolean
            mode: 'tap' | 'tapAsync' | 'tapPromise'
        },
        rawFn: (...args: any[]) => any
    ) {
        const hook = this.getHook(rawOptions.hook)

        if (!hook) {
            throwError(`tapHook Cannot find hook by key ${rawOptions.hook}`)
        }

        if (
            rawOptions.mode !== 'tap' &&
            rawOptions.mode !== 'tapAsync' &&
            rawOptions.mode !== 'tapPromise'
        ) {
            throwError(
                `tapHook rawOptions' mode must be tap/tapAsync/tapPromise, but get ${rawOptions.mode}`
            )
        }

        hook[rawOptions.mode](
            {
                context: Boolean(rawOptions.context),
                name: this.getHookTapName(rawOptions.hook as string),
                once: Boolean(rawOptions.once)
            },
            rawFn
        )
    }

    removeTapHook(
        name: keyof HooksMap,
        mode: 'tap' | 'tapAsync' | 'tapPromise',
        fn: (...args: any[]) => any
    ) {
        const hook = this.getHook(name)

        if (!hook) {
            throwError(`removeTapHook Cannot find hook by key ${name}`)
        }

        if (mode !== 'tap' && mode !== 'tapAsync' && mode !== 'tapPromise') {
            throwError(`removeTapHook mode must be tap/tapAsync/tapPromise, but get ${mode}`)
        }

        hook._deleteTapHook(ModeTypeMap[mode], fn)
    }
}

export function createTapableController<THooks extends Record<string, string>>(
    name: string,
    hooks: ControllerHooks<THooks>
): {
    /**
     * This is a map for tapped hooks
     * */
    HooksNameMap: {
        [K in keyof THooks]: K
    }
    /**
     * This useHook is used to tap function for React Hooks
     * */
    useTapable: (
        rawOptions: {
            once?: boolean
            hook: keyof THooks
            context?: boolean
            mode: 'tap' | 'tapAsync' | 'tapPromise'
        },
        rawFn: (...args: any[]) => any,
        rawUseAliasArr?: any[]
    ) => any
    /**
     * This is a method for call sync function
     * */
    call: (hooksName: keyof THooks, ...args: any[]) => any
    /**
     * This is a method for call async function, and expected callback
     * */
    callAsync: (hooksName: keyof THooks, ...args: any[]) => any
    /**
     * This is a method for call promise function, and return Promise Object
     * */
    promise: (hooksName: keyof THooks, ...args: any[]) => Promise<any>
    /**
     * This function is used to tap function for React Component
     * */
    tapHook: (
        rawOptions: {
            once?: boolean
            hook: keyof THooks
            context?: boolean
            mode: 'tap' | 'tapAsync' | 'tapPromise'
        },
        rawFn: (...args: any[]) => any
    ) => any
    /**
     * This function is used to remove tapped function
     * */
    removeTapHook: (
        hook: keyof THooks,
        mode: 'tap' | 'tapAsync' | 'tapPromise',
        fn: (...args: any[]) => any
    ) => void
} {
    const globalId = getGlobalId()
    if (ControllerMap.has(name + globalId + '')) {
        console.warn(`react-tapable: controller: ${name} has been registed, and it will be covered`)
    }

    const controller = new Controller<THooks>(name, hooks)
    ControllerMap.set(name + globalId, controller)

    return {
        HooksNameMap: controller.getHooksNameMap() as {
            [Key in keyof THooks]: Key
        },
        call: (hooksName: keyof THooks, ...args: any[]) => controller.call(hooksName, ...args),
        callAsync: (hooksName: keyof THooks, ...args: any[]) =>
            controller.callAsync(hooksName, ...args),
        promise: (hooksName: keyof THooks, ...args: any[]) =>
            controller.promise(hooksName, ...args),
        tapHook: (
            rawOptions: {
                once?: boolean
                hook: keyof THooks
                context?: boolean
                mode: 'tap' | 'tapAsync' | 'tapPromise'
            },
            rawFn: (...args: any[]) => any
        ) => controller.tapHook(rawOptions, rawFn),
        removeTapHook: (
            hook: keyof THooks,
            mode: 'tap' | 'tapAsync' | 'tapPromise',
            fn: (...args: any[]) => any
        ) => controller.removeTapHook(hook, mode, fn),
        useTapable: (
            rawOptions: {
                once?: boolean
                hook: keyof THooks
                context?: boolean
                mode: 'tap' | 'tapAsync' | 'tapPromise'
            },
            rawFn: (...args: any[]) => any,
            rawUseAliasArr?: any[]
        ) => useTapable<THooks>(name + globalId, rawOptions, rawFn, rawUseAliasArr)
    }
}
