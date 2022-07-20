import CodeFactory from './CodeFactory'
import Hook from './Hook'

class SyncBailHookCodeFactory extends CodeFactory {
    content({ onError, onResult, resultReturns, onDone, rethrowIfPossible }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err) => onError(err),
            onResult: (_i, result, next) =>
                // @ts-ignore
                `if(${result} !== undefined) {\n${onResult(result)};\n} else {\n${next()}}\n`,
            resultReturns,
            onDone,
            rethrowIfPossible
        })
    }
}

const codeFactory = new SyncBailHookCodeFactory()

class SyncBailHook extends Hook {
    private fns: any[] | undefined
    constructor(args: string[], name?: string) {
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

export default SyncBailHook
