var LizardGetModels, LizardRender, LizardUrlMapping;var Lizard = Lizard||{};(function (){Lizard.runAt = "server";Lizard.renderAt = "server";
/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
;// Underscore.js 1.4.4
// ===================

// > http://underscorejs.org
// > (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
// > Underscore may be freely distributed under the MIT license.

// Baseline setup
// --------------
var _=(function() {

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
          if (a > b || a === void 0) return 1;
          if (a < b || b === void 0) return -1;
        }
        return left.index < right.index ? -1 : 1;
      }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

  // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
        _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(__sandbox||{}){with(obj||{}){\n' + source + '}}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_' , '__sandbox' , source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data){
    var ret='';
    if (typeof vm && vm && vm.eval){
      ret=vm.eval('(function(){'+source+'})()',{
        obj:data,
        _:_,
        __sandbox:__sandbox
      })||'';
    }else{
      ret=render(data, _, __sandbox)||'';
    }
    return ret;
  }
    var template = function(data, __sandbox){
    var ret='';
    if (typeof vm && vm && vm.eval){
      ret=vm.eval('(function(){'+source+'})()',{
        obj:data,
        _:_,
        __sandbox:__sandbox
      })||'';
    }else{
      ret = render(data, _ , __sandbox)||'';
    }
    return ret;
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  return _;
})();
;function htmlNode(parser, parent, tagName, plainText, plainComment) {
  this.parser = parser;
  if (tagName) {
    this._tagName = tagName;
    this._attrs = {};
    this._children = [];
  }
  if (plainText) {
    this._plainText = plainText;
  }
  if (plainComment) {
    this._plainComment = plainComment;
  }
  if (tagName || plainComment) {
    this._htmlStart = -1;
    this._htmlEnd = -1;
    this._ohtmlStart = -1;
    this._ohtmlEnd = -1;
  }
  this._parent = parent;
  if (parent) {
    parent._children.push(this);
  }
}
htmlNode.prototype.children = function () {
  return this._children || null;
};
htmlNode.prototype.parent = function () {
  return this._parent || null;
};
htmlNode.prototype.tagName = function () {
  return this._tagName || null;
};
htmlNode.prototype.find = function (tagName, attrs) {
  tagName = (tagName || '*').toLowerCase();
  if (this._type(attrs) != 'object') {
    attrs = {};
  }
  var ret = null;
  if (this._tagName) {
    for (var i = 0; i < this._children.length; i++) {
      if (this._children[i]._tagName) {
        if (tagName == '*' || this._children[i]._tagName == tagName) {
          if (this._compareAttr(this._children[i]._attrs, attrs)) {
            ret = this._children[i];
            break;
          }
        }
        ret = this._children[i].find(tagName, attrs);
        if (ret) {
          break;
        }
      }
    }
  }
  return ret;
};
htmlNode.prototype.findAll = function (tagName, attrs) {
  tagName = (tagName || '*').toLowerCase();
  if (this._type(attrs) != 'object') {
    attrs = {};
  }
  var ret = [];
  if (this._tagName) {
    for (var i = 0; i < this._children.length; i++) {
      if (this._children[i]._tagName) {
        if (tagName == '*' || this._children[i]._tagName == tagName) {
          if (this._compareAttr(this._children[i]._attrs, attrs)) {
            ret.push(this._children[i]);
          }
        }
        ret = ret.concat(this._children[i].findAll(tagName, attrs));
      }
    }
  }
  return ret;
};
htmlNode.prototype.comment = function () {
  var ret = [];
  if (this._tagName) {
    for (var i = 0; i < this._children.length; i++) {
      if (this._children[i]._plainComment) {
        ret.push(this._children[i]);
      }
      if (this._children[i]._tagName) {
        ret = ret.concat(this._children[i].comment());
      }
    }
  }
  return ret;
};
htmlNode.prototype._compareAttr = function (nodeAttrs, attrs) {
  for (var key in attrs) {
    if (attrs.hasOwnProperty(key)) {
      if (nodeAttrs.hasOwnProperty(key)) {
        switch (this._type(attrs[key])) {
        case 'string':
          if (attrs[key] != nodeAttrs[key]) {
            return false;
          }
          break;
        case 'regexp':
          if (nodeAttrs[key].test(atts[key])) {
            return false;
          }
          break;
        }
      } else {
        return false;
      }
    }
  }
  return true;
};
htmlNode.prototype._type = function (obj) {
  if (typeof obj == "undefined") return "undefined";
  if (obj === null) return "object";
  var arr = Object.prototype.toString.call(obj).match(/^\[object (.+)\]$/);
  return arr ? arr[1].toLowerCase() : '';
};
htmlNode.prototype.html = function () {
  var ret = '';
  if (this._htmlStart != -1) {
    ret = this.parser._html.substring(this._htmlStart, this._htmlEnd + 1);
  }
  return ret;
};
htmlNode.prototype.ohtml = function () {
  var ret = '';
  if (this._ohtmlStart != -1) {
    ret = this.parser._html.substring(this._ohtmlStart, this._ohtmlEnd + 1);
  }
  return ret;
};
htmlNode.prototype.text = function () {
  var ret = [];
  if (this._plainText) {
    ret.push(this._plainText);
  } else if (this._tagName) {
    for (var i = 0; i < this._children.length; i++) {
      ret.push(this._children[i].text());
    }
  }
  return ret.join(' ');
};
htmlNode.prototype.attr = function (attrKey, attrValue) {
  if (this._type(attrValue) == 'undefined') {
    var ret = null;
    if (this._attrs && this._attrs.hasOwnProperty(attrKey)) {
      ret = this._attrs[attrKey];
    }
    return ret;
  } else {
    this._attrs[attrKey] = attrValue;
    return this;
  }
};
htmlNode.prototype.remove = function () {
  if (this == this.parser.root) {
    for (var i = node._children.length; i >= 0; i--) {
      node._children[i].remove();
    }
    return;
  }
  if (this._ohtmlStart == -1 || this._ohtmlEnd == -1) {
    return;
  }
  // calc position
  var p1 = this._ohtmlStart,
    p2 = this._ohtmlEnd + 1;
  var start = this._ohtmlEnd;
  var len = this._ohtmlStart - this._ohtmlEnd - 1;
  // remove node
  var children = this._parent._children;
  for (var i = 0; i < children.length; i++) {
    if (children[i] == this) {
      children.splice(i, 1);
      break;
    }
  }
  this._parent = null;
  // fix this node postion
  this.parser.root._fixPosition(start, len);
  this._fixPosition(0, -start);
  // fix html
  this.parser._html = this.parser._html.slice(0, p1) + this.parser._html.slice(p2);
  // add flag
  this._remove = true;
  return this.parser.root;
};
htmlNode.prototype._fixPosition = function (start, len) {
  var arr = ['_htmlStart', '_htmlEnd', '_ohtmlStart', '_ohtmlEnd'];
  for (var i = 0; i < arr.length; i++) {
    if (this[arr[i]] >= start) {
      this[arr[i]] += len;
    }
  }
  if (this._tagName) {
    for (var i = 0; i < this._children.length; i++) {
      this._children[i]._fixPosition(start, len);
    }
  }
};

function htmlParse(html) {
  this._html = '';
  this._parse(html);
};
htmlParse.prototype._autoCloseTag = (function () {
  var tagArr = '!DOCTYPE,input,br,hr,area,base,img,meta,link'.split(',');
  var tagHash = {};
  for (var i = 0; i < tagArr.length; i++) {
    tagHash[tagArr[i]] = 1;
  }
  return tagHash;
})();
htmlParse.prototype._ignoreTag = (function () {
  var tagArr = 'script,textarea,pre'.split(',');
  var tagHash = {};
  for (var i = 0; i < tagArr.length; i++) {
    tagHash[tagArr[i]] = 1;
  }
  return tagHash;
})();
htmlParse.prototype._parse = function (html) {
  if (htmlNode.prototype._type(html) == 'string') {
    this._html = html || '';
  }
  var commentStart = '<!--',
    commentEnd = '-->';
  var commentStartChar = commentStart.substr(0, 1);
  var commentEndChar = commentEnd.substr(0, 1);
  var codeArr = this._html.split("");
  var curNode = this.root = new htmlNode(this, null, 'root', null, null);
  curNode._htmlStart = curNode._ohtmlStart = 0;
  curNode._htmlEnd = curNode._ohtmlEnd = this._html.length - 1;
  var s = 'text',
    isIgnore = false,
    isClose, tagName, start, attrKey, attrValue, plainText = '',
    plainComment = '',
    isQuote = '',
    isError = false;
  for (var i = 0; i < codeArr.length; i++) {
    var t = codeArr[i],
      pt = codeArr[i - 1],
      nt = codeArr[i + 1];
    var isLast = i == codeArr.length - 1;
    switch (s) {
    case 'text':
      if (!isIgnore && t == commentStartChar && codeArr.slice(i, i + commentStart.length).join('') == commentStart) {
        start = i;
        plainComment = commentStart;
        s = 'comment';
        i += commentStart.length - 1;
      } else if (isLast || !isIgnore && t == '<' && nt && !/^\s$/.test(nt) || isIgnore && t == '<' && codeArr.slice(i, i + tagName.length + 2).join('') == '</' + tagName && /^[>\/\s]$/.test(codeArr[i + tagName.length + 2])) {
        if (this._trim(plainText)) {
          new htmlNode(this, curNode, null, plainText, null);
        }
        tagName = '';
        start = i;
        s = 'tagName';
        isIgnore = false;
        if (nt == '/') {
          isClose = true;
          i++;
        } else {
          isClose = false;
        }
      } else {
        plainText += t;
      }
      break;
    case 'comment':
      if (isLast || t == commentEndChar && codeArr.slice(i, i + commentEnd.length).join('') == commentEnd) {
        s = 'text';
        var node = new htmlNode(this, curNode, null, null, plainComment + commentEnd);
        node._ohtmlStart = start;
        node._htmlStart = start + commentStart.length;
        node._htmlEnd = i - 1;
        i += commentEnd.length - 1;
        node._ohtmlEnd = i;
      } else {
        plainComment += t;
      }
      break;
    case 'tagName':
      if (/^[>\/\s]$/.test(t)) {
        if (!isClose) {
          curNode = new htmlNode(this, curNode, tagName, null, null);
          isIgnore = this._ignoreTag.hasOwnProperty(tagName);
          curNode._ohtmlStart = start;
        }
        attrKey = '';
        attrValue = '';
        s = 'attrKey';
        if (t == '>') {
          i--;
        }
      } else {
        tagName += t.toLowerCase();
      }
      break;
    case 'attrKey':
      if (t == '>') {
        if (isClose) {
          var t = curNode;
          var wfcArr = [];
          while (t) {
            if (t._tagName == tagName) {
              for (var j = 0; j < wfcArr.length; j++) {
                wfcArr[j]._htmlEnd = wfcArr[j]._ohtmlEnd = start - 1;
              }
              t._htmlEnd = start - 1;
              t._ohtmlEnd = i;
              curNode = t._parent;
              break;
            } else {
              wfcArr.push(t);
            }
            t = t._parent;
          }
        } else {
          if (this._autoCloseTag.hasOwnProperty(tagName)) {
            curNode._ohtmlEnd = i;
            curNode = curNode._parent;
          } else {
            curNode._htmlStart = i + 1;
          }
        }
        plainText = '';
        s = 'text';
      } else if (attrKey && t == '=') {
        attrValue = '';
        s = 'attrValue';
      } else if (/^[\/\s]$/.test(t)) {
        if (!isClose) {
          this._addAttr(curNode, attrKey, attrValue);
        }
      } else {
        attrKey += t;
      }
      break;
    case 'attrValue':
      if (isQuote) {
        if (t == isQuote) {
          isQuote = false;
          if (!isClose) {
            this._addAttr(curNode, attrKey, attrValue);
          }
          //update weixj start
          attrKey = '';
          attrValue = '';
          //update weixj end
          s = 'attrKey';
        } else {
          attrValue += t;
        }
      } else if (!attrValue && /^[\'\"]$/.test(t)) {
        isQuote = t;
      } else if (attrValue && /^\s$/.test(t) || t == '>') {
        if (!isClose) {
          this._addAttr(curNode, attrKey, attrValue);
        }
        attrKey = '';
        attrValue = '';
        s = 'attrKey';
        if (t == '>') {
          i--;
        }
      } else {
        if (attrValue || /^\s$/.test(t)) {
          attrValue += t;
        }
      }
      break;
    }
  }
  switch (s) {
  case 'text':
  case 'comment':
  case 'tagName':
    break;
  case 'attrKey':
  case 'attrValue':
    curNode._parent.pop();
    break;
  }
  while (curNode != this.root) {
    t._htmlEnd = t._ohtmlEnd = codeArr.length - 1;
    curNode = curNode._parent;
  }
};
htmlParse.prototype._addAttr = function (node, attrKey, attrValue) {
  if (attrKey && !node._attrs.hasOwnProperty(node)) {
    node._attrs[attrKey] = attrValue;
  }
};
htmlParse.prototype._trim = function (str) {
  return str.replace(/^\s+|\s+$/g, '');
};;var vm = {};
vm.undfn = void(0);
vm.global = (1, eval)('this');
vm.getContext = function (code, context) {
  code = code || '';
  context = context || {};
  var con = {
    global: {},
    alert: function () {},
    confirm: function () {},
    console: {
      log: function () {},
    },
    localStorage: {
      setItem: function () {},
      getItem: function () {
        return '';
      }
    },
    vm: vm.undfn,
    Lizard: Lizard,
    setInterval: function () {},
    setTimeout: function () {}
  };
  if (context) {
    for (var key in context) {
      if (context.hasOwnProperty(key) && !con.hasOwnProperty(key)) {
        con[key] = context[key];
      }
    }
  }
  code.replace(/[a-z][a-z0-9_$]*/gi, function (a) {
    if (!con.hasOwnProperty(a) && !vm.global.hasOwnProperty(a)) {
      if (a != 'hasOwnProperty') con[a]=vm.undfn;
    }
  });
  return con;
};
vm.code2string = function (code) {
  var hash = {
    '\\': '\\\\',
    '\t': '\\t',
    '\r': '\\r',
    '\n': '\\n',
    '\'': '\\\'',
    '\"': '\\\"'
  };
  ret = code.replace(/[\\\t\r\n\'\"]/g, function (a) {
    return hash[a];
  });
  return ret;
};
vm.require = function (code, context) {
  var ret = {};
  var con = vm.getContext(code, context);
  con.define = function () {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] == 'function') {
        try {
          ret = args[i](ret);
        } catch (e) {};
      }
    }
  };
  try {
    var fn = new Function('__context', 'with(__context){' + code + '}');
    fn(con);
  } catch (e) {}
  return ret;
};
vm.eval = function (code, context) {
  var ret = vm.undef;
  var con = vm.getContext(code, context);
  try {
    var fn = new Function('__context', 'with(__context){return eval(\'' + vm.code2string(code) + '\');}');
    con._ = _;
    ret = fn(con);
  } catch (e) {
    var conStr = '';
    try {
      conStr = JSON.stringify(con);
    } catch (e) {};
    if (typeof LizardDebug!='undefined'){
      LizardDebug += '<br />Code: '+code.replace(/</g, '&lt;').replace(/>/g, '&gt;')+'<br />Context: '+conStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }else{
      throw (new Error(('[' + e.stack + '] ' + code + ' @@@ ' + conStr + ' @@@ ').replace(/</g, '&lt;').replace(/>/g, '&gt;')));
    }
  }
  return ret;
};;/**
 * @File c.parser.util.js
 * parser的工具类
 * @author luwei@ctrip.com
 * @version V2.1
 */
define('cParserUtil',[],function(){
  var ParseUtil = {}, uuid = 0, schemaRegs = {};
  ParseUtil.getID = function(url){
    var id= "client_id_viewport_"+(++uuid)+"_"+(new Date().getTime());
    return id;
  }
  
  ParseUtil._containFunc = function(obj, expr)
  {
    var ret = false;
    for (var p in obj)
    {
      if (ret)
      {
        return true;
      }
      if (_.isFunction(obj[p]) && obj[p].toString().indexOf(expr.trim()) > -1)
      {
        obj[p] = obj[p].toString().trim();
        return true;
      }   
      else if (_.isObject(obj[p]) || _.isArray(obj[p]))
      {
        ret = ParseUtil._containFunc(obj[p], expr);
      }       
    }
    return ret;         
  }  
  
  function reString(str) {
    var h = {
        '\r': '\\r',
        '\n': '\\n',
        '\t': '\\t'
    };
    var re1 = /([\.\\\/\+\*\?\[\]\{\}\(\)\^\$\|])/g;
    var re2 = /[\r\t\n]/g;
    return str.replace(re1, "\\$1").replace(re2, function (a) {
      return h[a];
    });
  }
  
  function fixReString(str){
    var chars=str.split('');
    var isInCharDict=false; // []
    var t='';
    var ret=[];
    while (t=chars.shift()){
      ret.push(t);
      if (t=='\\'){
        ret.push(chars.shift());
      }else if (t=='['&&!isInCharDict){
        isInCharDict=true;
      }else if (t==']'&&isInCharDict){
        isInCharDict=false;
       }else if (t=='('&&!isInCharDict){
        if (chars[0] == '?') {
          if (chars[1] == '!') {
          } else if (chars[1] == ':' || chars[1] == '=') {
            chars.shift();
            chars.shift();
            ret.push('?');
            ret.push(':');
          } else {
            ret.push('?');
            ret.push(':');    
          }
        }
      }
    }
    return ret.join('');
  }
  
  function urlParse(urlSchema, url){    
    var paraArr = [], tArr = [], params = {};
    var reStr = schemaRegs[urlSchema];
    if (_.isString(url) || _.isUndefined(reStr)) {
      reStr = schemaRegs[urlSchema] = urlSchema.replace(/\{\{(.+?)\}\}/g,function(a,b){
      tArr.push(b);
      return '{@'+(tArr.length-1)+'}';
      }).replace(/\{(@?)(.+?)\}|[^\{\}]+/g,function(a,b,c){
        var ret = '';
        if (c){
          if (b){
            var pArr=tArr[c].match(/^(?:(?:\((\w+)\))?([^!=]+?)|([^!=]+?)=(.*))$/);
            if (pArr){
              if (pArr[2]){
                switch (pArr[1]){
                  case 'number':
                    ret='(\\d+(?:\\.\\d*)?|\\.\\d+)';
                    break;
                  case 'int':
                    ret='(\\d+)';
                    break;
                  case 'letter':
                    ret='([a-z _\\-\\$]+)';
                    break;
                  default:
                    ret='([^\\\/]*)';
                    break;
                }
                paraArr.push(pArr[2]);
              }else{
                paraArr.push(pArr[3]);
                if (/^\/.*\/$/.test(pArr[4])){
                  ret='('+fixReString(pArr[4].slice(1,-1))+')';
                }else{
                  var arr = pArr[4].split('||');
                  for (var j = 0;j < arr.length; j++){
                    arr[j]=reString(arr[j]);
                  }
                  ret='('+arr.join('|')+')';
                }
              }
            }else{
              ret='';
            }
          }else{
            paraArr.push(c);
            ret='([^\\\/]*)';
          }
        }else{
          ret=reString(a);
        }
        return ret;
      });  
    } 
    if (_.isUndefined(url)) {
      return reStr;
    }
    url = url.replace(/[#\?].*$/g,'');    
    var matches = url.match(new RegExp(reStr,'i')), pathRe = '/([^\/]*)';
    if (reStr[reStr.length - 1] != '\\')
    {
      pathRe = '\\/([^\/]*)'
    }     
    var morePathmatches = url.match(new RegExp(reStr + pathRe,'i'));
    if (matches && !morePathmatches){
      for (var i=0;i<paraArr.length;i++) {
        params[paraArr[i]] = matches[i+1]||null;
      }
      return {reStr: reStr, param: params, index: matches.index};
    } 
    return {};
  }
  
  ParseUtil.getPageUrlschema = function(configStr)
  {
    var ret = '';
    var arr=configStr.match(/([\'\"])?url_schema\1\s*:\s*([\'\"])(.*?)\2/) || configStr.match(/([\'\"])?url_schema\1\s*:\s*\[\s*([\'\"])((.|\s)*?)\2(\s*|,)]/);
    if (arr){
      eval('ret = {' + arr[0] + '}[\'url_schema\']');
      return ret;
    }
    else
    {
      return '';
    }
  }
  
  ParseUtil.getPageParams = function(url, urlschema) {
    url = decodeURIComponent(url);
    var ret = {};
    if (typeof urlschema == 'string')
    {
      urlschema = [urlschema];
    }
    _.each(urlschema, function(item){
      var paraArr = [], paraHash = {};
      var parseRet = Lizard.schema2re(item, url);
      if (parseRet.reStr && parseRet.param)       
      {
        ret = parseRet.param;
      }        
    }); 
    // parseQuery: here cant replace hash to blank coz someone use querystring "from" which contain hash to show where the page come from  
    var queryStr=url.replace(/^[^\?#]*\??/g,'').replace(/#DIALOG_.*$/g,'').replace(/#\|cui-.*$/g,'');
    var searchReg = /([^&=?]+)=([^&]+)/g;
    var urlReg = /\/+.*\?/;
    var arrayReg = /(.+)\[\]$/;
    var match, name, value, isArray;    
    while (match = searchReg.exec(queryStr)) {
      name = match[1].toLowerCase();
      value = match[2];
      isArray = name.match(arrayReg);
      if (urlReg.test(value)) {
        ret[name] = queryStr.substr(queryStr.indexOf(value));
        break;
      } else {
        if (isArray) {
          name = isArray[1];
          ret[name] = ret[name] || [];
          ret[name].push(value);
        } else {
          ret[name] = value;
        }
      }
    }
    
    return ret;
  }
  
  ParseUtil.parseDepend = function(configStr) {
    var ajaxDataMatch = configStr.match(/Lizard.D\(([\'\"])(.*?)([\'\"])\)(.*?)(,|\s)/g), dataexpr = [];
    if (ajaxDataMatch)
    {
      _.each(ajaxDataMatch, function(match){
        var dataexprStr = match.split(',').join('').split('}').join('');
        dataexpr.push(dataexprStr);
      })
    }
    return dataexpr;
  }
  
  ParseUtil._runUnderscore = function(tmpl,datas){
    if (!datas){
      datas={};
    }
    var ret='';
    if (tmpl){
      var compiled = _.template(tmpl);
      var handler = Lizard.T;      
      ret = compiled(datas,{
        Lizard:Lizard
      }).trim();
    }
    return ret;
  }
  
  Lizard.getModels = function(pageConfig)
  {
    if(!pageConfig.model) pageConfig.model= {};
    var apis = pageConfig.model.apis || [], ret = [], dataexpr = pageConfig.dataexpr;
    _.each(apis, function(api){
      api.runat = api.runat||"all";
      if((api.runat == Lizard.renderAt) || api.runat=="all"){
        ret.push(api);
      }   
      if ('suspend' in api)
      {
        api.suspend = api.suspend.toString();
      }
      else
      {
        api.suspend = false;
      }
      _.each(dataexpr, function(p)
      {
        var postdataStr = JSON.stringify(api.postdata);
        if (JSON.stringify(postdataStr).indexOf(p) > -1 || ParseUtil._containFunc(api.postdata, p) || (api.suspend && api.suspend.indexOf(p) > -1))
        {
          if (!api.depends)
          {
            api.depends = [];
            api.expressionMap = {};
          }
          api.depends.push(eval(p.match(/Lizard.D\(([\'\"])(.*?)([\'\"])\)/g)[0].split('Lizard.D').join('')));
          api.expressionMap[p] = dataexpr[p];
        }
      });
    });
    if (_.isFunction(pageConfig.errorBack))
    {
      Lizard.errorBack = pageConfig.errorBack;
    }
    else
    {
      Lizard.errorBack = null;
    }

    return apis;
  } 
    
  /**
   * 根据ID 获取相应的模板
   * @param {String} tmplId 模板的id
   * @param {Object} datas 模板中对应变量属性值
   * @returns {String} result
   * @Method Global.Lizard.T
   * @example
   * //返回值
   * var domString  = Lizard.T("testId")
   * console.log(domString) //" < d i v > < s p a n> 测试字符串</ s p a n></ d i v>"
   */
  Lizard.T = Lizard._T = function(tmplId,datas)
  {
    if (arguments.length == 1)
    {
      var ret = "";
      var t=Lizard.T.lizTmpl[tmplId];
      if (t&&t.runat!=('server')){
        ret = t.text;
      }
      return ret;
    }
    else
    {
      return _runUnderscore(Lizard._T(tmplId),datas);
    }
}
  /**
   * 根据属性Key,获取Url中得参数值
   * @param {String} key 参数名
   * @param {Object|*} [val] 参数值
   * @returns {Object | *}
   * @Method Global.Lizard.P
   * @example
   * //location.href = 'http://ctrip.com/html5/search/index?k=1&from=http:/ctrip.com?a=1&b=3';
   * var k = Lizard.P('k');
   * console.log(k)  //1
   * Lizard.P('k',5)
   * console.log(k)  //5
   */
  Lizard.P = function(key, val)
  {
    var ret=null;
    if (_.isUndefined(val)){
      ret= Lizard.P.lizParam[key] || Lizard.P.lizParam[key.toLowerCase()];
    }else{
      ret=Lizard.P.lizParam[key]=val;
    }
    return ret;
  }  
  Lizard.schema2re = urlParse;

  return ParseUtil;  
});;define('cSeoEntendUtil',['cParserUtil'], function(ParserUtil){
  ParserUtil.getPageConfig = function(parser, pd_init_script) {
    var lizardExpansions = ["appBaseUrl", "webresourceBaseUrl", "restfullApi", "restfullApiHttps", "WebresourcePDBaseUrl"];
    var metas = parser.root.findAll('meta');
    _.each(metas, function (meta) {
      if (meta._attrs && (meta._attrs['lizardExpansion'] || _.contains(lizardExpansions, meta._attrs['name']))) {
        Lizard[meta._attrs['name']] = meta._attrs['content'];
      }
    });
    
    var defaultStr = JSON.stringify({
        "url_schema" : "",
        "model" : {
          "apis" : []
        },
        "view" : {}

      });
    try {
      var configStr = parser.root.find('script', {
          type : 'text/lizard-config'
        }).text();
    } catch (e) {
      var configStr = defaultStr
    }
    if (!configStr)
      configStr = defaultStr;
    var dataexpr = ParserUtil.parseDepend(configStr);
    var ret = {};
    var funcStr = '(function(){' + pd_init_script + ';ret=' + configStr + ';return ret;})()';
    ret = vm.eval(funcStr);
    ret.dataexpr = dataexpr;
    return ret;
  }
  
  ParserUtil.getPageTemplates = function(parser){
    var ret={};
    var templates=parser.root.findAll('script',{
      type:'text/lizard-template'
    });
    
    _.each(templates, function(template){
      var id=template.attr('id');
      if (id){
        ret[id]={
          'runat': template.attr('runat')||'all',
          'text': removeTags(template.text(),'client')
        };
      }
    });    
    return ret;
  }
  
  ParserUtil.urlParse = function(url){
    var arr=url.match(/^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/)||[];
    return {
      href:arr[0]||'',
      hrefNoHash:arr[1]||'',
      hrefNoSearch:arr[2]||'',
      domain:arr[3]||'',
      protocol:arr[4]||'',
      doubleSlash:arr[5]||'',
      authority:arr[6]||'',
      username:arr[8]||'',
      password:arr[9]||'',
      host:arr[10]||'',
      hostname:arr[11]||'',
      port:arr[12]||'',
      pathname:arr[13]||'',
      directory:arr[14]||'',
      filename:arr[15]||'',
      search:arr[16]||'',
      hash:arr[17]||''
    };
  }
 
  ParserUtil.urlFormat = function(urlObj){
    return urlObj.protocol+urlObj.doubleSlash+urlObj.authority+urlObj.pathname+urlObj.search+urlObj.hash;
  }
  
  ParserUtil.hostMapping = function(env,url){
    var objUrl=ParserUtil.urlParse(url);


    objUrl.authority=objUrl.authority.replace(/^([^@]*@)?m.ctrip.com(:\d+)?/i,'$1h5seo.mobile.ctripcorp.com$2');


    var ret=ParserUtil.urlFormat(objUrl);

    return ret;
  }
  
  function removeTags(html,runat){
    var ret=html||'';
    if (/runat=/.test(ret)){
      var hash={};
      var guid='';
      var re;
      while (1){
        guid=(Math.random()*10000).toFixed(0);
        re=new RegExp('lizard_'+guid+'_\\d+','g');
        if (!re.test(ret)){
          break;
        }
      }
      var i=0;
      ret=ret.replace(/<%[\s\S]*?%>/g,function(a){
        var id='/*lizard_'+guid+'_'+i+'*/';
        hash[i]=a;
        i++;
        return id;
      });
      var parser=new htmlParse(ret),node;
      while (node=parser.root.find('*',{
        'runat':runat
      })){
        node.remove();
      }
      ret=parser.root.html();
      re=new RegExp('\\/?\\*lizard_'+guid+'_(\\d+)\\*\\/?','g');
      ret=ret.replace(re,function(a,b){
        return hash[b]||'';
      });
    }
    return ret;
  }
  
  return ParserUtil;
});;define('cSeoUrlmapping',['cSeoEntendUtil'], function (ParserUtil) {
  LizardUrlMapping = function (env, url) {
    var objUrl = ParserUtil.urlParse(url);
    objUrl.pathname = objUrl.pathname.replace(/^\/html5\//i, '/webapp/');
    var ret = ParserUtil.urlFormat(objUrl);
    ret = ParserUtil.hostMapping(env, ret);
    return ret;
  }; 
});
;define('cSeoGetModels',['cSeoEntendUtil'], function (ParserUtil) { 
  var pd_script = '', funcStr;
  function transfuncToVal(obj) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (_.isString(obj[p]) && obj[p].indexOf('function') == 0) {
          funcStr = '(function(){\r\n' + pd_script + '; return (' + obj[p] + ')();})()';
          obj[p] = vm.eval(funcStr);
        } else if (_.isObject(obj[p]) || _.isArray(obj[p])) {
          transfuncToVal(obj[p]);
        }
      }
    }
  }
  
  LizardGetModels = function () {
    var url = arguments[0],
    html = arguments[1],
    fetchedDatas = arguments[2],
    funcStr,
    parser = new htmlParse(html),
    pdInitScript = parser.root.find('script', {
        pd_init : 1
      });

    if (!fetchedDatas) {
      if (pdInitScript) {
        return JSON.stringify({
          bProceed : true,
          models : [{
              url : ParserUtil.hostMapping(null, pdInitScript._attrs['src']),
              postdata : '',
              name : '100'
            }
          ],
          fetchedDatas : arguments[2]
        });
      } else {
        fetchedDatas = {
          100 : ''
        };
      }
    } else if (!pdInitScript) {
      fetchedDatas[100] = '';
    }
    pd_script = fetchedDatas[100];
    Lizard.P.lizParam = ParserUtil.getPageParams(url, ParserUtil.getPageUrlschema(parser.root.find('script', {
      type : 'text/lizard-config'
    }).text()));
    Lizard.T.lizTmpl = ParserUtil.getPageTemplates(parser);
    var pageConfig = ParserUtil.getPageConfig(parser, fetchedDatas[100]);


    var models = Lizard.getModels(pageConfig);

    _.each(models, function (api) {
      var url = ParserUtil.hostMapping(null, api.url);

      var postdata = api.postdata || {};
      if (!postdata.head) {
        postdata.head = {
          "cid" : (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()),
          "ctok" : "351858059049938",
          "cver" : "1.0",
          "lang" : "01",
          "sid" : "8888",
          "syscode" : '09',
          "auth" : ""
        };
      }
      postdata.head.syscode = "09";

      api.url = url;
    });

    var indexMap = {};
    _.each(models, function(model, index){
      if (model.name) {
        indexMap[index] = model.name;
      }
      model.name = index;   
    });
    var leftmodels = models;

    
    if (_.size(fetchedDatas) > 0)
    {
      Lizard.D = function (name) {
        for (var p in indexMap) {
          if (indexMap[p] == name) {
            return fetchedDatas[p]
          }
        }
      }
      leftmodels = _.filter(models, function(model, index){
        if (fetchedDatas[index]) {
          return false;
        }        
        return true;
      });     
    }



    if (leftmodels.length)
    {
      leftmodels = _.filter(leftmodels, function(model){
        return !model.depends || _.every(model.depends, function(depend){
          if (fetchedDatas) {
            for (var p in indexMap) {
              if (indexMap[p] == depend && fetchedDatas[p])
              {
                return true;
              }
            }
          }
          return false;
        });
      }); 
    }


    
    if (leftmodels.length) {
      _.each(leftmodels, function (model) {
        funcStr = '(function(){\r\n' + fetchedDatas[100] + ';transfuncToVal(model);})()';
        model = vm.eval(funcStr, {
          model : model,
          transfuncToVal : transfuncToVal
        });
      })
    }


    var flag = leftmodels.length + _.size(fetchedDatas) < models.length + 1;
    if (!flag) {
      _.each(models, function (model, index) {
        if (model.suspend) {
          arguments[2][index] = {};
        }        
      })
    }
    return JSON.stringify({bProceed: flag, models: leftmodels, fetchedDatas: arguments[2]});  
  }  

  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
});
;define('cSeoRender',['cSeoEntendUtil'], function (ParserUtil) {
  var globalspaces = ["hotel", "CommentDeal","ddrUtils","NewsCommon","travelsFn","ShopsDataCommon","travelsFn","GsPlaceTtdList","commonUtil", "ddrParser", "ShopsListData", "ShopsBrandListData", "ShopsGlanceDetailData", "ShopsNearbyData", "Lipin"];
  function _runUnderscore(tmpl, datas, script) {
    if (!datas) {
      datas = {};
    }
    var ret = '';
    if (tmpl) {
      var compiled = _.template(tmpl);
      var handler = Lizard.T;
      Lizard.T = function (id, datas) {
        return _runUnderscore(Lizard._T(id), datas, script);
      };
      Lizard.T.lizTmpl = Lizard._T.lizTmpl;
      if (!script)
        script = '';
      try {
        var context = {};
        _.each(globalspaces, function(space){          
          vm.eval('(function(){' + script + ';if (typeof ' + space + ' != "undefined"){context["' + space + '"] = ' + space +'};})()', {context: context}) ;
        });
        ret = compiled(datas, context).trim();
      }
      finally {
        Lizard.T = handler;
      }
    }
    return ret;
  }
  
  LizardRender = function () {
    var url = arguments[0],
    html = arguments[1],
    datas = arguments[2],
    parser = new htmlParse(html),
    TDK = {};
    
    Lizard.P.lizParam = ParserUtil.getPageParams(url, ParserUtil.getPageUrlschema(parser.root.find('script', {
            type : 'text/lizard-config'
          }).text()));
    Lizard.T.lizTmpl = ParserUtil.getPageTemplates(parser);    
    var pageConfig = ParserUtil.getPageConfig(parser, datas[100]);
    
    if (pageConfig.model && _.isFunction(pageConfig.model.setTDK)) TDK = pageConfig.model.setTDK(datas);

    var title = parser.root.find('title');
    TDK.title && title && title.remove();

    var names = ['title', 'keywords', 'description']
    var metas = parser.root.findAll('meta');
    _.each(metas, function (meta) {
      if (meta._attrs && _.indexOf(names, meta._attrs['name']) > -1) {
        meta.remove();
      }
    });

    var tdkStr = [];
    _.each(_.keys(TDK), function (key) {
      if (key == 'title')
        tdkStr.push('<title>' + TDK.title + '</title>');
      tdkStr.push('<meta name="' + key + '" content="' + TDK[key] + '" />');
    });

    var pd_script = datas[100];
    if (pageConfig.model && _.isFunction(pageConfig.model.filter)) {
      var context = {};
      _.each(globalspaces, function(space){
        vm.eval('(function(){' + pd_script + ';if (typeof ' + space + ' != "undefined"){context["' + space + '"] = ' + space +'};})()', {context: context}) ;
      });
      context = _.extend(context, {
        fn : pageConfig.model.filter,
        _this : null,
        datas : datas,
        TDK : TDK
      })      
      datas = vm.eval('fn.call(_this, datas, TDK)', context);
    };

    var ret = {
      header : '',
      viewport : ''
    };

    _.each(_.keys(pageConfig.view), function (tmplName) {
      ret[tmplName] = _runUnderscore(pageConfig.view[tmplName], datas, pd_script);
    });

    if (ret.header) {
      ret.header = ret.header.replace(/<[\s|\B]+h1|<h1/gi, '<h2').replace(/h1[\s|\B]+>|h1>/gi, 'h2>');
    }

    ret.viewport = ('<div id="' + ParserUtil.getID() + '" page-url="' + url.replace('h5seo.mobile.ctripcorp.com', 'm.ctrip.com') + '">'
       + ret.viewport
       + '</div>').trim();

    var main_viewport = parser.root.find('*', {
        'class' : 'main-viewport'
      });
    if (main_viewport) {
      while (node = main_viewport.children()[0]) {
        node.remove();
      }
    }
    tdkStr = tdkStr.join('');
    return parser.root.html()
    .replace(/<div\b[^>]*?class=([\'\"])main-viewport\1[^>]*>/i, function (a) {
      return a.replace('>', ' renderat="server" >') + ret.viewport;
    })
    .replace(/<header\b[^>]*>/i, function (a) {
      return a.split('none').join('') + ret.header;
    })
    .replace(/<head\b[^>]*>/, function (a) {
      var ret = "";
      if (tdkStr) {
        ret = a + tdkStr;
      } else {
        ret = a;
      }
      return ret;
    }).replace(/<a\s+.*?\>([\w\W]*?)\<\/a\>/gi, function (linktag) {
      return linktag.replace(/href\s*=\s*[\"\']?([^\"\' ]+)[\"\']/gi, function (a, b) {
        return a.replace(b, b.replace('\/webapp\/', '\/html5\/'));
      })
    });
  };
});
;require(['cSeoUrlmapping', 'cSeoGetModels', 'cSeoRender'], function(){
  Lizard.S = function(stroename, key, defaultvalue)
  {
    return defaultvalue;
  }   
}, null, true);

// export for nodejs
if (typeof exports !== 'undefined') {
  exports.Lizard = Lizard;
  exports.LizardGetModels = LizardGetModels;
  exports.LizardRender = LizardRender;
  exports.LizardUrlMapping = LizardUrlMapping;
}})()