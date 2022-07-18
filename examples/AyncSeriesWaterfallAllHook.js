const { AsyncSeriesWaterfallAllHook } = require('../lib/index')

const hook = new AsyncSeriesWaterfallAllHook(['sum', 'name']);
hook.tapAsync('tapAsync0', (sum, name, cb)=>{
    console.log('sum', sum, 'name', name);
    setTimeout(()=>{
        cb(null, [++sum, name + '0']);
    }, 2000);
});

hook.tapAsync('tapAsync1', (sum, name, cb)=>{
    console.log('sum', sum, 'name', name);
    setTimeout(()=>{
        cb(null, [++sum, name + '1']);
    }, 1000);
});

hook.callAsync(1, 'name', (err, [sum, name])=>{
    console.log('end', 'sum', sum, 'name', name, 'err', err);
});
