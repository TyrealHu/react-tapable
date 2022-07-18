const { AsyncSeriesWaterfallHook } = require('../lib/index')

const hook = new AsyncSeriesWaterfallHook(['sum']);
hook.tapAsync('tapAsync0', (sum, cb)=>{
    console.log('sum', sum);
    setTimeout(()=>{
        cb(null, ++sum);
    }, 2000);
});

hook.tapAsync('tapAsync1', (sum, cb)=>{
    console.log('sum', sum);
    setTimeout(()=>{
        cb && cb(null, ++sum);
    }, 1000);
});

hook.callAsync(1, (err, sum)=>{
    console.log('end', 'sum', sum, 'err', err);
});
