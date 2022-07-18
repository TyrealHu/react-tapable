const { SyncHook } = require('../lib/index.js')

const hook = new SyncHook(['test'])

hook.tap('test', (test) => {
    console.log('This is tap test: ', test)
})

hook.tap('test2', (test) => {
    console.log('This is tap test2: ', test)
})

hook.call('Hello World')
