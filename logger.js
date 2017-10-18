/* eslint-disable */ // accept the shady magic of this file
/* $lab:coverage:off$ */
// don't use strict mode on that file because it breaks the module stack hack

const _ = require('lodash')
const path = require('path')
const moment = require('moment')
const SysLogger = require('ain2')

Object.defineProperty(module, '__stack', {
  get: function () {
    var orig = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) {
      return stack
    }
    var err = new Error()
    Error.captureStackTrace(err, arguments.callee)
    var stack = err.stack
    delete Error.prepareStackTrace
    Error.prepareStackTrace = orig
    return stack
  }
})

const STACK_DEPTH = parseInt(process.env.LOGACIOUS_STACK_DEPTH, 10) || 3

Object.defineProperty(module, '__caller_info', {
  get: function () {
    var callerStack = module.__stack
    return {
      line: callerStack[STACK_DEPTH].getLineNumber(),
      file: path.relative(process.cwd(), callerStack[STACK_DEPTH].getFileName()),
      functionName: callerStack[STACK_DEPTH].getFunctionName()
    }
  }
})

function fileInfo () {
  var callerInfo = module.__caller_info
  return callerInfo.file + ':' + callerInfo.line
}

function prepare (prependList, jsArguments) {
  var args =_.map(jsArguments, function (item) {
    if(item instanceof String) {
      return item
    } else if(item instanceof Error) {
      let str = `${item.message}\n`
      if(item.code) {
        str += `code=${item.code}\n`
      }
      if(item.statusCode) {
        str += `statusCode=${item.statusCode}\n`
      }
      str += item.stack
      return str
    }else {
      try {
        return JSON.stringify(item)
      }
      catch(e) {
        // can happen if item has circular dependencies.
        // In which case, logging [item] will default
        //   below to whatever console.log can handle.
        return item
      }
    }
  })
  _.eachRight(prependList, function (prependItem) {
    args.unshift(prependItem)
  })
  return args
}

function wrapWithMetadata (level, func) {
  return function () {
    var args = prepare([
      '[' + level +']',
      moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      fileInfo()
    ],
    arguments)
    return func.apply(null, args)
  }
}

var logger = console

if(process.env.LOGACIOUS_SYSLOG) {
  var syslogConf = {}
  if(process.env.LOGACIOUS_SYSLOG_TAG) {
    syslogConf.tag = process.env.LOGACIOUS_SYSLOG_TAG
  }
  if(process.env.LOGACIOUS_SYSLOG_FACILITY) {
    syslogConf.facility = process.env.LOGACIOUS_SYSLOG_FACILITY
  }
  if(process.env.LOGACIOUS_SYSLOG_HOSTNAME) {
    syslogConf.host = process.env.LOGACIOUS_SYSLOG_HOSTNAME
  }
  if(process.env.LOGACIOUS_SYSLOG_PORT) {
    syslogConf.port = process.env.LOGACIOUS_SYSLOG_PORT
  }
  if(process.env.LOGACIOUS_SYSLOG_TRANSPORT) {
    syslogConf.transport = process.env.LOGACIOUS_SYSLOG_TRANSPORT.toUpperCase()
  }
  logger = new SysLogger()
  logger.log = logger.log.bind(logger)
  logger.info = logger.info.bind(logger)
  logger.warn = logger.warn.bind(logger)
  logger.error = logger.error.bind(logger)
}


const debug = wrapWithMetadata('DEBUG', logger.log)
const info = wrapWithMetadata('INFO', logger.info)
const warn = wrapWithMetadata('WARN', logger.warn)
const error = wrapWithMetadata('ERROR', logger.error)


module.exports = () => ({
  name: 'global',
  debug,
  info,
  warn,
  error
})
/* $lab:coverage:on$ */

