const { SyncWaterfallHook } = require('../lib/index.js')

const hook = new SyncWaterfallHook(['name', 'height'])

hook.tap('test', (name, height) => {
    return name + 'A'
})

hook.tap('test2', (name, height) => {
    return name + 'B'
})

const r = hook.call('test', 2)
console.log(r)
