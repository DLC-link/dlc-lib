/**
 * cfd error class.
 */
class CfdError extends Error {
  /**
   * constructor.
   * @param {string} message error message.
   * @param {*} errorInformation error information object.
   * @param {Error} cause cause error.
   */
  constructor(message, errorInformation = undefined, cause = undefined) {
    super(
      !errorInformation ? message : message + JSON.stringify(errorInformation)
    )
    this.name = 'CfdError'
    this.errorInformation = errorInformation
    this.cause = cause
  }
  // eslint-disable-next-line valid-jsdoc
  /**
   * error object string.
   * @return message string.
   */
  toString() {
    return `${this.name}: ${this.message}`
  }
  // eslint-disable-next-line valid-jsdoc
  /**
   * get error information.
   * @return InnerErrorResponse object.
   */
  getErrorInformation() {
    return this.errorInformation
  }
  // eslint-disable-next-line valid-jsdoc
  /**
   * get error cause.
   * @return Error or undefined.
   */
  getCause() {
    return this.cause
  }
}

const ccallCfd = async function (module, func, returnType, argTypes, args) {
  const UTF8Decoder =
    typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined
  const stringToUTF8Array = function (str, heap, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0
    const startIdx = outIdx
    const endIdx = outIdx + maxBytesToWrite - 1
    for (let i = 0; i < str.length; ++i) {
      let u
      if (str.charCodeAt) {
        u = str.charCodeAt(i)
        if (u >= 55296 && u <= 57343) {
          const u1 = str.charCodeAt(++i)
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
        }
      } else {
        u = str[i]
        if (u >= 55296 && u <= 57343) {
          const u1 = str[++i]
          u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
        }
      }
      if (u <= 127) {
        if (outIdx >= endIdx) break
        heap[outIdx++] = u
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break
        heap[outIdx++] = 192 | (u >> 6)
        heap[outIdx++] = 128 | (u & 63)
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break
        heap[outIdx++] = 224 | (u >> 12)
        heap[outIdx++] = 128 | ((u >> 6) & 63)
        heap[outIdx++] = 128 | (u & 63)
      } else {
        if (outIdx + 3 >= endIdx) break
        heap[outIdx++] = 240 | (u >> 18)
        heap[outIdx++] = 128 | ((u >> 12) & 63)
        heap[outIdx++] = 128 | ((u >> 6) & 63)
        heap[outIdx++] = 128 | (u & 63)
      }
    }
    heap[outIdx] = 0
    return outIdx - startIdx
  }
  const stringToUTF8 = function (str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, module['HEAPU8'], outPtr, maxBytesToWrite)
  }
  const UTF8ArrayToString = function (heap, idx, maxBytesToRead) {
    const endIdx = idx + maxBytesToRead
    let endPtr = idx
    let str = ''
    while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr
    if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
      return UTF8Decoder.decode(heap.subarray(idx, endPtr))
    } else {
      while (idx < endPtr) {
        let u0 = heap[idx++]
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0)
          continue
        }
        const u1 = heap[idx++] & 63
        if ((u0 & 224) == 192) {
          str += String.fromCharCode(((u0 & 31) << 6) | u1)
          continue
        }
        const u2 = heap[idx++] & 63
        if ((u0 & 240) == 224) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63)
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0)
        } else {
          const ch = u0 - 65536
          str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
        }
      }
    }
    return str
  }
  const UTF8ToString = function (ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(module['HEAPU8'], ptr, maxBytesToRead) : ''
  }
  const writeArrayToMemory = function (array, buffer) {
    module['HEAPU8'].set(array, buffer)
  }
  const toC = {
    string: function (str) {
      let ret = 0
      if (str !== null && str !== undefined && str !== 0) {
        const len = (str.length << 2) + 1
        ret = module['stackAlloc'](len)
        stringToUTF8(str, ret, len)
      }
      return ret
    },
    array: function (arr) {
      const ret = module['stackAlloc'](arr.length)
      writeArrayToMemory(arr, ret)
      return ret
    },
  }

  const convertReturnValue = function (ret) {
    if (returnType === 'string') {
      const result = UTF8ToString(ret)
      module['_cfdjsFreeString'](ret)
      return result
    }
    if (returnType === 'boolean') return Boolean(ret)
    return ret
  }
  // const func = getCFunc(ident);
  const cArgs = []
  let stack = 0
  if (args) {
    for (let i = 0; i < args.length; i++) {
      const converter = toC[argTypes[i]]
      if (converter) {
        if (stack === 0) stack = module['stackSave']()
        cArgs[i] = converter(args[i])
      } else {
        cArgs[i] = args[i]
      }
    }
  }

  // eslint-disable-next-line prefer-spread
  let ret = func.apply(null, cArgs)
  ret = convertReturnValue(ret)
  if (stack !== 0) module['stackRestore'](stack)
  return ret
}

const callJsonApi = async function (
  wasmModule,
  reqName,
  arg,
  hasThrowExcept = true
) {
  let retObj
  try {
    // stringify all arguments
    let argStr = ''
    if (arg) {
      argStr = JSON.stringify(arg, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    }

    const retJson = await ccallCfd(
      wasmModule,
      wasmModule['_cfdjsJsonApi'],
      'string',
      ['string', 'string'],
      [reqName, argStr]
    )
    if (retJson.startsWith('CfdError: ') || retJson.startsWith('Error: ')) {
      // TODO: Logic to follow the difference in error responses in cfd-dlc-js.
      retObj = {
        error: retJson.split(':')[1],
      }
    } else {
      retObj = JSON.parse(retJson)
    }
  } catch (err) {
    throw new CfdError(
      'ERROR: Invalid function call:' + ` func=[${reqName}], arg=[${arg}]`,
      undefined,
      err
    )
  }

  if (hasThrowExcept && retObj.hasOwnProperty('error')) {
    throw new CfdError('', retObj.error)
  }
  return retObj
}

const Api = {
  callJsonApi: callJsonApi,
  ccallCfd: ccallCfd,
  CfdError: CfdError,
}

export default Api
