## SyncHook
### 流程图如下
`call ----> tap0 ----> tap2 ----> end`

使用例子如下

```javascript
const hook = new SyncHook(['name'])

hook.tap('test',(name) => {
    console.log(name + ' name abc')
})

hook.tap('TEST2222', (name) => {
    console.log(name + 'name cba')
})

hook.call('test')

// result:
// test name abc
// test name cba
```

## SyncLoopHook
### 流程图如下
```
            ----------------------------------
            |          yes                  yes
            v          |                     |
call ----> tap0 ----return --not--> tap1 ----return --not--> end
```
当tap有返回值的时候就会重复执行这个tap，直到没有再到下一个tap或者end
使用例子如下

```javascript
const { SyncLoopHook } = require('../lib/index.js')

const hook = new SyncLoopHook();
let num = 0;
hook.tap('tap0', ()=>{
    console.log('tap0', num);
    if( num++ < 5 ) {
        return false;
    }
});

hook.call()


// result:
// tap0 0
// tap0 1
// tap0 2
// tap0 3
// tap0 4
// tap0 5
```

## SyncWaterfallHook
### 流程图如下
`call ----> tap0 --value0--> tap2 --value1--> end`

在SyncWaterfallHook中只支持将第一个参数连续传递下去例子如下

```javascript
const { SyncWaterfallHook } = require('../lib/index.js')

const hook = new SyncWaterfallHook(['name', 'height'])

hook.tap('test', (name, height) => {
    return name + 'A'
})

hook.tap('test2', (name, height) => {
    return name + 'B'
})

const r = hook.call('test', 2)
console.log(r) 
// result testAB
```

## SyncWaterfallAllHook
### 流程图如下
`call ----> tap0 --[value0, value2]--> tap2 --[value3, value4]--> end`

在[tapable](https://github.com/webpack/tapable)当中有一个SyncWaterfallHook只支持将第一个参数连续传递下去，但SyncWaterfallAllHook支持所有的参数传递，但需要返回一个数组，例子如下

```javascript
const hook = new SyncWaterfallAllHook(['name', 'height'])

hook.tap('test', (name, height) => {
    return [name + '1', height + 1]
})

hook.tap('TEST2222', (name, height) => {
    return [name + '1', height + 1]
})

const r = hook.call('test', 2)
console.log(r) 
// result: [ 'test11', 4 ]
```

## SyncBailHook
### 流程图如下
```
            --------------------------
            |             |           |
            |if return    |if return  v
call ----> tap0   ---->   tap2  ----> end
```
如果有一个tap有返回值，那么就会停止执行，使用例子如下

```javascript
const { SyncBailHook } = require('../lib/index.js')

const hook = new SyncBailHook(['test'])

hook.tap('test', (test) => {
    console.log(`This tap will call, and tap will not return, because tap's name(test) !== ${test}`)
})

hook.tap('test2', (test) => {
    console.log(`This tap will call, and tap will return, because tap's name(test2) === ${test}`)
    return false
})

hook.tap('test3', (test) => {
    console.log(`This tap will not call`)
})

hook.call('test2')


// result:
// This tap will call, and tap will not return, because tap's name(test) !== test2
// This tap will call, and tap will not return, because tap's name(test2) === test2
```

## AsyncParallelHook
### 流程图如下
```
            --------------------------
            |             ------------|
            |cb/error     |cb/error   v
call ----> tap0  ---->  tap2  ----> end
```

需要所有的tap都执行了callback函数，或者其中有一个执行callback函数有回传error，那么就
会进入end，执行在callAsync时传入的函数，类似于`Promise.all`

```javascript
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
// result:
// tap0, Hello World
// tap1, Hello World
// tap2, Hello World
// ...timeout 4s...
// end
```

## AsyncParallelBailHook
### 流程图如下
```
                            只需要一个
            -------------------------------------
            |                  |                 |
            |cb/error,result   |cb/error,result  v
call ----> tap0     ---->     tap2     ---->    end
            |                   |                ^
            |                   |                |
            --------------------全部执行完---------
```
执行有一下几个case：
1，需要所有的tap都执行了callback函数，并且没有`error/result`返回
2，其中一个tap有`error/result`返回
类似于`Promise.all`与`Promise.rice`结合

```javascript
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

// result:
// tapAsync0
// tapAsync1
// ...timeout 2s...
// end1111
```

## AsyncSeriesHook
### 流程图如下
```
call ----> tap0   ---->   tap2  ----> end
```
会一个tap一个tap的执行下去，并且在里面是要通过执行callback函数才能跳转到下一个tap的

```javascript
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
// result:
// tapAsync0
// ...timeout 5s...
// tapAsync1
// ...timeout 1s...
// end
```

## AsyncSeriesBailHook
### 流程图如下
```
            ---------------------------
            |res          ------------|  
            |error       |error/res   |
            |cb          |cb          v
call ----> tap0  ---->  tap2  ----> end
```
会一个tap一个tap的执行下去，但是如果其中有一个执行callback的时候传入了error或者result那么就不会执行后面的tap了，会直接执行end

```javascript
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
// result:
// sum 1
// end sum undefined err true
```

## AsyncSeriesWaterfallHook
### 流程图如下
```
            -----------------------
            |error      |error    |
            |res------  |res------|
            |         | |         |
            |         v |         v
call ----> tap0 ----> tap2 ----> end
```

在SyncWaterfallHook中只支持将第一个参数连续传递下去例子如下

```javascript
const { SyncWaterfallHook } = require('../lib/index.js')

const hook = new SyncWaterfallHook(['name', 'height'])

hook.tap('test', (name, height) => {
    return name + 'A'
})

hook.tap('test2', (name, height) => {
    return name + 'B'
})

const r = hook.call('test', 2)
console.log(r) 
// result testAB
```

## AsyncSeriesLoopHook
### 流程图如下
```
            ----------------------------------
            |          yes                  yes
            v          |                     |
call ----> tap0 ----return --not--> tap1 ----return --not--> end
```
当tap有返回值的时候就会重复执行这个tap，直到没有再到下一个tap或者end，支持传入callback
使用例子如下

```javascript
const { AsyncSeriesLoopHook } = require('../lib/index.js')

const hook = new AsyncSeriesLoopHook();
let num = 0;
let num1 = 0;
hook.tapAsync('tap0', (cb)=>{
    console.log('tap0', num);
    if( num++ < 1 ) {
        cb(null, false);
    }
});
hook.tapAsync('tap1', (cb)=>{
    console.log('tap1', num1);
    if( num1++ < 1 ) {
        cb(null, false);
    }
});

hook.callAsync((err) => {
    console.log('end', 'err', err)
})


// result:
// tap0 0
// tap0 1
// tap1 2
// tap0 2
// tap1 1
// end err undefined
```

## AsyncSeriesWaterfallAllHook
### 流程图如下
```
            --------------------- -----------------------
            |[value0, value2]   | |[value0, value2]     |
            |                   v |                     v
call ----> tap0      ---->     tap2      ---->        end
```

在[tapable](https://github.com/webpack/tapable)当中有一个AsyncSeriesWaterfallHook只支持将第一个参数连续传递下去，但AsyncSeriesWaterfallAllHook支持所有的参数传递，但需要返回一个数组，例子如下

```javascript
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

// result:
// sum 1 name name
// sum 2 name name0
// end sum 3 name name01 err null
```
