export const deprecate = (fn: () => any, msg: string) => {
    let once = true
    return function (...args: any[]) {
        if (once) {
            console.warn('DeprecationWarning: ' + msg)
            once = false
        }
        // @ts-ignore
        return fn.apply(this, args)
    }
}
