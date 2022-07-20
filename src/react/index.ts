import { useEffect } from 'react'
import Hook from '../Hook'
import { ControllerMap, getGlobalId } from './global'
import type { UserTapableOptions } from './types'
import { ControllerHooks, NormalizedUserTapableOptions } from './types'

const ModeTypeMap: Record<string, 'sync' | 'async' | 'promise'> = {
    tap: 'sync',
    tapAsync: 'async',
    tapPromise: 'promise'
}

function getNormalizedTapableOptions(
    selector: string,
    rawOptions: UserTapableOptions,
    rawFn: (...args: any[]) => any,
    rawUseAliasArr?: any[]
): NormalizedUserTapableOptions {
    const options = {} as NormalizedUserTapableOptions
    const controller = ControllerMap.get(selector) as Controller

    if (typeof rawOptions.mode !== 'string') {
        throw new Error(`react-tapable: rawOptions' mode must be string`)
    } else {
        if (
            rawOptions.mode !== 'tap' &&
            rawOptions.mode !== 'tapAsync' &&
            rawOptions.mode !== 'tapPromise'
        ) {
            throw new Error(
                `react-tapable: rawOptions' mode must be tap/tapAsync/tapPromise, but get ${rawOptions.mode}`
            )
        } else {
            options.mode = rawOptions.mode
        }
    }

    if (typeof rawOptions.hook !== 'string') {
        throw new Error(
            `react-tapable: rawOptions' hook must be string, but get ${typeof rawOptions.hook}`
        )
    } else {
        const hook = controller.getHook(rawOptions.hook)

        if (!hook) {
            throw new Error(
                `react-tapable: please check to see if the controller has this hook ${rawOptions.hook}`
            )
        }
        options.hook = hook
    }

    options.type = ModeTypeMap[options.mode]

    if (!(rawFn instanceof Function)) {
        throw new Error(`react-tapable: rawOptions' fn must be function`)
    } else {
        if (options.hook._isRegistered(options.type, rawFn)) {
            throw new Error(`react-tapable: rawOptions' fn has been registered`)
        }
        options.fn = rawFn
    }

    options.useAliasArr = rawUseAliasArr || []

    options.context = Boolean(rawOptions.context)

    options.name = controller.getHookTapName(rawOptions.hook)

    return options
}

function useTapable(
    selector: string,
    rawOptions: UserTapableOptions,
    rawFn: (...args: any[]) => any,
    rawUseAliasArr?: any[]
) {
    const { hook, context, fn, useAliasArr, name, type, mode } = getNormalizedTapableOptions(
        selector,
        rawOptions,
        rawFn,
        rawUseAliasArr
    )

    useEffect(() => {
        hook[mode](
            {
                context,
                name
            },
            fn
        )

        return () => {
            hook._deleteTapHook(type, fn)
        }
    }, [...useAliasArr])
}

export class Controller {
    public name: string
    public hooks: ControllerHooks
    public count: Record<string, number>

    constructor(name: string, hooks: ControllerHooks) {
        this.name = name
        this.hooks = hooks
        this.count = Object.keys(hooks).reduce((pre, cur) => {
            pre[cur] = 0
            return pre
        }, {} as Record<string, number>)
    }

    call(hooksName: string, ...args: any[]): any {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        hook.call(...args)
        return
    }

    callAsync(hooksName: string, ...args: any[]): any {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        hook.callAsync(...args)
        return
    }

    promise(hooksName: string, ...args: any[]): Promise<any> {
        const hook = this.getHook(hooksName)

        if (!hook) {
            throw new Error(`hook doesn't exist in controller,it' s name : ${hooksName} `)
        }

        return hook.promise(...args)
    }

    getHook(key: string): Hook | undefined {
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
}

export function createTapableController<T extends Record<string, string>>(
    name: string,
    hooks: ControllerHooks
): {
    HooksNameMap: T
    useTapable: (
        rawOptions: UserTapableOptions,
        rawFn: (...args: any[]) => any,
        rawUseAliasArr?: any[]
    ) => any
    tapableCall: (hooksName: string, ...args: any[]) => any
    tapableCallAsync: (hooksName: string, ...args: any[]) => any
    tapablePromise: (hooksName: string, ...args: any[]) => Promise<any>
} {
    const globalId = getGlobalId()
    if (ControllerMap.has(name + globalId + '')) {
        console.warn(`react-tapable: controller: ${name} has been registed, and it will be covered`)
    }

    const controller = new Controller(name, hooks)
    ControllerMap.set(name + globalId, controller)

    return {
        HooksNameMap: controller.getHooksNameMap() as T,
        tapableCall: (hooksName: string, ...args: any[]) => controller.call(hooksName, ...args),
        tapableCallAsync: (hooksName: string, ...args: any[]) =>
            controller.callAsync(hooksName, ...args),
        tapablePromise: (hooksName: string, ...args: any[]) =>
            controller.promise(hooksName, ...args),
        useTapable: (
            rawOptions: UserTapableOptions,
            rawFn: (...args: any[]) => any,
            rawUseAliasArr?: any[]
        ) => useTapable(name + globalId, rawOptions, rawFn, rawUseAliasArr)
    }
}