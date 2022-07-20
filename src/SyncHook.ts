import CodeFactory from './CodeFactory'
import Hook from './Hook'

class SyncHookCodeFactory extends CodeFactory {
    content({ onError, onDone, rethrowIfPossible }: CodeFactoryContent) {
        return this.callTapsSeries({
            onError: (_i, err) => onError(err),
            onDone,
            rethrowIfPossible
        })
    }
}

const codeFactory = new SyncHookCodeFactory()

class SyncHook extends Hook {
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

export default SyncHook
