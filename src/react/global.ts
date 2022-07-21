import { Controller } from './index'

const ControllerMap = new Map<string, Controller<any>>()
let globalId = 0

function getGlobalId() {
    return ++globalId
}

export { ControllerMap, getGlobalId }
