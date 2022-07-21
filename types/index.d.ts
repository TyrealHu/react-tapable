type Types = 'sync' | 'promise' | 'async'

interface HookCompileOptions {
  taps: HooksTapsItem[]
  args: string[]
  type: Types
}

interface CodeFactoryContent {
  // 执行函数的时候，出error如何处理
  onError: (...args: any[]) => any
  // 执行函数的时候，有返回值的处理
  onResult?: (...args: any[]) => any
  resultReturns?: boolean
  onDone: () => any
  doneReturns?: boolean
  rethrowIfPossible?: boolean
}

type FunctionArray = () => any[]

interface HooksTapOptions {
  name?: string
  context?: boolean
  once?: boolean
}

interface HooksTapsItem {
  type: Types
  fn: () => any
  name: string
  context: boolean,
  once: boolean
}

type UserTapOptions = HooksTapOptions | string
