import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncSeriesBailHookCodeFactory extends CodeFactory {
    content({ onError, onResult, resultReturns, onDone }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err, _next, doneBreak) => onError(err) + doneBreak(true),
            onResult: (_i, result, next) =>
                // @ts-ignore
                `if(${result} !== undefined) {\n${onResult(result)}\n} else {\n${next()}}\n`,
            resultReturns,
            onDone
        })
    }
}

const codeFactory = new AsyncSeriesBailHookCodeFactory()

class AsyncSeriesBailHook extends Hook {
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
            throw new Error('call is not supported on a AsyncSeriesBailHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncSeriesBailHook')
        }
    }
}

export default AsyncSeriesBailHook
