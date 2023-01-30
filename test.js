class H {
    fo() {
        console.log('fo')
    }

    go() {
        this.fo()
    }
}

class H1 extends H{
    fo() {
        console.log('fo1')
    }
}

new H1().go()
