# react-tapable
基于tapable，实现react的订阅发布的库
目前实现以下几个Hook
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
// 1, test name abc
// 2, test name cba
```

## SyncWaterfallHook
### 流程图如下
 `call ----> tap0 --[value0, value2]--> tap2 --[value3, value4]--> end`

在[tapable](https://github.com/webpack/tapable)当中这个hook只支持将第一个参数连续传递下去，但本库当中支持所有的参数传递，但需要返回一个数组，例子如下

```javascript
const hook = new SyncWaterfallHook(['name', 'height'])

hook.tap('test',(name, height) => {
    return [ name+ '1', height + 1]
})

hook.tap('TEST2222', (name, height) => {
    return [ name+ '1', height + 1]
})

const r = hook.call('test', 2)
console.log(r) // result: [ 'test11', 4 ]
```

