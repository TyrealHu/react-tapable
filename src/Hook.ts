import { deprecate } from './utils'

// tslint:disable-next-line:no-empty
const deprecateContext = deprecate(() => {}, 'Hook.context is deprecated and will be removed')

class Hook {
    // use to cache origin call func
    public _call: (...args: any[]) => any
    // use to cache call tap func
    public call: (...args: any[]) => any
    // use to cache origin call func
    public _callAsync: (...args: any[]) => any
    // use to cache call tapAsync func
    public callAsync: (...args: any[]) => any
    // use to cache origin call func
    public _promise: (...args: any[]) => Promise<any>
    // use to cache call tapPromise func
    public promise: (...args: any[]) => Promise<any>
    // use to cache arguments for tap function
    private _args: string[]
    // use to cache hook's name
    private name: string
    // use to cache taps function
    private taps: HooksTapsItem[]
    // if hooks has once tap
    private once: boolean

    constructor(args: string[], name?: string) {
        this._args = args || []
        this.name = name || ''
        this.taps = []
        this.once = false

        this._call = function (..._args: any[]) {
            // @ts-ignore
            this.call = this._createCall('sync')
            const res =  this.call(..._args)
            this.afterInvoke()
            return res
        }
        this.call = this._call

        this._callAsync = function (..._args: any[]) {
            // @ts-ignore
            this.callAsync = this._createCall('async')
            const res = this.callAsync(..._args)
            this.afterInvoke()
            return res
        }
        this.callAsync = this._callAsync

        this._promise = function (..._args: any[]) {
            // @ts-ignore
            this.promise = this._createCall('promise')
            const res = this.promise(..._args)
            this.afterInvoke()
            return res
        }
        this.promise = this._promise
    }

    afterInvoke() {
        if (this.once) {
            this.taps = this.taps.filter((item) => {
                return !item.once
            })
            this._resetCompilation()
            this.once = false
        }
    }

    // this function is Abstract to Hooks Class
    // @ts-ignore
    compile(options: HookCompileOptions) {
        throw new Error('Abstract: should be overridden')
    }

    isUsed() {
        return this.taps.length > 0
    }

    withOptions(options: UserTapOptions) {
        const mergeOptions = (opt: UserTapOptions): UserTapOptions =>
            Object.assign({}, options, typeof opt === 'string' ? { name: opt } : opt)

        return {
            name: this.name,
            tap: (opt: UserTapOptions, fn: () => any) => this.tap(mergeOptions(opt), fn),
            tapAsync: (opt: UserTapOptions, fn: () => any) => this.tapAsync(mergeOptions(opt), fn),
            tapPromise: (opt: UserTapOptions, fn: () => any) =>
                this.tapPromise(mergeOptions(opt), fn),
            isUsed: () => this.isUsed(),
            withOptions: (opt: UserTapOptions) => this.withOptions(mergeOptions(opt))
        }
    }

    _createCall(type: Types) {
        return this.compile({
            taps: this.taps,
            args: this._args,
            type
        })
    }

    _resetCompilation() {
        this.call = this._call
        this.callAsync = this._callAsync
        this.promise = this._promise
    }

    _insert(item: HooksTapsItem) {
        this._resetCompilation()
        if (!this.once && item.once) {
            this.once = true
        }
        this.taps.push(item)
    }

    _tap(type: Types, options: UserTapOptions, fn: (...args: any[]) => any) {
        const tapOptions = {
            name: '',
            context: false,
            once: false
        }
        if (typeof options === 'string') {
            tapOptions.name = options.trim()
        } else if (typeof options !== 'object' || options === null) {
            throw new Error('Invalid tap options')
        } else {
            if (typeof options.name !== 'string' || options.name === '') {
                throw new Error('Missing name for tap')
            } else {
                tapOptions.name = options.name
            }
            if (options.context) {
                deprecateContext()
                tapOptions.context = options.context
            }

            tapOptions.once = Boolean(options.once)
        }

        this._insert({
            type,
            fn,
            ...tapOptions
        })
    }

    tap(options: UserTapOptions, fn: (...args: any[]) => any) {
        this._tap('sync', options, fn)
    }

    tapAsync(options: UserTapOptions, fn: (...args: any[]) => any) {
        this._tap('async', options, fn)
    }

    tapPromise(options: UserTapOptions, fn: (...args: any[]) => any) {
        this._tap('promise', options, fn)
    }

    _isRegistered(type: Types, fn: (...args: []) => any): boolean {
        const index = this._tapHookIndexOf(type, fn)

        return index !== -1
    }

    _deleteTapHook(type: Types, fn: (...args: []) => any): void {
        this._resetCompilation()

        this.taps = this.taps.filter((tap) => {
            return !(tap.type === type && tap.fn === fn)
        })
    }

    _replaceTapHook(
        type: Types,
        oldFn: (...args: any[]) => any,
        newFn: (...args: []) => any
    ): boolean {
        this._resetCompilation()

        let replaced = false
        for (const tap of this.taps) {
            if (tap.type === type && tap.fn === oldFn) {
                replaced = true
                tap.fn = newFn
            }
        }

        return replaced
    }

    _tapHookIndexOf(type: Types, fn: (...args: []) => any): number {
        let index = -1

        for (let _index = 0; _index < this.taps.length; _index++) {
            if (this.taps[_index].fn === fn && this.taps[_index].type === type) {
                index = _index
                break
            }
        }

        return index
    }
}

export default Hook
