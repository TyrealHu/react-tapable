const { SyncBailHook } = require('../lib/index.js')

const hook = new SyncBailHook(['test'])

hook.tap('test', (test) => {
    console.log(`This tap will call, and tap will not return, because tap's name(test) !== ${test}`)
})

hook.tap('test2', (test) => {
    console.log(`This tap will call, and tap will return, because tap's name(test2) === ${test}`)
    return false
})

hook.tap('test3', (test) => {
    console.log(`This tap will not call`)
})

hook.call('test2')
