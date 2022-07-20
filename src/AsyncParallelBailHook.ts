import CodeFactory from './CodeFactory'
import Hook from './Hook'

class AsyncParallelBailHookCodeFactory extends CodeFactory {
    content({ onError, onResult, onDone }: CodeFactoryContent) {
        let code = ''
        if (!this.options || !onResult) {
            return code
        }
        code += `var _results = new Array(${this.options.taps.length});\n`
        code += 'var _checkDone = function() {\n'
        code += 'for(var i = 0; i < _results.length; i++) {\n'
        code += 'var item = _results[i];\n'
        code += 'if(item === undefined) return false;\n'
        code += 'if(item.result !== undefined) {\n'
        code += onResult('item.result')
        code += 'return true;\n'
        code += '}\n'
        code += 'if(item.error) {\n'
        code += onError('item.error')
        code += 'return true;\n'
        code += '}\n'
        code += '}\n'
        code += 'return false;\n'
        code += '}\n'
        code += this.callTapsParallel({
            onError: (i, err, done, doneBreak) => {
                let _code = ''
                _code += `if(${i} < _results.length && ((_results.length = ${
                    i + 1
                }), (_results[${i}] = { error: ${err} }), _checkDone())) {\n`
                _code += doneBreak(true)
                _code += '} else {\n'
                _code += done()
                _code += '}\n'
                return _code
            },
            onResult: (i, result, done, doneBreak) => {
                let _code = ''
                _code += `if(${i} < _results.length && (${result} !== undefined && (_results.length = ${
                    i + 1
                }), (_results[${i}] = { result: ${result} }), _checkDone())) {\n`
                _code += doneBreak(true)
                _code += '} else {\n'
                _code += done()
                _code += '}\n'
                return _code
            },
            onTap: (i, run, done, _doneBreak) => {
                let _code = ''
                if (i > 0) {
                    _code += `if(${i} >= _results.length) {\n`
                    _code += done()
                    _code += '} else {\n'
                }
                _code += run()
                if (i > 0) {
                    _code += '}\n'
                }
                return _code
            },
            onDone
        })
        return code
    }
}

const codeFactory = new AsyncParallelBailHookCodeFactory()

class AsyncParallelBailHook extends Hook {
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
            throw new Error('call is not supported on a AsyncParallelBailHook')
        }

        this._call = () => {
            throw new Error('call is not supported on a AsyncParallelBailHook')
        }
    }
}

export default AsyncParallelBailHook
