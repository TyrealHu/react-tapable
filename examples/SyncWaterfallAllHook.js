const { SyncWaterfallAllHook } = require('../lib/index.js')

const hook = new SyncWaterfallAllHook(['name', 'height'])

hook.tap('test', (name, height) => {
    return [name + 'A', height + 2]
})

hook.tap('test2', (name, height) => {
    return [name + 'B', height + 4]
})

const r = hook.call('test', 2)
console.log(r) //result [testAB, 8]
