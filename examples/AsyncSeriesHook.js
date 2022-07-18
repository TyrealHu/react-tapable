const { AsyncSeriesHook } = require('../lib/index')

const hook = new AsyncSeriesHook();

hook.tapAsync('tapAsync0', (cb)=>{
    console.log('tapAsync0')
    setTimeout(()=>{
        cb && cb()
    }, 5000);
});

hook.tapAsync('tapAsync1', (cb)=>{
    console.log('tapAsync1')
    setTimeout(()=>{
        cb && cb()
    }, 1000);
});

hook.callAsync(()=>{
    console.log('end');
});
