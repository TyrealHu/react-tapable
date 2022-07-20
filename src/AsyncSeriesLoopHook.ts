import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncSeriesLoopHookCodeFactory extends CodeFactory {
    content({ onError, onDone }: CodeFactoryContent) {
        return this.callTapsLooping({
            onError: (_i, err, _next, doneBreak) => onError(err) + doneBreak(true),
            onDone
        })
    }
}

const codeFactory = new AsyncSeriesLoopHookCodeFactory()

class AsyncSeriesLoopHook extends Hook {
    private fns: any[] | undefined
    constructor(args: string[], name?: string) {
        super(args, name)

        this.compile = function (options: HookCompileOptions) {
            this.fns = []
            codeFactory.setup(this.fns, options)

            return codeFactory.create(options)
        }

        // async hook did not support call
        this.call = () => {
            throw new Error('call is not supported on a AsyncSeriesLoopHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncSeriesLoopHook')
        }
    }
}

export default AsyncSeriesLoopHook
