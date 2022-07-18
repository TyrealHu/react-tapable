const { AsyncSeriesBailHook } = require('../lib/index')

const hook = new AsyncSeriesBailHook(['sum']);
hook.tapAsync('tapAsync0', (sum, cb)=>{
    console.log('sum', sum);
    setTimeout(()=>{
        cb(true);
    }, 2000);
});

hook.tapAsync('tapAsync1', (sum, cb)=>{
    console.log('sum', sum);
    setTimeout(()=>{
        cb(false, 2);
    }, 1000);
});

hook.callAsync(1, (err, sum)=>{
    console.log('end', 'sum', sum, 'err', err);
});
