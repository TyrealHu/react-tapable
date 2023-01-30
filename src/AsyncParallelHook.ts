import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelHookCodeFactory extends CodeFactory {
    content({ onError, onDone }: CodeFactoryContent) {
        return this.callTapsParallel({
            onError: (_i, err, _done, doneBreak) => onError(err) + doneBreak(true),
            onDone
        })
    }
}

const codeFactory = new AsyncParallelHookCodeFactory()

class AsyncParallelHook extends Hook {
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

export default AsyncParallelHook
