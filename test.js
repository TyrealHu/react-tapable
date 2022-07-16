const { SyncWaterfallHook, SyncHook } = require('./lib/index.js')

// const hook = new SyncHook(['test'])
const hook = new SyncWaterfallHook(['name', 'height'])

hook.tap('test',(name, height) => {
    return [ name+ '1', height + 1]
})

hook.tap('TEST2222', (name, height) => {
    return [ name+ '1', height + 1]
})

const r = hook.call('test', 2)
console.log(r)
