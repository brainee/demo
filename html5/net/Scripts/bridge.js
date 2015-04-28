var LizardGetModels, LizardRender, Lizard;
; (function () {
    /*
    添加undersore的依赖
    */
    // Underscore.js 1.4.4
    // ===================
    var underscore = {}; (function (root) { var previousUnderscore = root._; var breaker = {}; var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype; var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty; var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind; var _ = function (obj) { if (obj instanceof _) return obj; if (!(this instanceof _)) return new _(obj); this._wrapped = obj }; root._ = _; _.VERSION = '1.4.4'; var each = _.each = _.forEach = function (obj, iterator, context) { if (obj == null) return; if (nativeForEach && obj.forEach === nativeForEach) { obj.forEach(iterator, context) } else if (obj.length === +obj.length) { for (var i = 0, l = obj.length; i < l; i++) { if (iterator.call(context, obj[i], i, obj) === breaker) return } } else { for (var key in obj) { if (_.has(obj, key)) { if (iterator.call(context, obj[key], key, obj) === breaker) return } } } }; _.map = _.collect = function (obj, iterator, context) { var results = []; if (obj == null) return results; if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context); each(obj, function (value, index, list) { results[results.length] = iterator.call(context, value, index, list) }); return results }; var reduceError = 'Reduce of empty array with no initial value'; _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) { var initial = arguments.length > 2; if (obj == null) obj = []; if (nativeReduce && obj.reduce === nativeReduce) { if (context) iterator = _.bind(iterator, context); return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator) }; each(obj, function (value, index, list) { if (!initial) { memo = value; initial = true } else { memo = iterator.call(context, memo, value, index, list) } }); if (!initial) throw new TypeError(reduceError); return memo }; _.reduceRight = _.foldr = function (obj, iterator, memo, context) { var initial = arguments.length > 2; if (obj == null) obj = []; if (nativeReduceRight && obj.reduceRight === nativeReduceRight) { if (context) iterator = _.bind(iterator, context); return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator) }; var length = obj.length; if (length !== +length) { var keys = _.keys(obj); length = keys.length }; each(obj, function (value, index, list) { index = keys ? keys[--length] : --length; if (!initial) { memo = obj[index]; initial = true } else { memo = iterator.call(context, memo, obj[index], index, list) } }); if (!initial) throw new TypeError(reduceError); return memo }; _.find = _.detect = function (obj, iterator, context) { var result; any(obj, function (value, index, list) { if (iterator.call(context, value, index, list)) { result = value; return true } }); return result }; _.filter = _.select = function (obj, iterator, context) { var results = []; if (obj == null) return results; if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context); each(obj, function (value, index, list) { if (iterator.call(context, value, index, list)) results[results.length] = value }); return results }; _.reject = function (obj, iterator, context) { return _.filter(obj, function (value, index, list) { return !iterator.call(context, value, index, list) }, context) }; _.every = _.all = function (obj, iterator, context) { iterator || (iterator = _.identity); var result = true; if (obj == null) return result; if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context); each(obj, function (value, index, list) { if (!(result = result && iterator.call(context, value, index, list))) return breaker }); return !!result }; var any = _.some = _.any = function (obj, iterator, context) { iterator || (iterator = _.identity); var result = false; if (obj == null) return result; if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context); each(obj, function (value, index, list) { if (result || (result = iterator.call(context, value, index, list))) return breaker }); return !!result }; _.contains = _.include = function (obj, target) { if (obj == null) return false; if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1; return any(obj, function (value) { return value === target }) }; _.invoke = function (obj, method) { var args = slice.call(arguments, 2); var isFunc = _.isFunction(method); return _.map(obj, function (value) { return (isFunc ? method : value[method]).apply(value, args) }) }; _.pluck = function (obj, key) { return _.map(obj, function (value) { return value[key] }) }; _.where = function (obj, attrs, first) { if (_.isEmpty(attrs)) return first ? null : []; return _[first ? 'find' : 'filter'](obj, function (value) { for (var key in attrs) { if (attrs[key] !== value[key]) return false }; return true }) }; _.findWhere = function (obj, attrs) { return _.where(obj, attrs, true) }; _.max = function (obj, iterator, context) { if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) { return Math.max.apply(Math, obj) }; if (!iterator && _.isEmpty(obj)) return -Infinity; var result = { computed: -Infinity, value: -Infinity }; each(obj, function (value, index, list) { var computed = iterator ? iterator.call(context, value, index, list) : value; computed >= result.computed && (result = { value: value, computed: computed }) }); return result.value }; _.min = function (obj, iterator, context) { if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) { return Math.min.apply(Math, obj) }; if (!iterator && _.isEmpty(obj)) return Infinity; var result = { computed: Infinity, value: Infinity }; each(obj, function (value, index, list) { var computed = iterator ? iterator.call(context, value, index, list) : value; computed < result.computed && (result = { value: value, computed: computed }) }); return result.value }; _.shuffle = function (obj) { var rand; var index = 0; var shuffled = []; each(obj, function (value) { rand = _.random(index++); shuffled[index - 1] = shuffled[rand]; shuffled[rand] = value }); return shuffled }; var lookupIterator = function (value) { return _.isFunction(value) ? value : function (obj) { return obj[value] } }; _.sortBy = function (obj, value, context) { var iterator = lookupIterator(value); return _.pluck(_.map(obj, function (value, index, list) { return { value: value, index: index, criteria: iterator.call(context, value, index, list)} }).sort(function (left, right) { var a = left.criteria; var b = right.criteria; if (a !== b) { if (a > b || a === void 0) return 1; if (a < b || b === void 0) return -1 }; return left.index < right.index ? -1 : 1 }), 'value') }; var group = function (obj, value, context, behavior) { var result = {}; var iterator = lookupIterator(value || _.identity); each(obj, function (value, index) { var key = iterator.call(context, value, index, obj); behavior(result, key, value) }); return result }; _.groupBy = function (obj, value, context) { return group(obj, value, context, function (result, key, value) { (_.has(result, key) ? result[key] : (result[key] = [])).push(value) }) }; _.countBy = function (obj, value, context) { return group(obj, value, context, function (result, key) { if (!_.has(result, key)) result[key] = 0; result[key]++ }) }; _.sortedIndex = function (array, obj, iterator, context) { iterator = iterator == null ? _.identity : lookupIterator(iterator); var value = iterator.call(context, obj); var low = 0, high = array.length; while (low < high) { var mid = (low + high) >>> 1; iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid }; return low }; _.toArray = function (obj) { if (!obj) return []; if (_.isArray(obj)) return slice.call(obj); if (obj.length === +obj.length) return _.map(obj, _.identity); return _.values(obj) }; _.size = function (obj) { if (obj == null) return 0; return (obj.length === +obj.length) ? obj.length : _.keys(obj).length }; _.first = _.head = _.take = function (array, n, guard) { if (array == null) return void 0; return (n != null) && !guard ? slice.call(array, 0, n) : array[0] }; _.initial = function (array, n, guard) { return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n)) }; _.last = function (array, n, guard) { if (array == null) return void 0; if ((n != null) && !guard) { return slice.call(array, Math.max(array.length - n, 0)) } else { return array[array.length - 1] } }; _.rest = _.tail = _.drop = function (array, n, guard) { return slice.call(array, (n == null) || guard ? 1 : n) }; _.compact = function (array) { return _.filter(array, _.identity) }; var flatten = function (input, shallow, output) { each(input, function (value) { if (_.isArray(value)) { shallow ? push.apply(output, value) : flatten(value, shallow, output) } else { output.push(value) } }); return output }; _.flatten = function (array, shallow) { return flatten(array, shallow, []) }; _.without = function (array) { return _.difference(array, slice.call(arguments, 1)) }; _.uniq = _.unique = function (array, isSorted, iterator, context) { if (_.isFunction(isSorted)) { context = iterator; iterator = isSorted; isSorted = false }; var initial = iterator ? _.map(array, iterator, context) : array; var results = []; var seen = []; each(initial, function (value, index) { if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) { seen.push(value); results.push(array[index]) } }); return results }; _.union = function () { return _.uniq(concat.apply(ArrayProto, arguments)) }; _.intersection = function (array) { var rest = slice.call(arguments, 1); return _.filter(_.uniq(array), function (item) { return _.every(rest, function (other) { return _.indexOf(other, item) >= 0 }) }) }; _.difference = function (array) { var rest = concat.apply(ArrayProto, slice.call(arguments, 1)); return _.filter(array, function (value) { return !_.contains(rest, value) }) }; _.zip = function () { var args = slice.call(arguments); var length = _.max(_.pluck(args, 'length')); var results = new Array(length); for (var i = 0; i < length; i++) { results[i] = _.pluck(args, "" + i) }; return results }; _.object = function (list, values) { if (list == null) return {}; var result = {}; for (var i = 0, l = list.length; i < l; i++) { if (values) { result[list[i]] = values[i] } else { result[list[i][0]] = list[i][1] } }; return result }; _.indexOf = function (array, item, isSorted) { if (array == null) return -1; var i = 0, l = array.length; if (isSorted) { if (typeof isSorted == 'number') { i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted) } else { i = _.sortedIndex(array, item); return array[i] === item ? i : -1 } }; if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted); for (; i < l; i++) if (array[i] === item) return i; return -1 }; _.lastIndexOf = function (array, item, from) { if (array == null) return -1; var hasIndex = from != null; if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) { return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item) }; var i = (hasIndex ? from : array.length); while (i--) if (array[i] === item) return i; return -1 }; _.range = function (start, stop, step) { if (arguments.length <= 1) { stop = start || 0; start = 0 }; step = arguments[2] || 1; var len = Math.max(Math.ceil((stop - start) / step), 0); var idx = 0; var range = new Array(len); while (idx < len) { range[idx++] = start; start += step }; return range }; _.bind = function (func, context) { if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1)); var args = slice.call(arguments, 2); return function () { return func.apply(context, args.concat(slice.call(arguments))) } }; _.partial = function (func) { var args = slice.call(arguments, 1); return function () { return func.apply(this, args.concat(slice.call(arguments))) } }; _.bindAll = function (obj) { var funcs = slice.call(arguments, 1); if (funcs.length === 0) funcs = _.functions(obj); each(funcs, function (f) { obj[f] = _.bind(obj[f], obj) }); return obj }; _.memoize = function (func, hasher) { var memo = {}; hasher || (hasher = _.identity); return function () { var key = hasher.apply(this, arguments); return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments)) } }; _.delay = function (func, wait) { var args = slice.call(arguments, 2); return setTimeout(function () { return func.apply(null, args) }, wait) }; _.defer = function (func) { return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1))) }; _.throttle = function (func, wait) { var context, args, timeout, result; var previous = 0; var later = function () { previous = new Date; timeout = null; result = func.apply(context, args) }; return function () { var now = new Date; var remaining = wait - (now - previous); context = this; args = arguments; if (remaining <= 0) { clearTimeout(timeout); timeout = null; previous = now; result = func.apply(context, args) } else if (!timeout) { timeout = setTimeout(later, remaining) }; return result } }; _.debounce = function (func, wait, immediate) { var timeout, result; return function () { var context = this, args = arguments; var later = function () { timeout = null; if (!immediate) result = func.apply(context, args) }; var callNow = immediate && !timeout; clearTimeout(timeout); timeout = setTimeout(later, wait); if (callNow) result = func.apply(context, args); return result } }; _.once = function (func) { var ran = false, memo; return function () { if (ran) return memo; ran = true; memo = func.apply(this, arguments); func = null; return memo } }; _.wrap = function (func, wrapper) { return function () { var args = [func]; push.apply(args, arguments); return wrapper.apply(this, args) } }; _.compose = function () { var funcs = arguments; return function () { var args = arguments; for (var i = funcs.length - 1; i >= 0; i--) { args = [funcs[i].apply(this, args)] }; return args[0] } }; _.after = function (times, func) { if (times <= 0) return func(); return function () { if (--times < 1) { return func.apply(this, arguments) } } }; _.keys = nativeKeys || function (obj) { if (obj !== Object(obj)) throw new TypeError('Invalid object'); var keys = []; for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key; return keys }; _.values = function (obj) { var values = []; for (var key in obj) if (_.has(obj, key)) values.push(obj[key]); return values }; _.pairs = function (obj) { var pairs = []; for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]); return pairs }; _.invert = function (obj) { var result = {}; for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key; return result }; _.functions = _.methods = function (obj) { var names = []; for (var key in obj) { if (_.isFunction(obj[key])) names.push(key) }; return names.sort() }; _.extend = function (obj) { each(slice.call(arguments, 1), function (source) { if (source) { for (var prop in source) { obj[prop] = source[prop] } } }); return obj }; _.pick = function (obj) { var copy = {}; var keys = concat.apply(ArrayProto, slice.call(arguments, 1)); each(keys, function (key) { if (key in obj) copy[key] = obj[key] }); return copy }; _.omit = function (obj) { var copy = {}; var keys = concat.apply(ArrayProto, slice.call(arguments, 1)); for (var key in obj) { if (!_.contains(keys, key)) copy[key] = obj[key] }; return copy }; _.defaults = function (obj) { each(slice.call(arguments, 1), function (source) { if (source) { for (var prop in source) { if (obj[prop] == null) obj[prop] = source[prop] } } }); return obj }; _.clone = function (obj) { if (!_.isObject(obj)) return obj; return _.isArray(obj) ? obj.slice() : _.extend({}, obj) }; _.tap = function (obj, interceptor) { interceptor(obj); return obj }; var eq = function (a, b, aStack, bStack) { if (a === b) return a !== 0 || 1 / a == 1 / b; if (a == null || b == null) return a === b; if (a instanceof _) a = a._wrapped; if (b instanceof _) b = b._wrapped; var className = toString.call(a); if (className != toString.call(b)) return false; switch (className) { case '[object String]': return a == String(b); case '[object Number]': return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b); case '[object Date]': case '[object Boolean]': return +a == +b; case '[object RegExp]': return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase }; if (typeof a != 'object' || typeof b != 'object') return false; var length = aStack.length; while (length--) { if (aStack[length] == a) return bStack[length] == b }; aStack.push(a); bStack.push(b); var size = 0, result = true; if (className == '[object Array]') { size = a.length; result = size == b.length; if (result) { while (size--) { if (!(result = eq(a[size], b[size], aStack, bStack))) break } } } else { var aCtor = a.constructor, bCtor = b.constructor; if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) && _.isFunction(bCtor) && (bCtor instanceof bCtor))) { return false }; for (var key in a) { if (_.has(a, key)) { size++; if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break } }; if (result) { for (key in b) { if (_.has(b, key) && !(size--)) break }; result = !size } }; aStack.pop(); bStack.pop(); return result }; _.isEqual = function (a, b) { return eq(a, b, [], []) }; _.isEmpty = function (obj) { if (obj == null) return true; if (_.isArray(obj) || _.isString(obj)) return obj.length === 0; for (var key in obj) if (_.has(obj, key)) return false; return true }; _.isElement = function (obj) { return !!(obj && obj.nodeType === 1) }; _.isArray = nativeIsArray || function (obj) { return toString.call(obj) == '[object Array]' }; _.isObject = function (obj) { return obj === Object(obj) }; each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) { _['is' + name] = function (obj) { return toString.call(obj) == '[object ' + name + ']' } }); if (!_.isArguments(arguments)) { _.isArguments = function (obj) { return !!(obj && _.has(obj, 'callee')) } }; if (typeof (/./) !== 'function') { _.isFunction = function (obj) { return typeof obj === 'function' } }; _.isFinite = function (obj) { return isFinite(obj) && !isNaN(parseFloat(obj)) }; _.isNaN = function (obj) { return _.isNumber(obj) && obj != +obj }; _.isBoolean = function (obj) { return obj === true || obj === false || toString.call(obj) == '[object Boolean]' }; _.isNull = function (obj) { return obj === null }; _.isUndefined = function (obj) { return obj === void 0 }; _.has = function (obj, key) { return hasOwnProperty.call(obj, key) }; _.noConflict = function () { root._ = previousUnderscore; return this }; _.identity = function (value) { return value }; _.times = function (n, iterator, context) { var accum = Array(n); for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i); return accum }; _.random = function (min, max) { if (max == null) { max = min; min = 0 }; return min + Math.floor(Math.random() * (max - min + 1)) }; var entityMap = { escape: { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;'} }; entityMap.unescape = _.invert(entityMap.escape); var entityRegexes = { escape: new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'), unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g') }; _.each(['escape', 'unescape'], function (method) { _[method] = function (string) { if (string == null) return ''; return ('' + string).replace(entityRegexes[method], function (match) { return entityMap[method][match] }) } }); _.result = function (object, property) { if (object == null) return null; var value = object[property]; return _.isFunction(value) ? value.call(object) : value }; _.mixin = function (obj) { each(_.functions(obj), function (name) { var func = _[name] = obj[name]; _.prototype[name] = function () { var args = [this._wrapped]; push.apply(args, arguments); return result.call(this, func.apply(_, args)) } }) }; var idCounter = 0; _.uniqueId = function (prefix) { var id = ++idCounter + ''; return prefix ? prefix + id : id }; _.templateSettings = { evaluate: /<%([\s\S]+?)%>/g, interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g }; var noMatch = /(.)^/; var escapes = { "'": "'", '\\': '\\', '\r': 'r', '\n': 'n', '\t': 't', '\u2028': 'u2028', '\u2029': 'u2029' }; var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g; _.template = function (text, data, settings) { var render; settings = _.defaults({}, settings, _.templateSettings); var matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g'); var index = 0; var source = "__p+='"; text.replace(matcher, function (match, escape, interpolate, evaluate, offset) { source += text.slice(index, offset).replace(escaper, function (match) { return '\\' + escapes[match] }); if (escape) { source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'" }; if (interpolate) { source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'" }; if (evaluate) { source += "';\n" + evaluate + "\n__p+='" }; index = offset + match.length; return match }); source += "';\n"; if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n'; source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n"; try { render = new Function(settings.variable || 'obj', '_', source) } catch (e) { e.source = source; throw e }; if (data) return render(data, _); var template = function (data) { return render.call(this, data, _) }; template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}'; return template }; _.chain = function (obj) { return _(obj).chain() }; var result = function (obj) { return this._chain ? _(obj).chain() : obj }; _.mixin(_); each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) { var method = ArrayProto[name]; _.prototype[name] = function () { var obj = this._wrapped; method.apply(obj, arguments); if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0]; return result.call(this, obj) } }); each(['concat', 'join', 'slice'], function (name) { var method = ArrayProto[name]; _.prototype[name] = function () { return result.call(this, method.apply(this._wrapped, arguments)) } }); _.extend(_.prototype, { chain: function () { this._chain = true; return this }, value: function () { return this._wrapped } }) })(underscore);

    /*
    添加htmlparse的依赖
    */
    var Tautologistics = { NodeHtmlParser: {} }; (function (exports) { function inherits(ctor, superCtor) { var tempCtor = function () { }; tempCtor.prototype = superCtor.prototype; ctor.super_ = superCtor; ctor.prototype = new tempCtor(); ctor.prototype.constructor = ctor }; var Mode = { Text: 'text', Tag: 'tag', Attr: 'attr', CData: 'cdata', Doctype: 'doctype', Comment: 'comment' }; function Parser(builder, options) { this._options = options ? options : {}; this._validateBuilder(builder); var self = this; this._builder = builder; this.reset() }; if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') { var Stream = require('stream'); inherits(Parser, Stream); Parser.prototype.writable = true; Parser.prototype.write = function (data) { if (data instanceof Buffer) { data = data.toString() }; this.parseChunk(data) }; Parser.prototype.end = function (data) { if (arguments.length) { this.write(data) }; this.writable = false; this.done() }; Parser.prototype.destroy = function () { this.writable = false } }; Parser.prototype.reset = function Parser$reset() { this._state = { mode: Mode.Text, pos: 0, data: null, pendingText: null, pendingWrite: null, lastTag: null, isScript: false, needData: false, output: [], done: false }; this._builder.reset() }; Parser.prototype.parseChunk = function Parser$parseChunk(chunk) { this._state.needData = false; this._state.data = (this._state.data !== null) ? this._state.data.substr(this.pos) + chunk : chunk; while (this._state.pos < this._state.data.length && !this._state.needData) { this._parse(this._state) } }; Parser.prototype.parseComplete = function Parser$parseComplete(data) { this.reset(); this.parseChunk(data); this.done() }; Parser.prototype.done = function Parser$done() { this._state.done = true; this._parse(this._state); this._flushWrite(); this._builder.done() }; Parser.prototype._validateBuilder = function Parser$_validateBuilder(builder) { if ((typeof builder) != "object") { throw new Error("Builder is not an object") }; if ((typeof builder.reset) != "function") { throw new Error("Builder method 'reset' is invalid") }; if ((typeof builder.done) != "function") { throw new Error("Builder method 'done' is invalid") }; if ((typeof builder.write) != "function") { throw new Error("Builder method 'write' is invalid") }; if ((typeof builder.error) != "function") { throw new Error("Builder method 'error' is invalid") } }; Parser.prototype._parse = function Parser$_parse() { switch (this._state.mode) { case Mode.Text: return this._parseText(this._state); case Mode.Tag: return this._parseTag(this._state); case Mode.Attr: return this._parseAttr(this._state); case Mode.CData: return this._parseCData(this._state); case Mode.Doctype: return this._parseDoctype(this._state); case Mode.Comment: return this._parseComment(this._state) } }; Parser.prototype._writePending = function Parser$_writePending(node) { if (!this._state.pendingWrite) { this._state.pendingWrite = [] }; this._state.pendingWrite.push(node) }; Parser.prototype._flushWrite = function Parser$_flushWrite() { if (this._state.pendingWrite) { for (var i = 0, len = this._state.pendingWrite.length; i < len; i++) { var node = this._state.pendingWrite[i]; this._builder.write(node) }; this._state.pendingWrite = null } }; Parser.prototype._write = function Parser$_write(node) { this._flushWrite(); this._builder.write(node) }; Parser._re_parseText_scriptClose = /<\s*\/\s*script/ig; Parser.prototype._parseText = function Parser$_parseText() { var state = this._state; var foundPos; if (state.isScript) { Parser._re_parseText_scriptClose.lastIndex = state.pos; foundPos = Parser._re_parseText_scriptClose.exec(state.data); foundPos = (foundPos) ? foundPos.index : -1 } else { foundPos = state.data.indexOf('<', state.pos) }; var text = (foundPos === -1) ? state.data.substring(state.pos, state.data.length) : state.data.substring(state.pos, foundPos); if (foundPos < 0 && state.done) { foundPos = state.data.length }; if (foundPos < 0) { if (state.isScript) { state.needData = true; return }; if (!state.pendingText) { state.pendingText = [] }; state.pendingText.push(state.data.substring(state.pos, state.data.length)); state.pos = state.data.length } else { if (state.pendingText) { state.pendingText.push(state.data.substring(state.pos, foundPos)); text = state.pendingText.join(''); state.pendingText = null } else { text = state.data.substring(state.pos, foundPos) }; if (text !== '') { this._write({ type: Mode.Text, data: text }) }; state.pos = foundPos + 1; state.mode = Mode.Tag } }; Parser.re_parseTag = /\s*(\/?)\s*([^\s>\/]+)(\s*)\??(>?)/g; Parser.prototype._parseTag = function Parser$_parseTag() { var state = this._state; Parser.re_parseTag.lastIndex = state.pos; var match = Parser.re_parseTag.exec(state.data); if (match) { if (!match[1] && match[2].substr(0, 3) === '!--') { state.mode = Mode.Comment; state.pos += 3; return }; if (!match[1] && match[2].substr(0, 8) === '![CDATA[') { state.mode = Mode.CData; state.pos += 8; return }; if (!match[1] && match[2].substr(0, 8) === '!DOCTYPE') { state.mode = Mode.Doctype; state.pos += 8; return }; if (!state.done && (state.pos + match[0].length) === state.data.length) { state.needData = true; return }; var raw; if (match[4] === '>') { state.mode = Mode.Text; raw = match[0].substr(0, match[0].length - 1) } else { state.mode = Mode.Attr; raw = match[0] }; state.pos += match[0].length; var tag = { type: Mode.Tag, name: match[1] + match[2], raw: raw }; if (state.mode === Mode.Attr) { state.lastTag = tag }; if (tag.name.toLowerCase() === 'script') { state.isScript = true } else if (tag.name.toLowerCase() === '/script') { state.isScript = false }; if (state.mode === Mode.Attr) { this._writePending(tag) } else { this._write(tag) } } else { state.needData = true } }; Parser.re_parseAttr_findName = /\s*([^=<>\s'"\/]+)\s*/g; Parser.prototype._parseAttr_findName = function Parser$_parseAttr_findName() { Parser.re_parseAttr_findName.lastIndex = this._state.pos; var match = Parser.re_parseAttr_findName.exec(this._state.data); if (!match) { return null }; if (this._state.pos + match[0].length !== Parser.re_parseAttr_findName.lastIndex) { return null }; return { match: match[0], name: match[1]} }; Parser.re_parseAttr_findValue = /\s*=\s*(?:'([^']*)'|"([^"]*)"|([^'"\s\/>]+))\s*/g; Parser.re_parseAttr_findValue_last = /\s*=\s*['"]?(.*)$/g; Parser.prototype._parseAttr_findValue = function Parser$_parseAttr_findValue() { var state = this._state; Parser.re_parseAttr_findValue.lastIndex = state.pos; var match = Parser.re_parseAttr_findValue.exec(state.data); if (!match) { if (!state.done) { return null }; Parser.re_parseAttr_findValue_last.lastIndex = state.pos; match = Parser.re_parseAttr_findValue_last.exec(state.data); if (!match) { return null }; return { match: match[0], value: (match[1] !== '') ? match[1] : null} }; if (state.pos + match[0].length !== Parser.re_parseAttr_findValue.lastIndex) { return null }; return { match: match[0], value: match[1] || match[2] || match[3]} }; Parser.re_parseAttr_splitValue = /\s*=\s*['"]?/g; Parser.re_parseAttr_selfClose = /(\s*\/\s*)(>?)/g; Parser.prototype._parseAttr = function Parser$_parseAttr() { var state = this._state; var name_data = this._parseAttr_findName(state); if (!name_data || name_data.name === '?') { Parser.re_parseAttr_selfClose.lastIndex = state.pos; var matchTrailingSlash = Parser.re_parseAttr_selfClose.exec(state.data); if (matchTrailingSlash && matchTrailingSlash.index === state.pos) { if (!state.done && !matchTrailingSlash[2] && state.pos + matchTrailingSlash[0].length === state.data.length) { state.needData = true; return }; state.lastTag.raw += matchTrailingSlash[1]; this._write({ type: Mode.Tag, name: '/' + state.lastTag.name, raw: null }); state.pos += matchTrailingSlash[1].length }; var foundPos = state.data.indexOf('>', state.pos); if (foundPos < 0) { if (state.done) { state.lastTag.raw += state.data.substr(state.pos); state.pos = state.data.length; return }; state.needData = true } else { state.pos = foundPos + 1; state.mode = Mode.Text }; return }; if (!state.done && state.pos + name_data.match.length === state.data.length) { state.needData = true; return null }; state.pos += name_data.match.length; var value_data = this._parseAttr_findValue(state); if (value_data) { if (!state.done && state.pos + value_data.match.length === state.data.length) { state.needData = true; state.pos -= name_data.match.length; return }; state.pos += value_data.match.length } else { Parser.re_parseAttr_splitValue.lastIndex = state.pos; if (Parser.re_parseAttr_splitValue.exec(state.data)) { state.needData = true; state.pos -= name_data.match.length; return }; value_data = { match: '', value: null} }; state.lastTag.raw += name_data.match + value_data.match; this._writePending({ type: Mode.Attr, name: name_data.name, data: value_data.value }) }; Parser.re_parseCData_findEnding = /\]{1,2}$/; Parser.prototype._parseCData = function Parser$_parseCData() { var state = this._state; var foundPos = state.data.indexOf(']]>', state.pos); if (foundPos < 0 && state.done) { foundPos = state.data.length }; if (foundPos < 0) { Parser.re_parseCData_findEnding.lastIndex = state.pos; var matchPartialCDataEnd = Parser.re_parseCData_findEnding.exec(state.data); if (matchPartialCDataEnd) { state.needData = true; return }; if (!state.pendingText) { state.pendingText = [] }; state.pendingText.push(state.data.substr(state.pos, state.data.length)); state.pos = state.data.length; state.needData = true } else { var text; if (state.pendingText) { state.pendingText.push(state.data.substring(state.pos, foundPos)); text = state.pendingText.join(''); state.pendingText = null } else { text = state.data.substring(state.pos, foundPos) }; this._write({ type: Mode.CData, data: text }); state.mode = Mode.Text; state.pos = foundPos + 3 } }; Parser.prototype._parseDoctype = function Parser$_parseDoctype() { var state = this._state; var foundPos = state.data.indexOf('>', state.pos); if (foundPos < 0 && state.done) { foundPos = state.data.length }; if (foundPos < 0) { Parser.re_parseCData_findEnding.lastIndex = state.pos; if (!state.pendingText) { state.pendingText = [] }; state.pendingText.push(state.data.substr(state.pos, state.data.length)); state.pos = state.data.length; state.needData = true } else { var text; if (state.pendingText) { state.pendingText.push(state.data.substring(state.pos, foundPos)); text = state.pendingText.join(''); state.pendingText = null } else { text = state.data.substring(state.pos, foundPos) }; this._write({ type: Mode.Doctype, data: text }); state.mode = Mode.Text; state.pos = foundPos + 1 } }; Parser.re_parseComment_findEnding = /\-{1,2}$/; Parser.prototype._parseComment = function Parser$_parseComment() { var state = this._state; var foundPos = state.data.indexOf('-->', state.pos); if (foundPos < 0 && state.done) { foundPos = state.data.length }; if (foundPos < 0) { Parser.re_parseComment_findEnding.lastIndex = state.pos; var matchPartialCommentEnd = Parser.re_parseComment_findEnding.exec(state.data); if (matchPartialCommentEnd) { state.needData = true; return }; if (!state.pendingText) { state.pendingText = [] }; state.pendingText.push(state.data.substr(state.pos, state.data.length)); state.pos = state.data.length; state.needData = true } else { var text; if (state.pendingText) { state.pendingText.push(state.data.substring(state.pos, foundPos)); text = state.pendingText.join(''); state.pendingText = null } else { text = state.data.substring(state.pos, foundPos) }; this._write({ type: Mode.Comment, data: text }); state.mode = Mode.Text; state.pos = foundPos + 3 } }; function HtmlBuilder(callback, options) { this.reset(); this._options = options ? options : {}; if (this._options.ignoreWhitespace === undefined) { this._options.ignoreWhitespace = false; }; if (this._options.includeLocation === undefined) { this._options.includeLocation = false; }; if (this._options.verbose === undefined) { this._options.verbose = true; }; if (this._options.enforceEmptyTags === undefined) { this._options.enforceEmptyTags = true; }; if (this._options.caseSensitiveTags === undefined) { this._options.caseSensitiveTags = false; }; if (this._options.caseSensitiveAttr === undefined) { this._options.caseSensitiveAttr = false; }; if ((typeof callback) == "function") { this._callback = callback } }; HtmlBuilder._emptyTags = { area: 1, base: 1, basefont: 1, br: 1, col: 1, frame: 1, hr: 1, img: 1, input: 1, isindex: 1, link: 1, meta: 1, param: 1, embed: 1, '?xml': 1 }; HtmlBuilder.reWhitespace = /^\s*$/; HtmlBuilder.prototype.dom = null; HtmlBuilder.prototype.reset = function HtmlBuilder$reset() { this.dom = []; this._done = false; this._tagStack = []; this._lastTag = null; this._tagStack.last = function HtmlBuilder$_tagStack$last() { return (this.length ? this[this.length - 1] : null) }; this._line = 1; this._col = 1 }; HtmlBuilder.prototype.done = function HtmlBuilder$done() { this._done = true; this.handleCallback(null) }; HtmlBuilder.prototype.error = function HtmlBuilder$error(error) { this.handleCallback(error) }; HtmlBuilder.prototype.handleCallback = function HtmlBuilder$handleCallback(error) { if ((typeof this._callback) != "function") { if (error) { throw error } else { return } }; this._callback(error, this.dom) }; HtmlBuilder.prototype.isEmptyTag = function HtmlBuilder$isEmptyTag(element) { var name = element.name.toLowerCase(); if (name.charAt(0) == '?') { return true }; if (name.charAt(0) == '/') { name = name.substring(1) }; return this._options.enforceEmptyTags && !!HtmlBuilder._emptyTags[name] }; HtmlBuilder.prototype._getLocation = function HtmlBuilder$_getLocation() { return { line: this._line, col: this._col} }; HtmlBuilder.prototype._updateLocation = function HtmlBuilder$_updateLocation(node) { var positionData = (node.type === Mode.Tag) ? node.raw : node.data; if (positionData === null) { return }; var lines = positionData.split("\n"); this._line += lines.length - 1; if (lines.length > 1) { this._col = 1 }; this._col += lines[lines.length - 1].length; if (node.type === Mode.Tag) { this._col += 2 } else if (node.type === Mode.Comment) { this._col += 7 } else if (node.type === Mode.CData) { this._col += 12 } }; HtmlBuilder.prototype._copyElement = function HtmlBuilder$_copyElement(element) { var newElement = { type: element.type }; if (this._options.verbose && element['raw'] !== undefined) { newElement.raw = element.raw }; if (element['name'] !== undefined) { switch (element.type) { case Mode.Tag: newElement.name = this._options.caseSensitiveTags ? element.name : element.name.toLowerCase(); break; case Mode.Attr: newElement.name = this._options.caseSensitiveAttr ? element.name : element.name.toLowerCase(); break; default: newElement.name = this._options.caseSensitiveTags ? element.name : element.name.toLowerCase(); break } }; if (element['data'] !== undefined) { newElement.data = element.data }; if (element.location) { newElement.location = { line: element.location.line, col: element.location.col} }; return newElement }; HtmlBuilder.prototype.write = function HtmlBuilder$write(element) { if (this._done) { this.handleCallback(new Error("Writing to the builder after done() called is not allowed without a reset()")) }; if (this._options.includeLocation) { if (element.type !== Mode.Attr) { element.location = this._getLocation(); this._updateLocation(element) } }; if (element.type === Mode.Text && this._options.ignoreWhitespace) { if (HtmlBuilder.reWhitespace.test(element.data)) { return } }; var parent; var node; if (!this._tagStack.last()) { if (element.type === Mode.Tag) { if (element.name.charAt(0) != "/") { node = this._copyElement(element); this.dom.push(node); if (!this.isEmptyTag(node)) { this._tagStack.push(node) }; this._lastTag = node } } else if (element.type === Mode.Attr && this._lastTag) { if (!this._lastTag.attributes) { this._lastTag.attributes = {} }; this._lastTag.attributes[this._options.caseSensitiveAttr ? element.name : element.name.toLowerCase()] = element.data } else { this.dom.push(this._copyElement(element)) } } else { if (element.type === Mode.Tag) { if (element.name.charAt(0) == "/") { var baseName = this._options.caseSensitiveTags ? element.name.substring(1) : element.name.substring(1).toLowerCase(); if (!this.isEmptyTag(element)) { var pos = this._tagStack.length - 1; while (pos > -1 && this._tagStack[pos--].name != baseName) { }; if (pos > -1 || this._tagStack[0].name == baseName) { while (pos < this._tagStack.length - 1) { this._tagStack.pop() } } } } else { parent = this._tagStack.last(); if (element.type === Mode.Attr) { if (!parent.attributes) { parent.attributes = {} }; parent.attributes[this._options.caseSensitiveAttr ? element.name : element.name.toLowerCase()] = element.data } else { node = this._copyElement(element); if (!parent.children) { parent.children = [] }; parent.children.push(node); if (!this.isEmptyTag(node)) { this._tagStack.push(node) }; if (element.type === Mode.Tag) { this._lastTag = node } } } } else { parent = this._tagStack.last(); if (element.type === Mode.Attr) { if (!parent.attributes) { parent.attributes = {} }; parent.attributes[this._options.caseSensitiveAttr ? element.name : element.name.toLowerCase()] = element.data } else { if (!parent.children) { parent.children = [] }; parent.children.push(this._copyElement(element)) } } } }; HtmlBuilder.prototype._options = null; HtmlBuilder.prototype._callback = null; HtmlBuilder.prototype._done = false; HtmlBuilder.prototype._tagStack = null; function RssBuilder(callback) { RssBuilder.super_.call(this, callback, { ignoreWhitespace: true, verbose: false, enforceEmptyTags: false, caseSensitiveTags: true }) }; inherits(RssBuilder, HtmlBuilder); RssBuilder.prototype.done = function RssBuilder$done() { var feed = {}; var feedRoot; var found = DomUtils.getElementsByTagName(function (value) { return (value == "rss" || value == "feed") }, this.dom, false); if (found.length) { feedRoot = found[0] }; if (feedRoot) { if (feedRoot.name == "rss") { feed.type = "rss"; feedRoot = feedRoot.children[0]; feed.id = ""; try { feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.description = DomUtils.getElementsByTagName("description", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.updated = new Date(DomUtils.getElementsByTagName("lastBuildDate", feedRoot.children, false)[0].children[0].data) } catch (ex) { }; try { feed.author = DomUtils.getElementsByTagName("managingEditor", feedRoot.children, false)[0].children[0].data } catch (ex) { }; feed.items = []; DomUtils.getElementsByTagName("item", feedRoot.children).forEach(function (item, index, list) { var entry = {}; try { entry.id = DomUtils.getElementsByTagName("guid", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.description = DomUtils.getElementsByTagName("description", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.pubDate = new Date(DomUtils.getElementsByTagName("pubDate", item.children, false)[0].children[0].data) } catch (ex) { }; feed.items.push(entry) }) } else { feed.type = "atom"; try { feed.id = DomUtils.getElementsByTagName("id", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].attributes.href } catch (ex) { }; try { feed.description = DomUtils.getElementsByTagName("subtitle", feedRoot.children, false)[0].children[0].data } catch (ex) { }; try { feed.updated = new Date(DomUtils.getElementsByTagName("updated", feedRoot.children, false)[0].children[0].data) } catch (ex) { }; try { feed.author = DomUtils.getElementsByTagName("email", feedRoot.children, true)[0].children[0].data } catch (ex) { }; feed.items = []; DomUtils.getElementsByTagName("entry", feedRoot.children).forEach(function (item, index, list) { var entry = {}; try { entry.id = DomUtils.getElementsByTagName("id", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].attributes.href } catch (ex) { }; try { entry.description = DomUtils.getElementsByTagName("summary", item.children, false)[0].children[0].data } catch (ex) { }; try { entry.pubDate = new Date(DomUtils.getElementsByTagName("updated", item.children, false)[0].children[0].data) } catch (ex) { }; feed.items.push(entry) }) }; this.dom = feed }; RssBuilder.super_.prototype.done.call(this) }; var DomUtils = { testElement: function DomUtils$testElement(options, element) { if (!element) { return false }; for (var key in options) { if (!options.hasOwnProperty(key)) { continue }; if (key == "tag_name") { if (element.type !== Mode.Tag) { return false }; if (!options["tag_name"](element.name)) { return false } } else if (key == "tag_type") { if (!options["tag_type"](element.type)) { return false } } else if (key == "tag_contains") { if (element.type !== Mode.Text && element.type !== Mode.Comment && element.type !== Mode.CData) { return false }; if (!options["tag_contains"](element.data)) { return false } } else { if (!element.attributes || !options[key](element.attributes[key])) { return false } } }; return true }, getElements: function DomUtils$getElements(options, currentElement, recurse, limit) { recurse = (recurse === undefined || recurse === null) || !!recurse; limit = isNaN(parseInt(limit)) ? -1 : parseInt(limit); if (!currentElement) { return ([]) }; var found = []; var elementList; function getTest(checkVal) { return function (value) { return (value == checkVal) } }; for (var key in options) { if ((typeof options[key]) != "function") { options[key] = getTest(options[key]) } }; if (DomUtils.testElement(options, currentElement)) { found.push(currentElement) }; if (limit >= 0 && found.length >= limit) { return (found) }; if (recurse && currentElement.children) { elementList = currentElement.children } else if (currentElement instanceof Array) { elementList = currentElement } else { return (found) }; for (var i = 0; i < elementList.length; i++) { found = found.concat(DomUtils.getElements(options, elementList[i], recurse, limit)); if (limit >= 0 && found.length >= limit) { break } }; return (found) }, getElementById: function DomUtils$getElementById(id, currentElement, recurse) { var result = DomUtils.getElements({ id: id }, currentElement, recurse, 1); return (result.length ? result[0] : null) }, getElementsByTagName: function DomUtils$getElementsByTagName(name, currentElement, recurse, limit) { return (DomUtils.getElements({ tag_name: name }, currentElement, recurse, limit)) }, getElementsByTagType: function DomUtils$getElementsByTagType(type, currentElement, recurse, limit) { return (DomUtils.getElements({ tag_type: type }, currentElement, recurse, limit)) } }; exports.Parser = Parser; exports.HtmlBuilder = HtmlBuilder; exports.RssBuilder = RssBuilder; exports.ElementType = Mode; exports.DomUtils = DomUtils })(Tautologistics.NodeHtmlParser);

    var isServer = false;
    try {
        if (!window) {
            isServer = true;
        } else {
            isServer = false;

        }
    } catch (e) {
        isServer = true;
    }
    var lizard = {};
    String.prototype.replaceWith = String.prototype.replaceWith || function (d) {
        return this.replace(/\{(.+?)\}/g, function (a, c) {
            if (c in d) {
                return d[c];
            } else {
                return a;
            }
        });
    };
    /*
    添加公用方法
    */
    String.prototype.trim = String.prototype.trim || function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
    /*
    获取页面上的urlschema
    */
    function getUrlschema(html) {
        var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function (error, dom) {

        });
        var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
        parser.parseComplete(html);
        var dom = handler.dom;
        var DomUtils = Tautologistics.NodeHtmlParser.DomUtils;

        var scripts = DomUtils.getElementsByTagName("script", dom);

        var nested = DomUtils.getElements({ type: "text/urlschema" }, scripts);
        var urlschema = nested[0].children[0]['data'];
        return urlschema.trim();
    }
    /*
    获取传过来的参数
    */
    function getPageParams(url, urlschema) {
        var urlArr = url.split('/');
        var urlschemaArr = urlschema.split('/');
        var len = urlArr.length;
        var ret = {};
        for (var i = 0; i < len; i++) {
            var item = urlschemaArr[i];
            if (item.indexOf("{") != -1) {
                var key = item.replace("{", "").replace("}", "");
                ret[key.trim()] = urlArr[i]
            }
        }
        return ret;
    }
    /*
    获取模块和model的url
    */
    function getTemplateAndModelUrl(html) {
        var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function (error, dom) {

        });
        var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
        parser.parseComplete(html);
        var dom = handler.dom;
        var DomUtils = Tautologistics.NodeHtmlParser.DomUtils;

        var scripts = DomUtils.getElementsByTagName("script", dom);

        var templates = DomUtils.getElements({ type: "text/template" }, scripts);
        var len = templates.length;
        var ret = [];
        for (var i = 0; i < len; i++) {
            var template = templates[i];

            var data = template.children[0]['data'];
            var data_model = template.attributes['data-model'];
            ret.push({
                text: data.trim(),
                model: data_model.trim()
            })
        }
        return ret;
    }
    /*
    根据urlschema生成整的url
    */
    function convertPageModels(pageModels, params) {
        var ret = {};
        for (var key in pageModels) {
            var template = pageModels[key];
            var text = template.text;
            var id = template.id;
            var url = text.replaceWith(params);
            ret[id] = {}
            ret[id]['text'] = text;
            ret[id]['id'] = id;
            ret[id]['url'] = url;
        }
        return ret;
    }

    /*
    生成渲染的模版
    */
    function getRenderTemplate() {

    }
    function renderToPage(html) {



    }
    /*
    获取页面配置项
    */
    function getPageConfig(DomUtils, scripts) {
        var templates = DomUtils.getElements({ type: "text/config" }, scripts);
        var len = templates.length;
        var ret = [];
        for (var i = 0; i < len; i++) {
            var template = templates[i];
            var data = template.children[0]['data'];
            var text = data.trim();

            ret.push(JSON.parse(text))
        }
        return ret;
    }
    /*

    */
    function getPageCommon(DomUtils, scripts, ids, type) {
        var script = DomUtils.getElements({ type: "text/" + type }, scripts);

        var len = ids.length;
        var ret = {};
        for (var i = 0; i < len; i++) {
            var id = ids[i];
            var templates = DomUtils.getElements({ id: id }, script);


            var template = templates[0];
            var data = template.children[0]['data'];
            var text = data.trim();
            ret[id] = text;
        }
        return ret;
    }
    /*
    获取页面models	
    */
    function getPageModels(DomUtils, scripts, ids) {
        return getPageCommon(DomUtils, scripts, ids, 'model');
    }
    /*
    获取页面filters
    */
    function getPageFilters(DomUtils, scripts, ids) {
        return getPageCommon(DomUtils, scripts, ids, 'filter');
    }
    /*
    获取页面templates
    */
    function getPageTemplates(DomUtils, scripts, ids) {
        return getPageCommon(DomUtils, scripts, ids, 'template');
    }
    function getPageUrlschema(DomUtils, scripts) {

        var templates = DomUtils.getElements({ type: "text/urlschema" }, scripts);
        var template = templates[0];
        var data = template.children[0]['data'];
        var text = data.trim();
        return text;
    }
    function getID(url) {
        var id = url;
        id = id.replace(/\//g, '');
        id = id.replace(/\:/g, '');
        return id;
    }
    /*
    最终的调用方式
    var ins = new Lizard(url,html)
    function Lizard(url,html){
    this.url = url;
    this.html = html;
    this.config = [];
    this.models = [];
    this.filters = [];
    tihs.urlschema = "";
    this.templates = [];
    this._init()
    }
    Lizard.prototype = {
    _init:function(){
	
    },
    getModels:function(){
    var models = [];
    return models;
    },
    render:function(models){

    return html;
    }
    }
		
    var models = inis.getModels();

    inis.render(models)

    */
    function _Lizard(url, html) {
        this.url = url;
        this.html = html;
        this.configs = [];
        this.models = {};
        this.filters = {};
        this.urlschema = "";
        this.templates = {};
        this.params = {};
        /*
        将各自的内容填到congfig中
        */
        this.snapshoot1 = [];
        this._init()
    }
    _Lizard.prototype = {
        _init: function () {
            var url = this.url;
            var html = this.html;
            var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(function (error, dom) {

            });
            var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
            parser.parseComplete(html);
            var dom = handler.dom;
            var DomUtils = Tautologistics.NodeHtmlParser.DomUtils;

            var scripts = DomUtils.getElementsByTagName("script", dom);
            this.urlschema = getPageUrlschema(DomUtils, scripts);
            this.params = getPageParams(this.url, this.urlschema);

            this.configs = getPageConfig(DomUtils, scripts);
            for (var i = 0; i < this.configs.length; i++) {
                var config = this.configs[i];
                for (var j = 0; j < config.length; j++) {
                    var item = config[j];
                    //对空值的处理
                    if (!item.models) item.models = [];
                    if (!item.filters) item.filters = [];
                    if (!item.templates) item.templates = [];

                    var models = item.models;
                    var filters = item.filters;
                    var templates = item.templates;
                    var models_temp = getPageModels(DomUtils, scripts, models)
                    for (var key in models_temp) {
                        this.models[key] = {
                            id: key,
                            text: models_temp[key]
                        }
                    }
                    var filters_temp = getPageFilters(DomUtils, scripts, filters)
                    for (var key in filters_temp) {
                        this.filters[key] = {
                            id: key,
                            text: filters_temp[key]
                        }
                    }
                    var templates_temp = getPageTemplates(DomUtils, scripts, templates)
                    for (var key in templates_temp) {
                        this.templates[key] = {
                            id: key,
                            text: templates_temp[key]
                        }
                    }
                }
            };
            this.models = convertPageModels(this.models, this.params);
            this.handler = handler;
            this.parser = parser;
        },
        getModels: function () {
            var ret = [];
            var models = this.models;
            for (var key in models) {
                ret.push(models[key].url);
            }
            return ret;
        },
        render: function (datas) {
            var html = [];
            var models = this.models;
            var i = 0;
            datas = eval(datas);
            for (var key in models) {
                models[key].data = datas[i++];
            }
            /*
            数据格式[{models:[]}],[{}]
            */
            var configs = this.configs;

            for (var i = 0; i < configs.length; i++) {
                var config = configs[i];
                for (var j = 0; j < config.length; j++) {
                    var task = config[j];
                    var models = task.models;
                    var filters = task.filters;
                    var templates = task.templates;
                    var temp_data = [];
                    for (var j = 0; j < models.length; j++) {
                        var model = models[j];
                        temp_data.push(this.models[model].data);
                    }
                    for (var j = 0; j < filters.length; j++) {
                        var filter = this.filters[filters[j]].text;
                        var fun_body = ('return ' + filter.trim());
                        var fun = new Function(fun_body)();
                        temp_data = fun(temp_data)
                    }
                    var temp_templates = [];
                    for (var j = 0; j < templates.length; j++) {
                        var template = this.templates[templates[j]].text;
                        var compiled = underscore._.template(template);


                        //filter不存在且temp_data只有一个值
                        if (!filters.length && temp_data.length == 1) {
                            temp_templates.push(compiled(temp_data[0]));
                        } else {
                            temp_templates.push(compiled(temp_data));
                        }
                    }
                    html.push(temp_templates)

                }
            }
            var str_html = html.join("").replaceWith(this.params);

            var id = getID(this.url);
            if (isServer) {
                var temp_html = this.html.replace(/(<div id="main">)/gi, function () {
                    return arguments[1] + '<!--instert start--><div id="' + id + '" class="active"><script>window.server=true</script>' + str_html + '</div><!--instert end-->';
                });
                return temp_html;
            } else {
                return '<!--instert start--><div id="' + id + '"  class="active"><script>window.server=true</script>' + str_html + '</div><!--instert end-->';
            }
        },
        _unint: function () {
            this.handler = null;
            this.parser = null;


        }
    }
    Lizard = {};
    Lizard.getModels = function (url, html) {
        var ins = new _Lizard(url, html);
        var models = ins.getModels();
        ins._unint();
        ins = null;
        return JSON.stringify(models);
    }
    Lizard.render = function (url, html, datas) {
        var ins = new _Lizard(url, html);
        var text = ins.render(datas);

        ins._unint();
        ins = null;
        return text;
    }
    //导出对象
    LizardGetModels = Lizard.getModels;
    LizardRender = Lizard.render;



    Lizard.clientInit = function (url, html, cb) {

        function getData(models, cb) {
            var len = models.length;
            var ajax = 0;
            var ret = [];

            for (var i = 0; i < len; i++) {
                var model = models[i];

                $.ajax({ type: 'get', url: model, success: function (data) {
                    ret.push(JSON.parse(data))
                    end()
                } 
                })
            }
            function end() {
                ajax++;
                if (ajax >= len) {
                    cb(ret)
                }
            }
        }

        var models = Lizard.getModels(url, html);

        models = JSON.parse(models);

        getData(models, function (datas) {

            var text = Lizard.render(url, html, datas);

            if (cb) cb(text);
        })
    }
    if ((typeof window != 'undefined') && !window.server) {
        function getPageContent() {
            var html = document.body.innerHTML;
            html = html.replace(/amp;/g, '');
            return html;
        }
        function getPageUrl() {
            var url = window.location.href;
            return url;
        }
        var url = getPageUrl();
        var html = getPageContent();
        Lizard.clientInit(url, html, function (text) {
            document.getElementById('main').innerHTML = text;
        });
    }
})();
var LizardGetModels, LizardRender, Lizard;

if (typeof exports !== 'undefined') {
    exports.Lizard = Lizard;
    exports.LizardGetModels = LizardGetModels;
    exports.LizardRender = LizardRender;
} 