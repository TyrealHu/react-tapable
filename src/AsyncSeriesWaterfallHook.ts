import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncSeriesWaterfallHookCodeFactory extends CodeFactory {
    content({ onError, onResult }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err, _next, doneBreak) => onError(err) + doneBreak(true),
            onResult: (_i, result, next) => {
                let code = ''
                code += `if(${result} !== undefined) {\n`
                // @ts-ignore
                code += `${this._args[0]} = ${result};\n`
                code += `}\n`
                code += next()
                return code
            },
            // @ts-ignore
            onDone: () => onResult(this._args[0])
        })
    }
}

const codeFactory = new AsyncSeriesWaterfallHookCodeFactory()

class AsyncSeriesWaterfallHook extends Hook {
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
            throw new Error('call is not supported on a AsyncSeriesWaterfallHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncSeriesWaterfallHook')
        }
    }
}

export default AsyncSeriesWaterfallHook
