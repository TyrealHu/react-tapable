class CodeFactory {
    protected _args: string[] | undefined
    protected options: HookCompileOptions | undefined

    // @ts-ignore
    content(options: CodeFactoryContent) {
        throw new Error('CodeFactory must be abstract')
    }

    create(options: HookCompileOptions) {
        this.init(options)
        let fn
        if (!this.options || !this._args) {
            return
        }

        switch (this.options.type) {
            case 'sync':
                fn = new Function(
                    this.args({}),
                    '"use strict";\n' +
                        this.header() +
                        this.content({
                            onError: (err) => `throw ${err};\n`,
                            onResult: (result) => `return ${result};\n`,
                            resultReturns: true,
                            onDone: () => '',
                            rethrowIfPossible: true
                        })
                )
                break
            case 'async':
                fn = new Function(
                    this.args({
                        after: '_callback'
                    }),
                    '"use strict";\n' +
                        this.header() +
                        this.content({
                            onError: (err) => `_callback(${err});\n`,
                            onResult: (result: any) => `_callback(null, ${result});\n`,
                            onDone: () => '_callback();\n'
                        })
                )
                break
            case 'promise':
                let errorHelperUsed = false
                const content = this.content({
                    onError: (err) => {
                        errorHelperUsed = true
                        return `_error(${err});\n`
                    },
                    onResult: (result: any) => `_resolve(${result});\n`,
                    onDone: () => '_resolve();\n'
                })
                let code = ''
                code += '"use strict";\n'
                code += this.header()
                code += 'return new Promise((function(_resolve, _reject) {\n'
                if (errorHelperUsed) {
                    code += 'var _sync = true;\n'
                    code += 'function _error(_err) {\n'
                    code += 'if(_sync)\n'
                    code += '_resolve(Promise.resolve().then((function() { throw _err; })));\n'
                    code += 'else\n'
                    code += '_reject(_err);\n'
                    code += '};\n'
                }
                code += content
                if (errorHelperUsed) {
                    code += '_sync = false;\n'
                }
                code += '}));\n'
                fn = new Function(this.args({}), code)
                break
        }
        this.deinit()
        return fn
    }

    setup(fns: any[], options: HookCompileOptions) {
        options.taps.forEach((item) => {
            fns.push(item.fn)
        })
    }

    /**
     * @param {{ type: "sync" | "promise" | "async", taps: Array<Tap>, interceptors: Array<Interceptor> }} options
     */
    init(options: HookCompileOptions) {
        this.options = options
        this._args = options.args.slice()
    }

    deinit() {
        this.options = undefined
        this._args = undefined
    }

    header() {
        let code = ''
        if (this.needContext()) {
            code += 'var _context = {};\n'
        } else {
            code += 'var _context;\n'
        }
        code += 'var fns = this.fns;\n'
        return code
    }

    needContext() {
        if (this.options) {
            for (const tap of this.options.taps) {
                if (tap.context) {
                    return true
                }
            }
        }
        return false
    }

    callTap(
        tapIndex: number,
        {
            onError,
            onResult,
            onDone,
            rethrowIfPossible
        }: Omit<CodeFactoryContent, 'onDone'> & { onDone: false | (() => any) }
    ) {
        let code = ''

        if (!this.options) {
            return code
        }
        code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`
        const tap = this.options.taps[tapIndex]
        switch (tap.type) {
            case 'sync':
                if (!rethrowIfPossible) {
                    code += `var _hasError${tapIndex} = false;\n`
                    code += 'try {\n'
                }
                if (onResult) {
                    code += `var _result${tapIndex} = _fn${tapIndex}(${this.args({
                        before: tap.context ? '_context' : undefined
                    })});\n`
                } else {
                    code += `_fn${tapIndex}(${this.args({
                        before: tap.context ? '_context' : undefined
                    })});\n`
                }
                if (!rethrowIfPossible) {
                    code += '} catch(_err) {\n'
                    code += `_hasError${tapIndex} = true;\n`
                    code += onError('_err')
                    code += '}\n'
                    code += `if(!_hasError${tapIndex}) {\n`
                }
                if (onResult) {
                    code += onResult(`_result${tapIndex}`)
                }
                if (onDone) {
                    code += onDone()
                }
                if (!rethrowIfPossible) {
                    code += '}\n'
                }
                break
            case 'async':
                let cbCode = ''
                if (onResult) {
                    cbCode += `(function(_err${tapIndex}, _result${tapIndex}) {\n`
                } else {
                    cbCode += `(function(_err${tapIndex}) {\n`
                }
                cbCode += `if(_err${tapIndex}) {\n`
                cbCode += onError(`_err${tapIndex}`)
                cbCode += '} else {\n'
                if (onResult) {
                    cbCode += onResult(`_result${tapIndex}`)
                }
                if (onDone) {
                    cbCode += onDone()
                }
                cbCode += '}\n'
                cbCode += '})'
                code += `_fn${tapIndex}(${this.args({
                    before: tap.context ? '_context' : undefined,
                    after: cbCode
                })});\n`
                break
            case 'promise':
                code += `var _hasResult${tapIndex} = false;\n`
                code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args({
                    before: tap.context ? '_context' : undefined
                })});\n`
                code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`
                code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`
                code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`
                code += `_hasResult${tapIndex} = true;\n`
                if (onResult) {
                    code += onResult(`_result${tapIndex}`)
                }
                if (onDone) {
                    code += onDone()
                }
                code += `}), function(_err${tapIndex}) {\n`
                code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`
                code += onError(`_err${tapIndex}`)
                code += '});\n'
                break
        }
        return code
    }

    callTapsSeries({
        onError,
        onResult,
        resultReturns,
        onDone,
        doneReturns,
        rethrowIfPossible
    }: CodeFactoryContent) {
        if (!this.options || this.options.taps.length === 0) {
            return onDone()
        }
        const firstAsync = this.options.taps.findIndex((t) => t.type !== 'sync')
        const somethingReturns = resultReturns || doneReturns
        let code = ''
        let current = onDone
        let unrollCounter = 0
        for (let j = this.options.taps.length - 1; j >= 0; j--) {
            const i = j
            const unroll =
                current !== onDone && (this.options.taps[i].type !== 'sync' || unrollCounter++ > 20)
            if (unroll) {
                unrollCounter = 0
                code += `function _next${i}() {\n`
                code += current()
                code += `}\n`
                current = () => `${somethingReturns ? 'return ' : ''}_next${i}();\n`
            }
            const done = current
            const doneBreak = (skipDone: boolean) => {
                if (skipDone) {
                    return ''
                }
                return onDone()
            }
            const content = this.callTap(i, {
                onError: (error: any) => onError(i, error, done, doneBreak),
                onResult:
                    onResult &&
                    ((result: any) => {
                        return onResult(i, result, done, doneBreak)
                    }),
                onDone: !onResult && done,
                rethrowIfPossible: rethrowIfPossible && (firstAsync < 0 || i < firstAsync)
            })
            current = () => content
        }
        code += current()
        return code
    }

    callTapsLooping({ onError, onDone, rethrowIfPossible }: CodeFactoryContent) {
        if (!this.options || this.options.taps.length === 0) {
            return onDone()
        }
        const syncOnly = this.options.taps.every((t) => t.type === 'sync')
        let code = ''
        if (!syncOnly) {
            code += 'var _looper = (function() {\n'
            code += 'var _loopAsync = false;\n'
        }
        code += 'var _loop;\n'
        code += 'do {\n'
        code += '_loop = false;\n'
        code += this.callTapsSeries({
            onError,
            onResult: (_i, result, next, doneBreak) => {
                let _code = ''
                _code += `if(${result} !== undefined) {\n`
                _code += '_loop = true;\n'
                if (!syncOnly) {
                    _code += 'if(_loopAsync) _looper();\n'
                }
                _code += doneBreak(true)
                _code += `} else {\n`
                _code += next()
                _code += `}\n`
                return _code
            },
            onDone:
                onDone &&
                (() => {
                    let _code = ''
                    _code += 'if(!_loop) {\n'
                    _code += onDone()
                    _code += '}\n'
                    return _code
                }),
            rethrowIfPossible: rethrowIfPossible && syncOnly
        })
        code += '} while(_loop);\n'
        if (!syncOnly) {
            code += '_loopAsync = true;\n'
            code += '});\n'
            code += '_looper();\n'
        }
        return code
    }

    callTapsParallel({
        onError,
        onResult,
        onDone,
        rethrowIfPossible,
        onTap = (_i, run) => run()
    }: CodeFactoryContent & {
        // 每一个tap hook之间连接的作用
        onTap?: (...args: any[]) => any
    }) {
        if (!this.options) {
            return ''
        }
        if (this.options.taps.length <= 1) {
            return this.callTapsSeries({
                onError,
                onResult,
                onDone,
                rethrowIfPossible
            })
        }
        let code = ''
        code += 'do {\n'
        code += `var _counter = ${this.options.taps.length};\n`
        if (onDone) {
            code += 'var _done = (function() {\n'
            code += onDone()
            code += '});\n'
        }
        for (let i = 0; i < this.options.taps.length; i++) {
            const done = () => {
                // @ts-ignore
                if (onDone) {
                    return 'if(--_counter === 0) _done();\n'
                } else {
                    return '--_counter;'
                }
            }
            const doneBreak = (skipDone: boolean) => {
                if (skipDone || !onDone) {
                    return '_counter = 0;\n'
                } else {
                    return '_counter = 0;\n_done();\n'
                }
            }
            code += 'if(_counter <= 0) break;\n'
            code += onTap(
                i,
                () =>
                    this.callTap(i, {
                        onError: (error) => {
                            let _code = ''
                            _code += 'if(_counter > 0) {\n'
                            _code += onError(i, error, done, doneBreak)
                            _code += '}\n'
                            return _code
                        },
                        onResult:
                            onResult &&
                            ((result) => {
                                let _code = ''
                                _code += 'if(_counter > 0) {\n'
                                _code += onResult(i, result, done, doneBreak)
                                _code += '}\n'
                                return _code
                            }),
                        onDone:
                            !onResult &&
                            (() => {
                                return done()
                            }),
                        rethrowIfPossible
                    }),
                done,
                doneBreak
            )
        }
        code += '} while(false);\n'
        return code
    }

    args({ before, after }: { before?: string; after?: string }) {
        let allArgs = this._args || []

        if (before) {
            allArgs = [before].concat(allArgs)
        }

        if (after) {
            allArgs = allArgs.concat(after)
        }

        if (allArgs.length === 0) {
            return ''
        } else {
            return allArgs.join(', ')
        }
    }

    getTapFn(idx: number) {
        return `fns[${idx}]`
    }

    getTap(idx: number) {
        return `_taps[${idx}]`
    }
}

export default CodeFactory
