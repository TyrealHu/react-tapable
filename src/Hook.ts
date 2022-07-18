import { deprecate } from './utils'

// tslint:disable-next-line:no-empty
const deprecateContext = deprecate(() => {},
'Hook.context is deprecated and will be removed')

class Hook {
  // use to cache origin call func
  protected _call: (...args: any[]) => any
  // use to cache call tap func
  protected call: (...args: any[]) => any
  // use to cache origin call func
  protected _callAsync: (...args: any[]) => any
  // use to cache call tapAsync func
  protected callAsync: (...args: any[]) => any
  // use to cache origin call func
  protected _promise: (...args: any[]) => any
  // use to cache call tapPromise func
  protected promise: (...args: any[]) => any
  // use to cache arguments for tap function
  private _args: string[]
  // use to cache hook's name
  private name: string
  // use to cache taps function
  private taps: HooksTapsItem[]

  constructor(args: string[], name?: string) {
    this._args = args || []
    this.name = name || ''
    this.taps = []

    this._call = function (..._args: any[]) {
      // @ts-ignore
      this.call = this._createCall('sync')
      return this.call(..._args)
    }
    this.call = this._call

    this._callAsync = function (..._args: any[]) {
      // @ts-ignore
      this.callAsync = this._createCall('async')
      return this.callAsync(..._args)
    }
    this.callAsync = this._callAsync

    this._promise = function (..._args: any[]) {
      // @ts-ignore
      this.promise = this._createCall('promise')
      return this.promise(..._args)
    }
    this.promise = this._promise
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
      tap: (opt: UserTapOptions, fn: () => any) =>
        this.tap(mergeOptions(opt), fn),
      tapAsync: (opt: UserTapOptions, fn: () => any) =>
        this.tapAsync(mergeOptions(opt), fn),
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
    this.taps.push(item)
  }

  _tap(type: Types, options: UserTapOptions, fn: (...args: any[]) => any) {
    const tapOptions = {
      name: '',
      context: false
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
}

export default Hook
