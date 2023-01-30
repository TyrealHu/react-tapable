import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelWaterfallHookCodeFactory extends CodeFactory {
    content({ onError, onDone }: CodeFactoryContent) {
        return this.callTapsParallel({
            onError: (_i, err, _done, doneBreak) => onError(err) + doneBreak(true),
            onResult: (_i, result, next) => {
                let code = ''
                code += `if(${result} !== undefined) {\n`
                // @ts-ignore
                code += `${this._args[0]} = ${result};\n`
                code += `}\n`
                code += next()
                return code
            },
            onDone
        })
    }
}

const codeFactory = new AsyncParallelWaterfallHookCodeFactory()

class AsyncParallelWaterfallHook extends Hook {
    private fns: any[] | undefined
    constructor(args: string[], name?: string) {
        super(args, name)
        this.forbiddenCall()
    }

    compile(options: HookCompileOptions) {
        this.fns = []
        codeFactory.setup(this.fns, options)

        return codeFactory.create(options)
    }
}

export default AsyncParallelWaterfallHook
