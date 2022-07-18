const { AsyncParallelBailHook } = require('../lib/index')

const asyncParallelBailHook = new AsyncParallelBailHook();
asyncParallelBailHook.tapAsync("tapAsync0", (cb)=>{
    console.log('tapAsync0')
    setTimeout(() => {
        cb(undefined, '1111');
    }, 2000)
    return false;
});

asyncParallelBailHook.tapAsync("tapAsync1", (cb)=>{
    console.log('tapAsync1')
    cb();
});

asyncParallelBailHook.callAsync((err, res)=>{
    console.log("end", res);
});
