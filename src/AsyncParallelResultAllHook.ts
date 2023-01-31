import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelResultAllHookCodeFactory extends CodeFactory {
    header() {
        let code = super.header()
        code += 'var asyncParallelResMap = {};\n'
        return code
    }

    createContentPromiseDone() {
        return () => '_resolve(asyncParallelResMap);\n'
    }

    createContentAsyncDone(): () => string {
        return () => '_callback(null, asyncParallelResMap);\n'
    }

    content({ onError, onResult, onDone }: CodeFactoryContent) {
        let code = ''
        if (!this.options || !onResult) {
            return code
        }

        code += this.callTapsParallel({
            onError: (_i, err, _done, doneBreak) => onError(err) + doneBreak(true),
            onTap: (_i, run) => {
                return run()
            },
            onResult: (i, result, done) => {
                if (!this.options) {
                    return undefined
                }

                const tap = this.options.taps[i]

                if (!tap.name) {
                    return undefined
                }
                let _code = ''
                _code += `asyncParallelResMap["${tap.name}"] = ${result}\n`
                _code += done()
                return _code
            },
            onDone: () => {
                return onDone()
            }
        })

        return code
    }
}

const codeFactory = new AsyncParallelResultAllHookCodeFactory()

class AsyncParallelResultAllHook extends Hook {
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

export default AsyncParallelResultAllHook
