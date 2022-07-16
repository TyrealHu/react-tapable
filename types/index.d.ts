type Types = 'sync' | 'promise' | 'async'

interface HookCompileOptions {
  taps: HooksTapsItem[]
  args: string[]
  type: Types
}

interface CodeFactoryContent {
  onError: (...args: any[]) => any
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
}

interface HooksTapsItem {
  type: Types
  fn: () => any
  name: string
  context: boolean
}

type UserTapOptions = HooksTapOptions | string
