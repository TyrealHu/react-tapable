import CodeFactory from './CodeFactory'
import Hook from './Hook'

class SyncWaterfallHookCodeFactory extends CodeFactory {
    content({ onError, onResult, resultReturns, rethrowIfPossible }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err) => onError(err),
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
            onDone: () => onResult(this._args[0]),
            doneReturns: resultReturns,
            rethrowIfPossible
        })
    }
}

const codeFactory = new SyncWaterfallHookCodeFactory()

class SyncWaterfallHook extends Hook {
    private fns: any[] | undefined

    constructor(args: string[], name?: string) {
        if (args.length < 1) {
            throw new Error('Waterfall hooks must have at least one argument')
        }

        super(args, name)

        this.compile = function (options: HookCompileOptions) {
            this.fns = []
            codeFactory.setup(this.fns, options)

            return codeFactory.create(options)
        }
    }

    tapAsync() {
        throw new Error('tapAsync is not supported on a SyncHook')
    }

    tapPromise() {
        throw new Error('tapPromise is not supported on a SyncHook')
    }
}

export default SyncWaterfallHook
