import Hook from '../Hook'

interface UserTapableOptions {
    hook: string
    context: boolean
    mode: 'tap' | 'tapAsync' | 'tapPromise'
}

interface NormalizedUserTapableOptions {
    hook: Hook
    context: boolean
    mode: 'tap' | 'tapAsync' | 'tapPromise'
    type: 'promise' | 'sync' | 'async'
    name: string
    fn: (...args: any[]) => any
    useAliasArr: any[]
}

interface ControllerHooks {
    [key: string]: Hook
}
