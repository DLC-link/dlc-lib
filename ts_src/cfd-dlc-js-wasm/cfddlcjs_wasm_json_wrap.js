import cfddlcjsWasmJson from './cfddlcjs_wasm_json.js'

const wrappedModule = {}
let hasLoaded = false
cfddlcjsWasmJson['onRuntimeInitialized'] = async () => {
  if ('onRuntimeInitialized' in wrappedModule) {
    wrappedModule.onRuntimeInitialized()
  }
  hasLoaded = true
}

wrappedModule['addInitializedListener'] = function (func) {
  if (hasLoaded) {
    if (func) func()
  } else {
    wrappedModule['onRuntimeInitialized'] = func
  }
}

wrappedModule['getCfddlc'] = function () {
  return cfddlcjsWasmJson
}

wrappedModule['hasLoadedWasm'] = function () {
  return hasLoaded
}

wrappedModule['CfdError'] = cfddlcjsWasmJson.CfdError

export default wrappedModule
