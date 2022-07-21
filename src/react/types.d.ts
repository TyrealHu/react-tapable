import Hook from '../Hook'

interface UserTapableOptions<T> {
    once?: boolean
    hook: keyof T
    context?: boolean
    mode: 'tap' | 'tapAsync' | 'tapPromise'
}

interface NormalizedUserTapableOptions {
    once: boolean
    hook: Hook
    context: boolean
    mode: 'tap' | 'tapAsync' | 'tapPromise'
    type: 'promise' | 'sync' | 'async'
    name: string
    fn: (...args: any[]) => any
    useAliasArr: any[]
}

type ControllerHooks<T> = {
    [K in keyof T]: Hook
}
