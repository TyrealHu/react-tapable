const { AsyncParallelHook } = require('../lib/index')

const hook = new AsyncParallelHook(['test'])

hook.tapAsync('tap0', (test, cb)=>{
    console.log('tap0, ', test);
    setTimeout(()=>{
        cb();
    }, 1000);
});
hook.tapAsync('tap1', (test, cb)=>{
    console.log('tap1, ', test);
    setTimeout(()=>{
        cb();
    }, 2000);
});
hook.tapAsync('tap2', (test, cb)=>{
    console.log('tap2, ', test);
    setTimeout(()=>{
        cb();
    }, 4000);
});

hook.callAsync('Hello World', ()=>{
    console.log('end');
});
