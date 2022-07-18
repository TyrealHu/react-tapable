const { SyncLoopHook } = require('../lib/index.js')

const hook = new SyncLoopHook();
let num = 0;
let num1 = 0;
hook.tap('tap0', ()=>{
    console.log('tap0', num);
    if( num++ < 1 ) {
        return false;
    }
});
hook.tap('tap1', ()=>{
    console.log('tap1', num1);
    if( num1++ < 1 ) {
        return false;
    }
});

hook.call()
