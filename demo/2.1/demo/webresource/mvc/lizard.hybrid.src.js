;/**
 * @file c.hybrid.shell
 * @description 面向 H5 开发人员，提供调用 HybridAPI 的界面。
 * @description 
 * 自 Lizard 1.1/2.0/2.1 for APP 6.0 起，对于 Native vs Hybrid / H5(inApp) 之间互相调用的封装，我们采用了新的策略： *
 * ⑴ 对于 H5 中尚未对等实现的功能（如调取系统联系人），我们将通过 cHybridShell 对 bridge.js 中的方法提供二次封装；
 * ⑵ 对于 H5 中已经对等实现的功能（如定位），我们将通过 Guider 等功能类提供二次封装；
 * 更多细节请参考{@link http://conf.ctripcorp.com/display/FRAM/cHybridShell|cHybridShell 使用方法}
 * @namespace Hybrid.cHybridShell
 * @author jiangjing@ctrip.com
 */

//--No.1--
// 根据 H5 vs Hybrid 的约定：
// ⑴ 调用 HybridAPI 的同时，将以方法标签名（Hybrid）为索引注册回调函数；
// ⑵ HybridAPI 异步执行，执行完毕后将调用 window.app.callback() 反馈信息，其中应包括同样的方法标签名（Hybrid）；
// ⑶ 方法标签名应与 HybridAPI（见 bridge.js）中对应的方法名除去前缀 app_ 后的剩余部分一致；
// ⑷ HybridAPI 必须确保不同的类中的方法不重名，否则无法以标签名为依据正确执行回调函数。

define('cHybridShell',[], function() {
	'use strict';

	var HYBRID = {}, W = window;

	HYBRID.CLASSES = [];
	for (var i in W) if (i.substr(0, 5) == 'Ctrip') HYBRID.CLASSES.push(W[i]);
	// var HYBRID.CLASSES = [
	// 	CtripBar            ,
	// 	CtripBusiness       ,
	// 	CtripEncrypt        ,
	// 	CtripFile           ,
	// 	CtripGeoHelper      ,
	// 	CtripMap            ,
	// 	CtripPage           ,
	// 	CtripPay            ,
	// 	CtripPipe           ,
	// 	CtripSumSungWallet  ,
	// 	CtripTool           ,
	// 	CtripUser           ,
	// 	CtripUtil           ];

	HYBRID.FNINFO = {		
		abort_http_pipe_request            : { realname: 'app_abort_HTTP_pipe_request' },
	//	check_network_status               : { paramsMixed: true },  // 反馈信息是否混淆在回调参数中。
		do_business_job                    : { sidIndex: 3 },  // sequenceId 在形参中的位置，顺序自 0 起始。
		send_h5_pipe_request               : { realname: 'app_send_H5_pipe_request' },
		send_http_pipe_request             : { realname: 'app_send_HTTP_pipe_request' }
	};

	// paramsMixed 指该方法回调时将反馈信息和元信息（tagname, error_code）混杂在一起，而没有单独放在 param 属性中。
	// e.g. locate: { klass: CtripMap, realname: 'app_locate' },

	// 	refresh_nav_bar                    : { klass: CtripBar },

	// 	choose_contact_from_addressbook    : { klass: CtripBusiness },
	// 	choose_invoice_title               : { klass: CtripBusiness },
	// 	get_device_info                    : { klass: CtripBusiness },
	// 	log_google_remarkting              : { klass: CtripBusiness },
	// 	read_verification_code_from_sms    : { klass: CtripBusiness },
		
	// 	base64_encode                      : { klass: CtripEncrypt },
	// 	ctrip_encrypt                      : { klass: CtripEncrypt },
		
	// 	check_file_exist                   : { klass: CtripFile },
	// 	delete_file                        : { klass: CtripFile },
	// 	get_current_sandbox_name           : { klass: CtripFile },
	// 	get_file_size                      : { klass: CtripFile },
	// 	make_dir                           : { klass: CtripFile },
	// 	read_text_from_file                : { klass: CtripFile },
	// 	write_text_to_file                 : { klass: CtripFile },
		
	// 	locate                             : { klass: CtripMap },
	// 	show_map_with_POI_list             : { klass: CtripMap },
		
	// 	enable_drag_animation              : { klass: CtripPage },
	// 	hide_loading_page                  : { klass: CtripPage },
	// 	show_loading_page                  : { klass: CtripPage },
		
	// 	check_pay_app_install_status       : { klass: CtripPay },
		
		
	// 	finished_login                     : { klass: CtripUser },
	// 	member_auto_login                  : { klass: CtripUser },
	// 	member_login                       : { klass: CtripUser },
	// 	member_register                    : { klass: CtripUser },
	// 	non_member_login                   : { klass: CtripUser },
		
	// 	check_app_install_status           : { klass: CtripUtil },
	// 	check_network_status               : { klass: CtripUtil },
	// 	choose_photo                       : { klass: CtripUtil },
	// 	download_data                      : { klass: CtripUtil },
	// 	init_member_H5_info                : { klass: CtripUtil },
	// 	read_copied_string_from_clipboard  : { klass: CtripUtil },
	// 	save_photo                         : { klass: CtripUtil },	

	// 获取 tagname 对应 Hybrid API 方法的相关信息。
	HYBRID.fninfo = function(tagname) {
		var info = _ME.ifHasnot(HYBRID.FNINFO, tagname, {});

		if (!info._READY) {
			// 关于 tagname 的命名规则，参见注释 No.1 第⑶条。
			_ME.ifHasnot(info, 'realname', 'app_' + tagname);

			// 此处不使用 _ME.ifHasnot() 方法系因 _.find() 运算成本较高。
			if (!info.hasOwnProperty('klass')) info.klass = _.find(HYBRID.CLASSES, function(klass) { return !!klass[info.realname]; });

			// 信息初始化不会反复尝试。
			info._READY = true;
		}

		return info;
	};

	// 仅供内部调用的成员集合（包括常量、变量和方法）。
	var _ME = {
		EXCEPTION: new Error('HYBRID-SHEL-2014'),

		SN: {
			DEFAULT : 0,
			UPON    : 'UPON.2014' ,
			PRE     : 'PRE.2014'  ,
			POST    : 'POST.2014' ,
			PX      : 'PX.2014'   ,

			gen     : function() { return (new Date).getTime(); }
		},

		// ⑴ 指定参数，则判断该异常是否为内部异常。
		//    对于非内部异常，仍然抛出以免干扰其他依赖类似机制的功能及程序调试。
		// ⑵ 未指定参数，则抛出内部异常。
		abort: function(ex) {
			if (ex) {
				if (ex == _ME.EXCEPTION) return true;
				throw ex;
			}
			else throw _ME.EXCEPTION;
		},

		// 根据方法标签名（Hybrid）取得对应的 HybridAPI 方法句柄。
		// 为确保方法在正确的上下文中执行，须对该方法进行封装，即返回的并非原始句柄。
		apiFn: function(tagname) {
			var method = function() {}, info = HYBRID.fninfo(tagname);
			if (info.klass) {
				method = function() {
					var args = arguments, abort = false;
					
					// 对参数进行预处理。
					// 在预处理过程中，如果预处理方法抛出错误，则中止执行后续预处理方法，并且阻断对 Hybrid API 的请求。
					_.find(_ME.fn('find', tagname, _ME.SN.PRE), function(fn) {
						try { args = fn.apply(null, args); }
						catch (ex) { return _ME.abort(ex); }
					});

					// 在 HybridAPI 类的上下文中执行关联方法。
					abort || info.klass[info.realname].apply(info.klass, args);
				};
			}
			return method;
		},

		fn: (function() {
			// 存储容器
			var STORAGE = {};

			return function(action, tagname, sequenceId, callback) {
				// 参数兼容
				if (!callback && (sequenceId instanceof Function)) {
					callback = sequenceId;
					// delete sequenceId; // Uncaught SyntaxError: Delete of an unqualified identifier in strict mode. 
					sequenceId = undefined;  // _.noop() returns undefined
				}

				// × 方法标签名（Hybrid）是大小写敏感的。
				// // 方法标签名（Hybrid）规范化
				// tagname = tagname.toLowerCase();

				// 设置默认顺序号。
				if (!sequenceId) sequenceId = _ME.SN.DEFAULT;

				var storage, index, times;

				// 初始化容器。
				storage = _ME.ifHasnot(STORAGE, tagname, {});
				storage = _ME.ifHasnot(storage, sequenceId, { fns: [], times: [] });

				// 某些情况下，回调函数可能已在队列中，我们需要取得其位置。
				index = _.indexOf(storage.fns, callback);

				// 如回调函数未在队列中，则认为其当前执行次数为零。 
				times = index < 0 ? 0 : storage.times[index];	

				switch (action) {
					// 注册回调函数（可无限次使用）。
					case 'on':
					// 注册回调函数（仅供使用一次）。
					case 'once':
						if (callback) {

							// 调整执行次数
							times = (action == 'once') ? 1 : W.Infinity;

							// 将回调函数在队列中的位置设定为末尾
							if (index < 0) index = storage.fns.length;

							storage.times[index] = times;
							storage.fns[index] = callback;
						}
						return;

					// 返回所有已注册的回调函数。
					case 'find':
						return storage.fns;

					// 削减已注册回调函数的可使用次数，自动删除即将失效的回调函数。
					case 'try':

						// 调整执行次数
						storage.times[index] = --times;

						if (times == 0) { // 执行次数已消耗完毕，则取消该回调函数的注册
							arguments[0] = 'off';
							_ME.fn.apply(_ME, arguments);
						}
						return;

					// case 'pop':
					// 	storage[sequenceId] = [];
					// 	return callbacks;

					// 删除（取消注册）回调函数，如未指定回调函数，则删除所有的。
					case 'off':
						if (callback) {
							var reject = function(arr, index) {
								return _.union(_.first(arr, index), _.rest(arr, index+1));
							};
							storage.fns = reject(storage.fns, index);
							storage.times = reject(storage.times, index);
						}
						else {
							storage.fns = []
							storage.times = [];
						}
						return;
				}
			};
			
			// return {
			// 	// 根据方法标签名（Hybrid）和顺序号登记回调函数。
			// 	push: function(tagname, sequenceId, callback) {
			// 		return fn('on', tagname, sequenceId, callback);
			// 	},

			// 	// 根据方法标签名（Hybrid）和顺序号读取回调函数。
			// 	/*Array*/ find: function(tagname, sequenceId) {
			// 		return fn('find', tagname, sequenceId);
			// 	},

			// 	// 根据方法标签名（Hybrid）和顺序号读取回调函数，并取消登记。
			// 	/*Array*/ pop: function(tagname, sequenceId) {					
			// 		return fn('pop', tagname, sequenceId);
			// 	},

			// 	// 根据方法标签名（Hybrid）和顺序号取消对指定回调函数的登记。
			// 	remove: function(tagname, sequenceId, callback) {
			// 		return fn('off', tagname, sequenceId, callback);
			// 	}
			// };
		})(),

		// 返回第一个非假的参数值，如均非真，则返回最后一个参数值（比如 0 或 ''）。
		// 辅助方法，仅供本模块内部为简化代码使用。
		// ifEmpty: function() {
		// 	for (var i = 0, args = arguments; i < args.length - 1; i++) if (args[i]) return args[i];
		// 	return args[i];
		// },

		// 判断对象是否存在指定属性，若不存在，则使用缺省值初始化该属性，并返回属性值。
		ifHasnot: function(obj, propname, value) {
			if (!obj.hasOwnProperty(propname)) obj[propname] = value;
			return obj[propname];
		}

		// @deprecated
		//
		// // ⑴ 判断父对象（obj）是否存在指定子对象（keyname），如果不存在，则将其初始化为一个空对象；
		// // ⑵ 如果指定了 subKeyname，则以 obj.keyname 为父对象，重复上述步骤；
		// // ⑶ 如果存在更多参数，则依次类推；
		// // ⑷ 返回最末端的对象。
		// initHash: function(/*object*/ obj, /*string*/ keyname, /*OPTIONAL string*/ subKeyname /*, ... */) {
		// 	for (var i = 1; keyname = arguments[i]; i++) {
		// 		if (!obj[keyname]) obj[keyname] = {};
		// 		obj = obj[keyname];
		// 	}
		// 	return obj;
		// },
		//
		// findHash: function(/*object*/ obj, /*string*/ keyname, /*OPTIONAL string*/ subKeyname /*, ... */) {
		// 	for (var i = 1; obj && (keyname = arguments[i]); i++) obj = obj[keyname];
		// 	return obj;
		// }
	};

	var exports = {
		/**
		 * 可在预处理函数或后处理函数中调用，用于中止本次与 Hybrid API 请求有关的后续任务的执行。
		 * @method cHybridShell.abort
		 */
		abort: _ME.abort,

		/**
		 * 返回 HybridAPI 句柄供调用，也可以同时注册回调方法。
		 * 建议按链式语法调用，如 
		 *   var callback = function(params) { alert(params.outString); };
		 *   cHybridShell.fn('ctrip_encrypt', callback)('hello world!', '1');		 
		 *
		 * @method cHybridShell.fn
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {string}         [sequenceId]  顺序号，并行调用同一方法时可能需要指定顺序号
		 * @param  {function}       [callback]    回调函数
		 * @return {function}                     对应的 HybridAPI 函数句柄
		 */
		// 此方法可取代原 request() 和 register() 的功能，但书写方式有所不同。
		fn: function(tagname, sequenceId, callback) {
			// 登记回调函数
			this.on(tagname, sequenceId, callback);

			// 取得对应的 HybridAPI 函数句柄。
			var fn = _ME.apiFn(tagname);

			// 为了与 .Fn() 在形式上相对应，有此兼容。
			fn.run = fn;

			return fn;
		},

		/**
		 * 初始化。
		 * @singleton
		 */
		init: _.once(function() {
			// var _me = this.init;
			// if (_me.called) return; _me.called = true;

			/**
			 * 与 Hybrid 约定的回调函数。
			 * 按约定 Hybrid 将按以下方式回调：
			 *   window.app.callback({ tagname: '...', param: { ... } });
			 *
			 * @method window.app.callback
			 * @param  {object}   options               参数集合
			 * @param  {string}   options.tagname       方法标签名（Hybrid）
			 * @param  {object}   options.param         返回的参数集合
			 * @return {boolen}   true = 成功执行回调，或毋须回调；false = 出现故障
			 */
			if (!W.app) W.app = {};
			W.app.callback = function(options) {
				var params, err;

				// 容错处理：某些 Hybrid 方法在回调时未严格遵守约定。
				if (typeof options == 'string') {
					try {
						options = JSON.parse(decodeURIComponent(options));
					} catch (ex) {
						return; // 老版本中此处未终止函数执行。
					}
				}

				var tagname = options.tagname;

				// params = _ME.ifEmpty(options.param, options); 
				// 容错处理：某些 Hybrid 方法在回调时未严格遵守约定，未将返回的参数集合放在回调参数的 param 属性中。
				// 但是这种容错也造成一个问题，即如果 param 不是一个集合，而是一个非真值，那么这种处理将会导致歧义。
				params = HYBRID.fninfo(tagname).paramsMixed ? options : options.param;

				// 容错处理
				if (typeof params == 'string') {
					// 老版本中此处未尝试捕获错误。
					// 但是，老版本中如果 options.param 为非真值（包括空字符串），则会以 options 替代，因此不会出现尝试解析空字符串导致出错的情形。
					try {
						params = JSON.parse(params); 
					} catch (ex) {}
				}

				// 错误信息规范化处理
				if (options.error_code) {
					/^(\((-?\d+)\))?(.+)$/.exec(options.error_code);
					err = new Error();
					err.number = parseInt(RegExp.$2);
					err.message = RegExp.$3;
				}

				// 根据 tagname 和 sequenceId 选择回调函数并执行该回调函数。
				// 如未发现匹配的回调函数，则认为毋须回调。
				/**
				 * @todo sequenceId 是 options 的属性还是 options.param 的属性？按常理它应当与 tagname 属同一级别，即应属前者，但现在是按后者处理。
				 */
				var sequenceId = params ? params.sequenceId : undefined;  // _.noop() returns undefined
				var 
					upons     = _ME.fn('find', tagname, _ME.SN.UPON),
					posts     = _ME.fn('find', tagname, _ME.SN.POST),
					callbacks = _ME.fn('find', tagname, sequenceId );
				var abort = false;

				// 继承一个古老的容错处理。
				// @TODO 自 Lizard 2.1 起不再支持该容错处理。
				var extFn;
				if (W.Lizard && W.Lizard.version == '2.0') {
					extFn = W.Lizard.facadeMethods;
					if (extFn) extFn = extFn[tagname];
					if (typeof extFn == 'function') callbacks = callbacks.concat(extFn);
					else extFn = undefined;
				}

				if (upons.length + callbacks.length) {
					// 参数后处理：此处“后”的意思是指在调用 Hybrid API 之后，相对于回调函数，它们是“预”处理方法。
					// 如果扣处理函数抛出异常，将中止后续预处理函数及回调函数的执行。
					_.find(posts, function(fn) { 
						try { params = fn(params, err); }
						catch (ex) { return _ME.abort(ex); }			
					});

					var fnTry = function(sequenceId, callback) { 
						_ME.fn('try', tagname, sequenceId, callback);
						return abort = callback(params, err) === false;
					};

					// 执行全局回调
					// 如果回调函数返回 false，将中止后后续回调函数的执行。
					if (!abort) _.find(upons, function(callback) { return fnTry(_ME.SN.UPON, callback); });

					// 执行回调
					// 如果回调函数返回 false，将中止后后续回调函数的执行。
					if (!abort) _.find(callbacks, function(callback) { return fnTry(sequenceId, callback); });

					// 如果仅有 extFn 方法时，应返回 undefined，此时不会终止 Native 默认功能的执行。
					return (extFn && upons.length + callbacks.length == 1) ? undefined : true;
				}

				// 明确一点：如果参数应该是一个集合，那么它就必须是一个集合！
				// 换言之，用户不必在回调函数中作 if (params && params.somthing) 这样的容错处理，可以直接判断 if (params.somthing)。
				// 除非，在定义回调函数的时候，就已明知（根据 API Docs for: Ctrip Hybrid Javascript Lib）返回值可能是 undefined。

				// 无匹配回调函数时，返回 undefined。
				// return true;
			};
		}),

		/**
		 * 注册方法，将回调函数与方法标签名（Hybrid）和顺序号（如有）绑定。
		 * @see cHybridShell.on
		 *
		 * @method cHybridShell.on
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {string}         [sequenceId]  顺序号，并行调用同一 HybridAPI 方法且需要反馈时必须指定顺序号
		 * @param  {function}        callback     回调函数
		 */
		on: function(tagname, sequenceId, callback) {
			_ME.fn('on', tagname, sequenceId, callback);
			return this;
		},

		/**
		 * 注册方法，将回调函数与方法标签名（Hybrid）和顺序号（如有）绑定。
		 * 该方法被回调后即销毁！
		 * @see cHybridShell.on
		 *
		 * @method cHybridShell.on
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {string}         [sequenceId]  顺序号，并行调用同一 HybridAPI 方法且需要反馈时必须指定顺序号
		 * @param  {function}        callback     回调函数
		 */
		once: function(tagname, sequenceId, callback) {
			_ME.fn('once', tagname, sequenceId, callback);
			return this;
		},

		/**
		 * 注册预处理方法，在发起对 HybridAPI 的请求之前执行，可用于对请求实参进行预处理。
		 * 预处理方法的返回值为实参数组（如未处理，请返回原始实参数组 arguments）。
		 * 如果预处理方法抛出指定错误（调用 cHybridShell.abort() 方法），则中止后续预处理，并且将阻断对 Hybrid API 的请求。
		 *
		 * @method cHybridShell.preTreat
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {function}        pretreat     预处理函数
		 */
		preTreat: function(tagname, pretreater) {
			_ME.fn('on', tagname, _ME.SN.PRE, pretreater);
			return this;
		},

		/**
		 * 注册后处理方法，在执行回调函数前执行，在执行中可修改回调参数实参内容。
		 * 后处理方法的返回值为实参数组（如未处理，请返回原始实参数组 arguments）。
		 * 如果后处理方法抛出指定错误（调用 cHybridShell.abort() 方法），则中止执行后续后处理方法和所有回调函数。
		 * @see cHybridShell.on 
		 *
		 * @method cHybridShell.postTreat
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {function}        posttreater  后处理函数，可用于对返回参数集进行预处理。
		 */
		postTreat: function(tagname, posttreater) {			
			_ME.fn('on', tagname, _ME.SN.POST, posttreater);
			return this;
		},

		/**
		 * 取消方法注册。
		 * @method cHybridShell.off
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {string}         [sequenceId]  顺序号，并行调用同一方法时可能需要指定顺序号
		 * @param  {function}        callback     回调函数
		 * @return {function}                     对应的 HybridAPI 函数句柄
		 */
		off: function(tagname, sequenceId, callback) {
			// 取消回调函数登记
			_ME.fn('off', tagname, sequenceId, callback);
			return this;
		},

		/**
		 * 注册方法，将回调函数与方法标签名（Hybrid）绑定。
		 * 当多个回调函数并存时：
		 *   ⑴ 按注册的先后顺序执行；
		 *   ⑵ 回调函数返回 false 将阻断后续回调函数的执行。
		 *
		 * upon vs on 
		 *   ⑴ 前者在关于任意顺序号的回调中都将被执行；
		 *   ⑵ 前者执行顺序上优先于后者（包括默认顺序号绑定的监听函数）。
		 *
		 * on vs once
		 *   ⑴ 前者可以被多次回调（无论是在一次请求或多次请求中）；
		 *   ⑵ 后者只能被回调一次。
		 *
		 * preTreat vs postTreat
		 *   ⑴ 前者将在任意回调函数之前执行，换言之，如果没有注册回调函数，则 posttreater 也不会被执行；
		 *   ⑵ 前者可以改变回调函数的实参。
		 *
		 * @method cHybridShell.upon
		 * @param  {string}          tagname      方法标签名（Hybrid）
		 * @param  {function}        callback     回调函数 ({}, [, Error])
		 */
		upon: function(tagname, callback) {
			_ME.fn('on', tagname, _ME.SN.UPON, callback);
			return this;
		},

		// Fn: (function() {
		// 	var tagname, sequenceId;
		// 	return function(T, S, callback) {
		// 		if (this === exports) return new this.Fn(T, S, callback);

		// 		tagname = T;
		// 		if (callback || typeof S != 'function') sequenceId = S;
		// 		exports.once(T, S, callback);

		// 		var that = this;
		// 		_.each(['on', 'once', 'off'], function(action) {
		// 			that[action] = function(callback) {
		// 				exports[action](tagname, sequenceId, callback);
		// 				return this;
		// 			};
		// 		});

		// 		this.run = function() {
		// 			_ME.apiFn(tagname).apply(null, arguments);
		// 			return this;
		// 		};
		// 	};
		// })()
		
		Fn: (function() {
			var tagname, sequenceId, sidIndex;
			return function(T, callback) {
				if (this === exports) return new this.Fn(T, callback);

				tagname = T;

				// 拥有序列号参数，意味着该方法支持并发。
				sidIndex = HYBRID.fninfo(tagname).sidIndex;

				// 自动生成序列号
				if (_.isNumber(sidIndex)) sequenceId = _ME.SN.gen();

				// 如果方法不支持并发，则清除所有此前注册的方法（不包括全局注册），以避免冲突。
				else exports.off(T);

				exports.once(T, sequenceId, callback);

				_.each(['on', 'once', 'off'], function(action) {
					this[action] = function(callback) {
						exports[action](tagname, sequenceId, callback);
						return this;
					};
				}, this);

				this.run = function() {
					var args = arguments;

					// 在实参中插入序列号至预定位置。
					// 如实参数目不足，将以 undefined 值递补。
					if (_.isNumber(sidIndex)) {
						args = [];
						for (var i = 0, n = Math.max(sidIndex + 1, arguments.length); i < n; i++) {
							if (i == sidIndex) args.push(sequenceId);
							args.push(arguments[i]);
						}
					}					
					_ME.apiFn(tagname).apply(null, args);
					return this;
				};
			};
		})()
	};

	// var Fn = function(tagname, sequenceId, callback) {
	// 	// 兼容：可作为普通函数调用，仍创建并返回对象实例。
	// 	if (this === exports) return new Fn(tagname, sequenceId, callback);

	// 	this.tagname = tagname;
	// 	if (callback || typeof sequenceId != 'function') this.sn = sequenceId;
	// 	exports.once(tagname, sequenceId, callback);
	// };
	// _.extend(Fn.prototype, {
	// 	on: function(callback) {
	// 		exports.on(this.tagname, this.sn, callback);
	// 		return this;
	// 	},
	// 	once: function(callback) {
	// 		exports.once(this.tagname, this.sn, callback);
	// 		return this;
	// 	},
	// 	off: function(callback) {
	// 		exports.off(this.tagname, this.sn, callback);
	// 		return this;
	// 	},
	// 	run: function() {
	// 		_ME.apiFn(this.tagname).apply(null, arguments);
	// 		return this;
	// 	}
	// });
	// exports.Fn = Fn;

	return exports;
});;/**
 * 面向 H5 开发人员，提供调用 HybridAPI 的界面。
 * 此界面为向前兼容而写作，新开发中请尽量直接使用 cHybridShell 中提供的方法。
 * @author jiangjing@ctrip.com （旧版作者 cmli@Ctrip.com）
 * @deprecated since Lizard 2.1 / APP 6.0
 * @see cHybridShell
 */
define('cHybridFacade',['cHybridShell', 'cCommonStore'], function(cHybridShell, CommonStore) {
	'use strict'

	// 针对每一个方法索引名：
	// ⑴ 在旧版本中，所有 cHybridFacade.request() 调用均以参数集合为为唯一参数，因此：
	//    如果方法索引名对应的 Hybrid API 方法需要参数，请将其对应的参数集合键值按顺序放在 argnames 数组中；
	// ⑵ 如果方法标签名（Hybrid）无法由方法索引名按约定规则生成，请用 tagname 属性指示其正确的方法标签名（Hybrid）；
	// ⑶ 如果方法参数需要特殊处理，请指定 parseArgs 函数；
	// ⑷ 如果方法回调函数需要特殊处理，请指定 parseCallback 函数。

	// e.g. 
	//   INDEX_NAME: { 
	//     // 匹配的方法标签名（Hybrid）
	//     tagname: 'TAG_NAME', 
	//
	//     // 参数表，顺序应与 Hybrid API 方法形参一致，以下假设 options 为 cHybridFacade.request(options) 实参。
	//     argnames: [ 
	//       // 该位置实参将取值 options.p1
	//       'p1',
	//       // 该位置实参将忽略 options，直接取值为 1000
	//       [ 1000 ],
	//       // 若 option.p3 为非真值，该位置实参取值为 0 
	//       { p3: 0 },
	//       // 将 options.p4 作为函数参数，取返回值为该位置实参
	//       { p4: function(value) { if (!value) return 1000; } }
	//     ],
	//     
	//     // Hybrid API 将以该方法的返回值为实参
	//     parseArgs: function(options) { return options; },
	//     
	//     // 回调函数预处理
	//     parseCallback: function(options) { return function() {}; } //
	//   },
	var METHOD_INFO = {
		ABORT_HTTP_PIPE_REQUEST             : { argnames: [ 'sequenceId' ] },
		ADD_WEIXIN_FRIEND                   : {},
		APP_CALL_SYSTEM_SHARE               : { argnames: [ 'imageRelativePath', 'text', 'title', 'linkUrl', 'isIOSSystemShare' ] },
		APP_CHECK_ANDROID_PACKAGE_INFO      : {},
		APP_CHECK_NETWORK_STATUS            : {},
		APP_CHOOSE_INVOICE_TITLE            : { argnames: [ 'title' ] },
		APP_CHOOSE_PHOTO                    : { argnames: [ {maxFileSize: 200}, {maxPhotoCount: 1}, {meta: { canEditSinglePhoto: false }} ] },
		APP_FINISHED_LOGIN                  : { argnames: [ 'userInfo' ] },
		APP_FINISHED_REGISTER               : { argnames: [ 'userInfo' ] },
		APP_GET_DEVICE_INFO                 : {},
		APP_LOG_GOOGLE_REMARKTING           : { argnames: [ {url: function() { return window.location.href; }} ] },
		APP_NETWORK_DID_CHANGED             : {},
		APP_READ_VERIFICATION_CODE_FROM_SMS : {},
		APP_SHOW_MAP_WITH_POI_LIST          : { tagname: 'show_map_with_POI_list', argnames: [ 'poiList' ] },
		APP_SHOW_VOICE_SEARCH               : { argnames: [ 'bussinessType' ] },
		AUTO_LOGIN                          : { tagname: 'member_auto_login' },
		BACK                                : {},
		BACK_TO_BOOK_CAR                    : {},
		BACK_TO_HOME                        : {},
		BACK_TO_LAST_PAGE                   : { argnames: [ {param: ''} ] },
		BECOME_ACTIVE                       : {},
		CALL_PHONE                          : { argnames: [ 'tel' ] },

	    // @todo 不需要提供电话号码吗？//add by byl 12/01 此处添加callphone的两个参数
	    CALL_SERVICE_CENTER                 : {  argnames: [ { tel : ''},{ pageId : ''},{ businessCode : ''}  ],tagname: 'call_phone' },

		CHECK_APP_INSTALL                   : { tagname: 'check_app_install_status', argnames: [ 'url', 'package' ] },
		CHECK_FILE_EXIST                    : { argnames: [ 'fileName', 'relativeFilePath' ] },
		CHECK_PAY_APP_INSTALL_STATUS        : {},
		CHECK_UPDATE                        : {},
		CHOOSE_CONTACT_FROM_ADDRESSBOOK     : {},
		CITY_CHOOSE                         : { tagname: 'cityChoose' },
		COMMIT                              : {},
		COPY_TO_CLIPBOARD                   : { tagname: 'copy_string_to_clipboard', argnames: [ 'content' ] },
		CROSS_DOMAIN_HREF                   : { argnames: [ 'moduleType', 'anchor', 'param' ] },
		CROSS_JUMP                          : { tagname: 'cross_package_href', argnames: [ 'path', 'param' ] },
		DELETE_FILE                         : { argnames: [ 'fileName', 'relativeFilePath' ] },
		DOWNLOAD_DATA                       : { argnames: [ 'url', 'suffix' ]},
		ENABLE_DRAG_ANIMATION               : { argnames: [ 'show' ] },
		ENCRYPT_BASE64                      : { tagname: 'base64_encode', argnames: [ 'info' ] },
		ENCRYPT_CTRIP                       : { tagname: 'ctrip_encrypt', argnames: [ 'inString', 'encType' ] },

		// @deprecated
		ENTRY                               : {}, 

		FAVORITE                            : {},
		FAVORITED                           : {},
		GET_CURRENT_SANDBOX_NAME            : {},
		GET_FILE_SIZE                       : { argnames: [ 'fileName', 'relativeFilePath' ] },
		GO_TO_BOOK_CAR_FINISHED_PAGE        : { argnames: [ 'url' ] },
		GO_TO_HOTEL_DETAIL                  : { argnames: [ 'hotelId', 'hotelName', 'cityId', 'isOverSea' ] },
		H5_NEED_REFRESH                     : {},
		H5_PAGE_FINISH_LOADING              : {},
		HIDE_LOADING_PAGE                   : {},
		INIT                                : { tagname: 'init_member_H5_info' },

		LOCATE                              : { 
			argnames: [ [3000], [true] ], 
			parseCallback: function(options) {
				return function(params) {
					try { options.success(params); } catch (ex) { options.error(params); }
				};
			}
		},

		LOG_EVENT                           : { argnames: [ 'event_name' ] },
		MAKE_DIR                            : { argnames: [ 'dirname', 'relativeFilePath' ] },
		MEMBER_LOGIN                        : { argnames: [ 'isShowNonMemberLogin' ] },
		NATIVE_LOG                          : { tagname: 'log' },
		NON_MEMBER_LOGIN                    : {},
		OPEN_ADV_PAGE                       : { argnames: [ 'url' ] },
		OPEN_PAY_APP_BY_URL                 : { argnames: [ 'payAppName', 'payURL', 'successRelativeURL', 'detailRelativeURL' ] },
		OPEN_URL                            : { argnames: [ 'openUrl', 'targetMode', {title: ''}, {pageName: ''}, {isShowLoadingPage: false}] },
		PHONE                               : {},
		READ_FROM_CLIPBOARD                 : { tagname: 'read_copied_string_from_clipboard' },
		READ_TEXT_FROM_FILE                 : { argnames: [ 'fileName', 'relativeFilePath' ] },
		RECOMMEND_APP_TO_FRIEND             : { tagname: 'recommend_app_to_friends' },
		REFRESH_NATIVE                      : { tagname: 'refresh_native_page', argnames: [ 'package', 'json' ] },
		REFRESH_NAV_BAR                     : { argnames: [ 'config' ] },
		REGISTER                            : { tagname: 'member_register' },
		SAVE_PHOTO                          : { argnames: [ 'photoUrl', 'photoBase64String', 'imageName' ] },
		SEARCH                              : {},
		SEND_H5_PIPE_REQUEST                : { argnames: [ 'serviceCode', 'header', 'data', 'sequenceId', {pipeType: ''} ] },
		SEND_HTTP_PIPE_REQUEST              : { argnames: [ 'target', 'methods', 'header', 'queryData', 'retryInfo', 'sequenceId' ] },
		SET_NAVBAR_HIDDEN                   : { argnames: [ 'isNeedHidden' ] },
		SET_TOOLBAR_HIDDEN                  : { argnames: [ 'isNeedHidden' ] },
		SHARE                               : {},
		SHARE_TO_VENDOR                     : { tagname: 'call_system_share', argnames: [ 'imgUrl', 'text', {title: ''}, {linkUrl: ''}, {isIOSSystemShare: false} ] },
		SHOW_LOADING_PAGE                   : {},
		SHOW_MAP                            : { argnames: [ 'latitude', 'longitude', 'title', 'subtitle' ] },
		SHOW_NEWEST_INTRODUCTION            : {},
		WEB_VEW_DID_APPEAR                  : { tagname: 'web_view_did_appear' },
		WEB_VIEW_DID_APPEAR                 : {},
		WEB_VIEW_FINISHED_LOAD              : {},
		WRITE_TEXT_TO_FILE                  : { argnames: [ 'text', 'fileName', 'relativeFilePath', 'isAppend' ] } 
	};

	var _ME = {
		methodInfo: function(name) {
			var info = METHOD_INFO[name];

			// 如未指定匹配的方法标签名（Hybrid），则按默认规则自动生成。
			if (!info.tagname) {
				info.tagname = name.toLowerCase().replace(/^app_/, '');
			}

			return info;
		},

		// 方法索引名转换成方法标签名（Lizard）
		name2var: function(name) { return 'METHOD_' + name; },

		// 方法标签名（Lizard）转换成方法索引名
		var2name: function(varname) { return varname.substr(7); },

		var2tagname: function(varname) {
			var name = _ME.var2name(varname), info = _ME.methodInfo(name);
			return info.tagname;
		}
	};

	var exports = {
		/**
		 * 初始化。
		 * @singleton
		 */
		init: function() {
			var _me = exports.init;
			if (_me.called) return; _me.called = true;
			
			// 执行初始化。
			cHybridShell.init();

			// 按 cHybridFacade 在程序架构中的角色，它的任务应是忠实地代理 Hybrid API，而不应介入业务逻辑处理。
			// 如确需作全局处理，应在其他特定的工具类中进行封装。
			var callback, pretreater, posttreater;

			pretreater = function(log, result) {
				if (!window.localStorage.getItem('isPreProduction')) cHybridShell.abort();
				return [ '@[Wireless H5] ' + log, result ];
			};
			cHybridShell.preTreat('log', pretreater);

			callback = function(params) {
				if (params && params.data) {
					var userStore = CommonStore.UserStore.getInstance();
					var userInfo = userStore.getUser();
					userStore.setUser(params.data);

					var headStore = CommonStore.HeadStore.getInstance();
					var headInfo = headStore.get();
					headInfo.auth = params.data.Auth;
					headStore.set(headInfo);
				}
			};
			cHybridShell
				.upon('init_member_H5_info', callback)
				.upon('member_auto_login'  , callback)
				.upon('member_login'       , callback)
				.upon('member_register'    , callback)
				.upon('non_member_login'   , callback);

			callback = function(params) {
				if (typeof params == 'undefined') return;

				var store = {
					SERVERDATE      : params.timestamp       ,
					SOURCEID        : params.sourceId        ,
					isPreProduction : params.isPreProduction 
				};

				if (params.device) {
					store.DEVICEINFO = JSON.stringify({ device: params.device });
				}   
				
				if (params.appId) {
					store.APPINFO = JSON.stringify({
						version       : params.version,
						appId         : params.appId,
						serverVersion : params.serverVersion,
						platform      : params.platform
					});
				}

				_.each(store, function(value, key) {
					if (value) window.localStorage.setItem(key, value);
				});
			};
			cHybridShell.upon('init_member_H5_info', callback);

			// 主动获取网络状态，并保持监听。
			callback = function(params) { Lizard.networkType = params.networkType; };
			cHybridShell
				.on('network_did_changed', callback)
				.fn('check_network_status', callback)();

			// 有些回调函数的开发人员认为错误代码应在主参数集中取得。
			posttreater = function(params, err) {
				if (!params) params = {};
				if (err) params.error_code = err.number;
				return params;
			};
			cHybridShell.postTreat('save_photo', posttreater);
		},

		/**
		 * @deprecated since Lizard 2.1 / APP 6.0
		 */
		getOpenUrl: function(options) {
			var url = (Internal && Internal.isYouthApp ? 'ctripyouth' : 'ctrip') + '://wireless/' + options.module + '?';
			var params = [];
			for (var i in options.param) params.push(i + '=' + options.param[i]);
			return url + params.join('&');
		},

		/**
		 * 注册方法，绑定指定的回调函数，使与 Hybrid 约定的全局回调函数能够适时地通过 window.app.callback() 调用该回调函数。
		 * 本方法是调用 Hybrid 方法前的预处理，并不会实际调用任何 Hybrid 内置方法。
		 * 特别注意：本方法参数集合中的 tagname 并不是 unix_style 而是 METHOD_UNIX_STYLE。
		 * @method cHybridFacade.register
		 * @param  {object}   options               参数集合
		 * @param  {string}   options.tagname       方法标签名（Lizard）
		 * @param  {function} options.callback      回调函数
		 * @deprecated since Lizard 2.1 / APP 6.0
		 */
		register: function(options) {
			// 因为上述的特别注意，故删除
			// cHybridShell.on(options.tagname, options.sequenceId, options.callback);

			// 有些意外的情况，程序员会不先调用 registerOne() 而直接使用 register() 为一个自定义功能注册回调函数，
			// 此时，var2tagname() 方法会报错。
			try {
				var tagname = _ME.var2tagname(options.tagname);
			} catch (ex) { return; }  // 在旧版中，遇此类情况不作为，不报错！

			cHybridShell
				.off(tagname, options.sequenceId)
				.on(tagname, options.sequenceId, options.callback);
		},

		/**
		 * 方法注册前预处理。
		 *
		 * @method cHybridFacade.registerOne
		 * @param  {string}   varname               方法标签名（Lizard）
		 * @param  {string}   [tagname]             方法标签名（Hybrid）
		 * @deprecated since Lizard 2.1 / APP 6.0
		 */
		// 在旧版中，该方法用于生成一个注册方法（用于完成方法注册的方法），以 tagname 为索引保存在 defaultRegisterHandler 中。
		// 该注册方法被调用时：
		// ⑴ 将生成一个间接回调方法，以 tagname 和 sequenceId 为索引保存在 defaultHandler 中；
		// ⑵ 将用户提供的回调函数，以 tagname 和 sequenceId 为索引保存在 defaultCallback 中。
		registerOne: function(varname, tagname) {
			METHOD_INFO[_ME.var2name(varname)] = { tagname: tagname };
		},

		/**
		 * 调用方法（通常需设定一个或多个回调函数）。
		 * @method cHybridFacade.request
		 * @param  {object}   options               参数集合
		 * @param  {string}   options.name          方法标签名（Hybrid）
		 * @param  {MIXED}    options.*             其他参数视具体方法而定
		 */
		request: function(options) {
			var info = _ME.methodInfo(_ME.var2name(options.name));      

			// ⑵ 处理参数；
			var args = [];
			if (info.parseArgs) args = info.parseArgs(options);
			else if (info.argnames) {
				_.each(info.argnames, function(argname) {
					var arg;
					if (_.isString(argname)) arg = options[argname];
					else if (_.isArray(argname)) arg = argname[0];
					else {
						var p = _.pairs(argname)[0], t = typeof p[1];
						arg = options[p[0]];
						if (typeof p[1] == 'function') arg = p[1](arg);
						else if (!arg) arg = p[1];
					}
					args.push(arg);
				});
			}
			
			// ⑴ 处理回调函数；
			var callback = info.parseCallback ? info.parseCallback(options) : options.callback;

			// ⑶ 通过代理方法发起对 Hybrid API 的请求。
			cHybridShell
				.off(info.tagname, options.sequenceId)
				.fn(info.tagname, options.sequenceId, callback).apply(null, args);
		},

		/**
		 * 解除方法注册。
		 * @method cHybridFacade.unregister
		 * @param  {object}   options               参数集合
		 * @param  {string}   options.tagname       方法标签名（Hybrid）
		 * @deprecated since Lizard 2.1 / APP 6.0
		 */
		/**
		 * 解除方法注册。
		 * @method cHybridFacade.unregister
		 * @param  {string}   tagname               参数集合
		 * @deprecated since Lizard 2.1 / APP 6.0
		 */
		unregister: function(tagname) {
			// 参数兼容
			if (typeof arguments[0] == 'object') tagname = arguments[0].tagname;
			
			// 取消回调函数登记
			cHybridShell.off(tagname);
		}
	};
	
	// 初始化常量定义
	_.each(METHOD_INFO, function(info, name) {
		var varname = _ME.name2var(name);
		exports[varname] = varname;
	})
	
	return exports;
});;/**
 * @description 与hybrid 相关的操作
 * @File c.hybrid.guider
 * @author shbzhang@ctrip.com
 * @date  2014-09-22 13:47:55
 * @version V1.0
 */
/**
 * @descrption 与hybrid 相关的操作
 */
define('cHybridGuider',['cHybridFacade', 'cHybridShell'], function (Facade, Hish) {
  "use strict";

  var HybridGuider = {
    /**
     * @description Hybrid页面，打开链接URL地址，兼容App和浏览器
     * @method Service.cGuiderService.jump
     * @param {object} options 输入参数
     * @example
     * 参数：
     * {
     *    targetModel：refresh，//{String }refresh|app|h5|browser|open|open_relative
     *    title:"",// {String} 标题栏 当targetModel = 'h5'    时，新打开的H5页面的title
     *    url:''  ,  // {String } 需要打开的URL，可以为ctrip://,http(s)://,file://等协议的URL
     *    pageName:'' , //{String} 当targetModel = 'refresh'|'h5'|'open'时，本页面，或者新打开的H5页面，此时pageName有效，pageName当作H5页面唯一标识，可用于刷新页面；5.6版本加入
     *    isShowLoadingPage:false  //{boolean} 开启新的webview的时候，是否加载app的loading
     * }
     */
    jump: function (options) {
      var model = {
        refresh: function () {
          Facade.request({ name: Facade.METHOD_OPEN_URL, targetMode: 0, title: options.title, pageName: options.pageName });
        },
        app: function () {
          if (options && options.module) {
            var openUrl = Facade.getOpenUrl(options);
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: openUrl, targetMode: 1, title: options.title, pageName: options.pageName });
          } else if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 1, title: options.title, pageName: options.pageName });
          }
        },
        h5: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 2, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        browser: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 3, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        open: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 4, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        },
        open_relative: function () {
          if (options && options.url) {
            Facade.request({ name: Facade.METHOD_OPEN_URL, openUrl: options.url, targetMode: 5, title: options.title, pageName: options.pageName, isShowLoadingPage: options.isShowLoadingPage});
          }
        }
      };

      if (typeof model[options.targetModel] === 'function') {
        model[options.targetModel]();
      }
    },

	  /**
	   * 根据环境不同执行不同的函数分支
	   * @method Service.cGuiderService.apply
	   * @param {Object} options 输入参数
     * @param {function} [options.hybridCallback] hybrid环境下的执行函数
     * @param {function} [options.callback] web环境下的执行函数
	   * @example
	   * //参数
	   * {
	   *   hybridCallback：function(){}
	   *  }
	   */
    apply: function (options) {
      if (_.isObject(options) && _.isFunction(options.hybridCallback)) {
        options.hybridCallback();
      }
    },

	  /**
	   * @description  进入H5模块，初始化数据 H5接收到web_view_did_finished_load的回调之后，调用该函数，初始化数据会通过callback传递给H5
	   * @method Service.cGuiderService.init
	   * @param {object} options 输入参数
     * @param {function} options.callback 回调
	   * @example
	   * //参数：
	   * {
	   *    version:5.8，callback:function(){}
	   * }
	   */
    init: function (options) {
      if (options && window.parseFloat(options.version) < 5.2) {
        Facade.request({ name: Facade.METHOD_ENTRY, callback: options.callback });
      } else {
        Facade.request({ name: Facade.METHOD_INIT, callback: options.callback });
      }
    },

	  /**
	   * @description,上传日志至服务端, H5页面调用该函数，需要将增加的event_name告知native，native需要整理纪录
	   * @method Service.cGuiderService.log
	   * @param {object} options 输入参数
     * @param {string} name 日志
	   * @example
	   * //参数：
	   * {name:""}
	   */
    log: function (options) {
      Facade.request({ name: Facade.METHOD_LOG_EVENT, event_name: options.name });
    },

	  /**
	   * @description 将log写入到native的日志界面
	   * @method Service.cGuiderService.print
	   * @param {object} options 输入参数
     * @param {string} options.log 需要打印打log
     * @param {string} [options.result] 上一句log执行的结果，可以为空,打印的时候会自动换行，加入时间
	   * @example
	   * //参数：
	   * {log:"",result:""}
	   */
    print: function (options) {
      Facade.request({ name: Facade.METHOD_NATIVE_LOG, log: options.log, result: options.result });
    },

	  /**
	   * @description 拨打ctrip呼叫中心号码
	   * @method Service.cGuiderService.callService
     * @param {object} opt 参数
     * @param {string} [opt.tel] 电话号码,如果不传,使用渠道包的默认号码
     * @param {pageid} [opt.businessCode] 业务号码
     * @param [pageId] [opt.pageId] ubt pageId,hybrid下默认取view.hpageid
	   */
    callService: function (options) {
     //add by byl 在此处添加pageid以及businessCode参数
     var curView;
     if(Lizard && Lizard.instance && Lizard.instance.curView){
       curView = Lizard.instance.curView;
     }
     if(curView && curView.businessCode){
       Facade.request({ name: Facade.METHOD_CALL_SERVICE_CENTER, tel: (options && options.tel) || '', pageId : curView.hpageid || '', businessCode : curView.businessCode || '' });
     }else{
       Facade.request({ name: Facade.METHOD_CALL_SERVICE_CENTER });
     }
    },

	  /**
	   * @description 退回到H5页面的上一个页面，离开H5. v5.3开始支持带参数给上一个H5页面
	   * @method Service.cGuiderService.backToLastPage
	   * @param {Object} options 输入参数
     * @param {object} options.param 参数
     * @since v5.3
	   * @example
	   * //参数：
	   * {
	   *    param:Object //跳转到上一个页面的参数
	   * }
	   */
    backToLastPage: function (options) {
      var param = options ? options.param : '';
      Facade.request({ name: Facade.METHOD_BACK_TO_LAST_PAGE, param: param });
    },

	  /**
	   * @description 检查App的版本更新
	   * @method Service.cGuiderService.checkUpdate
	   */
    checkUpdate: function () {
      Facade.request({ name: Facade.METHOD_CHECK_UPDATE });
    },

	  /**
	   * @description 推荐携程旅行给好友
	   * @method Service.cGuiderService.recommend
	   */
    recommend: function () {
      Facade.request({ name: Facade.METHOD_RECOMMEND_APP_TO_FRIEND });
    },

	  /**
	   * @description 添加微信好友
	   * @method Service.cGuiderService.addWeixinFriend
	   */
    addWeixinFriend: function () {
      Facade.request({ name: Facade.METHOD_ADD_WEIXIN_FRIEND });
    },

	  /**
	   *  @description 查看最新版本功能介绍
	   *  @method Service.cGuiderService.showNewestIntroduction
	   */
    showNewestIntroduction: function () {
      Facade.request({ name: Facade.METHOD_SHOW_NEWEST_INTRODUCTION });
    },

	  /**
	   * @description 自定义注册需要hybrid回调执行的方法（确保此方法会在hybrid中执行，不然不会执行回调函数
	   * @method Service.cGuiderService.register
	   * @param {Object} options 输入参数
     * @param {string} options.tagname 事件名
     * @param {string} options.callback 回调
	   * @example
	   * //参数:
	   * {tagname:"non_member_login",callback:function(){}}
	   */
    register: function (options) {
      if (options && options.tagname && options.callback) {
        Facade.register({ tagname: options.tagname, callback: options.callback });
      }
    },

	  /**
	   * @description 进入H5模块，初始化数据 H5接收到web_view_did_finished_load的回调之后，调用该函数，初始化数据会通过callback传递给H5
	   * @method Service.cGuiderService.create
	   */
    create: function () {
      Facade.init();
    },

	  /**
	   * @description 退回到首页，离开H5
	   * @method Service.cGuiderService.home
	   */
    home: function () {
      Facade.request({ name: Facade.METHOD_BACK_TO_HOME });
    },


	  /**
	   * @description 检查是否安装App
	   * @method Service.cGuiderService.checkAppInstall
	   * @param {Object} options 输入参数
     * @param {string} options.url 尝试打开的URL
     * @param {string} options.callback 返回检查的回调
	   * @example
	   * //参数:
	   * {
	   *    url:"ctrip://wireless", //尝试打开的URL
	   *    packageName:"com.ctrip.view" //app的包名，android使用
	   *    callback: function(data){ //回调数据：
	   *      var data =  {
	   *       isInstalledApp:false //布尔值返回是否有安装
	   *      }
	   *    }
	   */
    checkAppInstall: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_APP_INSTALL, url: options.url, package: options.package, callback: options.callback });
    },

	  /**
	   * @description 拨打电话
	   * @method Service.cGuiderService.callPhone
	   * @param {Object} options 输入参数
     * @param {object} options.tel  电话号码
	   * @example
	   * //参数：
	   *  {
	   *    tel:"13800138000"
	   *  }
	   */
    callPhone: function (options) {
      Facade.request({ name: Facade.METHOD_CALL_PHONE, tel: options.tel });
    },

	  /**
	   * @description H5跨模块/站点跳转
	   * @method Service.cGuiderService.cross
	   * @param {Object} options 输入参数
     * @param {string} options.path 模块名称，如hotel, car, myctrip,
     * @param {string} optiosn.param  作为URL，拼接在path后面的页面和其它参数 index.html#cashcouponindex?cash=xxxx
	   * @example
	   * //参数：
	   * {
	   *    param:"index.html#cashcouponindex?cash=xxxx",
	   *    path:"myctrip"
	   * }
	   */
    cross: function (options) {
      Facade.request({ name: Facade.METHOD_CROSS_JUMP, param: options.param, path: options.path });
    },

	  /**
	   * @description H5通知Native刷新
	   * @method Service.cGuiderService.refreshNative
	   * @param {Object} options 输入参数
     * @param {string} package 要刷新的页面名字,该字段需要H5和native共同约定，H5调用之后，native需要捕获该名字的boardcast/notification
     * @param {string} json //刷新该页面需要的参数
	   * @example
	   * //参数：
	   * {
	   *    pakage:"xxxxPageName"
	   *    json:"xxxx_json_string"
	   * }
	   */
    refreshNative: function (options) {
      Facade.request({ name: Facade.METHOD_REFRESH_NATIVE, package: options.package, json: options.json });
    },

	  /**
	   * @description 复制文字到粘贴板
	   * @method Service.cGuiderService.copyToClipboard
	   * @param {Object} options 输入参数
     * @param {string} options.content 文字内容
	   * @example
	   * //参数：
	   * {
	   *    content:"" // String 需要复制的文字
	   * }
	   */
    copyToClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_COPY_TO_CLIPBOARD, content: options.content });
    },
	  /**
	   * @description 从粘贴板读取复制的文字
	   * @method Service.cGuiderService.readFromClipboard
	   * @param {Object} options 输入参数
     * @param {function} callback 读取后回调
	   * @example
	   * //参数：
	   * {
	   *    callback:function(content){
	   *      //content 回调函数
	   *    }
	   * }
	   */
    readFromClipboard: function (options) {
      Facade.request({ name: Facade.METHOD_READ_FROM_CLIPBOARD, callback: options.callback });
    },

	  /**
	   * @description 调用App的分享
	   * @method Service.cGuiderService.shareToVendor
	   * @param {Object} options 输入参数
     * @param {string} options.imgUrl 将要分享的图片相对路径，相对webapp的路径
     * @param {string} options.text 需要分享的文字,微博分享文字限制在140
     * @param {string} options.title 需要分享的标题, v5.4开始支持该字段，微信和email支持
     * @param {string} options.linkUrl 需要分享的链接, v5.4开始支持该字段
     * @param {boolean} options.isIOSSystemShare 是否支持IO6系统
	   * @example
	   * //参数：
	   * {
	   *    imgUrl:'',
	   *    text:'',
	   *    title:'',
	   *    linkUrl:','
	   *    isIOSSystemShare:false //是否是ios系统
	   * }
	   */
    shareToVendor: function (options) {
      Facade.request({ name: Facade.METHOD_SHARE_TO_VENDOR, imgUrl: options.imgUrl, text: options.text, title: options.title, linkUrl: options.linkUrl, isIOSSystemShare: options.isIOSSystemShare });
    },

	  /**
	   * @description 根据URL下载数据
	   * @method Service.cGuiderService.downloadData
	   * @param {Object} options 输入参数
     * @param {string} options.url 下载url
     * @param {string} options.suffix 需要保存文件
     * @param {boolean} [options.isIgnoreHttpsCertification=false] 是否忽略非法的HTTPS证书
     * @param {string} options.callback 回调
	   * @example
	   * //参数：
	   * {
	   *    url:"",//需要下载内容的URL
	   *    //data.downloadUrl 下载地址
	   *    //data.savedPath 保存地址
	   *    //data.isSuccess 是否成功
	   *    //error_code 错误码 param_error/download_fail
	   *    callback:function(data, error_code){
	   *      data = {
	   *
	   *      },
	   *      error_code  //错误码
	   *    },
	   *    suffix:'' //保存文件的后缀
	   * }
	   * //回调参数,此参数成功时只回调param,错误时可获取error_code
	   * //成功：
	   * {
	   *    downloadUrl:"http://www.baidu.com/bdlogo.gif",
	   *    savedPath:"../wb_cache/pkg_name/md5_url_hash", false
	   *  }
	   *  //错误error_code:"xxxxx",//param_error,download_faild
	   */
    downloadData: function (options) {
      Facade.request({ name: Facade.METHOD_DOWNLOAD_DATA, url: options.url, callback: options.callback, suffix: options.suffix });
    },

	  /**
	   * @description base64 UTF8编码
	   * @method Service.cGuiderService.encode
	   * @param {Object} options 输入参数
     * @param {string} options.info 需要做base64 encode的字符串
     * @param {function} options.callback 编码完成后执行的回调方法
	   * @example
	   * //参数：
	   * {
	   *    callback:function(data){}, //编码完成后执行的回调方法
	   *    info:'' //需要做base64 encode的字符串
	   * }
	   * //回调参数：
	   *  {
     *      inString:"xxxxxx", //传入的String
     *      encodedString:"eHh4eHh4", // 编码之后的String
     *  }
	   */
    encode: function (options) {
      if (options && options.mode === 'base64') {
        Facade.request({ name: Facade.METHOD_ENCRYPT_BASE64, callback: options.callback, info: options.info });
      }
    },

	  /**
	   * @description 从通讯录选取联系人
	   * @method Service.cGuiderService.chooseContactFromAddressbook
	   * @param {Object} options 输入参数
     * @param {function} options.callback 选取联系人之后的回调
	   * @example
	   * //回调参数:
	   *{
     *  name:"xxx",
     *  phoneList:[{"家庭":1320000000}, {"工作":021888888888}], //手机号码有一个标签＋号码
     *  emailList:[{"家庭":a@gmail.com}, {"工作":b@yahoo.com}]  //email有标签＋号码
	   *}
	   */
    chooseContactFromAddressbook: function (options) {
      Facade.request({ name: Facade.METHOD_CHOOSE_CONTACT_FROM_ADDRESSBOOK, callback: options.callback });

    },

	  /**
	   * @description 隐藏native的loading界面
	   * @method Service.cGuiderService.hideLoadingPage
	   */
    hideLoadingPage: function () {
      Facade.request({ name: Facade.METHOD_HIDE_LOADING_PAGE });
    },

	  /**
	   * @description 显示native的loading界面
	   * @method Service.cGuiderService.showLoadingPage
	   */
    showLoadingPage: function () {
      Facade.request({ name: Facade.METHOD_SHOW_LOADING_PAGE });
    },

	  /**
	   * @description 选择常用发票title
	   * @method Service.cGuiderService.choose_invoice_title
	   * @param {Object} options 输入参数
     * @param {string} options.title 标题
     * @param {function} options.callback 回调函数
	   * @example
	   * //参数：
	   * {
	   *    callback:function(){},// {function}回调函数
	   *    title:"" // {String} 当前已经选择好的发票title
	   * }
	   * //回调参数：
	   *  {
     *     selectedInvoiceTitle:"所选择的发票title"
     *   }
	   */
    choose_invoice_title: function (options) {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_INVOICE_TITLE, callback: options.callback, title: options.title });
    },

	  /**
	   * @description 获取设备相关信息，相关部门需要
	   * @method Service.cGuiderService.get_device_info
	   * @param {Object} options 输入参数
     * @param {function} options.callback 回调
	   * @example
	   * //回调参数：
	   * {
     *  IP:"",
     *  OS:"\U82f9\U679c",
     *  account:"",
     *  areaCode:"",
     *  baseStation:"",
     *  clientID:12933032900000135327,
     *  latitude:0,
     *  longitude:0,
     *  mac:"10:DD:B1:CF:C1:80",
     *  port:"",
     *  wifiMac:""
     * };
	   */
    get_device_info: function (options) {
      Facade.request({ name: Facade.METHOD_APP_GET_DEVICE_INFO, callback: options.callback });
    },

	  /**
	   * @description 进入语音搜索,5.7版本，语音搜索之后的结果，不需要BU处理，只需调用即可，后续版本，可能只做语音解析，解析结果传递给H5，BU自行处理
	   * @method Service.cGuiderService.show_voice_search
	   * @param {Object} options
     * @param {number} options.bussinessType 业务类型(0. 无（默认）1. 机票 2. 酒店3 . 火车票 5. 目的地 6. 攻略 7.景点门票 8.周末/短途游) 61：团队游 62：周末游 63：自由行 64：邮轮
	   * @example
	   * //参数：
	   * {
	   *    bussinessType:0 //业务类型(0. 无（默认）1. 机票 2. 酒店3 . 火车票 5. 目的地 6. 攻略 7.景点门票 8.周末/短途游) 61：团队游 62：周末游 63：自由行 64：邮轮
	   * }
	   */
    show_voice_search: function (options) {
      Facade.request({ name: Facade.METHOD_APP_SHOW_VOICE_SEARCH, bussinessType: options.bussinessType });
    },

	  /**
	   * @description 选取图片/拍摄照片，base64返回图片
	   * @method Service.cGuiderService.choose_photo
	   * @param {Object} options 输入参数
     * @param {number} [options.maxFileSize=200*1024] 最大的图片文件大小，单位是bit，默认200*1024
     * @param {number} [options.maxPhotoCount=1]  最多支持选择的图片个数,默认为1张，此时不显示多选
     * @param {object} {options.meta} 图片选取相关配置信息，5.8新增，5.8版本开始支持1个key， canEditSinglePhoto:单选能否编辑
     * @param {function} {options.callback} 回调
	   * @example
	   * //参数：
	   * {
	   *    maxFileSize: 200*1024 , //{int} 最大的图片文件大小，单位是bit，默认200*1024
	   *    maxPhotoCount:1,        // {int} 最多支持选择的图片个数,默认为1张，此时不显示多选
	   *    meta:{},                 //{Object} 图片选取相关配置信息，5.8新增，5.8版本开始支持1个key， canEditSinglePhoto:单选能否编辑
	   *    callback:function(data){} //{function} 图片选取后的回调函数
	   * }
	   * //回调参数
	   * {
     *    photoList:["xx089xessewz....", "xx089xessewz...."]
     * }
	   */
    choose_photo: function (options) {
      Facade.request({ name: Facade.METHOD_APP_CHOOSE_PHOTO, maxFileSize: options.maxFileSize, maxPhotoCount: options.maxPhotoCount, meta: options.meta, callback: options.callback });
    },

	  /**
	   * @description H5完成注册，将注册信用户息告知Native，native做登录
	   * @method Service.cGuiderService.finished_register
	   * @param {Object} options 输入参数
     * @param {object} options.userInfo 用户信息
     * @param {string} options.userInfo.userID userID
     * @param {string} options.userInfo.phone phone
     * @param {string} options.userInfo.password password
	   */
    finished_register: function (options) {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_REGISTER, userInfo: options.userInfo });
    },

	  /**
	   * @description 调用app共享
	   * @method Service.cGuiderService.app_call_system_share
	   * @param {Object} options 输入参数
     * @param {string} options.imageRelativePath 将要分享的图片相对路径，相对webapp的路径
     * @param {string} options.text 需要分享的文字,微博分享文字限制在140
     * @param {string} options.title 需要分享的标题, v5.4开始支持该字段，微信和email支持；
     * @param {string} options.linkUrl 需要分享的链接
	   * @example
	   * //参数：
	   * {
	   *    imageRelativePath:'',//将要分享的图片相对路径，相对webapp的路径
	   *    text:'',//需要分享的文字,微博分享文字限制在140
	   *    title:'',//需要分享的标题, v5.4开始支持该字段，微信和email支持；
	   *    linkUrl:'' //需要分享的链接, v5.4开始支持该字段
	   *    isIOSSystemShare:false //是否是ios系统
	   * }
	   */
    app_call_system_share: function (options) {
      Facade.request({ name: Facade.METHOD_APP_CALL_SYSTEM_SHARE, imageRelativePath: options.imageRelativePath,
        text: options.text, title: options.title, linkUrl: options.linkUrl, isIOSSystemShare: options.isIOSSystemShare});
    },

	  /**
	   * @description 检查当前App网络状况
	   * @method Service.cGuiderService.app_check_network_status
	   * @param {Object} options
     * @param {function} options.callback 检查完成后的回调
	   * @example
	   * //回调参数：
	   * {
	   *    tagname:"check_network_status",
     *    hasNetwork:true,//布尔值返回是否有网络
     *    networkType:"4G", //5.8开始加入， None-无网络, 2G-蜂窝数据网EDGE/GPRS, 3G-蜂窝数据网HSPDA,CDMAVOD, 4G-LTE(4G为5.9加入), WIFI-WLAN网络
	   * }
	   */
    app_check_network_status: function (options) {
      Facade.request({ name: Facade.METHOD_APP_CHECK_NETWORK_STATUS, callback: options.callback });
    },

	  /**
	   * @description 检查渠道包信息 此方法目前不可用，后期会改成app_check_app_package_info
	   * @method Service.cGuiderService.app_check_android_package_info
	   * @param {Object} options
     * @param {funcion} options.callback 检查完成后的回调函数
	   * @example
	   * //回调参数：
	   * {
	   *    isHideAdv:true,
	   *    isHideAppRecommend:true
	   * }
	   */
    app_check_android_package_info: function (options) {
      Facade.request({ name: Facade.METHOD_APP_CHECK_ANDROID_PACKAGE_INFO, callback: options.callback });
    },

	  /**
	   * @description 记录google remarkting的screenName
	   * @method Service.cGuiderService.app_log_google_remarkting
	   * @param {String} url 需要纪录的页面名
	   */
    app_log_google_remarkting: function (url) {
      Facade.request({ name: Facade.METHOD_APP_LOG_GOOGLE_REMARKTING, url: url });
    },

	  /**
	   * @description 获取短信中的验证码
	   * @method Service.cGuiderService.app_read_verification_code_from_sms
	   * @param {Object} options 输入参数
     * @param {function} options.callback 获取验证码之后的回调{callback:function(data){}}
	   * @example
	   * //回调参数：
	   * {
	   *    verificationCode = "8890
	   * }
	   */
    app_read_verification_code_from_sms: function (options) {
      Facade.request({ name: Facade.METHOD_APP_READ_VERIFICATION_CODE_FROM_SMS, callback: options.callback });
    },

	  /**
	   * @description H5页面加载完成，通知native app，app会隐藏loading界面
	   * @method  Service.cGuiderService.app_h5_page_finish_loading
	   */
    app_h5_page_finish_loading: function (options) {
      Facade.request({ name: Facade.METHOD_H5_PAGE_FINISH_LOADING });
    },

	  /**
	   * @description 保存照片到相册
	   * @method Service.cGuiderService.save_photo
	   * @param {Object} options 输入参数
     * @param  {string} options.photoUrl 需要保存图片的URL
     * @param {string} options.photoBase64String 需要保存图片的base64字符串,UTF8编码
     * @param {string} options.imageName  图片保存到相册的名字
     * @param {function} options.callback 保存完成后的回调
	   * @example
	   * //参数：
	   * {
	   *    photoUrl:'',//{String} 需要保存图片的URL， 注：当photoBase64String字段不为空的时候，base64图片内容优先，URL不处理
	   *    photoBase64String:'',//{String} 需要保存图片的base64字符串,UTF8编码
	   *    imageName:"", //图片保存到相册的名字，android有效，ios无效. 不传的时候，默认android存储为image.jpg
	   *    callback；function(){} //保存完成后的回调
	   * }
	   * //回调参数：
	   *    error_code:"xxxxx",//error_code有内容时候，代表有错误，否则表示保存成功.error_code分为以下几种
	   *    //(-200)参数错误, base64字符串转换成图片失败
	   *    //(-201)下载成功，图片格式不正确
	   *    //(-202)下载图片失败
	   *    //(-203)保存到相册失败
	   */
    save_photo: function(options)
    {
      if (!options.photoUrl) options.photoUrl = null;
      if (!options.photoBase64String) options.photoBase64String = null;
      options.name = Facade.METHOD_SAVE_PHOTO;
      Facade.request(options);
    },

    /**
     * @description 注册webview appear 事件(webview 显示时，hybrid会调用此回调)
     * @method Service.cGuiderService.registerAppearEvent
     * @param {Function} callback webview 显示时的回调函数
     */
    registerAppearEvent: function (callback) {
      Facade.register({tagname: Facade.METHOD_WEB_VEW_DID_APPEAR, callback: callback})
    },
    /**
     * @description 注销webview appear 事件 配合registerAppearEvent方法使用（webview销毁时，hybrid会调用此方法）
     * @method Service.cGuiderService.unregisterAppearEvent
     */
    unregisterAppearEvent: function () {
      Facade.unregister(Facade.METHOD_WEB_VEW_DID_APPEAR)
    }
  };

  /**
   * @description 文件操作相关类
   * @namespace Service.cGuiderService.file
   */
  HybridGuider.file = {
    /**
     * @description 检查文件是否存在。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.isFileExist
     * @param {object} options 输入参数
     * @param {string} options.fileName 需要读取文件大小的文件路径
     * @param {string} options.relativeFilePath 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @param {function} options.callback 检查过后的回调
     * @example
     * 参数:
     * {
     *    fileName:"", // {String}需要读取文件大小的文件路径
     *    relativeFilePath:"", // {String} 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     *    callback:function(data){} //检查过后的回调
     * }
     * 回调参数为
     * param : {
     *      isExist: true
     * }
     */
    isFileExist: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_FILE_EXIST, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    /**
     * @description 删除文件/目录。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.deleteFile
     * @see http://jimzhao2012.github.io/api/classes/CtripFile.html#method_app_delete_file
     * @param {object} options 输入参数
     * @example
     * 参数：
     * {
     *    fileName:'', //{String} 需要删除的文件路径
     *    relativeFilePath:'', //{String} 需要删除的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     *    callback；fucntion(data){} //{Function}删除文件后的回调
     * }
     * 回调参数：
     *  {
     *     isSuccess: true
     *  }
     */
    deleteFile: function (options) {
      Facade.request({ name: Facade.METHOD_DELETE_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    /**
     * @description 获取当前web页面的sandbox目录，在webapp/wb_cache/xxxx/目录下xxxx即为当前sandbox的名字
     * @method Service.cGuiderService.file.getCurrentSandboxName
     * @see http://jimzhao2012.github.io/api/classes/CtripFile.html#method_app_get_current_sandbox_name
     * @param {object} options 输入参数{callback:function(data){}}
     * @example
     * 回调参数:
     *   {
     *     sandboxName: "car"
     *   }
     */
    getCurrentSandboxName: function (options) {
      Facade.request({ name: Facade.METHOD_GET_CURRENT_SANDBOX_NAME, callback: options.callback });
    },

    /**
     * @description 读取文件大小。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.getFileSize
     * @param {object} options 输入参数
     * @example
     * //参数：
     * {
     *    fileName:"", //{String} 需要读取文件大小的文件路径
     *    relativeFilePath :"",//{String} relativeFilePath
     *    callback:function(data){} //获取之后的回调
     * }
     * //回调参数:
     *   {
     *     fileSize: 8
     *   }
     */
    getFileSize: function (options) {
      Facade.request({ name: Facade.METHOD_GET_FILE_SIZE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },


    /**
     * @description 创建文件夹。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.makeDir
     * @param {object} options 输入参数
     * @example
     * //参数
     * {
     *    dirname:"",//{String}需要创建的文件夹路径
     *    relativeDirPath :"", //{String} 需要创建的文件夹相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     *    callback:function(data){} //{Function} 创建成功后的回调
     * }
     * //回调参数：
     *  {
     *    isSuccess: true
     *  }
     */
    makeDir: function (options) {
      Facade.request({ name: Facade.METHOD_MAKE_DIR, callback: options.callback, dirname: options.dirname, relativeFilePath: options.relativeFilePath });
    },

    /**
     * @description 读取文本文件内容，UTF-8编码。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.readTextFromFile
     * @param {object} options 输入参数
     * @example
     * //参数：
     * {
     *    fileName:"", //{String} 需要读取内容的文件路径
     *    relativeFilePath:"",//{String}需要读取内容的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     *    callback:function(data){} //读取完成后的回调
     * }
     * //回调参数：
     * {
     *      text: "Hello,世界"
     *  }
     */
    readTextFromFile: function (options) {
      Facade.request({ name: Facade.METHOD_READ_TEXT_FROM_FILE, callback: options.callback, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    },

    /**
     * @description 文本写入文件中，UTF8编码。可以指定文件名，或者相对路径
     * @method Service.cGuiderService.file.writeTextToFile
     * @see http://jimzhao2012.github.io/api/classes/CtripFile.html#method_app_write_text_to_file
     * @param {object} options 输入参数
     * @example
     * //参数;
     * {
     *    fileName:"", //{String} 写入的文件路径
     *    relativeFilePath:"",//{String}写入的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     *    text:"",//{String} 需要写入文件的文本内容
     *    isAppend:false,//{String} 是否是将当前文件append到已有文件
     *    callback:function(data){} // {Function} 写完之后的回调
     * }
     * //回调收到参数为
     * {
     *      isSuccess: true
     *  }
     */
    writeTextToFile: function (options) {
      Facade.request({ name: Facade.METHOD_WRITE_TEXT_TO_FILE, callback: options.callback, text: options.text, isAppend: options.isAppend, fileName: options.fileName, relativeFilePath: options.relativeFilePath });
    }
  };

  /**
   * @description 管道相关类
   * @namespace Service.cGuiderService.pipe
   */
  HybridGuider.pipe = {
    /**
     * @description H5通过App发送服务 发送socket请求
     * @method Service.cGuiderService.pipe.socketRequest
     * @param {object} options 输入参数
     * @example
     * //参数：
     * {
     *    serviceCode:"", //{String} 需要发送服务的服务号
     *    header:"",   //{String} 服务的header
     *    data:""，    //{String} 服务所需要的数据部分，各个服务都不同
     *    pipeType:1  //{Int}  管道类型，因mobileServer原因，5.4的管道是支付专用，默认是0=支付管道，1＝公共管道
     *    callback:function(data){} //{Function}请求返回后的回调
     * }
     * //回调参数：
     * //成功
     *{
		 *  sequenceId:"13523333333",
		 *  resultMessage:"eHh4eHh4",
		 *  resultHead:"eHh4eHh4",
		 *  resultBody:"eHh4eHh4",
		 *  result:1,
     * },
     * //失败
     * //  code定义，返回给Hybrid时候，为负数，iOS/Android －200开始，递减
     * //  CONN_FAIL_TYPE_NO_FAIL = 200------------------正确，无错误
     * // CONN_FAIL_TYPE_GETCONN_UNKOWN = 201-----------从连接池获取长连接失败
     * //  CONN_FAIL_TYPE_GETIP = 202--------------------获取IP地址失败
     * //  CONN_FAIL_TYPE_CONNECT = 203------------------创建连接失败
     * //  CONN_FAIL_TYPE_SEND_DATA = 204----------------发送数据失败
     * //  CONN_FAIL_TYPE_RECEIVE_LENGTH = 205-----------读报文头失败
     * //  CONN_FAIL_TYPE_RECEIVE_BODY = 206-------------读报文体失败
     * //  CONN_FAIL_TYPE_BUILE_REQUESTDATAFAIL = 207----创建请求报文失败
     * //  CONN_FAIL_TYPE_BUILE_RESPONSEDATAFAIL = 208---解析返回报文失败
     * //  CONN_FAIL_TYPE_SERIALIZE_REQUEST_FAIL = 209---序列化请求报文失败
     * //  CONN_FAIL_TYPE_SERIALIZE_RESPONSE_FAIL = 210--序列化返回报文失败
     * //  CONN_FAIL_TYPE_RESPONSE_REPEAT = 211----------服务端下发需要重试
     *
     *{
		 * sequenceId:"13523333333",
		 * errorInformation:"抱歉！加载失败，请重试(-203)", //括号内的code为errorCode，5.8.1加入
		 * serverErrorCode:"eHh4eHh4",
     *},
     */
    socketRequest: function (options) {
      var timestamp = Date.now();
      Facade.request({ name: Facade.METHOD_SEND_H5_PIPE_REQUEST, callback: options.callback, serviceCode: options.serviceCode, header: options.header, data: options.data, sequenceId: timestamp, pipeType: options.pipeType });
      return timestamp;
    },

    /**
     * @description H5通过App发送服务 发送http请求
     * @method Service.cGuiderService.pipe.httpRequest
     * @param {object}  options 输入参数
     * @example
     * //参数：
     * {
     *    url:"", //{String}HTTP请求发送的URL地址
     *    method:"", //{String} HTTP请求方式GET/POST
     *    header:"", //{String} HTTP头，JSON字符串格式key/value，cookie作为一个key存储再HEADER内部
     *    param:{}, //key=value形式的字符串数组,请做好参数的Encode，app端只负责拼接
     *    sequenceId:"", //发送服务的序列号，随机生存即可
     *    retry:{} ,// 貌似bridge.js中未处理
     *    callback:function(data){} //请求成功的回调
     * }
     * //回调参数：
     * param:
     *{
		 *responseString:"eHh4eHh4",
		 *responseCookie : {
		 *			"BAIDUID":"2959D035E2F5D7C979687934D558DCD3:FG=1",
		 *			"BDSVRTM":10,
		 *			"BD_CK_SAM":1,
		 *			"H_PS_PSSID":"1429_5225_5287_5722_5848_4261_5830_4759_5659_5857"
		 *    },
		 *sequenceId:"13222222"
     *},
     */
    httpRequest: function (options) {
      var timestamp = Date.now();
      Facade.request({ name: Facade.METHOD_SEND_HTTP_PIPE_REQUEST, callback: options.callback, target: options.url, method: options.method, header: options.header, queryData: options.param, retryInfo: options.retry, sequenceId: timestamp });
      return timestamp;
    },

    /**
     * @description 根据发送的sequenceId，终止正在发送的HTTP请求 取消http请求
     * @method Service.cGuiderService.pipe.abortRequest
     * @param {object} options 输入参数
     * @param {string} [options.type=socket] 请求类型 http/socket
     * @param {string} options.id 需要取消的服务id
     * @example
     * //参数：
     * {
     *    type:"",//{String} 请求类型 'socket'/'http'
     *    id:发送服务的序列号，随机生存即可 对应socket
     *    sequenceId:发送服务的序列号，随机生存即可 对应http
     * }
     */
    abortRequest: function (options) {
      if(options.type == 'socket'){
        Facade.request({ name: Facade.METHOD_ABORT_HTTP_PIPE_REQUEST, sequenceId: options.id });
      }else{
        Facade.unregister({ name: Facade.METHOD_SEND_H5_PIPE_REQUEST, sequenceId: options.sequenceId });
      }
    }
  };

  /**
   * 支付相关类
   * @namespace Service.cGuiderService.pay
   */
  HybridGuider.pay = {

    /**
     * @description  检查支付相关App安装情况
     * @method Service.cGuiderService.pay.checkStatus
     * @see  http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
     * @param {object} options 参数对象
     * @param {function} options.callback 检查支付之后的回调 {callback:function(param){}}
     * @example
     * //回调数据
     *    {
     *       platform:"iOS", //Android
     *       weixinPay:true,
     *       aliWalet:true,
     *       aliQuickPay:true,
     *    }
     */
    checkStatus: function (options) {
      Facade.request({ name: Facade.METHOD_CHECK_PAY_APP_INSTALL_STATUS, callback: options.callback });
    },

    /**
     * @description 根据URL打开支付App
     * @method Service.cGuiderService.pay.payOut
     * @see http://jimzhao2012.github.io/api/classes/CtripPay.html#method_app_check_pay_app_install_status
     * @param {object} options
     * @example
     * //参数:
     * {
     *    payAppName:"" , // {String} 支付App的URL，暂固定为以下4个， aliWalet/aliQuickPay/wapAliPay/weixinPay(微信支付暂未支持)
     *    payURL:"",//{String}服务器返回的支付配置信息，ali相关为URL，微信支付为xml
     *    successRelativeURL:"" //{String} 支付成功跳转的URL
     *    detailRelativeURL :"" //{String} 支付失败或者支付超时跳转的url
     * }
     */
    payOut: function (options) {
      Facade.request({ name: Facade.METHOD_OPEN_PAY_APP_BY_URL, payAppName: options.payAppName, payURL: options.payURL, successRelativeURL: options.successRelativeURL, detailRelativeURL: options.detailRelativeURL });
    },

    callPay: function(options) {
      Hish.Fn('call_pay').run(options);
    }
  };

  /**
   * @description 自有加解密操作类
   * @namespace Service.cGuiderService.encrypt
   */
  HybridGuider.encrypt = {

    /**
     * @description Ctrip私有加解密算法
     * @method Service.cGuiderService.encrypt.ctrip_encrypt
     * @param {object} options 参数对象
     * @param {string} options.inStr 加密字符串
     * @param {function} options.callback 
     * @example
     * //参数：
     * {
     *    inStr:"", // {String}需要做加解密的字符串
     *    callback:function(){} //{Function} 加密成功的回调
     * }
     * //回调参数
     * param:
	   *  {
		 *	 inString:"abcdxxxx",
		 *	 outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
		 *	 encType:1
     * }
     */
    ctrip_encrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString: options.inStr, encType: 1 });
    },
    /**
     * @description 携程自有解密
     * @method Service.cGuiderService.encrypt.ctrip_decrypt
     * @param {object} options 参数对象
     * @param {function} options.callback 回调参数
     * @param {string} opitions.inStr 解密字符串
     * @example
     * //参数：
     * {
     *    inStr:"", // {String}需要做加解密的字符串
     *    callback:function(){} //{Function} 加密成功的回调
     * }
     * //回调参数
     * param:
     *  {
		 *	 inString:"abcdxxxx",
		 *	 outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
		 *	 encType:1
     * },
     */
    ctrip_decrypt: function (options) {
      Facade.request({ name: Facade.METHOD_ENCRYPT_CTRIP, callback: options.callback, inString: options.inStr, encType: 2 });
    }
  };

  return HybridGuider;

});
;define('cHybridAppInit',['cHybridGuider'], function(Guider){

  
  Lizard.localRoute = {
    config: {},
    addConfig: function (obj) {
      for (var urlschema in obj) {
        if (obj.hasOwnProperty(urlschema)) {
          Lizard.localRoute.config[urlschema] = obj[urlschema];
        }
      }
    },
    
    mapUrl: function (url) {
      var ret = '', lc = 0;
      _.each(Lizard.localRoute.config, function(item, urlSchema){
        if (Lizard.localRoute.config.hasOwnProperty(urlSchema)) {
          var parseRet = Lizard.schema2re(urlSchema, url);
          if (parseRet.reStr && parseRet.param) {
            if (parseRet.reStr.length > lc) {
              lc = parseRet.reStr.length;
              ret = Lizard.localRoute.config[urlSchema];
            }
          }
        }
      })      
      return ret;
    }
  };
  
  if (window.LizardLocalroute) {
    Lizard.localRoute.addConfig(window.LizardLocalroute);
    var el = document.getElementById("LizardLocalroute");
    if (el) {
      Lizard.weinre = el.getAttribute("LizardWeinre");
      Lizard.ip = el.getAttribute("LizardIP");
      Lizard.chanal = el.getAttribute("LizardChanal");
    }
  }
  
  //如果是pc端打开的话，直接主动触发init_member_H5_info
  if (Internal.isIOS || Internal.isAndroid || Internal.isWinOS) {} else {
    var isPc = (function isPc() {
      return window.navigator.platform == "Win32";
    })();
    if (!isPc) {
      Guider.create();
      return;
    }
    var appInfo = {
      "tagname": "web_view_finished_load",
      "param": {
        "platform": "2",
        "osVersion": "Android_18",
        "extSouceID": "",
        "version": "5.5"
      }
    }
    Internal.isAndroid = (appInfo.param.platform == "2");
    Internal.isInApp = true;
    Internal.appVersion = appInfo.param.version;
    Internal.osVersion = appInfo.param.osVersion;
    if (window.localStorage) {
      window.localStorage.clear();
      if (appInfo) window.localStorage.setItem('APPINFO', JSON.stringify(appInfo));
      window.localStorage.setItem('ISINAPP', '1');
    }
    window.Util_a = {};
    window.Util_a.h5Log = function(paramString) {
      console.log('h5Log::', paramString);
    }
    window.Util_a.openUrl = function(paramString) {
      console.log('h5Log::', paramString);
    }
    window.Util_a.checkNetworkStatus = function(paramString) {
      console.log('h5Log::', paramString);
    }
    window.Locate_a = {};
    window.Locate_a.locate = function(paramString) {};
    window.NavBar_a = {};
    window.NavBar_a.setNavBarHidden = function(paramString) {};
    window.User_a = {};
    window.User_a.initMemberH5Info = function(paramString) {};
    window.Business_a = {};
    window.Business_a.sendUBTLog = function(paramString) {};
    window.Business_a.logGoogleRemarking = function(paramString) {};
    window.app.callback({
      'tagname': 'web_view_finished_load'
    });
    window.app.callback({
      'tagname': 'init_member_H5_info',
      'param': {
        appId: "ctrip.android.view",
        clientID: "32043596200000129090",
        device: "samsung_GT-N7102",
        extSouceID: "",
        isPreProduction: "0",
        osVersion: "Android_18",
        platform: "2",
        serverVersion: "5.7",
        sourceId: "8892",
        timestamp: "1402930469100",
        userInfo: {
          data: {
            Auth: "",
            BMobile: "",
            BindMobile: "",
            IsNonUser: true,
            UserID: ""
          },
          timeby: 1,
          timeout: "2015/06/16"
        },
        version: "5.5"
      }
    });    
  }
  
  Guider.create();
});define('cHybridHeader',['cHybridShell'], function (cHybridShell) { 
  var specialtags = ['home', 'share', 'favorite', 'favorited', 'phone', 'call'];

  function Header(opt) {
    this.root = this.rootBox = $('#headerview');
    //当前header所属的view对象
    this.parent = opt.parent;
    this.root.hide();
  };

  Header.prototype = {
    set: function (headData) {
      this.headerData = headData;
      var events = this.headerData.events || {};
      var head = {
        'left'         : [],
        'center'       : [],
        'centerButtons': [],
        'right'        : []
      }, self = headData.view || this;

      //Handle left buttons
      if (headData.back) {
        if (headData.back === true) {
          headData.back = {callback: events.returnHandler}
        }
        head.left.push({
          'tagname' : 'back',
          'callback': headData.back.callback
        });
      }
      if (head.left.length == 0) {
        head.left.push(headData.left[0]);
      }

      //Handle center text
      if (_.isObject(headData.center) || _.isObject(headData.title)) {
        var titleObj = headData.center || headData.title;
        if (titleObj.tagname == 'title') {
          if (_.isString(titleObj.value)) {
            head.center.push({'tagname': 'title', 'value': headData.title});
          } else if (_.isArray(titleObj.value)) {
            _.each(titleObj.value, function (value, index) {
              if (index == 0) {
                head.center.push({'tagname': 'title', 'value': value});
              } else if (index == 1) {
                head.center.push({'tagname': 'subtitle', 'value': value});
              }
            })
          } else if (titleObj.tagname == 'select') {
            headData.citybtn = titleObj.value;
            headData.citybtn.callback = titleObj.callback;
          }
        }
      } else {
        if (headData.title) {
          head.center.push({'tagname': 'title', 'value': headData.title});
        }
        if (headData.subtitle) {
          head.center.push({'tagname': 'subtitle', 'value': headData.subtitle});
        }
      }

      //Handle center buttons
      if (headData.citybtn) {
        var cityBynobj = {
          "tagname" : "cityChoose",
          "value"   : headData.citybtn,
          "a_icon"  : "icon_arrowx",
          "i_icon"  : "icon_arrowx.png",
          "callback": events.citybtnHandler
        }
        if (headData.citybtnImagePath) {
          cityBynobj.imagePath = headData.citybtnImagePath;
          if (headData.citybtnPressedImagePath) {
            cityBynobj.pressedImagePath = headData.citybtnPressedImagePath;
          } else {
            cityBynobj.pressedImagePath = cityBynobj.imagePath;
          }
        }
        if (headData.citybtnIcon) {
          cityBynobj.a_icon = cityBynobj.i_icon = headData.citybtnIcon;
        }
        head.centerButtons.push(cityBynobj);
      }

      //Handle right buttons
      var rightCallBack = events.commitHandler || events.searchHandler;
      if (rightCallBack) {
        var btnObj = {
          'tagname' : events.commitHandler ? 'commit' : 'search',
          'callback': rightCallBack
        };
        if (events.commitHandler) btnObj.value = headData.btn.title;
        head.right.push(btnObj);
      }

      if (headData.tel) {
        var telObj = {
          'tagname': 'call'
        };
        if (Lizard && Lizard.instance && Lizard.instance.curView) {
          var curView = Lizard.instance.curView;
          if (curView.businessCode) {
            telObj.businessCode = curView.businessCode;
            telObj.pageId = curView.hpageid;
          }
        }
        head.right.push(telObj);
      }
      _.each(specialtags, function (item) {
        if (headData[item]) {
          var temp_obj = {'tagname': item};
          if (_.isObject(headData[item]) && _.isFunction(headData[item].callback)) {
            temp_obj.callback = headData[item].callback;
          }
          head.right.push(temp_obj);
        }
      });

      if (headData.moreMenus) {
        head.moreMenus = headData.moreMenus;
        head.right.push({ 'tagname': 'more'});
      }
      head.right = _.union(head.right, headData.right || [], headData.moreRightMenus || []);
      var pickupMoremenu = _.groupBy(head.right, function (item) {
        if (item.tagname == 'list') {
          return 'a';
        } else {
          return 'b';
        }
      });
      head.right = pickupMoremenu['b'] || [];
      if (pickupMoremenu['a'] && pickupMoremenu['a'][0]) {
        head.right.push({ 'tagname': 'more'});
        head.moreMenus = pickupMoremenu['a'][0]['data'];
      } else {
        pickupMoremenu = _.groupBy(head.right, function (item) {
          if (item.tagname == 'more') {
            return 'a';
          } else {
            return 'b';
          }
        });
        head.right = _.union(pickupMoremenu['b'] || [], pickupMoremenu['a'] || []);
      }

      this.registerEvents(_.union(head.left, head.centerButtons, head.right, head.moreMenus || []), self);

      try {
        var headInfo = JSON.stringify(head);
        var fn = new cHybridShell.Fn('refresh_nav_bar');
        fn.run(headInfo);
      } catch (e) {
      }
    },

    registerEvents: function (buttons, scope) {
      _.each(buttons, function (button) {
        button.callback && cHybridShell.off(button.tagname).on(button.tagname, function () {
          if (button.tagname == 'back') {
            if (Lizard) {
              if (Lizard.instance._alert.status == 'show') {
                Lizard.hideMessage();
                return;
              }
              if (Lizard.instance._confirm.status == 'show') {
                Lizard.hideConfirm();
                return;
              }
              if (Lizard.instance._toast.status == 'show') {
                Lizard.hideToast();
                return;
              }
            }
          }
          button.callback.call(scope);
        });
      })
    },

    updateHeader: function (name, val) {
      if (val) {
        this.headerData[name] = val;
      } else if (_.isObject(name)) {
        if (name.right && _.some(name.right, function (item) {
          return item.tagname == 'favorite' || item.tagname == 'favorited';
        })) {
          delete this.headerData.favorite;
          delete this.headerData.favorited;
        }
        _.extend(this.headerData, name);
      }
      this.set(this.headerData);
    },

    show: function () {
      var fn = new cHybridShell.Fn('set_navbar_hidden ');
      fn.run(false);
    },

    hide: function () {
      var fn = new cHybridShell.Fn('set_navbar_hidden ');
      fn.run(true);
    }
  };

  return Header;
});
var __CTRIP_JS_PARAM = "?jsparam="
var __CTRIP_URL_PLUGIN = "ctrip://h5/plugin" + __CTRIP_JS_PARAM;
var __CTRIP_YOUTH_URL_PLUGIN = "ctripyouth://h5/plugin" + __CTRIP_JS_PARAM;

/**
* @class Internal
* @description bridge.js内部使用的工具类
* @brief 内部使用工具类
* @private
*/ 
var Internal = {
    /**
     * @brief 是否是iOS设备
     * @description  bridge.js内部使用，判断是否是iOS
     * @type Bool
     * @property isIOS
     */
    isIOS:false,

    /**
     * @brief 是否是Android设备
     * @description  bridge.js内部使用，判断是否是Android设备
     * @type Bool
     * @property isAndroid
     */
    isAndroid:false,

     /**
     * @brief 是否是WinPhone设备
     * @description  bridge.js内部使用，判断是否是Windows Phone设备
     * @type Bool
     * @property isWinOS
     */
    isWinOS:false,

    /**
     * @brief 当前是否是App环境
     * @description  bridge.js内部使用，判断当前是否是App环境
     * @type Bool
     * @property isInApp
     */
    isInApp:false,
    
    /**
     * @brief 当前携程旅行App版本
     * @description bridge.js内部使用，存储当前携程旅行App版本
     * @type String
     * @property appVersion
     */     
    appVersion:"",

    /**
     * @brief 当前操作系统版本
     * @description bridge.js内部使用，存储当前操作系统版本
     * @type String
     * @property osVersion
     */ 
    osVersion:"",

    /**
     * @brief 当前App是否是青春版
     * @description bridge.js内部使用，判断是否是青春版
     * @type String
     * @property isYouthApp
     */ 
    isYouthApp:false,
    
    /**
     * @brief 判断版本大小
     * @description 判断当前版本号是否大于传入的版本号
     * @param {String} verStr 版本号
     * @method isAppVersionGreatThan
     * @return {Bool} 是否大于该版本号
     * @since v5.2
     * @example
     
     * var isLarger = isAppVersionGreatThan("5.2"); <br />
     * alert(isLarger); // depends
     */
    isAppVersionGreatThan:function(verStr) {
        if (Internal.isYouthApp) { //青春版不做校验
            return true;
        }

        if ((typeof verStr == "string") && (verStr.length > 0) && Internal.appVersion) {
            var fInVerStr = verStr.replace(/\./g,'');
            var fNowVerStr = Internal.appVersion.replace(/\./g,'');

            var inVer = parseFloat(fInVerStr);
            var nowVer = parseFloat(fNowVerStr);
            if (isNaN(nowVer) || nowVer - inVer >= 0) {
                return true;
            }
        }

        return false;
    },

     /**
     * @brief 判断API是否支持
     * @description 判断API是否支持当前版本
     * @param {String} verStr 版本号
     * @method isSupportAPIWithVersion
     * @return {Bool} 是否支持该API
     * @since v5.2
     * @example
     
     * var isSupport = isSupportAPIWithVersion("5.2"); <br />
     * alert(isSupport); // depends
     */
    isSupportAPIWithVersion:function(verStr) {
        return true;
        if ((verStr != null) && (!Internal.isAppVersionGreatThan(verStr))) {
            Internal.appVersionNotSupportCallback(verStr);
            return false;
        }
        return true;
    },

   /**
     * @brief app版本过低回调
     * @description 回调H5页面，告知API开始支持的版本号及当前App的版本
     * @param {String} supportVer API支持的版本号
     * @method appVersionNotSupportCallback
     * @since v5.2
     * @author jimzhao
     */
    appVersionNotSupportCallback:function(supportVer) {
        var jsonObj = {"tagname":"app_version_too_low","start_version":supportVer,"app_version":Internal.appVersion};
        CtripTool.app_log(JSON.stringify(jsonObj));
        window.app.callback(jsonObj);
    },

    /**
     * @brief 参数错误回调
     * @description 回调H5页面，所调用的JS 参数有错误
     * @param {String} description 错误原因描述
     * @method paramErrorCallback
     * @since v5.2
     * @author jimzhao
     */
    paramErrorCallback:function(description) {
        var jsonObj = {"tagname":"app_param_error","description":description};
        CtripTool.app_log(JSON.stringify(jsonObj));
        window.app.callback(jsonObj);
    },

   /**
     * @brief 判断字符串是否为空
     * @description 判断字符串是否为空
     * @method isNotEmptyString
     * @param {String} str 需要判断的字符串
     * @since v5.2
     */
    isNotEmptyString:function(str) {
        if ((typeof str == "string") && (str.length > 0)) {
            return true;
        }

        return false;
    },


   /**
     * @brief 内部URL跳转
     * @description 内部隐藏iframe，做URL跳转
     * @method loadURL
     * @param {String} url 需要跳转的链接
     * @since v5.2
     */
    loadURL:function(url) {
        if (url.length == 0) {
            return;
        }

        var iframe = document.createElement("iframe");
        var cont = document.body || document.documentElement;

        iframe.style.display = "none";
        iframe.setAttribute('src', url);
        cont.appendChild(iframe);

        setTimeout(function(){
            iframe.parentNode.removeChild(iframe);
            iframe = null;
        }, 200);
    },

   /**
     * @brief 内部组装URL参数
     * @description  内部使用，组装URL参数
     * @return 返回序列化之后的字符串
     * @method makeParamString
     * @param {String} service app响应的plugin的名字
     * @param {String} action 该plugin响应的函数
     * @param {JSON} param 扩展参数，json对象
     * @param {String} callbackTag app回调给H5页面的tagname
     * @since v5.2
     */
    makeParamString:function(service, action, param, callbackTag) {

        if (!Internal.isNotEmptyString(service) || !Internal.isNotEmptyString(action)) {
            return "";
        }

        if (!param) {
            param = {};
        };

        param.service = service;
        param.action = action;
        param.callback_tagname = callbackTag;

        return JSON.stringify(param);
    },

    /**
     * @brief 内部组装URL
     * @description  内部使用，组装URL
     * @return {String} encode之后的URL
     * @method makeURLWithParam
     * @param {String} paramString 拼接URL参数
     * @since v5.2
     */
    makeURLWithParam:function(paramString) {
        if (paramString == null) {
            paramString = "";
        }

        paramString = encodeURIComponent(paramString);
        if (Internal.isYouthApp) {
            return __CTRIP_YOUTH_URL_PLUGIN + paramString;
        } else {
            return  __CTRIP_URL_PLUGIN + paramString;
        }
    },

     /**
     * @brief JS调用Win8 native
     * @description  内部使用，用于js调用win8
     * @param {String} 传递给win8的参数
     * @method callWin8App
     * @since v5.3
     */
    callWin8App:function(paramString) {
        window.external.notify(paramString);
    }

//     execAPI:function(supportVersion, modelName, actionName, params, callbackTagName) {
//         console.log("start exec execAPIA");
//         if ((supportVersion != null) && !Internal.isSupportAPIWithVersion(supportVersion)) {
//             return;
//         }
// //        Internal.execAPI("5.4","NavBar", "setNavBarHidden",params,"set_navbar_hidden");

//         paramString = Internal.makeParamString(modelName, actionName, params, callbackTagName);
//         console.log("start exec execAPIB:" + paramString);

//         if (Internal.isIOS) {
//             url = Internal.makeURLWithParam(paramString);
//             Internal.loadURL(url);
//         }
//         else if(Internal.isAndroid) {
//             try {
//                 var pluginModelName = modelName + "_a";
//                 var pluginCmd = window[pluginModelName];
//                 if (pluginCmd != null) {
//                     pluginCmd = pluginCmd[actionName];
//                     console.log("start exec execAPID:" + pluginCmd);

//                     if (pluginCmd != null) {
//                         console.log("start exec execAPIE:" + pluginCmd);
//                         //pluginCmd=window.Util_a.setNavBarHidden
//                         vard = pluginCmd(paramString);
//                         console.log("start exec vard:" + vard);
//                         eval(vard);      
//                         console.log("start exec execAPIF:" + pluginCmd);
                  
//                     }
//                 }
//             } catch(e) {
//                  console.log("start exec ErrorG:" + e);
//             }
//         }
//         else if (Internal.isWinOS) {
//                 Internal.callWin8App(paramString);
//         }
//     }
};

var originalConsole = console;

var console = originalConsole;


var CtripConsole = {
    
    log:function(log) {
        if (Internal.isWinOS) {
            Internal.callWin8App("wp-log:#wp#Log:"+log);
        }
         else if (Internal.isIOS) {
            Internal.loadURL("ios-log:#iOS#Log:" + log);            
        }
    },
    
    debug:function(log) {
        if (Internal.isWinOS) {
            Internal.callWin8App("wp-log:#wp#Debug:"+log);
        } 
        else if (Internal.isIOS) {
            Internal.loadURL("ios-log:#iOS#Debug:" + log);
        }
    },
    
    info:function(log) {
        if (Internal.isWinOS) {
            Internal.callWin8App("wp-log:#wp#info:"+log);
        } 
        else if (Internal.isIOS) {
            Internal.loadURL("ios-log:#iOS#Info:" + log);
        }
    },
    
    warn:function(log) {
       if (Internal.isWinOS) {
            Internal.callWin8App("wp-log:#wp#warn:"+log);
        } 
        else if (Internal.isIOS) {
            Internal.loadURL("ios-log:#iOS#warn:" + log);
        }
    },

    error:function(log) {
        if (Internal.isWinOS) {
            Internal.callWin8App("wp-log:#wp#Error:"+log);
        } 
        else if (Internal.isIOS) {
            Internal.loadURL("ios-log:#iOS#Error:" + log);
        }
    }
};

/**
 * @brief app回调bridge.js
 * @description 将native的callback数据转换给H5页面的app.callback(JSON)
 * @method __bridge_callback
 * @param {String} param native传给H5的字符串,该字符串在app组装的时候做过URLEncode
 * @since v5.2
 * @author jimzhao
 */
function __bridge_callback(param) {
    param = decodeURIComponent(param);
    
    var jsonObj = JSON.parse(param);

    if (jsonObj != null) {
        if (jsonObj.param != null && jsonObj.param.hasOwnProperty("platform")) {
            var ua = navigator.userAgent;
            if (ua.indexOf("Youth_CtripWireless") > 0) { 
                Internal.isYouthApp = true;
            } 
            
            platform = jsonObj.param.platform;
            var typePf = typeof platform;

            if (typePf == "number") { //iOS
                if (platform == 1 || platform == 2 || platform == 3) {
                    Internal.isIOS = (platform == 1);
                    Internal.isAndroid = (platform == 2);
                    Internal.isWinOS = (platform == 3);
                }
            }
            else if (typePf == "string") { //Android
                if (platform == "1" || platform == "2" || platform == "3") {
                    Internal.isIOS = (platform == "1");
                    Internal.isAndroid = (platform == "2");
                    Internal.isWinOS = (platform == "3");     
                }
            }

            Internal.isInApp = true;
            Internal.appVersion = jsonObj.param.version;
            Internal.osVersion = jsonObj.param.osVersion;

            if (Internal.isWinOS) {
                window.navigator.userAgent.winPhoneUserAgent = window.navigator.userAgent+"_CtripWireless_"+Internal.appVersion; 
                console = CtripConsole;                
            }
            else if (Internal.isIOS) {
                console = CtripConsole;
            }
        }

        val = window.app.callback(jsonObj);
        
        if (Internal.isWinOS) {
            if (val) {
                val = "true";
            } else {
                val = "false";
            }
        }

        return val;
    }

    return -1;
};

/**
 * @brief app写localstorage
 * @description 写key/value数据到H5页面的local storage
 * @method __writeLocalStorage
 * @param {String} key 需要写入数据库的key
 * @param {String} value 需要写入数据库的value
 * @since v5.2
 * @author jimzhao
 */
function __writeLocalStorage(key, jsonValue) {
    if (Internal.isNotEmptyString(key)) {
        localStorage.setItem(key, jsonValue);
    }
};

/**
 * @class CtripTool
 * @brief 工具类
 * @description 工具类,和App无交互，纯JS处理
 */
var CtripTool = {

    /**
     * @brief 判断当前是否是在App内
     * @description  判断当前H5页面是否是在App内
     * @since 5.2
     * @method app_is_in_ctrip_app
     * @author jimzhao
     * @return bool, true代表在app环境，false表示不在app环境
     * @example 

     * var ret = CtripTool.app_is_in_ctrip_app();
     * alert("isInApp=="+ret);
     */
    app_is_in_ctrip_app:function() {
        if (Internal.isInApp) {
            return true;
        }

        var isInCtripApp = false;

         var ua = navigator.userAgent;
         if (ua.indexOf("CtripWireless")>0) {
            isInCtripApp = true;
         }
        
        return isInCtripApp;
    }
};

/**
 * @class CtripUtil
 * @description 常用Util
 * @brief 常用Util
 */
var CtripUtil = {

    /**
     * @description 进入H5模块，初始化数据
     * H5接收到web_view_did_finished_load的回调之后，调用该函数，初始化数据会通过callback传递给H5
     * @brief 初始化H5模块数据
     * @method app_init_member_H5_info
     * @since version 5.2
     * @author jimzhao
     * @callback tagname="init_member_H5_info"
     * @example

         CtripUtil.app_init_member_H5_info();
         //调用完成，H5页面会收到如下返回数据
         var json_obj =
         {
            tagname:"init_member_H5_info",
            param:{
                timestamp:135333222,
                version:"5.2",
                device:"iPhone4S",
                appId:"com.ctrip.wrieless",
                osVersion:"iOS_6.0",
                serverVersion:"5.7.1",
                platform:1, //区分平台，iPhone为1, Android为2, winPhone为3
                isPreProduction:0,//UAT:2, FAT:0,堡垒:1,生产不会有该字段
                extSouceID:"8888",//外部渠道ID,since 5.4
                clientID:"1323333333333333", //客户端唯一标识, since5.4
                systemCode:16, //标准版-iOS:12, android:32; 学生版－ios:16, Android:36, since 5.6
                latitude:32.011111,//缓存的纬度 since 5.7
                longitude:121.000332,//缓存的经度 since 5.7
                screenWidth:320,//晶赞广告系统使用 since 5.7
                screenHeight:480,//晶赞广告系统使用 since 5.7
                screenPxDensity:1,//晶赞广告系统使用 since 5.7
                deviceOSVersion:4.3,//晶赞广告系统使用 since 5.7
                internalVersion:"5.71",//app内部版本，和mobile server通讯需要，学生版可用该参数做版本更新判断，since 5.8
                allianceId:"xxxxxxx", //5.9加入，营销业绩使用
                sId:"ssssssss",//5.9加入，营销业绩使用
                ouId:"ssseeeeee",//5.9加入，营销业绩使用
                telephone:"999999999"//5.9加入，营销业绩使用
                networkStatus:"4G", //5.9加入，返回当前网络状态 2G/3G/4G/WIFI/None
                isSaveFlow:true, //是否是省流量模式，since 6.0
                isAppNeedUpdate:false, //5.10加入
                idfa:"guid_xxxx_3333_16字节",// iOS设备的IDFA，android设备无此字段，since 6.1
                deviceToken:"guid_xxxx_3333_32字节",// iOS设备的push deviceToken，android设备无此字段，since 6.1
                userInfo={USERINFO},//USERINFO内部结构参考CtripUser.app_member_login();    
            }
         }
         app.callback(json_obj);
     */
    app_init_member_H5_info:function() {
        var paramString = Internal.makeParamString("User", "initMemberH5Info", null, "init_member_H5_info");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if(Internal.isAndroid) {
            window.User_a.initMemberH5Info(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 拨打电话
     * @brief 拨打电话
     * @param {String} phone 需要拨打的电话号码，为空时候，会拨打ctrip呼叫中心号码
     * @param {String} pageId 页面PageId，可以为空，呼叫中心BI统计之用, 6.1加入
     * @param {String} businessCode 拨打电话的业务标识号，可以为空，呼叫中心BI统计之用, 6.1加入
     * @method app_call_phone
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_call_phone("13800138000");

     CtripUtil.app_call_phone("400666668","page_car_333", "car_phone_111");

     //或者直接拨打呼叫中心
     CtripUtil.app_call_phone();
     */
    app_call_phone:function(phone, pageId, businessCode) {  

        if(!phone) {
            phone = "";
        }
        
        var params = {};
        params.pageId = pageId;
        params.phone = phone;
        params.businessCode = businessCode;

        var paramString = Internal.makeParamString("Util", "callPhone", params, "call_phone")
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url); 
        }
        else if (Internal.isAndroid){
            window.Util_a.callPhone(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 退回到首页，离开H5
     * @brief 回到首页
     * @since v5.2
     * @method app_back_to_home
     * @author jimzhao
     * @example 

     CtripUtil.app_back_to_home();
     */
    app_back_to_home:function() {
        var paramString = Internal.makeParamString("Util", "backToHome", null, "back_to_home");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
           window.Util_a.backToHome(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 退回到H5页面的上一个页面，离开H5. v5.3开始支持带参数给上一个H5页面
     * @brief 离开H5回上一个页面
     * @method app_back_to_last_page
     * @param {String} callbackString 离开H5页面，需要传递给上一个H5页面的数据，上一个H5页面在web_view_did_appear回调里面将会收到该数据
     * @param {Bool} isDeleteH5Page 是否是直接删除该H5页面。直接删除H5页面时候，页面切换会没有动画效果
     * @since v5.2
     * @author jimzhao
     * @example 

        CtripUtil.app_back_to_last_page("This is a json string for my previous H5 page", false);

     */
    app_back_to_last_page:function(callbackString, isDeleteH5Page) {
        var params = {};
        if(!callbackString) {
            callbackString = "";
        }

        params.callbackString = callbackString;
        params.isDeleteH5Page = isDeleteH5Page;
        var paramString = Internal.makeParamString("Util", "backToLast", params, "back_to_last_page");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.backToLast(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description Hybrid页面，打开链接URL地址，兼容App和浏览器
     * @brief Hybrid页面打开链接URL
     * @param {String} openUrl @required<br> 需要打开的URL，可以为ctrip://,http(s)://,file://等协议的URL
     * @param {int} targetMode @required<br>
     0.当前页面刷新url, 该参数类似于js的location.href="", 注：只支持打online地址 <br/>
     1.处理ctrip://协议; 注：只处理ctrip协议的URL Schema<br/>
     2.开启新的H5页面,title生效; 注：只支持online地址<br/>
     3.使用系统浏览器打开; 注：只支持online地址和其它App的URL Schema，例如微信的weixin://home<br/>
     4.开启新的H5页面，title生效，打开webapp目录下的相对路径；注：和2对应，2打开online地址，4打开相对路径<br/>
     5.当前页面打开webapp目录下相对路径；注：和0对应，0是打开online地址，5是打开本地相对路径。 5.8之前版本，内部自动调用app_cross_package_href
     * @param {String} title @optional 当targetMode＝2时候，新打开的H5页面的title
     * @param {String} pageName @optional 当targetMode＝0、2、4时候，本页面，或者新打开的H5页面，此时pageName有效，pageName当作H5页面唯一标识，可用于刷新页面；5.6版本加入
     * @param {boolean} isShowLoadingPage  @optional 开启新的webview的时候，是否加载app的loading 
     * @method app_open_url
     * @since v5.2
     * @author jimzhao
     * @example 

     //当前H5页面打开ctrip.com
     CtripUtil.app_open_url("http://www.ctrip.com", 0);
     //进入App的酒店详情页
     CtripUtil.app_open_url("ctrip://wireless/hotel?id=1234", 1);
     //开启新的H5页面，进入m.ctrip.com
     CtripUtil.app_open_url("http://m.ctrip.com", 2, "Ctrip H5首页", "ctrip_home_page_id");
     //开启新的H5页面，进入webapp/car/index.html
     CtripUtil.app_open_url("car/index.html", 4, "用车首页", "car_index_page_id");
     //当前H5页面，跨包跳转进入webapp/car/index.html
     CtripUtil.app_open_url("car/index.html", 5, "用车首页", null);

     */
     app_open_url:function(openUrl, targetMode, title, pageName, isShowLoadingPage) {
        var params = {};
        if(!openUrl) {
            openUrl = "";
        }
        if (!title) {
            title = "";
        }
        if (!pageName) {
            pageName = "";
        }

        params.openUrl = openUrl;
        params.title = title;
        params.targetMode = targetMode;
        params.pageName = pageName;
        params.isShowLoadingPage = isShowLoadingPage;
        var paramString = Internal.makeParamString("Util", "openUrl", params, "open_url");
        
        if (Internal.appVersion) { //有AppVersion，为5.3及之后版本，或者5.2本地H5页面
            var isHandled = false;

            if (targetMode == 5) { //targetMode=5,5.8新增,可以兼容到以前版本,5.9之前版本使用cross做内部替换
                if (!Internal.isAppVersionGreatThan("5.9")) {
                    var firstSplashIndex = openUrl.indexOf("/");
                    if (firstSplashIndex > 0) {
                        var packageName = openUrl.substr(0, firstSplashIndex);
                        var pageParam = openUrl.substr(firstSplashIndex+1)
                        CtripUtil.app_cross_package_href(packageName, pageParam);
                    } else {
                        Internal.appVersionNotSupportCallback("传入URL有错误，eg. car/index.html#xxooee");
                    }
                    isHandled = true;
                } 
            }

            if (!isHandled) {
                if (Internal.isIOS) {
                    var url = Internal.makeURLWithParam(paramString);
                    Internal.loadURL(url);
                }
                else if (Internal.isAndroid) {
                    window.Util_a.openUrl(paramString);
                }
                else if (Internal.isWinOS) {
                    Internal.callWin8App(paramString);
                }
            }
        } 
        else
        {
            var ua = navigator.userAgent;
            var isAndroid52Version = (ua.indexOf("Android")>0) && (ua.indexOf("CtripWireless")>0);
            if(isAndroid52Version) {
                try {
                    window.Util_a.openUrl(paramString);
                } 
                catch(e){
                    window.location.href = openUrl;
                }
            } 
            else {
                window.location.href = openUrl;
            }
        }
    },

    /**
     * @description H5跨模块/站点跳转
     * @brief H5跨模块/站点跳转
     * @param {String} path 模块名称，如hotel, car, myctrip,
     * @param {String} param 作为URL，拼接在path后面的页面和其它参数 index.html#cashcouponindex?cash=xxxx
     * @method app_cross_package_href
     * @since v5.2
     * @author jimzhao
     * @example
     *
      //跳转到我的携程首页
      CtripUtil.app_cross_package_href("myctrip", "index.html?ver=5.2"); 

     */
    app_cross_package_href:function(path, param) {
        var params = {};
        if (!path) {
            path = "";
        }
        if (!param) {
            param = "";
        }

        params.path = path;
        params.param = param;

        var paramString = Internal.makeParamString("Util", "crossPackageJumpUrl", params, "cross_package_href");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.crossPackageJumpUrl(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 检查当前App网络状况
     * @brief 检查当前App网络状况
     * @since v5.2
     * @method app_check_network_status
     * @author jimzhao
     * @example 

     CtripUtil.app_check_network_status();
     //调用完成后，H5页面会收到如下回调数据
     var json_obj = 
     {
        tagname:"check_network_status",
        param = {
            hasNetwork:true,//布尔值返回是否有网络
            networkType:"4G", //5.8开始加入， None-无网络, 2G-蜂窝数据网EDGE/GPRS, 3G-蜂窝数据网HSPDA,CDMAVOD, 4G-LTE(4G为5.9加入), WIFI-WLAN网络    
        }
     }
     app.callback(json_obj);
     
     */
    app_check_network_status:function() {
        var paramString = Internal.makeParamString("Util", "checkNetworkStatus", null, "check_network_status");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkNetworkStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 检查是否安装App
     * @brief 检查是否安装App
     * @param {String} openUrl 尝试打开的URL，iOS使用
     * @param {String} packageName app的包名，android使用
     * @method app_check_app_install_status
     * @since v5.2
     * @author jimzhao
     * @example 

     CtripUtil.app_check_app_install_status("ctrip://wireless", "com.ctrip.view");
     //调用完成后，H5页面会收到如下回调数据
     var json_obj = 
     {
        tagname:"check_app_install_status",
        param: {
            isInstalledApp:true,//布尔值返回是否有安装    
        }
     }
     app.callback(json_obj);
     */
    app_check_app_install_status:function(openUrl, packageName) {
        var params = {};
        if (!openUrl) {
            openUrl = "";
        }
        if (!packageName) {
            packageName = "";
        }
        params.openUrl = openUrl;
        params.packageName = packageName;

        var paramString = Internal.makeParamString("Util", "checkAppInstallStatus", params, "check_app_install_status");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkAppInstallStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description H5通知Native刷新
     * @brief H5通知Native刷新
     * @param {String} pageName 要刷新的页面名字,该字段需要H5和native共同约定，H5调用之后，native需要捕获该名字的boardcast/notification
     * @param {String} jsonStr 刷新该页面需要的参数
     * @method app_refresh_native_page
     * @since v5.2
     * @author jimzhao
     * @example 
        
        5.6新增说明：刷新app_open_url打开的H5页面
        CtripUtil.app_open_url();函数打开的H5页面，设置pagename:h5_page_identify
        CtripUtil.app_refresh_native_page("h5_page_identify", "xxxx_json_string");
        
        先前版本，刷新Native的页面
        //H5调用
        
        CtripUtil.app_refresh_native_page("xxxxPageName", "xxxx_json_string");

        //Native需要处理的地方
     
        //iOS:
        //1. 添加Notification的关注
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(refresh:) name:kH5NativeShouldReloadNotification object:nil];
        
        //2. 实现方法
        - (void)refresh:(NSNotification *)notification {
             NSDictionary *dic = [notification userInfo];
             NSString *value = [dic objectForKey:@"pageName"];
             NSDictionary *objDict = [dict valueForKey:@"arguments"];
             if ([value isEqualToString:@"xxxxPageName"])
             {
                 NSLog("Do Something here, objDict==%@", objDict);      
             }

        }
        
        //3. 移除Notification的关注
        [[NSNotificationCenter defaultCenter] removeObserver:self];

       // Android:
       // 1. 创建BroadcastReceiver;
        private BroadcastReceiver mFocusNewStateReceiver = new BroadcastReceiver() {
            //@Override
            public void onReceive(Context context, Intent intent) {

                if (H5UtilPlugin.TAG_UPDATE_NATIVE_PAGE.equals(intent.getAction())) {
                    String info = intent.getStringExtra("info");
                    if (!StringUtil.emptyOrNull(info)) {
                        try {
                            JSONObject jsonObject = new JSONObject(info);
                            String value = jsonObject.getString("pageName");

                            if (!StringUtil.emptyOrNull(value)) {
                                if (value.equalsIgnoreCase("xxxxPageName")) {
                                    //TODO: do your job here
                                }
                            }    

                            String jsonStr = jsonObject.getString("jsonStr");
                            if (!StringUtil.emptyOrNull(jsonStr)) {
                                JSONObject obj = new JSONObject(jsonStr);
                                //TODO:with obj from hybrid
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        } finally {

                        }
                    }
                }
            }
        };
    
        //2. 注册创建BroadcastReceiver;
            IntentFilter filter = new IntentFilter();
            filter.addAction(H5UtilPlugin.TAG_UPDATE_NATIVE_PAGE);
            LocalBroadcastManager.getInstance(getApplicationContext()).registerReceiver(mFocusNewStateReceiver, filter);
            registerReceiver(mFocusNewStateReceiver, filter);

        //3. 使用完成，移除BroadcastReceiver
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(mFocusNewStateReceiver);
            unregisterReceiver(mFocusNewStateReceiver);

     */
    app_refresh_native_page:function(pageName, jsonStr) {
        var params = {};
        if (!pageName) {
            pageName = "";
        }
        if (!jsonStr) {
            jsonStr = "";
        }

        params.pageName = pageName;
        params.jsonStr = jsonStr;

        var paramString = Internal.makeParamString("Util", "refreshNativePage", params, "refresh_native_page");
        if(Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.refreshNativePage(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 复制文字到粘贴板
     * @brief 复制文字到粘贴板
     * @param {String} toCopyStr, 需要复制的文字
     * @method app_copy_string_to_clipboard
     * @since v5.3
     * @author jimzhao
     * @example CtripUtil.app_copy_string_to_clipboard("words_to_be_copy_xxxxxx");

     */
    app_copy_string_to_clipboard:function(toCopyStr) {
        if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }
        var params = {};
        if (!toCopyStr) {
            toCopyStr = "";
        }
        params.copyString = toCopyStr;

        var paramString = Internal.makeParamString("Util", "copyToClipboard", params, "copy_string_to_clipboard");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.copyToClipboard(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 从粘贴板读取复制的文字
     * @brief 从粘贴板读取复制的文字
     * @callback tagname="read_copied_string_from_clipboard";//返回当前粘贴板中的文字key=copiedString
     * @method app_read_copied_string_from_clipboard
     * @since v5.3
     * @author jimzhao
     * @example 

        Ctrip.app_read_copied_string_from_clipboard();
        //调用该函数之后，H5会收到如下回调
        var json_obj = 
        {
            tagname:"read_copied_string_from_clipboard",
            param: {
                copiedString:"words_copied_xxxxxx";
            }
        }
        app.callback(json_obj);
     */
    app_read_copied_string_from_clipboard:function() {
        var startVersion = "5.3";
         if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }

        var paramString = Internal.makeParamString("Util", "readCopiedStringFromClipboard", null, "read_copied_string_from_clipboard");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.readCopiedStringFromClipboard(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 根据URL下载数据
     * @brief 根据URL下载数据
     * @param {String} download_url 需要下载内容的URL
     * @param {String} suffix 保存的文件后缀
     * @param {Boolean} isIgnoreHttpsCertification 是否忽略非法的HTTPS证书
     * @method app_download_data
     * @since v5.3
     * @author jimzhao
     * @example

     CtripUtil.app_download_data("http://www.baidu.com/img/bdlogo.gif", "gif");
     //调用该函数后，native会返回H5内容
     var json_obj = {
        tagname:"download_data",
        error_code:"xxxxx",//param_error,download_faild
        param:{
            downloadUrl:"http://www.baidu.com/bdlogo.gif", 
            savedPath:"../wb_cache/pkg_name/md5_url_hash"
        }
     };
     app.callback(json_obj);
     */
    app_download_data:function(download_url, suffix, isIgnoreHttpsCertification) {
        if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }

        var params = {};
        if (!download_url) {
            download_url = "";
        }
        if (!suffix) {
            suffix = "";
        }
        params.downloadUrl = download_url;
        params.suffix = suffix;
        params.pageUrl = window.location.href;
        params.isIgnoreHttpsCertification = isIgnoreHttpsCertification;

        var paramString = Internal.makeParamString("Util", "downloadData",params,"download_data");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.downloadData(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 打开其它App，android可以根据包名和URL跳转，iOS只支持URL跳转
     * @brief 打开其它App
     * @param {String} packageId 需要打开的app的包名，android使用
     * @param {String} jsonParam 打开指定包名的app，所带的参数，json字符串
     * @param {String} url 需要打开的app支持的URL协议，如ctrip://xxx
     * @method app_open_other_app
     * @since v5.3
     * @author jimzhao
     * @example

     CtripUtil.app_open_other_app("com.tencent.mm", null, "weixin://xxxxx");
     //优先级说明：
     //1. android有packageId的时候，使用packageId＋jsonParam做跳转;
     //2. 无包名时候，android使用URL协议跳转;
     //3. iOS， winPhone OS都使用URL协议跳转;
     */
    app_open_other_app:function(packageId, jsonParam, url) {
        if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }

        var params = {};
        if (!packageId) {
            packageId = "";
        }
        if (!jsonParam) {
            jsonParam = "";
        }
        if (!url) {
            url = "";
        }
        params.packageId = packageId;
        params.jsonParam = jsonParam;
        params.url = url;
        var paramString = Internal.makeParamString("Util", "openOtherApp", params, "open_other_app");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Util_a.openOtherApp(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 将log写入到native的日志界面
     * @brief H5写日志到app
     * @method app_log
     * @param {String} log 需要打印打log
     * @param {String} result 上一句log执行的结果，可以为空,打印的时候会自动换行，加入时间
     * @since v5.2
     * @author jimzhao
     * @example

      CtripUtil.app_log("execute script xxxxx", "result for script is oooooo");
     */
    app_log:function(log, result) {
        if (!Internal.isNotEmptyString(log)) {
            return;
        }
        if (!Internal.isNotEmptyString(result)) {
            result = "";
        }
        var params = {};
        params.log = log;
        params.result = result;
        var paramString = Internal.makeParamString("Util", "h5Log", params, "log");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid)
        {
            window.Util_a.h5Log(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 选取图片/拍摄照片，返回图片base64字符串
     * @brief 选择图片/拍摄照片
     * @param {int} maxFileSize 选择的单张图片的最大文件大小，native会将图片做JPEG压缩到maxFileSize的范围内，单位是bit，默认200*1024
     * @param {int} maxPhotoCount 最多支持选择的图片个数,默认为1张，此时不显示多选
     * @param {JSON} meta 图片选取相关配置信息，5.8新增，5.8版本开始支持1个key， canEditSinglePhoto:单选能否编辑
     * @method app_choose_photo
     * @since v5.7
     * @author jimzhao
     * @example

       //选择一张需要编辑的图片
       var meta = {};
       meta.canEditSinglePhoto = true;
       CtripUtil.app_choose_photo(200*1024, 1, meta);
        
       //选择2张图片，单张图片大小限制200KB
       CtripUtil.app_choose_photo(200*1024, 2);
        
       //调用完成之后，返回的数据格式
       var json_obj =
        {
            tagname:"choose_photo",
            error_code:"",
            param:{
                photoList:["xx089xessewz....", "xx089xessewz...."]
            }
        }

        //未授权error_code,未授权错误返回如下，错误提示由native弹对话框处理。 6.0加入
        var json_obj =
        {
            tagname:"choose_photo",
            error_code:"(-301)相册/相机未授权",
        }

        app.callback(json_obj);
     
     */
    app_choose_photo:function(maxFileSize, maxPhotoCount, meta) {
        if (!Internal.isSupportAPIWithVersion("5.7")) {
            return;
        }
        var params = {};
        params.maxFileSize = maxFileSize;
        params.maxPhotoCount = maxPhotoCount;
        params.meta = meta;

        var paramString = Internal.makeParamString("Util", "choosePhoto", params, "choose_photo");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Util_a.choosePhoto(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 保存照片到相册
     * @brief  保存照片到相册
     * @param {String} photoUrl 需要保存图片的URL， 注：当photoBase64String字段不为空的时候，base64图片内容优先，URL不处理
     * @param {String} photoBase64String 需要保存图片的base64字符串,UTF8编码，
     * @param {String} imageName 图片保存到相册的名字，android有效，ios无效. 不传的时候，默认android存储为image.jpg
     * @method app_save_photo
     * @since v5.10
     * @author jimzhao
     * @example
        
       //保存图片base64内容
       CtripUtil.app_save_photo(null, "xxoooe33xxxeseee","my_img.jpg");
       //保存图片链接URL
       CtripUtil.app_save_photo("http://www.baidu.com/img/bd_logo1.png", null);

       //调用完成之后，返回的数据格式
       var json_obj =
        {
            tagname:"save_photo",
            error_code:"xxxxx",//error_code有内容时候，代表有错误，否则表示保存成功.error_code分为以下几种
            //(-200)参数错误, base64字符串转换成图片失败
            //(-201)下载成功，图片格式不正确
            //(-202)下载图片失败
            //(-203)保存到相册失败
            //(-301)相册未授权，错误提示由native弹对话框处理， 6.0加入
        }
        app.callback(json_obj);
     
     */
    app_save_photo:function(photoUrl, photoBase64String, imageName) {
        if (!Internal.isSupportAPIWithVersion("5.7")) {
            return;
        }
        var params = {};
        if (!photoUrl) {
            photoUrl = "";
        }
        if (!photoBase64String) {
            photoBase64String = "";
        }
        if (!imageName) {
            imageName = "";
        }

        params.photoUrl = photoUrl;
        params.photoBase64String = photoBase64String;
        params.imageName = imageName;
        var paramString = Internal.makeParamString("Util", "savePhoto", params, "save_photo");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Util_a.savePhoto(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description H5页面加载完成，通知native app，app会隐藏loading界面
     * @brief H5页面加载完成，通知native app
     * @method app_h5_page_finish_loading
     * @since v5.8
     * @author jimzhao
     * @example

       //H5页面加载完成后，通知native隐藏loading界面
       
       CtripUtil.app_h5_page_finish_loading();     
       
     */
    app_h5_page_finish_loading:function() {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }

        var paramString = Internal.makeParamString("Util", "h5PageFinishLoading", null, "h5_page_finish_loading");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Util_a.h5PageFinishLoading(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        } 
    }

};

/**
 * @class CtripUser
 * @description 用户相关类
 * @brief 用户相关类
 */
var CtripUser = {

    /**
     * @description 会员登录,native未登录时候，会显示会员登录界面，native会员已登录，直接完成，返回登录的用户信息
     * @brief 会员登录
     * @since 5.2
     * @method app_member_login 
     * @param {Boolean} isShowNonMemberLogin 是否现实非会员登录入， 5.7加入，默认不显示
     * @author jimzhao
     * @example 

     CtripUser.app_member_login(false);
     //调用完成后，H5会收到如下数据
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
    }

    var json_obj =
    {
        tagname:"member_login",
        param:userInfo,
    }
    app.callback(json_obj);
     
     */
    app_member_login:function(isShowNonMemberLogin) {
        var params = {};
        params.isShowNonMemberLogin = isShowNonMemberLogin;
        var paramString =  Internal.makeParamString("User", "memberLogin", params, 'member_login');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
      * @description 非会员登录
      * @brief 非会员登录
      * @since 5.2
      * @method app_non_member_login
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_non_member_login();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
      
      */
    app_non_member_login:function() {
        var paramString =  Internal.makeParamString("User", "nonMemberLogin", null, 'non_member_login');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.nonMemberLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

 
     /**
      * @description 会员自动登录,对于已经在native登陆的用户，app会通过调用callback回传登录数据，H5页面需要处理用户信息， 不显示输入用户名密码界面
      * @brief 会员自动登录
      * @since 5.2
      * @method app_member_auto_login
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_member_auto_login();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
      
      */
    app_member_auto_login:function() {
        var paramString =  Internal.makeParamString("User", "memberAutoLogin", null, 'member_auto_login');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberAutoLogin(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


     /**
      * @description 用户注册
      * @brief 用户注册
      * @since 5.2
      * @method app_member_register
      * @author jimzhao
      * @see app_member_login
      * @example 

      CtripUser.app_member_register();
      //调用后，H5会收到native回调的数据
      //回调的数据格式参考app_member_login()
     var userInfo = {
        "timeout":"2013/09/12",
        "data":
        {
          "LoginName":"wwwwww",
          "UserID":"21634352BAC43044380A7807B0699491",
          "IsNonUser":false,
          "UserName":"测试",
          "Mobile":"13845612110",
          "LoginToken":"",
          "LoginCode":0,
          "LoginErrMsg":"登录成功！",
          "Address":"",
          "Birthday":"19841010",
          "Experience":1453333973000,//微妙timestamp
          "Gender":1,
          "PostCode":"111111",
          "VipGrade":30,
          "VipGradeRemark":"钻石贵宾",
          "Email":"wang_peng@163.com",
          "ExpiredTime":"2013-09-12",
          "Auth":"079E643955C63839FF4617743DA20CFD93AFCAF6A82803A6F3ABD9219",
          "IsRemember":0,
          "BindMobile":18688888888
        },  
        "timeby":1
        }

        var json_obj =
        {
            tagname:"member_login",
            param:userInfo,
        }
        app.callback(json_obj);
          
      */
    app_member_register:function() {
        var paramString = Internal.makeParamString("User", "memberRegister", null, 'member_register');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.User_a.memberRegister(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


     /**
     * @description H5完成注册，将注册信用户息告知Native，native做登录
     * @brief H5完成注册，通知Native登录
     * @method app_finished_register
     * @param {JSON} userInfoJson 注册完成的用户信息
     * @since v5.7
     * @author jimzhao
     * @example 
        
        var userInfo = {};
        userInfo.userID = "xxxxxx";
        userInfo.phone="13900000000";
        userInfo.password="asdzxc";

        CtripUser.app_finished_register(userInfo)

     */
    app_finished_register:function(userInfoJson) {
        if (!Internal.isSupportAPIWithVersion("5.7")) {
            return;
        }

        if (!userInfoJson) {
            userInfoJson = "";
        }

        var params = {};
        params.userInfoJson = userInfoJson;

        var paramString = Internal.makeParamString("User", "finishedRegister", params, "finished_register");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.User_a.finishedRegister(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description H5登陆完成，将注册信息告知Native，native写入memory，修改登录态
     * @brief H5完成登录，通知Native修改登录态
     * @method app_finished_login
     * @param {JSON} userInfoJson 登录完成，服务器返回的用户信息
     * @since v5.8
     * @author jimzhao
     * @example 
                
        //.... json对象为服务器返回的用户信息对象
        var userModel = {};
        userModel.UserID = "132220000";
        userModel.UserName = "U2SB";
        userModel.Mobilephone = "13899999999";
        userModel.BindedMobilePhone = "13899999999";
        userModel.Telephone = "021-9999999"
        userModel.Gender =  0;
        userModel.Address = "火星，上海，月球";
        userModel.PostCode = "210000";
        userModel.Birthday = "1900-08-01";
        userModel.Email =  "US2B@gmail.com";
        userModel.Experience = 1344;
        userModel.VipGrade = 32;//
        userModel.VipGradeRemark = "蓝宝石";
        userModel.SignUpdate = "1911-09-09";
        userModel.Authentication = "2cxesescvdsfew32w3sxcq23";
        userModel.UserIconList = [];

        CtripUser.app_finished_login(userInfo)

     */
    app_finished_login:function(userInfoJson) {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }
        if (!userInfoJson) {
            userInfoJson = "";
        }

        var params = {};
        params.userInfoJson = userInfoJson;

        var paramString = Internal.makeParamString("User", "finishedLogin", params, "finished_login");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.User_a.finishedLogin(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

};


/**
 * @class CtripEncrypt
 * @description 加解密/HASH/编码相关类
 * @brief 提供给H5试用，通用加解密/HASH/编码相关类
 */
 var CtripEncrypt = {
    /**
      * @description  base64 UTF8编码
      * @brief base64 UTF8编码
      * @since 5.4
      * @method app_base64_encode
      * @param {String} toIncodeString 需要做base64 encode的字符串
      * @author jimzhao
      * @example 

      CtripEncrypt.app_base64_encode("xxxxxx");
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"base64_encode",
            param:
            {
                inString:"xxxxxx",
                encodedString:"eHh4eHh4",
            },
        }
        app.callback(json_obj);
          
      */
    app_base64_encode:function(toIncodeString) {
        if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }

        if (!toIncodeString) {
            toIncodeString = "";
        }

        params = {};
        params.toIncodeString = toIncodeString;

        var paramString = Internal.makeParamString("Encrypt", "base64Encode", params, 'base64_encode');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.base64Encode(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
      * @description MD5 哈希算法，长度32，大写
      * @brief MD5 哈希算法
      * @since 5.4
      * @method app_md5_hash
      * @param {String} inString 需要做MD5 哈希的字符串
      * @author jimzhao
      * @example 

      CtripEncrypt.app_md5_hash("abcdxxxx");
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"md5_hash",
            param:
            {   
                inString:"abcdxxxx"
                outString:"FDA820BA864415E2451BE1C67F1F304A",
            },
        }
        app.callback(json_obj);
          
      */
    app_md5_hash:function(inString) {
        if (!Internal.isSupportAPIWithVersion("5.5")) {
            return;
        }

        if (!inString) {
            inString = "";
        }

        params = {};
        params.inString = inString;

        var paramString = Internal.makeParamString("Encrypt", "md5Hash", params, 'md5_hash');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.md5Hash(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
      * @description Ctrip私有加解密算法
      * @brief Ctrip私有加解密算法
      * @since 5.5
      * @method app_ctrip_encrypt
      * @param {String} inString 需要做加解密的字符串
      * @param {String} encType 加解密类型，加密为1， 解密为2，其它不处理
      * @author jimzhao
      * @example 

      CtripEncrypt.app_ctrip_encrypt("abcdxxxx",1);
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"ctrip_encrypt",
            param:
            {
                inString:"abcdxxxx",
                outString:"ABScdXkYZunwXVF5kQpffnY+oL/MFmJGkn8ra8Ab5cI=",
                encType:1
            },
        }
        app.callback(json_obj);
          
      */
    app_ctrip_encrypt:function(inString, encType) {
        if (!Internal.isSupportAPIWithVersion("5.5")) {
            return;
        }
        if (!inString) {
            inString = "";
        }

        params = {};
        params.inString = inString;
        params.encType = encType;
        var paramString = Internal.makeParamString("Encrypt", "ctripEncrypt", params, 'ctrip_encrypt');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Encrypt_a.ctripEncrypt(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

 };


/**
 * @class CtripPay
 * @description Ctrip相关支付控件
 * @brief 提供Ctrip业务相关的支付功能
 */
 var CtripPay = {

     /**
      * @description  检查支付相关App安装情况
      * @brief  检查支付相关App安装情况
      * @since 5.4
      * @method app_check_pay_app_install_status
      * @author jimzhao
      * @example 

      CtripPay.app_check_pay_app_install_status();
      //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"check_pay_app_install_status",
            param:
            {
                platform:"iOS", //Android
                weixinPay:true,
                aliWalet:true,
                aliQuickPay:true,
            },
        }

        app.callback(json_obj);
      */
    app_check_pay_app_install_status:function() {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        var paramString = Internal.makeParamString("Pay","checkPayAppInstallStatus",null,'check_pay_app_install_status');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pay_a.checkPayAppInstallStatus(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
      * @description  根据URL打开支付App
      * @brief  根据URL打开支付App
      * @param {String} payAppName 支付App的URL，暂固定为以下4个， aliWalet/aliQuickPay/wapAliPay/weixinPay(微信支付暂未支持)
      * @param {String} payMeta 服务器返回的支付配置信息，ali相关为URL，微信支付为xml
      * @param {String} successRelativeURL 支付成功跳转的URL
      * @param {String} detailRelativeURL  支付失败或者支付
      * @since 5.4
      * @method app_open_pay_app_by_url
      * @author jimzhao
      * @example 

      CtripPay.app_open_pay_app_by_url("aliWalet","alipay://orderId=123","car/paySuccess.html", "car/payDetail.html");
      //调用后，App会做相应的页面跳转

      */
    app_open_pay_app_by_url:function(payAppName, payMeta, successRelativeURL, detailRelativeURL) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!payMeta) {
            payMeta = "";
        }
        
        if (!payAppName) {
            payAppName = "";
        }

        if (!successRelativeURL) {
            successRelativeURL = "";
        }

        if (!detailRelativeURL) {
            detailRelativeURL = "";
        }

        var params = {};
        params.payMeta = payMeta;
        params.payAppName = payAppName;
        params.successRelativeURL = successRelativeURL;
        params.detailRelativeURL = detailRelativeURL;

        var paramString = Internal.makeParamString("Pay","openPayAppByURL",params,'open_pay_app_by_url');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pay_a.openPayAppByURL(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
      * @description  用于hybrid bu进入支付时统一调用，用于读取native 中保存的payment_route_[bustype]
      * @brief  用于hybrid bu进入支付时统一调用，用于读取native 中保存的payment_route_[bustype]
      * @param {Object} paymentParam bu传递进入支付页面的参数集合{path: "payment2",param: n,callback: "PaymentCallback"}
 
      * @method app_call_pay
      * @author jianggd@Ctrip.com
      * @example
 
      CtripPay.app_call_pay({path: "payment2",param: n,callback: "PaymentCallback"});
      //调用后，会取到对应bu的跳转路由
    **/
    app_call_pay: function(paymentParam) {
        paymentParam = paymentParam || {};
        paymentParam.param = paymentParam.param || "";
        if(typeof(paymentParam.param) != "string"){
            return;
        }
        var _urlParam = paymentParam.param.split("?")[1] || "";
        var _urlDic = _urlParam.split("&") || [];
        var _bustype = "";
 
        for(var i = 0; i < _urlDic.length; i++){
           var _res = _urlDic[i].split("=") || [];
           var _key = _res[0];
           var _value = _res[1];
           if(_key === "bustype"){
               _bustype = _value;
               break;
           }
        }
 
        paymentParam.names = ["payment_route_" + _bustype];
 
        var paramString = Internal.makeParamString("Pay","callPay", paymentParam, "call_pay");
   
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else {
            if (Internal.isAndroid) {
                window.Pay_a.callPay(paramString);
            } else {
                if (Internal.isWinOS) {
                    Internal.callWin8App(paramString)
                }
            }
        }
    }

 };

/**
 * @class CtripPipe
 * @description App给H5提供的通讯管道
 * @brief 提供标准HTTP和H5管道服务
 */
var CtripPipe = {

    /**
     * @description H5通过App发送服务
     * @brief H5通过App发送服务
     * @method app_send_HTTP_pipe_request
     * @param {String} baseURL HTTP请求发送的URL地址     
     * @param {String} path HTTP请求发送的URL的路径
     * @param {String} method HTTP请求方式GET/POST
     * @param {String} header HTTP头，JSON字符串格式key/value，cookie作为一个key存储再HEADER内部
     * @param {Array}  parameters key=value形式的字符串数组,请做好参数的Encode，app端只负责拼接
     * @param {Boolean}  isIgnoreHTTPSCertification 是否忽略HTTPS证书
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @since v5.4
     * @author jimzhao
     * @example 

     //GET http://www.baidu.com/s?wd=good+day&rsv_bp=0&ch=&tn=baidu&bar=&rsv_spt=3&ie=utf-8&rsv_sug3=4&rsv_sug4=469&rsv_sug1=2&rsv_sug2=0&inputT=166
    
      var paramArr = new Array();
      paramArr[0]="wd=good+day";
      paramArr[1]="rsv_bp=0";
      paramArr[2]="ch=";
      paramArr[3]="tn=";
      paramArr[4]="baidu=";
      paramArr[5]="bar=";
      paramArr[6]="rsv_spt=3";
      paramArr[7]="ie=utf-8";
      paramArr[8]="rsv_sug3=4";
      paramArr[9]="rsv_sug4=469";
      //。。。。其它参数依次类推，请做好参数的Encode，app端只负责拼接

      CtripPipe.app_send_HTTP_pipe_request("http://www.baidu.com", "/s","GET",null,paramArr, false, "13222222");

     //调用后，H5会收到native回调的数据
        var json_obj =
        {
            tagname:"send_http_pipe_request",
            param:
            {
                responseString:"eHh4eHh4",
                responseCookie : {
                     "BAIDUID":"2959D035E2F5D7C979687934D558DCD3:FG=1",
                     "BDSVRTM":10,
                     "BD_CK_SAM":1,
                     "H_PS_PSSID":"1429_5225_5287_5722_5848_4261_5830_4759_5659_5857"
                },

                sequenceId:"13222222"
            },
        }
        app.callback(json_obj);

     */
    app_send_HTTP_pipe_request:function(baseURL, path, method, header, parameters, isIgnoreHTTPSCertification, sequenceId) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!baseURL) {
            baseURL = "";
        }
        if (!path) {
            path = "";
        }
        if (!method) {
            method = "";
        }
        if (!header) {
            header = "";
        }
        if (!parameters) {
            parameters = "";
        }

        if (!sequenceId) {
            sequenceId = "";
        }
        var params = {};
        params.baseURL = baseURL;
        params.path = path;
        params.method = method;
        params.header = header;
        params.parameters = parameters;
        params.sequenceId = sequenceId;
        params.isIgnoreHTTPSCertification = isIgnoreHTTPSCertification;

        var paramString = Internal.makeParamString("Pipe", "sendHTTPPipeRequest", params, 'send_http_pipe_request');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pipe_a.sendHTTPPipeRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }

    },

     /**
     * @description 根据发送的sequenceId，终止正在发送的HTTP请求
     * @brief 终止正在发送的HTTP请求
     * @method app_abort_HTTP_pipe_request
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripPipe.app_abort_HTTP_pipe_request("13523333333");

     */
    app_abort_HTTP_pipe_request:function(sequenceId) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!sequenceId) {
            sequenceId = "";
        }

        var params = {};
        params.sequenceId = sequenceId;
        var paramString = Internal.makeParamString("Pipe", "abortHTTPRequest", params, 'abort_http_pipe_request');
        
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Pipe_a.abortHTTPRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description H5通过App发送服务
     * @brief H5通过App发送服务
     * @method app_send_H5_pipe_request
     * @param {String} serviceCode 需要发送服务的服务号
     * @param {String} header 服务的header
     * @param {String} data 服务所需要的数据部分，各个服务都不同
     * @param {String} sequenceId 发送服务的序列号，随机生存即可
     * @param {int} pipeType 管道类型，因mobileServer原因，5.4的管道是支付专用，默认是0=支付管道，1＝公共管道
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripUtil.app_send_H5_pipe_request("9500001", "H5Agent","{}","13523333333");
     //调用后，H5会收到native回调的数据

        //成功 
        var json_obj =
        {
            tagname:"send_h5_pipe_request",
            param:
            {
                sequenceId:"13523333333",
                resultMessage:"eHh4eHh4",
                resultHead:"eHh4eHh4",
                resultBody:"eHh4eHh4",
                result:1,
            },
        }

        //失败
        //  code定义，返回给Hybrid时候，为负数，iOS/Android －200开始，递减
        //  CONN_FAIL_TYPE_NO_FAIL = 200------------------正确，无错误
        //  CONN_FAIL_TYPE_GETCONN_UNKOWN = 201-----------从连接池获取长连接失败
        //  CONN_FAIL_TYPE_GETIP = 202--------------------获取IP地址失败
        //  CONN_FAIL_TYPE_CONNECT = 203------------------创建连接失败
        //  CONN_FAIL_TYPE_SEND_DATA = 204----------------发送数据失败
        //  CONN_FAIL_TYPE_RECEIVE_LENGTH = 205-----------读报文头失败
        //  CONN_FAIL_TYPE_RECEIVE_BODY = 206-------------读报文体失败
        //  CONN_FAIL_TYPE_BUILE_REQUESTDATAFAIL = 207----创建请求报文失败
        //  CONN_FAIL_TYPE_BUILE_RESPONSEDATAFAIL = 208---解析返回报文失败
        //  CONN_FAIL_TYPE_SERIALIZE_REQUEST_FAIL = 209---序列化请求报文失败
        //  CONN_FAIL_TYPE_SERIALIZE_RESPONSE_FAIL = 210--序列化返回报文失败
        //  CONN_FAIL_TYPE_RESPONSE_REPEAT = 211----------服务端下发需要重试
        var json_obj =
        {
            tagname:"send_h5_pipe_request",
            param:
            {
                sequenceId:"13523333333",
                errorInformation:"抱歉！加载失败，请重试(-203)", //括号内的code为errorCode，5.8.1加入
                serverErrorCode:"eHh4eHh4",
            },
        }
        app.callback(json_obj);

     */
    app_send_H5_pipe_request:function(serviceCode,header,data, sequenceId, pipeType) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!serviceCode) {
            serviceCode = "";
        }
        if (!header) {
            header = "";
        }
        if (!data) {
            data = "";
        }
        if (!sequenceId) {
            sequenceId = "";
        }

        if (!pipeType) {
            pipeType = 0;
        }

        var params = {};
        params.serviceCode = serviceCode;
        params.header = header;
        params.data = data;
        params.sequenceId = sequenceId;
        params.pipeType = pipeType;

        var paramString = Internal.makeParamString("Pipe", "sendH5PipeRequest", params, 'send_h5_pipe_request');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Pipe_a.sendH5PipeRequest(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};



/**
 * @class CtripSumSungWallet
 * @description 三星钱包相关API
 * @brief 三星钱包相关API
 */
var CtripSumSungWallet = {

     /**
     * @description 检查ticket是否在三星钱包app中
     * @brief 检查ticket是否在三星钱包app中
     * @method app_check_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.3.2
     * @author jimzhao
     * @example 
     * 
     * CtripSumSungWallet.app_check_ticket_in_samsung_wallet("ID123333");

       //调用之后会收到
        var json_obj = {
            tagname : "check_ticket_in_samsung_wallet",
            param : {
                insInSamSungWallet: false, //true
            }
        }
        
        app.callback(json_obj);
     */
    app_check_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "checkTicketInSamSungWallet", param, 'check_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.checkTicketInSamSungWallet(paramString);
        }
    },

     /**
     * @description 到三星钱包中下载ticket
     * @brief 到三星钱包中下载ticket
     * @method app_download_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.32
     * @author jimzhao
     * @example 
     * 
     * CtripSumSungWallet.app_download_ticket_in_samsung_wallet("ID123333");
    
        //调用之后会收到
        var json_obj = {
            tagname : "download_ticket_in_samsung_wallet",
            param : {
                isDownloadSuccess: false, //true，下载成功的时候没有errorInfo
                errorInfo: "网络故障", 
            }
        }

        app.callback(json_obj);
     */
    app_download_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "downloadTicketInSamSungWallet", param, 'download_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.downloadTicketInSamSungWallet(paramString);
        }
    },

     /**
     * @description 在三星钱包app中查看Ticket
     * @brief 在三星钱包app中查看Ticket
     * @method app_show_ticket_in_samsung_wallet
     * @param {String} ticketID ticket的ID，服务器返回
     * @since v5.32
     * @author jimzhao
     * @example 
     
      CtripSumSungWallet.app_show_ticket_in_samsung_wallet("ID123333");

     //调用之后会收到
        var json_obj = {
            tagname : "show_ticket_in_samsung_wallet",
            param : {
                errorInfo: "Ticket ID不存在", //true
            }
        }
        
        app.callback(json_obj);
     */
    app_show_ticket_in_samsung_wallet:function(ticketID) {
        if (!ticketID) {
            ticketID = "";
        }

        var param = {};
        param.ticketID = ticketID;

        paramString = Internal.makeParamString("SamSungWallet", "showTicketInSamSungWallet", param, 'show_ticket_in_samsung_wallet');
        if (Internal.isAndroid) {
            window.SamSungWallet_a.showTicketInSamSungWallet(paramString);
        }
    }

};

/**
 * @class CtripFile
 * @description 文件IO操作相关API
 * @brief 文件IO操作相关API
 */
var CtripFile  = {
    /**
     * @description 获取当前web页面的sandbox目录，在webapp/wb_cache/xxxx/目录下xxxx即为当前sandbox的名字
     * @brief 获取当前web页面的sandbox目录
     * @method app_get_current_sandbox_name
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_get_current_sandbox_name();

     //调用之后会收到
        var json_obj = {
            tagname : "get_current_sandbox_name",
            param : {
                sandboxName: "car", 
            }
        }
        
        app.callback(json_obj);
     */
    app_get_current_sandbox_name:function() {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        var params = {};
        params.pageUrl = window.location.href;

        var paramString = Internal.makeParamString("File", "getCurrentSandboxName", params, 'get_current_sandbox_name');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.File_a.getCurrentSandboxName(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
     /**
     * @description 文本写入文件中，UTF8编码。可以指定文件名，或者相对路径
     * @brief 写文本到本地文件
     * @method app_write_text_to_file
     * @param {String} text 需要写入文件的文本内容
     * @param {String} fileName 写入的文件路径
     * @param {String} relativeFilePath 写入的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @param {BOOL} isAppend 是否是将当前文件append到已有文件
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_write_text_to_file("Hello,世界", "log.txt", null, false); //文件存储在本地的/webapp/wb_cache/car/log.txt
      CtripFile.app_write_text_to_file("Hello2,世界", null, /car/mydir/log.txt, false); //文件存储在本地的/webapp/wb_cache/car/mydir/log.txt

     //调用之后会收到
        var json_obj = {
            tagname : "write_text_to_file",
            param : {
                isSuccess: true, 
            }
        }
        
        app.callback(json_obj);
     */
    app_write_text_to_file:function(text, fileName, relativeFilePath, isAppend) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!text) {
            text = "";
        }
        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }
        var params = {};
        params.pageUrl = window.location.href;
        params.text = text;
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.isAppend = isAppend;
        var paramString = Internal.makeParamString("File", "writeTextToFile", params, 'write_text_to_file');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.writeTextToFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 删除文件/目录。可以指定文件名，或者相对路径
     * @brief 删除文件/目录
     * @method app_delete_file
     * @param {String} fileName 需要删除的文件路径
     * @param {String} relativeFilePath 需要删除的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_delete_file("log.txt", null); //删除文件/webapp/wb_cache/car/log.txt
      CtripFile.app_delete_file(null,"/car/mydir/log.txt"; //删除文件/webapp/wb_cache/car/mydir/log.txt

     //调用之后会收到
        var json_obj = {
            tagname : "delete_file",
            param : {
                isSuccess: true, 
            }
        }
        
        app.callback(json_obj);
     */    
    app_delete_file:function(fileName, relativeFilePath) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        var paramString = Internal.makeParamString("File", "deleteFile", params, 'delete_file');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.File_a.deleteFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 读取文本文件内容，UTF-8编码。可以指定文件名，或者相对路径
     * @brief 读取文本文件内容
     * @method app_read_text_from_file
     * @param {String} fileName 需要读取内容的文件路径
     * @param {String} relativeFilePath 需要读取内容的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_read_text_from_file("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_read_text_from_file(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "read_text_from_file",
            param : {
                text: "Hello,世界", 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_read_text_from_file:function(fileName, relativeFilePath) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.pageUrl = window.location.href;
        params.relativeFilePath = relativeFilePath;
        var paramString = Internal.makeParamString("File", "readTextFromFile", params, 'read_text_from_file');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.readTextFromFile(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 读取文件大小。可以指定文件名，或者相对路径
     * @brief 读取文件大小
     * @method app_get_file_size
     * @param {String} fileName 需要读取文件大小的文件路径
     * @param {String} relativeFilePath 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_get_file_size("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_get_file_size(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "get_file_size",
            param : {
                fileSize: 8 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_get_file_size:function(fileName, relativeFilePath) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        var paramString = Internal.makeParamString("File", "getFileSize", params, 'get_file_size');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.getFileSize(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
      /**
     * @description 检查文件是否存在。可以指定文件名，或者相对路径
     * @brief 检查文件是否存在
     * @method app_check_file_exist
     * @param {String} fileName 需要读取文件大小的文件路径
     * @param {String} relativeFilePath 需要读取文件大小的文件相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_check_file_exist("log.txt", null); //从文件/webapp/wb_cache/car/log.txt读取内容
      CtripFile.app_check_file_exist(null,"/car/mydir/log.txt"; //从文件/webapp/wb_cache/car/mydir/log.txt读取内容

     //调用之后会收到
        var json_obj = {
            tagname : "check_file_exist",
            param : {
                isExist: true 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_check_file_exist:function(fileName, relativeFilePath) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!fileName) {
            fileName = "";
        }
        if (!relativeFilePath) {
            relativeFilePath = "";
        }

        var params = {};
        params.fileName = fileName;
        params.relativeFilePath = relativeFilePath;
        params.pageUrl = window.location.href;
        var paramString = Internal.makeParamString("File", "checkFileExist", params, 'check_file_exist');
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.checkFileExist(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },
    
    /**
     * @description 创建文件夹。可以指定文件名，或者相对路径
     * @brief 创建文件夹
     * @method app_make_dir
     * @param {String} dirName 需要创建的文件夹路径
     * @param {String} relativeDirPath 需要创建的文件夹相对路径，需要调用app_get_current_sandbox_name获取sandbox的名字+路径
     * @since v5.4
     * @author jimzhao
     * @example 
     
      CtripFile.app_make_dir("mydir2", null); //创建文件夹/webapp/wb_cache/car/mydir2/
      CtripFile.app_make_dir(null,"/car/mydir/innerDir"; //创建文件夹/webapp/wb_cache/car/mydir/innerDir/

     //调用之后会收到
        var json_obj = {
            tagname : "make_dir",
            param : {
                isSuccess: true 
            }
        }
        
        app.callback(json_obj);
     */ 
    app_make_dir:function(dirName,relativeDirPath) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }

        if (!dirName) {
            dirName = "";
        }
        if (!relativeDirPath) {
            relativeDirPath = "";
        }

        var params = {};
        params.dirName = dirName;
        params.pageUrl = window.location.href;
        params.relativeDirPath = relativeDirPath;

        var paramString = Internal.makeParamString("File", "makeDir", params, 'make_dir');

         if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.File_a.makeDir(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
    
};

/**
 * @class CtripBar
 * @description H5页面顶部导航栏和底部工具栏的控制
 * @brief H5页面顶部/底部导航栏控制
 */
var CtripBar = {
     /**
     * @description 刷新顶部条按钮和文字
     * @brief 刷新顶部条按钮和文字
     * @param {String} nav_bar_config_json 顶部条配置json串
     * @method app_refresh_nav_bar
     * @author jimzhao
     * @since v5.2
     * @example

        //导航栏总共分为3部分:
        1.左侧，返回按钮，不能修改; 

        2.中间title，可以自定义，样式总共3种;
            a.标题[1行或者2行subtitle]；key=center;
           center:[
                {
                    "tagname": "title", 
                    "value":"携程" //标题文字
                },
                {
                    "tagname":"subtitle",//子标题的tagname必须为subtitle
                     value:"上海到北京", //子标题文字
                }
            ],
            b.带事件的标题；key=centerButtons;
            centerButtons:[
                {
                    "tagname": "cityChoose",  //点击标题回调H5的tagname
                    "value":"上海",  //标题文字
                    "a_icon":"icon_arrowx", //标题文字后面的按钮图片名，for android @deprecated
                    "i_icon":"icon_arrowx.png", //标题文字后面的按钮图片名，for iOS @deprecated
                    "imagePath":"car/res/logo.png", //标题文字后面的按钮图片名，图片路径，相对于业务模块的路径，比如car/res/logo.png， v5.8开始支持
                    "pressedImagePath":"car/res/logo.png"  //标题文字后面的按钮图片名，选中状态图片路径，相对于业务模块的路径，比如car/res/logo.png， v5.8开始支持
                }
            ], 

        3.右侧按钮,key=right, 可以自定义，样式总共3种， 
            A.1个文字按钮;
            B.1个图片按钮；
            C.2个图片按钮；
            单个右侧按钮样式的定义格式为
            right:[{
                tagname:"xxxx",  //点击之后 callback给H5的事件名字,
                value:"btn_title", //按钮上的文字
                imagePath:"car/res/logo.png",  //按钮上的图片，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                pressedImagePath:"car/res/logo.png" //按钮上的图片选中的效果图，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
            }]
           

        4.跟多按钮,key=moreMenus 5.9新增 多个menu的配置
            moreMenus:[
                {
                    tagname:"xxxx",  //点击之后 callback给H5的事件名字,
                    value:"btn_title", //按钮上的文字
                    imagePath:"car/res/logo.png",  //按钮上的图片，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                    pressedImagePath:"car/res/logo.png" //按钮上的图片选中的效果图，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                }

                {
                    tagname:"xxxx",  //点击之后 callback给H5的事件名字,
                    value:"btn_title", //按钮上的文字
                    imagePath:"car/res/logo.png",  //按钮上的图片，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                    pressedImagePath:"car/res/logo.png" //按钮上的图片选中的效果图，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                }

                {
                    tagname:"xxxx",  //点击之后 callback给H5的事件名字,
                    value:"btn_title", //按钮上的文字
                    imagePath:"car/res/logo.png",  //按钮上的图片，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                    pressedImagePath:"car/res/logo.png" //按钮上的图片选中的效果图，可以是相对于业务模块的路径，比如 car/res/logo.png， v5.8开始支持
                }

            ]

        5.  app预置tagname定义及说明(hybrid开发人员请避免使用以下预置的tagname)：
            1). tagname=home, 返回app首页，图片，事件 都不需要H5处理；
            2). tagname=call, 拨打呼叫中心，图片，事件 都不需要H5处理；                 @电话CTI统一出口，6.1开始，当前tagname需要，json对象中需要配置businessCode， pageId字段
            3). tagname=phone, 拨打电话，图片-native预置，事件交由H5处理；v5.8开始支持； 
            4). tagname=share, 分享，图片-native预置，事件将会交给H5处理；v5.8开始支持；
            5). tagname=favorite, 收藏，图片-native预置, 事件交给H5处理；v5.8开始支持；
            6). tagname=favorited, 已经收藏，图片-native预置，事件交给H5处理；v5.8开始支持；
            7). tagname=more, 图片，事件 都不需要H5处理；
            8). tagname=more_my_order, 更多菜单-我的订单, 图片-native预置，事件需要H5处理;
            9). tagname=more_message_center, 更多菜单-消息中心, 图片-native预置，事件需要H5处理;
           10). tagname=more_home, 更多菜单-App首页, 图片／事件都由native处理;
           11). tagname-more_my_favorite 更多菜单－我的收藏, 图片-native预置，事件需要H5处理;
           12). tagname-more_share 更多菜单－分享, 图片-native预置，事件需要H5处理;
           13). tagname=search, 搜索，图片有native预置，事件交由H5处理；v5.9开始支持；
           14). tagname=more_phone, 更多菜单－电话，图片有native预置，事件交由H5处理；v5.9开始支持；
           15). tagname=more_share, 更多菜单－分享，图片有native预置，事件交由H5处理；v5.9开始支持；
           16). 其他tagname，图片有H5提供，事件H5处理；

        示例：
        var nav_json = {   
            "right": [{"tagname": "click_tag_name", "value":"Click", "imagePath":"car/res/logo.png", "pressedImagePath":"car/res/logo_pressed.png"}],
            "center": [{"tagname": "title", "value":"携程"},{"tagname":"subtitle", value:"上海到北京"}],
            "centerButtons": [{"tagname": "cityChoose", "value":"上海", "a_icon":"icon_arrowx", "i_icon":"icon_arrowx.png","imagePath":"car/res/logo.png", "pressedImagePath":"car/res/logo_pressed.png"}], 
        }
        
        //拨打电话增加CTI统一出口demo
        var nav_json = {
            "center": [{"tagname": "title", "value":"携程"}],
            "right": [{"tagname": "call", "businessCode":"tour_call_id_0001", "pageId":"tour_page_id_1111"}],//businessCode, pageId为6.1开始识别
        }

        var json_str = JSON.stringify(nav_json);
        CtripBar.app_refresh_nav_bar(json_str);

        //调用完成，顶部条title为携程，右侧有一个按钮，按钮文字为Click，用户点击按钮后，H5页面会收到如下回调
        var cb_json = {tagname:"click_tag_name"};
        app.callback(cb_json);
        //H5页面需要处理tagname为click_tag_name的事件

     */
    app_refresh_nav_bar:function(nav_bar_config_json) {
        if (Internal.isNotEmptyString(nav_bar_config_json)) {
            jsonObj = JSON.parse(nav_bar_config_json);

            jsonObj.service = "NavBar";
            jsonObj.action = "refresh";
            jsonObj.callback_tagname = "refresh_nav_bar";
            
            var paramString = JSON.stringify(jsonObj);

            if (Internal.isIOS) {
                var url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
            else if (Internal.isAndroid) {
                window.NavBar_a.refresh(paramString);
            }
            else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
            }
        }
    },


      /**
     * @description 设置顶部导航栏隐藏／显示，使用该函数的隐藏顶部栏之后，必须保证页面有离开H5页面的功能，否则用户无法离开，必须要kill掉app。
     * @brief 顶部导航隐藏／显示
     * @param {boolean} isHidden 是否隐藏顶部导航栏
     * @since 5.4
     * @method app_set_navbar_hidden
     * @author jimzhao
     * @example 

     CtripBar.app_set_navbar_hidden(false);
     */
    app_set_navbar_hidden:function(isHidden) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }  

        var params = {};
        params.isHidden = isHidden;
        var paramString = Internal.makeParamString("NavBar","setNavBarHidden",params,"set_navbar_hidden");
        
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.NavBar_a.setNavBarHidden(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }   
    },

      /**
     * @description 设置底部工具栏隐藏／显示
     * @brief 底部工具栏隐藏／显示
     * @param {boolean} isHidden 是否隐藏底部工具栏
     * @since 5.4
     * @method app_set_toolbar_hidden
     * @author jimzhao
     * @example 

     CtripBar.app_set_toolbar_hidden(false);
     */
    app_set_toolbar_hidden:function(isHidden) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        }
        var params = {};
        params.isHidden = isHidden;
        var paramString = Internal.makeParamString("NavBar","setToolBarHidden",params,"set_toolbar_hidden");
        
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.NavBar_a.setToolBarHidden(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }   
    }
};


/**
 * @class CtripMap
 * @description 地图相关类，定位/导航
 * @brief 地图相关类，定位/导航
 */

var CtripMap = {
 /**
     * @description 定位，定位完成会有2－3次callback，第一次返回经纬度信息，第二次返回逆地址解析的信息， 第三次返回ctripCity信息(调用参数isNeedCtripCity需要设置成true)
     * @brief 定位
     * @param {int} timeout 定位timeout，设置timeout<=1或者timeout>=60,都会默认设置为15s
     * @param {Boolean} isNeedCtripCity 是否需要携程的城市定位，如果需要，会返回酒店&攻略的城市ID信息
     * @param {Boolean} isForceLocate 是否强制定位，如果是强制定位，native会发起定位，不用缓存中的数据 v6.0加入
     * @param {String} sequenceId 定位是异步调用，调用的时候传入该字段，取消的时候，可以根据该sequenceId取消/停止定位 v6.0加入
     * @method app_locate
     * @author jimzhao
     * @since v5.1
     * @example
        //调用定位
        CtripUtil.app_locate(15, true, true, "222222");

        //0. 定位失败－－5.10加入
        var json_obj = {
            tagname:'locate',
            error_code:"(-201)定位未开启" 
        };
        //error_code定义：
        a.(-201)定位未开启
        b.(-202)获取经纬度失败
        c.(-203)定位超时
        d.(-204)逆地址解析失败
        e.(-205)获取Ctrip城市信息失败
    
        //1. 返回定位的经纬度信息-------5.8版本加入
        var json_obj = 
         {
            tagname:'locate',
            param:{
                "value":{
                    lat:'121.487899',
                    lng:'31.249162'
                },
                "type":"geo" //表明是获取经纬度成功的返回值
            }
        }
        app.callback(json_obj);


        //2. 返回定位的逆地址解析信息
        var json_obj =
        {
            tagname:'locate',
            param:{
                "value":{
                    country:"中国",//5.9加入
                    countryShortName:"CN",//5.9加入
                    city:"上海", //5.9加入
                    ctyName: '上海', //后续版本将会废弃，使用city代替
                    province: '上海',    //5.8.1版本加入
                    district:"浦东新区", //5.8.1版本加入
                    addrs:'上海市浦东南路22号',
                    lat:'121.487899',
                    lng:'31.249162'
                },
                "type":"address" //表明是逆地址解析成功的返回值
            }
        }

        //3. 返回CtripCity信息，isNeedCtripCity参数为true的时候才有返回，5.10加入
        var json_obj = {
            tagname:'locate',
            param:{
                "value":{
                    "CountryName":"中国",       //所在国家
                    "ProvinceName":"江苏",      //所在省份
                    "CityEntities":[            //城市名列表，城市等级从低到高，先是县级市，然后是地级市，使用者应按列表顺序匹配，匹配到即结束
                        {"CityName":"昆山","CityID":100}, 
                        {"CityName":"苏州","CityID":1000} 
                        ]
                },
                "type":"CtripCity" //表明是CtripCity成功的返回值
            }
        }

        app.callback(json_obj);
     * 
     */
    app_locate:function(timeout, isNeedCtripCity, isForceLocate, sequenceId) {
        var params = {};
        params.timeout = timeout;
        params.isNeedCtripCity = isNeedCtripCity;
        params.isForceLocate = isForceLocate;
        params.sequenceId = sequenceId;
        var paramString = Internal.makeParamString("Locate", "locate", params, 'locate')
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.locate(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 停止定位定位，传入定位app_locate时候，传递过去的sequenceId
     * @brief 停止定位
     * @param {String} sequenceId 定位app_locate时候，传递过去的sequenceId
     * @method app_stop_locate
     * @author jimzhao
     * @since v6.0
        
        //使用
        CtripMap.app_stop_locate("222222");

     */
    app_stop_locate:function(sequenceId) {
        if (!Internal.isSupportAPIWithVersion("6.0")) {
            return;
        }
        var params = {};
        params.sequenceId = sequenceId;

        var paramString = Internal.makeParamString("Locate", "stopLocate", params, 'stop_locate')
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.stopLocate(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 在地图上显示某个位置
     * @brief 在地图上显示某个位置/导航
     * @param {double} latitude, 纬度
     * @param {double} longitude, 经度
     * @param {String} title, 在地图上显示的点的主标题
     * @param {String} subtitle, 在地图上显示点的附标题
     * @method app_show_map
     * @author jimzhao
     * @since v5.5
     * @example
        
        CtripMap.app_show_map(31.3222323, 121.32232332, "上海野生动物园", "浦东新区陆家嘴1234号");
     *
     */
    app_show_map:function(latitude, longitude, title, subtitle) {
        if (!Internal.isSupportAPIWithVersion("5.5")) {
            return;
        }

        if (!title) {
            title = "";
        }
        if (!subtitle) {
            subtitle = "";
        }

        var params = {};
        params.latitude = latitude;
        params.longitude = longitude;
        params.title = title;
        params.subtitle = subtitle;
        var paramString = Internal.makeParamString("Locate", "showMap",params, 'show_map');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.showMap(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 在地图上显示多个POI位置点
     * @brief 在地图上显示多个位置/导航
     * @param {Array} poiList poi列表, list中为JSON对象，key为：latitude, longitude, title, subtitle
     * @method app_show_map_with_POI_list
     * @author jimzhao
     * @since v5.8
     * @example
        
        var poi0 = {};
        poi0.latitude = 31.3222323; //must
        poi0.longitude = 121.32232332;//must
        poi0.title = "上海野生动物园"; //must
        poi0.subtitle = "浦东新区陆家嘴1234号";//optional

        var poi1 = {};
        poi1.latitude = 30.3222323; //must
        poi1.longitude = 120.32232332;//must
        poi1.title = "上海野生动物园A"; //must
        poi1.subtitle = "浦东新区陆家嘴1234号A";//optional


        var poi2 = {};
        poi2.latitude = 32.3222323; //must
        poi2.longitude = 122.32232332;//must
        poi2.title = "上海野生动物园B"; //must
        poi2.subtitle = "浦东新区陆家嘴1234号B";//optional
        
        var poiList = new Array();
        poiList[0] = poi0;
        poiList[1] = poi1;
        poiList[2] = poi2;

        CtripMap.app_show_map(poiList);
     *
     */
    app_show_map_with_POI_list:function(poiList) {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }

        var params = {};
        params.poiList = poiList;

        var paramString = Internal.makeParamString("Locate", "showMapWithPOIList",params, 'show_map_with_POI_list');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.showMapWithPOIList(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 获取native缓存的ctrip city信息, app会定时获取ctrip city, hybrid获取缓存命中率在99%以上，可以直接使用，获取不到的时候再进行定位
     * @brief 获取native缓存的ctrip city信息
     * @method app_get_cached_ctrip_city
     * @author jimzhao
     * @since v6.0
     * @example
     *
       //调用
        CtripMap.app_get_cached_ctrip_city()

       //返回数据
        var json_obj = {
            tagname:'get_cached_ctrip_city',
            param:{                         //param字段没有的时候，代表无ctripcity缓存                   
                "CountryName":"中国",       //所在国家
                    "ProvinceName":"江苏",      //所在省份
                    "CityEntities":[            //城市名列表，城市等级从低到高，先是县级市，然后是地级市，使用者应按列表顺序匹配，匹配到即结束
                        {"CityName":"昆山","CityID":100}, 
                        {"CityName":"苏州","CityID":1000} 
                        ]
            }
        }

        app.callback(json_obj);
     */
    app_get_cached_ctrip_city:function() {
        if (!Internal.isSupportAPIWithVersion("6.0")) {
            return;
        }

        var paramString = Internal.makeParamString("Locate", "getCachedCtripCity", null, 'get_cached_ctrip_city');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Locate_a.getCachedCtripCity(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};

/**
 * @class CtripBusiness
 * @description Ctrip业务相关，需要返回数据给H5页面
 * @brief Ctrip业务相关，需要返回数据给H5页面
 */
var CtripBusiness = {

    /**
     * @description 选择常用发票title
     * @brief 选择常用发票title
     * @param {String} selectedInvoiceTitle 当前已经选择好的发票title
     * @method app_choose_invoice_title
     * @author jimzhao
     * @since v5.6
     * @example
     *
     * 
        CtripBusiness.app_choose_invoice_title("上次选择的发票title，或者为空，用于标记已选title");
        
        //调用之后，H5页面会收到回调数据
        var json_obj =
        {
            tagname:'choose_invoice_title',
            param:{
                selectedInvoiceTitle:"所选择的发票title"
            }
        }
        
        app.callback(json_obj);
     */
    app_choose_invoice_title:function(selectedInvoiceTitle) {
        if (!Internal.isSupportAPIWithVersion("5.6")) {
            return;
        }

        if (!selectedInvoiceTitle) {
            selectedInvoiceTitle = "";
        }
        var params = {};
        params.selectedInvoiceTitle = selectedInvoiceTitle;
        var paramString = Internal.makeParamString("Business", "chooseInvoiceTitle", params, 'choose_invoice_title');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Business_a.chooseInvoiceTitle(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    //

    /**
     * @description 进入语音搜索,5.7版本，语音搜索之后的结果，不需要BU处理，只需调用即可，后续版本，可能只做语音解析，解析结果传递给H5，BU自行处理
     * @brief 进入语音搜索
     * @param {int} businessType 业务类型(0. 无（默认）1. 机票 2. 酒店3 . 火车票 5. 目的地 6. 攻略 7.景点门票 8.周末/短途游)  61：团队游 62：周末游  63：自由行 64：邮轮  
     * @method app_show_voice_search
     * @author jimzhao
     * @since v5.7
     * @example
     *
     * 
        CtripBusiness.app_show_voice_search(7);
        
        //调用之后，H5页面会收到回调数据
        var json_obj =
        {
            tagname:'show_voice_search',
           //param:{} 后续版本使用，返回语音解析的数据map，5.7暂不提供
        }
        
        app.callback(json_obj);
     */
    app_show_voice_search:function(businessType) {
        if (!Internal.isSupportAPIWithVersion("5.7")) {
            return;
        }

        var params = {};
        params.businessType = businessType;
        var paramString = Internal.makeParamString("Business", "showVoiceSearch", params, 'show_voice_search');

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Business_a.showVoiceSearch(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 打开Hybrid广告页面，会自动显示底部栏，且右上角有分享安妮
     * @brief 打开Hybrid广告页面
     * @method app_open_adv_page
     * @param {String} advUrl 广告URL， URL参数带title=xxx,设置xxx为标题
     * @since v5.4
     * @author jimzhao
     * @example

      CtripBusiness.app_open_adv_page("http://pages.ctrip.com/adv.html?title=标题xxx");
     */
    app_open_adv_page:function(advUrl) {
        if (!Internal.isSupportAPIWithVersion("5.4")) {
            return;
        } 

        var params = {};
        params.advUrl = advUrl;
        paramString = Internal.makeParamString("Util", "openAdvPage", params, "open_adv_page");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) 
        {
            window.Util_a.openAdvPage(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 查看最新版本功能介绍
     * @brief 查看最新版本功能介绍
     * @since v5.2
     * @method app_show_newest_introduction
     * @author jimzhao
     * @example 

     CtripUtil.app_show_newest_introduction();
     */
    app_show_newest_introduction:function() {
        var paramString = Internal.makeParamString("Util", "showNewestIntroduction", null, "show_newest_introduction");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.showNewestIntroduction(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 检查App的版本更新
     * @brief 检查App的版本更新
     * @since v5.2
     * @method app_check_update
     * @author jimzhao
     * @example 

     CtripBusiness.app_check_update();
     *
     */
    app_check_update:function() {
        var paramString = Internal.makeParamString("Util", "checkUpdate", null, "check_update");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.checkUpdate(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 推荐携程旅行给好友
     * @brief 推荐携程旅行给好友
     * @since v5.2
     * @method app_recommend_app_to_friends
     * @author jimzhao
     * @example 

        CtripBusiness.app_recommend_app_to_friends();
     *
     */
    app_recommend_app_to_friends:function() {
        var paramString = Internal.makeParamString("Util", "recommendAppToFriends", null, "recommend_app_to_friends");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.recommendAppToFriends(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 添加微信好友
     * @brief 添加微信好友
     * @since v5.2
     * @method app_add_weixin_friend
     * @author jimzhao
     * @example 

        CtripBusiness.app_add_weixin_friend();

     */
    app_add_weixin_friend:function() {
        var paramString = Internal.makeParamString("Util", "addWeixinFriend", null, "add_weixin_friend");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.addWeixinFriend(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 调用App的分享
     * @brief 调用App的分享(Moved to CtripShare)
     * @param {String} imageRelativePath 将要分享的图片相对路径，相对webapp的路径
     * @param {String} text 需要分享的文字,微博分享文字限制在140
     * @param {String} title 需要分享的标题, v5.4开始支持该字段，微信和email支持；
     * @param {String} linkUrl 需要分享的链接, v5.4开始支持该字段
     * @method app_call_system_share
     * @since v5.3
     * @author jimzhao
      @example

      参考CtripShare.app_call_system_share(....);
     */
    app_call_system_share:function(imageRelativePath, text, title, linkUrl) {
        CtripShare.app_call_system_share(imageRelativePath, text, title, linkUrl);
    },

    /**
     * @description Native收集用户行为,该日志会被上传
     * H5页面调用该函数，需要将增加的event_name告知native，native需要整理纪录
     * @brief 收集ActionLog
     * @method app_log_event
     * @param {String} event_name 需要纪录的事件名
     * @since v5.2
     * @author jimzhao
     * @example 

        CtripBusiness.app_log_event('GoodDay')
     */
    app_log_event:function(event_name) {
        if (Internal.isNotEmptyString(event_name)) {
            var params = {};
            params.event = event_name;
            var paramString =  Internal.makeParamString("Util", "logEvent", params, "log_event");

            if (Internal.isIOS) {
                var url = Internal.makeURLWithParam(paramString);
                Internal.loadURL(url);
            }
            else if (Internal.isAndroid) {
                window.Util_a.logEvent(paramString);
            }
            else if (Internal.isWinOS) {
                Internal.callWin8App(paramString);
            }
        }
    },

     /**
     * @description 获取设备相关信息，相关部门需要
     * @brief 获取设备相关信息，相关部门需要
     * @method app_get_device_info
     * @since v5.7
     * @author jimzhao
     * @example 

        CtripBusiness.app_get_device_info()
        调用之后，返回数据

        var json_obj = {
            tagname:"get_device_info",
            param: {
                IP:"",
                OS:"\U82f9\U679c",
                account:"",
                areaCode:"",
                baseStation:"",
                clientID:12933032900000135327,
                latitude:0,
                longitude:0,
                mac:"10:DD:B1:CF:C1:80",
                port:"",
                wifiMac:""
            }
        };

        app.callback(json_obj);
     */
    app_get_device_info:function() {
        if (!Internal.isSupportAPIWithVersion("5.7")) {
            return;
        }

        var paramString = Internal.makeParamString("Business", "getDeviceInfo", null, "get_device_info");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.getDeviceInfo(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


     /**
     * @description 获取短信中的验证码
     * @brief 获取短信中的验证码,iPhone不能读取，直接callback
     * @method app_read_verification_code_from_sms
     * @callback read_verification_code_from_sms
     * @since v5.8
     * @author jimzhao
     * @example 

        CtripBusiness.app_read_verification_code_from_sms()
        调用之后，返回数据

        var json_obj = {
            tagname = "read_verification_code_from_sms",
            param: {
                verificationCode = "8890"
            }
        };

        app.callback(json_obj);
     */
    app_read_verification_code_from_sms:function() {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }

        var paramString = Internal.makeParamString("Business", "readVerificationCodeFromSMS", null, "read_verification_code_from_sms");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.readVerificationCodeFromSMS(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 记录google remarkting的screenName
     * @brief 记录google remarkting的screenName
     * @param {String} screenName 需要纪录的页面名
     * @method app_log_google_remarkting
     * @since v5.8
     * @author jimzhao
     * @example 

        CtripBusiness.app_log_google_remarkting(window.location.href);
     */
    app_log_google_remarkting:function(screenName) {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }
        if (!screenName) {
            screenName = "";
        }

        var params = {};
        params.screenName = screenName;
        var paramString = Internal.makeParamString("Business", "logGoogleRemarking", params, "log_google_remarkting");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.logGoogleRemarking(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 从通讯录选取联系人
     * @brief 从通讯录选取联系人
     * @method app_choose_contact_from_addressbook
     * @author jimzhao
     * @since v5.9
     * @example
     *
     * 
        //调用API
        CtripBusiness.app_choose_contact_from_addressbook();
         
        //调用之后，app返回
        var json_obj = {
            name:"xxx",
            phoneList:[{"家庭":1320000000}, {"工作":021888888888}], //手机号码有一个标签＋号码
            emailList:[{"家庭":a@gmail.com}, {"工作":b@yahoo.com}]  //email有标签＋号码
        };

        app.callback(json_obj);

     */
    app_choose_contact_from_addressbook:function() {
        if (!Internal.isSupportAPIWithVersion("5.9")) {
            return;
        }
        var paramString = Internal.makeParamString("Business", "chooseContactFromAddressbook", null, "choose_contact_from_addressbook");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.chooseContactFromAddressbook(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description hybrid统计页面流量，框架使用，BU请勿使用
     * @brief hybrid统计页面流量
     * @method app_send_ubt_log
     * @param {JSON} tags 页面带的配置信息，可自定义，会传到UBT server，由BI分析
     * @author jimzhao
     * @since v5.9
     * @example
     *
     * 
        //调用API
        CtripBusiness.app_send_ubt_log({pageId:'xxxx',a:'bbb'});

     */
    app_send_ubt_log:function(tags) {
        if (!Internal.isSupportAPIWithVersion("5.9")) {
            return;
        }
        var params = {};
        params.tags = tags;

        var paramString = Internal.makeParamString("Business", "sendUBTLog", params, "send_ubt_log");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.sendUBTLog(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 使用native统计UBT trace日志
     * @brief 使用native统计UBT trace日志
     * @method app_send_ubt_trace
     * @param {String} traceName 需要纪录的trace名
     * @param {JSON} tags 页面带的配置信息，可自定义，会传到UBT server，由BI分析
     * @author jimzhao
     * @since v6.1
     * @example
     *
     * 
        //调用API
        CtripBusiness.app_send_ubt_trace('trace_name_here', {pageId:'xxxx',a:'bbb'});

     */
    app_send_ubt_trace:function(traceName, tags) {
        if (!Internal.isSupportAPIWithVersion("6.1")) {
            return;
        }
        var params = {};
        params.tags = tags;
        params.traceName = traceName;

        var paramString = Internal.makeParamString("Business", "sendUBTTrace", params, "send_ubt_trace");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.sendUBTTrace(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

     /**
     * @description 使用native统计UBT metrics日志，metrics日志是有个double的数字的
     * @brief 使用native统计UBT metrics日志
     * @method app_send_ubt_metrics
     * @param {String} metricsName 需要纪录metrics名
     * @param {double} numValue 需要纪录的metrics的数值
     * @param {JSON} tags 页面带的配置信息，可自定义，会传到UBT server，由BI分析
     * @author jimzhao
     * @since v6.1
     * @example
     *
     * 
        //调用API
        CtripBusiness.app_send_ubt_metrics('metrics_name_here', 10.2, {pageId:'xxxx',a:'bbb'});

     */
    app_send_ubt_metrics:function(metricsName, numValue, tags) {
        if (!Internal.isSupportAPIWithVersion("6.1")) {
            return;
        }
        var params = {};
        params.tags = tags;
        params.metricsName = metricsName;
        params.numValue = numValue;

        var paramString = Internal.makeParamString("Business", "sendUBTMetrics", params, "send_ubt_metrics");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.sendUBTMetrics(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description hybrid调用Native业务通用接口
     * @brief  hybrid调用Native业务通用接口
     * @method app_do_business_job
     * @param {int} businessType 业务类型，1=公共相关，2=酒店，3=机票，4=支付,5=火车票,6=攻略
     * @param {String} businessCode 业务方hybrid和native开发人员协商定义
     * @param {JSON} jsonParam hybrid传给Native的数据，JSON对象
     * @param {String} sequenceId 调用的序列号，调用该API时，如果native需要异步处理(比如发送网络请求)的，hybrid需要设置该值,可以取当前timestamp. native处理完成，会在回调的数据里面带回该字段
     * @author jimzhao
     * @since v6.0
     * @example
     *
     * 
        //调用API
        CtripBusiness.app_do_business_job(1, 10001, {aa:'aa_value',bb:'bb_value'}, 1111111);

        //回调数据
        var json_obj = {
            tagname:"do_business_job",
            error_code:"(-201) businessType不支持",//error_code,失败的时候才有error_code
            param:{
                sequenceId:"1111111",
                xxbusinessObj:{}, //自定义数据
                yy:32232332       //自定义数据

            }//param内容不固定，native／hybrid人员定义
         };

        // error_code定义：
        // (-201) businessType不支持
        // (-202) businessCode不支持
        // (-203) 业务处理失败
        // (-204)＋其它业务自定义错误

         app.callback(json_obj);
     */
    app_do_business_job:function(businessType, businessCode, jsonParam, sequenceId) {
        if (!Internal.isSupportAPIWithVersion("6.0")) {
            return;
        }

        var params = {};
        params.businessType = businessType;
        params.businessCode = businessCode;
        params.jsonParam = jsonParam;
        params.sequenceId = sequenceId;

        var paramString = Internal.makeParamString("Business", "doBusinessJob", params, "do_business_job");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Business_a.doBusinessJob(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};

/**
 * @class CtripPage
 * @description 页面跳转，导航，刷新相关API

    通过CtripUtil.app_open_url(....)打开新的webview，可以给webview设置pageName <br/>
    也可以调用CtripPage.app_set_page_name(...)给当前webview设置pageName；<br/>


    页面跳转举例说明：<br/>

    native-->a(na)-->b(nb)-->c(nc)-->d(nd)-->e(ne) //括号内na,nb,nc,nd,ne为页面pageName <br/>
    1.native打开webview页面a，此时a的名字为设置，hybrid调用CtripPage.app_set_page_name(..), 设置当前页面名字为na；<br/>
    2.在a页面用新的webview打开b页面，Ctrip.app_open_url(...),可以给b页面设置pageName为nb，或者调用CtripPage.app_set_page_name(..)，设置nb；<br/>
    3.按照2的方式打开c(nc)，d(nd)，e(ne)；<br/>
    4.如果需要从当前页面e(ne), 会退到c(nc), 调用CtripPage.app_back_to_page("nc"); <br/>

 * @brief 页面跳转，导航，刷新相关API
 */
var CtripPage = {

    /**
     * @description 设置当前页面名，可用于页面导航，刷新
     * @brief 设置当前页面名，可用于页面导航，刷新
     * @param {String} pageName 设置当前页面名
     * @method app_set_page_name
     * @author jimzhao
     * @since v5.6
     * @example
     *
     * 
        CtripPage.app_set_page_name("USE_CAR_PAGE_IDENTIFY");

     */
    app_set_page_name:function(pageName) {
        if (!Internal.isSupportAPIWithVersion("5.6")) {
            return;
        }

        if (!pageName) {
            pageName = "";
        }

        var params = {};
        params.pageName = pageName;

        var paramString = Internal.makeParamString("Page", "setPageName", params, "set_page_name");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Page_a.setPageName(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

   /**
     * @description 多webview app，回退到指定的webview页面
     * @brief 回退到指定的webview页面
     * @param {String} pageName 需要回退的页面名
     * @method app_back_to_page
     * @callback back_to_page
     * @author jimzhao
     * @since v5.8
     * @example
     *
     * 

        CtripPage.app_back_to_page("USE_CAR_PAGE_IDENTIFY");

        //调用之后，如果back失败，返回数据如下 since 6.0
        var json_obj = {
            tagname:"back_to_page",
            error_code:"(-201)指定的PageName未找到" //成功的时候，不会有error_code
        }

        app.callback(json_obj);

     */
    app_back_to_page:function(pageName) {
        if (!Internal.isSupportAPIWithVersion("5.8")) {
            return;
        }

        if (!pageName) {
            pageName = "";
        }

        var params = {};
        params.pageName = pageName;

        var paramString = Internal.makeParamString("Page", "backToPage", params, "back_to_page");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Page_a.backToPage(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 显示native的loading界面
     * @brief 显示native的loading界面
     * @method app_show_loading_page
     * @author jimzhao
     * @since v5.9
     * @example
     *
     * 
        CtripPage.app_show_loading_page();

     */
    app_show_loading_page:function() {
        if (!Internal.isSupportAPIWithVersion("5.9")) {
            return;
        }

        var paramString = Internal.makeParamString("Page", "showLoadingPage", null, "show_loading_page");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Page_a.showLoadingPage(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


    /**
     * @description 隐藏native的loading界面
     * @brief 隐藏native的loading界面
     * @method app_hide_loading_page
     * @author jimzhao
     * @since v5.9
     * @example
     *
     * 
        CtripPage.app_hide_loading_page();

     */
    app_hide_loading_page:function() {
        if (!Internal.isSupportAPIWithVersion("5.9")) {
            return;
        }

        var paramString = Internal.makeParamString("Page", "hideLoadingPage", null, "hide_loading_page");
        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            window.Page_a.hideLoadingPage(paramString);
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


    /**
     * @description 打开/关闭app的拖动手势，默认是关闭的
     * @brief 打开/关闭app的拖动手势
     * @method app_enable_drag_animation
     * @author jimzhao
     * @since v5.9
     * @example
     *
     * 
        CtripPage.app_enable_drag_animation(true);

     */
    app_enable_drag_animation:function(isEnable) {
        if (!Internal.isSupportAPIWithVersion("5.9")) {
            return;
        }
        var params = {};
        params.isEnable = isEnable;

        var paramString = Internal.makeParamString("Page", "enableDragAnimation", params, "enable_drag_animation");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } else if (Internal.isAndroid) {
            ;//do nothing for android
        } else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }
};

/**
 * @class CtripShare
 * @description 调用native的第三方分享

        通用参数，
        1. 分享平台(shareType)定义
        WeixinFriend------微信好友
        WeixinCircle----微信朋友圈
        SinaWeibo---------新浪微博
        QQ----------------QQ
        QQZone------------QQ空间
        SMS---------------短信
        Email-------------邮件
        Copy--------------复制
        OSMore------------系统更多分享

        Default-----------不是一种shareType，参考下面的demo，分享到多个平台的时候，可以只指定其中1-2个特殊定义，其他都是默认。
        
        2.分享error_code定义
        (-201)分享失败
        (-202)分享被取消
        (-203)分享参数有错误

        3. 分享规则

        微信(微信朋友/微信朋友圈)分享说明：
        1. 图片分享，只能分享图片，所传的文字，title都无效；
        2. 链接分享，所传的图片为分享网页的缩略图，title有效；
        3. 纯文本分享，只能分享text，title无效；
        4. 优先级 链接分享>图片分享>纯文本分享。
           a. 如果有linkUrl，会被当作网页分享，图片作为缩略图；
           b. 如果没有linkUrl，有图片，当作图片分享，text,title无效;
           c. 如果没有linkUrl，没有图片，当作纯文本分享；
        
        微博分享：
        1. 图片为所分享的图片；
        2. 分享title不起作用；
        3. 如果linkUrl有， 分享的text后面会自动添加linkUrl
    
        Email分享：
        1. 图片为所分享的图片；
        2. 分享title作为Email标题；
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

        短信分享：
        1. 图片为所分享的图片；注：iOS7.0之后才支持；
        2. 分享title不起作用；
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

        复制分享：
        1. 分享的图片不起作用;
        2. 分享的title不起作用;
        3. 如果有linkUrl，分享的text后面会自动添加linkUrl;

        QQ分享说明：
         1. 图片分享，只能分享图片，所传的文字，title都无效；
         2. 链接分享，所传的图片为分享网页的缩略图，title有效；
         3. 纯文本分享，只能分享text，title无效；
         4. 优先级 链接分享>图片分享>纯文本分享。
         a. 如果有linkUrl，会被当作网页分享，图片作为缩略图；
         b. 如果没有linkUrl，有图片，当作图片分享，text,title无效;
         c. 如果没有linkUrl，没有图片，当作纯文本分享；

        QQ空间分享
         只能分享新闻类消息，该消息必须要带URL，如果没有的情况下，默认使用m.ctrip.com


 * @brief 第三方分享 
*/
var CtripShare = {

    /**
     * @description 调用App的分享-兼容老的分享，调用之后，无回调信息，6.1之后不建议使用该API
     * @brief 调用App的分享－兼容6.1之前版本
     * @param {String} imageRelativePath 将要分享的图片相对路径，相对webapp的路径;需要调用CtripUtil.app_download_data()下载图片；
     * @param {String} text 需要分享的文字,微博分享文字限制在140
     * @param {String} title 需要分享的标题, v5.4开始支持该字段，微信和email支持；
     * @param {String} linkUrl 需要分享的链接, v5.4开始支持该字段
     * @method app_call_system_share
     * @since v5.3
     * @author jimzhao
     * @example
        
        CtripBusiness.app_call_system_share("../wb_cache/pkg_name/md5_url_hash", "text to share weibo", "this is titile", "http://www.ctrip.com/");

     */
    app_call_system_share:function(imageRelativePath, text, title, linkUrl) {
        if (!Internal.isSupportAPIWithVersion("5.3")) {
            return;
        }
        var params = {};
        params.title = title;
        params.text = text;
        params.linkUrl = linkUrl;
        params.imageRelativePath = imageRelativePath;

        var paramString = Internal.makeParamString("Util", "callSystemShare", params, "call_system_share");

        if (Internal.isIOS) {
            var url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        }
        else if (Internal.isAndroid) {
            window.Util_a.callSystemShare(paramString);
        }
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },

    /**
     * @description 分享默认内容到各个平台，此API 为Javascript简化包装app_call_custom_share
     * @brief 分享默认内容到各个平台(JS 二次包装)
     * @method wrap_call_default_share
     * @param{String} imageUrl 分享图片的imageUrl，图片下载失败后，继续分享，不带图片
     * @param{String} title 分享的标题
     * @param{String} text 分享的内容
     * @param{String} linkUrl 分享的链接
     * @param{String} businessCode 分享的业务ID，可以为空，设置后，方便BI统计数据
     * @callback call_custom_share 为app_call_custom_share的callBackTag名字
     * @author jimzhao
     * @since v6.1
     * @example

        CtripShare.wrap_call_default_share("http://s0.ifengimg.com/2014/11/19/03ee1773b2262aa40a226b97f5b44c97.jpg", "chen title", "我的描述", "http://www.ifeng.com");

        //调用之后回调数据请参考 CtripShare.app_call_custom_share()的 example

     */
    wrap_call_default_share:function(imageUrl, title, text, linkUrl, businessCode) {
        var shareData = {};
        shareData.shareType = "Default";
        shareData.imageUrl = imageUrl;
        shareData.title = title;
        shareData.text = text;
        shareData.linkUrl = linkUrl;

        var dataList = [];
        dataList.push(shareData);
        CtripShare.app_call_custom_share(dataList, businessCode);
    },

    /**
     * @description 自定义分享，各个平台可以分享不同的内容
     * @brief 自定义分享内容到第三方平台
     * @method app_call_custom_share
     * @param{JSON} dataList 分享的内容，格式参考下面的example
     * @param{String} businessCode 分享的业务ID，可以为空，设置后，方便BI统计数据
     * @callback call_custom_share
     * @author jimzhao
     * @since v6.1
     * @example

        var dataList = [
            {
                shareType:"QQ",
                imageUrl:"http://share.csdn.net/uploads/24bd27fd3ad6a559873c4aff3bd64a60/24bd27fd3ad6a559873c4aff3bd64a60_thumb.jpg",
                title:"分享图书",
                text:"这本书的简介大概是这样",
                linkUrl:"http://csdn.net"
            },
            {
                shareType:"WeiXin",
                imageUrl:"http://share.csdn.net/uploads/24bd27fd3ad6a559873c4aff3bd64a60/24bd27fd3ad6a559873c4aff3bd64a60_thumb.jpg",
                title:"分享图书给微信",
                text:"这本书的简介是专门为微信定制",
                linkUrl:"http://csdn.net/w"
            },
            {
                shareType:"Default", //表示其他未指定的平台，都适用该分享内容
                imageUrl:"http://share.csdn.net/uploads/24bd27fd3ad6a559873c4aff3bd64a60/24bd27fd3ad6a559873c4aff3bd64a60_thumb.jpg",
                title:"通用分享图书",
                text:"这本书的简介是为其他分享定制的",
                linkUrl:"http://csdn.net/common_test"
            }  
        ];

        CtripShare.app_call_custom_share(dataList);

        //调用处理完成之后
        //1. 没有分享成功返回数据如下
        var json_obj = {
            tagname:"call_custom_share",
            error_code:"(-201)分享失败" //error_code定义参考CtripShare通用参数定义
        }

        //2. 分享成功
        var json_obj = {
            tagname:"call_custom_share",
            param:{
                shareType:"WeiXin"
            }
        }

        app.callback(json_obj);
     */
    app_call_custom_share:function(dataList, businessCode) {
        var params = {};
        params.dataList = dataList;
        params.businessCode = businessCode;

        var paramString = Internal.makeParamString("Share", "callCustomShare", params, "call_custom_share");

        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Share_a.callCustomShare(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    },


    /**
     * @description 指定内容，分享到特定平台
     * @brief 指定内容，分享到特定平台
     * @method app_call_one_share
     * @param{String} shareType 分享的平台类型
     * @param{String} imageUrl 分享图片的imageUrl，图片下载失败后，继续分享，不带图片
     * @param{String} title 分享的标题
     * @param{String} text 分享的内容
     * @param{String} linkUrl 分享的链接
     * @param{String} businessCode 分享的业务ID，可以为空，设置后，方便BI统计数据
     * @callback call_one_share
     * @author jimzhao
     * @since v6.1
     * @example

     //调用
        CtripShare.app_call_one_share("QQZone", "http://a.hiphotos.baidu.com/ting/pic/item/314e251f95cad1c8ea16a3567d3e6709c93d5115.jpg" , "我是title", "我是text", "", "ctrip_share_11111");

        //调用处理完成之后
        //1. 没有分享成功返回数据如下
        var json_obj = {
            tagname:"call_custom_share",
            error_code:"(-201)分享失败" //error_code定义参考CtripShare通用参数定义
        }

        //2. 分享成功
        var json_obj = {
            tagname:"call_one_share",
        }

        app.callback(json_obj);
     */
    app_call_one_share:function(shareType, imageUrl, title, text, linkUrl, businessCode) {
        var params = {};
        params.shareType = shareType;
        params.imageUrl = imageUrl;
        params.title = title;
        params.text = text;
        params.linkUrl = linkUrl;
        params.businessCode = businessCode;

        var paramString = Internal.makeParamString("Share", "callOneShare", params, "call_one_share");
        if (Internal.isIOS) {
            url = Internal.makeURLWithParam(paramString);
            Internal.loadURL(url);
        } 
        else if (Internal.isAndroid) {
            window.Share_a.callOneShare(paramString);
        } 
        else if (Internal.isWinOS) {
            Internal.callWin8App(paramString);
        }
    }

};;(function () {
  var mutileLoad = Lizard.mutileLoad;
  delete Lizard.mutileLoad;
  window.appInstance = false;
  window.localStorage.setItem('ISINAPP', '1');
  window.app = {};

  window.app.callback = function (options) {
    var methods = {
      'web_view_finished_load': function () {
        if (window.localStorage) {
          var appInfo = options.param;
          if (appInfo)
            window.localStorage.setItem('APPINFO', JSON.stringify(appInfo));
        }
        //CtripBar.app_set_navbar_hidden(true);
        CtripUtil.app_init_member_H5_info();
      },

      'init_member_H5_info': function (params) {
        define("_", function () {
        });
        define("$", function () {
        });
        define("B", function () {
        });
        define("F", function () {
        });
        require(['libs', 'cCommonStore'],
          function (libs, CommonStore) {
            window.appInstance = true;
            var wStore = window.localStorage;
            if (wStore && params) {
              var headStore = CommonStore.HeadStore.getInstance();
              var userStore = CommonStore.UserStore.getInstance();
              var unionStore = CommonStore.UnionStore.getInstance();
              var headInfo = headStore.get();

              //用户信息
              if (params.userInfo) {
                try {
                  var userInfo = userStore.getUser();
                  params.userInfo.data.BMobile = params.userInfo.data.BindMobile;
                  userStore.setUser(params.userInfo.data);
                  headInfo.auth = params.userInfo.data.Auth;
                } catch (e) {
                  alert('set data error');
                }
              } else {
                userStore.removeUser();
              }

              if (params.device) {
                var deviceInfo = {
                  device: params.device
                }
                wStore.setItem('DEVICEINFO', JSON.stringify(deviceInfo));
              }

              if (params.appId) {
                var appInfo = {
                  version: params.version,
                  appId: params.appId,
                  serverVersion: params.serverVersion,
                  platform: params.platform
                }
                wStore.setItem('APPINFO', JSON.stringify(appInfo));
              }

              if (params.timestamp) {
                var date = new Date();
                var serverdate = {
                  server: params.timestamp,
                  local: date.getTime()
                }
                wStore.setItem('SERVERDATE', JSON.stringify(serverdate));
              }

              if (params.sourceId) {
                headInfo.sid = params.sourceId;
                wStore.setItem('SOURCEID', params.sourceId);
              }

              if (params.isPreProduction) {
                wStore.setItem('isPreProduction', params.isPreProduction);
              }

              //接受clientId,供UBT使用
              if (params.clientID) {
                headInfo.cid = params.clientID;
                wStore.setItem('GUID', params.clientID);
              }
              //外部渠道号
              if (params.extSouceID) {
                headInfo.xsid = params.extSouceID;
              }
              //soa2.0 syscode 可以接受非09的值, restful 待定
              if (params.platform) {
                headInfo.syscode = params.platform == '1' ? 12 : 32;
              }
              if (params.version) {
                headInfo.cver = params.version;
              }

              //分销联盟参数
              //ctrip://wireless/allianceID=123&ouID=456&sID=789&extendSourceID=11111
              if (params.allianceID && params.sID) {
                var union = {
                  "AllianceID": params.allianceID,
                  "SID": params.sID,
                  "OUID": params.ouID ? params.ouID : ""
                }
                unionStore.set(union);
              }

              headStore.set(headInfo);

              //保存原始参数值
              wStore.setItem('CINFO',JSON.stringify(params));
            }

            if (Lizard.isInCtripApp)
              mutileLoad();
          });
      },

      'app_h5_need_refresh': function () {
        mutileLoad();
      }
    }
    if (options && typeof methods[options.tagname] === 'function') {
      methods[options.tagname](options.param);
    }
  };
  if (!Lizard.isInCtripApp)
    mutileLoad();
})();
;/**
 * @File c.hybrid.memeberServic
 * @Description hybird下的登录服务
 * @author shbzhang@ctrip.com
 * @date  2014/09/19 15:06
 * @version V1.0
 */

/**
 * 与用户登录相关的工具方法
 */
define('cHybridMember',['cHybridFacade'], function (Facade) {
  "use strict";
  var HybridMember = {
    /**
     * 跳转至用户登录
     * @method memberlogin
     * @memberof  Service.cMemberService
     * @param {object} options
     * @param {boolean} options.isShowNonMemberLogin 是否用户登录界面显示非会员登录入口
     * @param {function} [options.callback] 仅hybrid可用 登录成功失败的回调
     * @param {string} [options.from] 仅web可用，登录成功跳转页
     * @param {string} [options.backurl] 仅web可用，登录页面回退跳转页
     */
    memberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_MEMBER_LOGIN, callback: options.callback, isShowNonMemberLogin: options.isShowNonMemberLogin });
    },
    /**
     * 非会员登录
     * @method nonMemberLogin
     * @memberof  Service.cMemberService
     * @param {object} options
     * @param {function} options.callback 非会员登录成功的回调
     */
    nonMemberLogin: function (options) {
      Facade.request({ name: Facade.METHOD_NON_MEMBER_LOGIN, callback: options.callback });
    },

    /**
     * 用户注册
     * @method register
     * @memberof  Service.cMemberService
     * @param {object} options
     * @param {function} options.callback 注册成功的回调
     */
    register: function (options) {
      Facade.request({ name: Facade.METHOD_REGISTER, callback: options.callback });
    },

    /**
     * 用户自动登录
     * @method autoLogin
     * @memberof  Service.cMemberService
     * @param {object} options
     * @param {function} options.callback 自动登录成功的回调
     */
    autoLogin: function (options) {
      Facade.request({ name: Facade.METHOD_AUTO_LOGIN, callback: options.callback });
    },


    /**
     * H5登陆完成，将注册信息告知Native
     * @method finishedLogin
     * @memberof  Service.cMemberService
     * @param {object} options
     * @param {object} options.userInfo H5登录用户数据
     * @param {function} options.callback Native登录成功的回调
     */
    finishedLogin: function (options) {
      Facade.request({ name: Facade.METHOD_APP_FINISHED_LOGIN, userInfo: options.userInfo, callback: options.callback });
    }
  };

  return HybridMember;
});
;/**
 * @File
 * @Description: (用一句话描述该文件做什么)
 * @author shbzhang
 * @date 2014-09-19 16:28:20
 * @version V1.0
 */
define('cHybridGeolocation',['cUtilPerformance', 'cHybridFacade'], function (cperformance, Facade) {
  var Geo = {};
  /**
   * @description 待地图上显示单个POI
   * @param {JSON}
   * options.latitude, 纬度2567.
   * options.longitude, 经度2568.
   * options.title, 在地图上显示的点的主标题2569.
   * options.subtitle, 在地图上显示点的附标题
   */
  Geo.showMapWithPOI = function (poi) {
    if (!options) {
      throw new Error('function show_map error is "param is null"');
    }
    options.name = Facade.METHOD_SHOW_MAP;
    Facade.request(poi);
  };

  /**
   * @description 在地图上显示多个POI位置点
   * @param {Array} poiList
   */
  Geo.showMapWithPOIList = function (poiList) {
    Facade.request({
      name: Facade.METHOD_APP_SHOW_MAP_WITH_POI_LIST,
      poiList: poiList
    });
  };

  /*
   * 获得城市信息
   * @param callback {Function} 成功时的回调
   * @param erro {Function} 失败时的回调
   * @param posCallback {Function} 获取经纬度成功的回调
   * @param posError {Function} 获取经纬度失败的回调
   * @param isAccurate {Boolean} 是否通过高精度查询 (如果使用高精度定位会发起两次请求，定位会需要更多时间，如只需定位城市，不需开启此开关，此开关在app中无效)
   */
  Geo.requestCityInfo = function (callback, error, posCallback, posError, isAccurate, cityCallBack, cityErrorCallBack) {
    var uuidGeoRequest = {
      number: cperformance.getUuid(),
      detail: cperformance.getUuid(),
      city: cperformance.getUuid(),
      error: cperformance.getUuid()
    };

    //+……2014-09-04……JIANGJing
    for (var i in uuidGeoRequest) {
      cperformance.group(uuidGeoRequest[i], {
        name: 'GeoRequest',
        url: 'Native function ' + i
      });     
    }
    var matchLocateInfo = function (info) {
      return (info.type == 'geo' || info.type == 'address' || info.type == 'CtripCity');
    };

    //+…2014-09-03……JIANGJing
    // 根据是否使用缓存数据的情形，Native 提供的 API 会回调一次（使用缓存）或两次（不使用缓存，第一次返回经纬度，第二次返回完整信息）。
    var firstCalled = true;

    //+…2014-09-03……JIANGJing
    var successCallback = function (info,error_code) {
      var ERR_INFOs = {
        1: '网络不通，当前无法定位',
        2: '定位没有开启'
      };
      // 定义当获取的定位信息不合规时的错误代码
      var DEFAULT_ERR_NUM = 1,
        errNum = 0;
      if (!matchLocateInfo(info)) {
        errNum = DEFAULT_ERR_NUM;
      } else if (info.locateStatus > 0) {
        errNum = window.Math.abs(info.locateStatus);
      }

      if (errNum) {
        //+……2014-09-12……JIANGJing……记录错误响应代码
        cperformance.groupTag(uuidGeoRequest.error, 'errno', '10' + errNum.toString());
        cperformance.groupEnd(uuidGeoRequest.error);
        if (typeof errorCallback == 'function') {
	        errorCallback(info, error_code);
        }
      } else {
        var v = info.value,
          detailed = (typeof v.addrs != 'undefined');
        if (detailed) {
          cperformance.groupEnd(uuidGeoRequest.detail);
        }

        if (firstCalled) {
          cperformance.groupEnd(uuidGeoRequest.number);
        }
        
        if ('CityEntities' in v) {
          cperformance.groupEnd(uuidGeoRequest.city);
          if (_.isFunction(cityCallBack)) {
            cityCallBack(v);
          }
        }

        if (firstCalled && typeof posCallback == 'function') {
          posCallback(v.lng, v.lat);
        }

        if (detailed && typeof callback == 'function') {
          callback({
            lng: v.lng,
            lat: v.lat,
            city: v.city || v.ctyName || v.province,
            province: v.province,
            district: v.district,
            //+2……2014-09-04……JIANGJing
            country: v.country,
            countryShortName: v.countryShortName,
            address: v.addrs
          });
        }
      }
      firstCalled = false;
    };

    var errorCallback = function (err, error_code) {
      //+……2014-09-12……JIANGJing……记录错误响应代码
      cperformance.groupTag(uuidGeoRequest.error, 'errno', '10');
      cperformance.groupEnd(uuidGeoRequest.error);
	    var errCode = (err && err.error_code) || error_code;
      if (errCode)
      {
        if (errCode.indexOf('201') > -1)
          posError(errCode);
        else if (errCode.indexOf('202') > -1)
          posError(errCode);
        else if (errCode.indexOf('203') > -1)
          posError(errCode);
        else if (errCode.indexOf('204') > -1)
          error(errCode);
        else if (errCode.indexOf('205') > -1)
          cityErrorCallBack && cityErrorCallBack(errCode);
      } else {
	      console.log("(-201)定位未开启");
	      posError("(-201)定位未开启");
      }
    };

    Facade.request({
      name: Facade.METHOD_LOCATE,
      success: successCallback,
      error: errorCallback
    });
  };


  return Geo;

});