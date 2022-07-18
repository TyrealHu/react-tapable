const { AsyncSeriesLoopHook } = require('../lib/index.js')

const hook = new AsyncSeriesLoopHook();
let num = 0;
hook.tap('tap0', ()=>{
    console.log('tap0', num);
    if( num++ < 5 ) {
        return false;
    }
});

hook.call()
