import CodeFactory from './CodeFactory'
import Hook from './Hook'

class SyncWaterfallAllHookCodeFactory extends CodeFactory {
    content({ onError, onResult, resultReturns, rethrowIfPossible }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err) => onError(err),
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
            onDone: () => onResult(`[${this._args.toString()}]`),
            doneReturns: resultReturns,
            rethrowIfPossible
        })
    }
}

const codeFactory = new SyncWaterfallAllHookCodeFactory()

class SyncWaterfallAllHook extends Hook {
    private fns: any[] | undefined

    constructor(args: string[], name?: string) {
        if (args.length < 1) {
            throw new Error('WaterfallAll hooks must have at least one argument')
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

export default SyncWaterfallAllHook
