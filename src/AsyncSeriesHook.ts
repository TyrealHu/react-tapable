import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncSeriesHookCodeFactory extends CodeFactory {
    content({ onError, onDone }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err, _next, doneBreak) => onError(err) + doneBreak(true),
            onDone
        })
    }
}

const codeFactory = new AsyncSeriesHookCodeFactory()

class AsyncSeriesHook extends Hook {
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
            throw new Error('call is not supported on a AsyncSeriesHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncSeriesHook')
        }
    }
}

export default AsyncSeriesHook
