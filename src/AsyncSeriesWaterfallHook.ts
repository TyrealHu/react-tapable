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
        if (args.length < 1) {
            throw new Error('Waterfall hooks must have at least one argument')
        }

        super(args, name)
        this.forbiddenCall()
    }

    compile(options: HookCompileOptions) {
        this.fns = []
        codeFactory.setup(this.fns, options)

        return codeFactory.create(options)
    }
}

export default AsyncSeriesWaterfallHook
