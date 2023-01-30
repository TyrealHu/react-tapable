import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelWaterfallAllHookCodeFactory extends CodeFactory {
    content({ onError, onResult }: CodeFactoryContent) {
        return this.callTapsParallel({
            onError: (_i, err, _next, doneBreak) => onError(err) + doneBreak(true),
            onResult: (_i, result, next) => {
                let code = ''
                code += `if(${result} !== undefined) {\n`
                code += `if (!(${result} instanceof Array)){ \n`
                code += `${result} = [${result}]\n`
                code += '}\n'
                if (this._args) {
                    for (let _argI = 0; _argI < this._args.length; _argI++) {
                        code += [
                            `if (${result}[${_argI}]) {`,
                            // @ts-ignore
                            `${this._args[_argI]} = ${result}[${_argI}];`,
                            '}\n'
                        ].join('\n')
                    }
                }
                code += `}\n`
                code += next()
                return code
            },
            // @ts-ignore
            onDone: () => onResult(`[${this._args.toString()}]`)
        })
    }
}

const codeFactory = new AsyncParallelWaterfallAllHookCodeFactory()

class AsyncParallelWaterfallAllHook extends Hook {
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

export default AsyncParallelWaterfallAllHook
