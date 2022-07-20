import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelHookCodeFactory extends CodeFactory {
    content({ onError, onDone }: CodeFactoryContent) {
        return this.callTapsParallel({
            onError: (_i, err, _done, doneBreak) => onError(err) + doneBreak(true),
            onDone
        })
    }
}

const codeFactory = new AsyncParallelHookCodeFactory()

class AsyncParallelHook extends Hook {
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
            throw new Error('call is not supported on a AsyncParallelHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncParallelHook')
        }
    }
}

export default AsyncParallelHook
