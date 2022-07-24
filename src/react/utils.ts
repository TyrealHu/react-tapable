import { ControllerMap } from './global'
import { Controller } from './index'
import { NormalizedUserTapableOptions, UserTapableOptions } from './types'

const ModeTypeMap: Record<string, 'sync' | 'async' | 'promise'> = {
    tap: 'sync',
    tapAsync: 'async',
    tapPromise: 'promise'
}

function throwError(msg: string): never {
    throw new Error(`react-tapable: ${msg}`)
}

function getNormalizedTapableOptions<T>(
    selector: string,
    rawOptions: UserTapableOptions<T>,
    rawFn: (...args: any[]) => any,
    rawUseAliasArr?: any[]
): NormalizedUserTapableOptions {
    const options = {} as NormalizedUserTapableOptions
    const controller = ControllerMap.get(selector) as Controller<T>

    if (typeof rawOptions.mode !== 'string') {
        throwError(`useTapable rawOptions' mode must be string`)
    } else {
        if (
            rawOptions.mode !== 'tap' &&
            rawOptions.mode !== 'tapAsync' &&
            rawOptions.mode !== 'tapPromise'
        ) {
            throwError(
                `useTapable rawOptions' mode must be tap/tapAsync/tapPromise, but get ${rawOptions.mode}`
            )
        } else {
            options.mode = rawOptions.mode
        }
    }

    if (typeof rawOptions.hook !== 'string') {
        throwError(`useTapable rawOptions' hook must be string, but get ${typeof rawOptions.hook}`)
    } else {
        const hook = controller.getHook(rawOptions.hook)

        if (!hook) {
            throwError(
                `useTapable please check to see if the controller has this hook ${rawOptions.hook}`
            )
        }
        options.hook = hook
    }

    options.type = ModeTypeMap[options.mode]

    if (!(rawFn instanceof Function)) {
        throwError(`useTapable rawOptions' fn must be function`)
    } else {
        if (options.hook._isRegistered(options.type, rawFn)) {
            throwError(`useTapable rawOptions' fn has been registered`)
        }
        options.fn = rawFn
    }

    options.useAliasArr = rawUseAliasArr || []

    options.context = Boolean(rawOptions.context)

    options.name = controller.getHookTapName(rawOptions.hook)

    options.once = Boolean(rawOptions.once)

    return options
}

export { getNormalizedTapableOptions, throwError, ModeTypeMap }
