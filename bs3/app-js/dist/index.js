(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod2) => function __require() {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target, mod2));
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
      if (decorator = decorators[i5])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // node_modules/fast-safe-stringify/index.js
  var require_fast_safe_stringify = __commonJS({
    "node_modules/fast-safe-stringify/index.js"(exports, module) {
      module.exports = stringify2;
      stringify2.default = stringify2;
      stringify2.stable = deterministicStringify;
      stringify2.stableStringify = deterministicStringify;
      var LIMIT_REPLACE_NODE = "[...]";
      var CIRCULAR_REPLACE_NODE = "[Circular]";
      var arr = [];
      var replacerStack = [];
      function defaultOptions2() {
        return {
          depthLimit: Number.MAX_SAFE_INTEGER,
          edgesLimit: Number.MAX_SAFE_INTEGER
        };
      }
      function stringify2(obj, replacer, spacer, options) {
        if (typeof options === "undefined") {
          options = defaultOptions2();
        }
        decirc(obj, "", 0, [], void 0, 0, options);
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(obj, replacer, spacer);
          } else {
            res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
          }
        } catch (_2) {
          return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function setReplace(replace, val, k2, parent) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k2);
        if (propertyDescriptor.get !== void 0) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k2, { value: replace });
            arr.push([parent, k2, val, propertyDescriptor]);
          } else {
            replacerStack.push([val, k2, replace]);
          }
        } else {
          parent[k2] = replace;
          arr.push([parent, k2, val]);
        }
      }
      function decirc(val, k2, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i5;
        if (typeof val === "object" && val !== null) {
          for (i5 = 0; i5 < stack.length; i5++) {
            if (stack[i5] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k2, parent);
              return;
            }
          }
          if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k2, parent);
            return;
          }
          if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k2, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i5 = 0; i5 < val.length; i5++) {
              decirc(val[i5], i5, i5, stack, val, depth, options);
            }
          } else {
            var keys = Object.keys(val);
            for (i5 = 0; i5 < keys.length; i5++) {
              var key = keys[i5];
              decirc(val[key], key, i5, stack, val, depth, options);
            }
          }
          stack.pop();
        }
      }
      function compareFunction(a3, b2) {
        if (a3 < b2) {
          return -1;
        }
        if (a3 > b2) {
          return 1;
        }
        return 0;
      }
      function deterministicStringify(obj, replacer, spacer, options) {
        if (typeof options === "undefined") {
          options = defaultOptions2();
        }
        var tmp = deterministicDecirc(obj, "", 0, [], void 0, 0, options) || obj;
        var res;
        try {
          if (replacerStack.length === 0) {
            res = JSON.stringify(tmp, replacer, spacer);
          } else {
            res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
          }
        } catch (_2) {
          return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]");
        } finally {
          while (arr.length !== 0) {
            var part = arr.pop();
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3]);
            } else {
              part[0][part[1]] = part[2];
            }
          }
        }
        return res;
      }
      function deterministicDecirc(val, k2, edgeIndex, stack, parent, depth, options) {
        depth += 1;
        var i5;
        if (typeof val === "object" && val !== null) {
          for (i5 = 0; i5 < stack.length; i5++) {
            if (stack[i5] === val) {
              setReplace(CIRCULAR_REPLACE_NODE, val, k2, parent);
              return;
            }
          }
          try {
            if (typeof val.toJSON === "function") {
              return;
            }
          } catch (_2) {
            return;
          }
          if (typeof options.depthLimit !== "undefined" && depth > options.depthLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k2, parent);
            return;
          }
          if (typeof options.edgesLimit !== "undefined" && edgeIndex + 1 > options.edgesLimit) {
            setReplace(LIMIT_REPLACE_NODE, val, k2, parent);
            return;
          }
          stack.push(val);
          if (Array.isArray(val)) {
            for (i5 = 0; i5 < val.length; i5++) {
              deterministicDecirc(val[i5], i5, i5, stack, val, depth, options);
            }
          } else {
            var tmp = {};
            var keys = Object.keys(val).sort(compareFunction);
            for (i5 = 0; i5 < keys.length; i5++) {
              var key = keys[i5];
              deterministicDecirc(val[key], key, i5, stack, val, depth, options);
              tmp[key] = val[key];
            }
            if (typeof parent !== "undefined") {
              arr.push([parent, k2, val]);
              parent[k2] = tmp;
            } else {
              return tmp;
            }
          }
          stack.pop();
        }
      }
      function replaceGetterValues(replacer) {
        replacer = typeof replacer !== "undefined" ? replacer : function(k2, v2) {
          return v2;
        };
        return function(key, val) {
          if (replacerStack.length > 0) {
            for (var i5 = 0; i5 < replacerStack.length; i5++) {
              var part = replacerStack[i5];
              if (part[1] === key && part[0] === val) {
                val = part[2];
                replacerStack.splice(i5, 1);
                break;
              }
            }
          }
          return replacer.call(this, key, val);
        };
      }
    }
  });

  // node_modules/xstate/lib/_virtual/_tslib.js
  var require_tslib = __commonJS({
    "node_modules/xstate/lib/_virtual/_tslib.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.__assign = function() {
        exports.__assign = Object.assign || function __assign3(t3) {
          for (var s5, i5 = 1, n6 = arguments.length; i5 < n6; i5++) {
            s5 = arguments[i5];
            for (var p2 in s5)
              if (Object.prototype.hasOwnProperty.call(s5, p2))
                t3[p2] = s5[p2];
          }
          return t3;
        };
        return exports.__assign.apply(this, arguments);
      };
      function __rest3(s5, e5) {
        var t3 = {};
        for (var p2 in s5)
          if (Object.prototype.hasOwnProperty.call(s5, p2) && e5.indexOf(p2) < 0)
            t3[p2] = s5[p2];
        if (s5 != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i5 = 0, p2 = Object.getOwnPropertySymbols(s5); i5 < p2.length; i5++) {
            if (e5.indexOf(p2[i5]) < 0 && Object.prototype.propertyIsEnumerable.call(s5, p2[i5]))
              t3[p2[i5]] = s5[p2[i5]];
          }
        return t3;
      }
      function __values3(o6) {
        var s5 = typeof Symbol === "function" && Symbol.iterator, m2 = s5 && o6[s5], i5 = 0;
        if (m2)
          return m2.call(o6);
        if (o6 && typeof o6.length === "number")
          return {
            next: function() {
              if (o6 && i5 >= o6.length)
                o6 = void 0;
              return { value: o6 && o6[i5++], done: !o6 };
            }
          };
        throw new TypeError(s5 ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }
      function __read2(o6, n6) {
        var m2 = typeof Symbol === "function" && o6[Symbol.iterator];
        if (!m2)
          return o6;
        var i5 = m2.call(o6), r4, ar = [], e5;
        try {
          while ((n6 === void 0 || n6-- > 0) && !(r4 = i5.next()).done)
            ar.push(r4.value);
        } catch (error3) {
          e5 = { error: error3 };
        } finally {
          try {
            if (r4 && !r4.done && (m2 = i5["return"]))
              m2.call(i5);
          } finally {
            if (e5)
              throw e5.error;
          }
        }
        return ar;
      }
      function __spreadArray2(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i5 = 0, l4 = from.length, ar; i5 < l4; i5++) {
            if (ar || !(i5 in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i5);
              ar[i5] = from[i5];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      }
      exports.__read = __read2;
      exports.__rest = __rest3;
      exports.__spreadArray = __spreadArray2;
      exports.__values = __values3;
    }
  });

  // node_modules/xstate/lib/types.js
  var require_types = __commonJS({
    "node_modules/xstate/lib/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ActionTypes = void 0;
      (function(ActionTypes2) {
        ActionTypes2["Start"] = "xstate.start";
        ActionTypes2["Stop"] = "xstate.stop";
        ActionTypes2["Raise"] = "xstate.raise";
        ActionTypes2["Send"] = "xstate.send";
        ActionTypes2["Cancel"] = "xstate.cancel";
        ActionTypes2["NullEvent"] = "";
        ActionTypes2["Assign"] = "xstate.assign";
        ActionTypes2["After"] = "xstate.after";
        ActionTypes2["DoneState"] = "done.state";
        ActionTypes2["DoneInvoke"] = "done.invoke";
        ActionTypes2["Log"] = "xstate.log";
        ActionTypes2["Init"] = "xstate.init";
        ActionTypes2["Invoke"] = "xstate.invoke";
        ActionTypes2["ErrorExecution"] = "error.execution";
        ActionTypes2["ErrorCommunication"] = "error.communication";
        ActionTypes2["ErrorPlatform"] = "error.platform";
        ActionTypes2["ErrorCustom"] = "xstate.error";
        ActionTypes2["Update"] = "xstate.update";
        ActionTypes2["Pure"] = "xstate.pure";
        ActionTypes2["Choose"] = "xstate.choose";
      })(exports.ActionTypes || (exports.ActionTypes = {}));
      exports.SpecialTargets = void 0;
      (function(SpecialTargets2) {
        SpecialTargets2["Parent"] = "#_parent";
        SpecialTargets2["Internal"] = "#_internal";
      })(exports.SpecialTargets || (exports.SpecialTargets = {}));
    }
  });

  // node_modules/xstate/lib/actionTypes.js
  var require_actionTypes = __commonJS({
    "node_modules/xstate/lib/actionTypes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var types = require_types();
      var start3 = types.ActionTypes.Start;
      var stop3 = types.ActionTypes.Stop;
      var raise3 = types.ActionTypes.Raise;
      var send4 = types.ActionTypes.Send;
      var cancel3 = types.ActionTypes.Cancel;
      var nullEvent2 = types.ActionTypes.NullEvent;
      var assign4 = types.ActionTypes.Assign;
      var after3 = types.ActionTypes.After;
      var doneState2 = types.ActionTypes.DoneState;
      var log2 = types.ActionTypes.Log;
      var init2 = types.ActionTypes.Init;
      var invoke2 = types.ActionTypes.Invoke;
      var errorExecution2 = types.ActionTypes.ErrorExecution;
      var errorPlatform2 = types.ActionTypes.ErrorPlatform;
      var error3 = types.ActionTypes.ErrorCustom;
      var update2 = types.ActionTypes.Update;
      var choose2 = types.ActionTypes.Choose;
      var pure3 = types.ActionTypes.Pure;
      exports.after = after3;
      exports.assign = assign4;
      exports.cancel = cancel3;
      exports.choose = choose2;
      exports.doneState = doneState2;
      exports.error = error3;
      exports.errorExecution = errorExecution2;
      exports.errorPlatform = errorPlatform2;
      exports.init = init2;
      exports.invoke = invoke2;
      exports.log = log2;
      exports.nullEvent = nullEvent2;
      exports.pure = pure3;
      exports.raise = raise3;
      exports.send = send4;
      exports.start = start3;
      exports.stop = stop3;
      exports.update = update2;
    }
  });

  // node_modules/xstate/lib/constants.js
  var require_constants = __commonJS({
    "node_modules/xstate/lib/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var STATE_DELIMITER2 = ".";
      var EMPTY_ACTIVITY_MAP2 = {};
      var DEFAULT_GUARD_TYPE2 = "xstate.guard";
      var TARGETLESS_KEY2 = "";
      exports.DEFAULT_GUARD_TYPE = DEFAULT_GUARD_TYPE2;
      exports.EMPTY_ACTIVITY_MAP = EMPTY_ACTIVITY_MAP2;
      exports.STATE_DELIMITER = STATE_DELIMITER2;
      exports.TARGETLESS_KEY = TARGETLESS_KEY2;
    }
  });

  // node_modules/xstate/lib/environment.js
  var require_environment = __commonJS({
    "node_modules/xstate/lib/environment.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var IS_PRODUCTION2 = false;
      exports.IS_PRODUCTION = IS_PRODUCTION2;
    }
  });

  // node_modules/xstate/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/xstate/lib/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var _tslib = require_tslib();
      var constants = require_constants();
      var environment = require_environment();
      var _a2;
      function keys(value) {
        return Object.keys(value);
      }
      function matchesState2(parentStateId, childStateId, delimiter) {
        if (delimiter === void 0) {
          delimiter = constants.STATE_DELIMITER;
        }
        var parentStateValue = toStateValue2(parentStateId, delimiter);
        var childStateValue = toStateValue2(childStateId, delimiter);
        if (isString2(childStateValue)) {
          if (isString2(parentStateValue)) {
            return childStateValue === parentStateValue;
          }
          return false;
        }
        if (isString2(parentStateValue)) {
          return parentStateValue in childStateValue;
        }
        return Object.keys(parentStateValue).every(function(key) {
          if (!(key in childStateValue)) {
            return false;
          }
          return matchesState2(parentStateValue[key], childStateValue[key]);
        });
      }
      function getEventType2(event2) {
        try {
          return isString2(event2) || typeof event2 === "number" ? "".concat(event2) : event2.type;
        } catch (e5) {
          throw new Error("Events must be strings or objects with a string event.type property.");
        }
      }
      function getActionType(action) {
        try {
          return isString2(action) || typeof action === "number" ? "".concat(action) : isFunction2(action) ? action.name : action.type;
        } catch (e5) {
          throw new Error("Actions must be strings or objects with a string action.type property.");
        }
      }
      function toStatePath2(stateId, delimiter) {
        try {
          if (isArray2(stateId)) {
            return stateId;
          }
          return stateId.toString().split(delimiter);
        } catch (e5) {
          throw new Error("'".concat(stateId, "' is not a valid state path."));
        }
      }
      function isStateLike2(state) {
        return typeof state === "object" && "value" in state && "context" in state && "event" in state && "_event" in state;
      }
      function toStateValue2(stateValue, delimiter) {
        if (isStateLike2(stateValue)) {
          return stateValue.value;
        }
        if (isArray2(stateValue)) {
          return pathToStateValue2(stateValue);
        }
        if (typeof stateValue !== "string") {
          return stateValue;
        }
        var statePath = toStatePath2(stateValue, delimiter);
        return pathToStateValue2(statePath);
      }
      function pathToStateValue2(statePath) {
        if (statePath.length === 1) {
          return statePath[0];
        }
        var value = {};
        var marker = value;
        for (var i5 = 0; i5 < statePath.length - 1; i5++) {
          if (i5 === statePath.length - 2) {
            marker[statePath[i5]] = statePath[i5 + 1];
          } else {
            marker[statePath[i5]] = {};
            marker = marker[statePath[i5]];
          }
        }
        return value;
      }
      function mapValues2(collection, iteratee) {
        var result = {};
        var collectionKeys = Object.keys(collection);
        for (var i5 = 0; i5 < collectionKeys.length; i5++) {
          var key = collectionKeys[i5];
          result[key] = iteratee(collection[key], key, collection, i5);
        }
        return result;
      }
      function mapFilterValues2(collection, iteratee, predicate) {
        var e_1, _a3;
        var result = {};
        try {
          for (var _b = _tslib.__values(Object.keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var item = collection[key];
            if (!predicate(item)) {
              continue;
            }
            result[key] = iteratee(item, key, collection);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return result;
      }
      var path2 = function(props) {
        return function(object) {
          var e_2, _a3;
          var result = object;
          try {
            for (var props_1 = _tslib.__values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
              var prop = props_1_1.value;
              result = result[prop];
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (props_1_1 && !props_1_1.done && (_a3 = props_1.return))
                _a3.call(props_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
          return result;
        };
      };
      function nestedPath2(props, accessorProp) {
        return function(object) {
          var e_3, _a3;
          var result = object;
          try {
            for (var props_2 = _tslib.__values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
              var prop = props_2_1.value;
              result = result[accessorProp][prop];
            }
          } catch (e_3_1) {
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (props_2_1 && !props_2_1.done && (_a3 = props_2.return))
                _a3.call(props_2);
            } finally {
              if (e_3)
                throw e_3.error;
            }
          }
          return result;
        };
      }
      function toStatePaths2(stateValue) {
        if (!stateValue) {
          return [[]];
        }
        if (isString2(stateValue)) {
          return [[stateValue]];
        }
        var result = flatten2(Object.keys(stateValue).map(function(key) {
          var subStateValue = stateValue[key];
          if (typeof subStateValue !== "string" && (!subStateValue || !Object.keys(subStateValue).length)) {
            return [[key]];
          }
          return toStatePaths2(stateValue[key]).map(function(subPath) {
            return [key].concat(subPath);
          });
        }));
        return result;
      }
      function pathsToStateValue(paths) {
        var e_4, _a3;
        var result = {};
        if (paths && paths.length === 1 && paths[0].length === 1) {
          return paths[0][0];
        }
        try {
          for (var paths_1 = _tslib.__values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
            var currentPath = paths_1_1.value;
            var marker = result;
            for (var i5 = 0; i5 < currentPath.length; i5++) {
              var subPath = currentPath[i5];
              if (i5 === currentPath.length - 2) {
                marker[subPath] = currentPath[i5 + 1];
                break;
              }
              marker[subPath] = marker[subPath] || {};
              marker = marker[subPath];
            }
          }
        } catch (e_4_1) {
          e_4 = {
            error: e_4_1
          };
        } finally {
          try {
            if (paths_1_1 && !paths_1_1.done && (_a3 = paths_1.return))
              _a3.call(paths_1);
          } finally {
            if (e_4)
              throw e_4.error;
          }
        }
        return result;
      }
      function flatten2(array) {
        var _a3;
        return (_a3 = []).concat.apply(_a3, _tslib.__spreadArray([], _tslib.__read(array), false));
      }
      function toArrayStrict2(value) {
        if (isArray2(value)) {
          return value;
        }
        return [value];
      }
      function toArray2(value) {
        if (value === void 0) {
          return [];
        }
        return toArrayStrict2(value);
      }
      function mapContext2(mapper, context, _event) {
        var e_5, _a3;
        if (isFunction2(mapper)) {
          return mapper(context, _event.data);
        }
        var result = {};
        try {
          for (var _b = _tslib.__values(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var subMapper = mapper[key];
            if (isFunction2(subMapper)) {
              result[key] = subMapper(context, _event.data);
            } else {
              result[key] = subMapper;
            }
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_5)
              throw e_5.error;
          }
        }
        return result;
      }
      function isBuiltInEvent2(eventType) {
        return /^(done|error)\./.test(eventType);
      }
      function isPromiseLike2(value) {
        if (value instanceof Promise) {
          return true;
        }
        if (value !== null && (isFunction2(value) || typeof value === "object") && isFunction2(value.then)) {
          return true;
        }
        return false;
      }
      function isBehavior2(value) {
        return value !== null && typeof value === "object" && "transition" in value && typeof value.transition === "function";
      }
      function partition2(items, predicate) {
        var e_6, _a3;
        var _b = _tslib.__read([[], []], 2), truthy = _b[0], falsy = _b[1];
        try {
          for (var items_1 = _tslib.__values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            if (predicate(item)) {
              truthy.push(item);
            } else {
              falsy.push(item);
            }
          }
        } catch (e_6_1) {
          e_6 = {
            error: e_6_1
          };
        } finally {
          try {
            if (items_1_1 && !items_1_1.done && (_a3 = items_1.return))
              _a3.call(items_1);
          } finally {
            if (e_6)
              throw e_6.error;
          }
        }
        return [truthy, falsy];
      }
      function updateHistoryStates2(hist, stateValue) {
        return mapValues2(hist.states, function(subHist, key) {
          if (!subHist) {
            return void 0;
          }
          var subStateValue = (isString2(stateValue) ? void 0 : stateValue[key]) || (subHist ? subHist.current : void 0);
          if (!subStateValue) {
            return void 0;
          }
          return {
            current: subStateValue,
            states: updateHistoryStates2(subHist, subStateValue)
          };
        });
      }
      function updateHistoryValue2(hist, stateValue) {
        return {
          current: stateValue,
          states: updateHistoryStates2(hist, stateValue)
        };
      }
      function updateContext2(context, _event, assignActions, state) {
        if (!environment.IS_PRODUCTION) {
          exports.warn(!!context, "Attempting to update undefined context");
        }
        var updatedContext = context ? assignActions.reduce(function(acc, assignAction) {
          var e_7, _a3;
          var assignment = assignAction.assignment;
          var meta = {
            state,
            action: assignAction,
            _event
          };
          var partialUpdate = {};
          if (isFunction2(assignment)) {
            partialUpdate = assignment(acc, _event.data, meta);
          } else {
            try {
              for (var _b = _tslib.__values(Object.keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var propAssignment = assignment[key];
                partialUpdate[key] = isFunction2(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
              }
            } catch (e_7_1) {
              e_7 = {
                error: e_7_1
              };
            } finally {
              try {
                if (_c && !_c.done && (_a3 = _b.return))
                  _a3.call(_b);
              } finally {
                if (e_7)
                  throw e_7.error;
              }
            }
          }
          return Object.assign({}, acc, partialUpdate);
        }, context) : context;
        return updatedContext;
      }
      exports.warn = function() {
      };
      if (!environment.IS_PRODUCTION) {
        exports.warn = function(condition, message) {
          var error3 = condition instanceof Error ? condition : void 0;
          if (!error3 && condition) {
            return;
          }
          if (console !== void 0) {
            var args = ["Warning: ".concat(message)];
            if (error3) {
              args.push(error3);
            }
            console.warn.apply(console, args);
          }
        };
      }
      function isArray2(value) {
        return Array.isArray(value);
      }
      function isFunction2(value) {
        return typeof value === "function";
      }
      function isString2(value) {
        return typeof value === "string";
      }
      function toGuard2(condition, guardMap) {
        if (!condition) {
          return void 0;
        }
        if (isString2(condition)) {
          return {
            type: constants.DEFAULT_GUARD_TYPE,
            name: condition,
            predicate: guardMap ? guardMap[condition] : void 0
          };
        }
        if (isFunction2(condition)) {
          return {
            type: constants.DEFAULT_GUARD_TYPE,
            name: condition.name,
            predicate: condition
          };
        }
        return condition;
      }
      function isObservable2(value) {
        try {
          return "subscribe" in value && isFunction2(value.subscribe);
        } catch (e5) {
          return false;
        }
      }
      var symbolObservable2 = /* @__PURE__ */ function() {
        return typeof Symbol === "function" && Symbol.observable || "@@observable";
      }();
      var interopSymbols2 = (_a2 = {}, _a2[symbolObservable2] = function() {
        return this;
      }, _a2[Symbol.observable] = function() {
        return this;
      }, _a2);
      function isMachine2(value) {
        return !!value && "__xstatenode" in value;
      }
      function isActor3(value) {
        return !!value && typeof value.send === "function";
      }
      var uniqueId2 = /* @__PURE__ */ function() {
        var currentId = 0;
        return function() {
          currentId++;
          return currentId.toString(16);
        };
      }();
      function toEventObject2(event2, payload) {
        if (isString2(event2) || typeof event2 === "number") {
          return _tslib.__assign({
            type: event2
          }, payload);
        }
        return event2;
      }
      function toSCXMLEvent2(event2, scxmlEvent) {
        if (!isString2(event2) && "$$type" in event2 && event2.$$type === "scxml") {
          return event2;
        }
        var eventObject = toEventObject2(event2);
        return _tslib.__assign({
          name: eventObject.type,
          data: eventObject,
          $$type: "scxml",
          type: "external"
        }, scxmlEvent);
      }
      function toTransitionConfigArray2(event2, configLike) {
        var transitions = toArrayStrict2(configLike).map(function(transitionLike) {
          if (typeof transitionLike === "undefined" || typeof transitionLike === "string" || isMachine2(transitionLike)) {
            return {
              target: transitionLike,
              event: event2
            };
          }
          return _tslib.__assign(_tslib.__assign({}, transitionLike), {
            event: event2
          });
        });
        return transitions;
      }
      function normalizeTarget2(target) {
        if (target === void 0 || target === constants.TARGETLESS_KEY) {
          return void 0;
        }
        return toArray2(target);
      }
      function reportUnhandledExceptionOnInvocation2(originalError, currentError, id) {
        if (!environment.IS_PRODUCTION) {
          var originalStackTrace = originalError.stack ? " Stacktrace was '".concat(originalError.stack, "'") : "";
          if (originalError === currentError) {
            console.error("Missing onError handler for invocation '".concat(id, "', error was '").concat(originalError, "'.").concat(originalStackTrace));
          } else {
            var stackTrace = currentError.stack ? " Stacktrace was '".concat(currentError.stack, "'") : "";
            console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '".concat(id, "'. ") + "Original error: '".concat(originalError, "'. ").concat(originalStackTrace, " Current error is '").concat(currentError, "'.").concat(stackTrace));
          }
        }
      }
      function evaluateGuard2(machine, guard, context, _event, state) {
        var guards = machine.options.guards;
        var guardMeta = {
          state,
          cond: guard,
          _event
        };
        if (guard.type === constants.DEFAULT_GUARD_TYPE) {
          return ((guards === null || guards === void 0 ? void 0 : guards[guard.name]) || guard.predicate)(context, _event.data, guardMeta);
        }
        var condFn = guards === null || guards === void 0 ? void 0 : guards[guard.type];
        if (!condFn) {
          throw new Error("Guard '".concat(guard.type, "' is not implemented on machine '").concat(machine.id, "'."));
        }
        return condFn(context, _event.data, guardMeta);
      }
      function toInvokeSource3(src) {
        if (typeof src === "string") {
          return {
            type: src
          };
        }
        return src;
      }
      function toObserver2(nextHandler, errorHandler, completionHandler) {
        if (typeof nextHandler === "object") {
          return nextHandler;
        }
        var noop = function() {
          return void 0;
        };
        return {
          next: nextHandler,
          error: errorHandler || noop,
          complete: completionHandler || noop
        };
      }
      function createInvokeId2(stateNodeId, index) {
        return "".concat(stateNodeId, ":invocation[").concat(index, "]");
      }
      exports.createInvokeId = createInvokeId2;
      exports.evaluateGuard = evaluateGuard2;
      exports.flatten = flatten2;
      exports.getActionType = getActionType;
      exports.getEventType = getEventType2;
      exports.interopSymbols = interopSymbols2;
      exports.isActor = isActor3;
      exports.isArray = isArray2;
      exports.isBehavior = isBehavior2;
      exports.isBuiltInEvent = isBuiltInEvent2;
      exports.isFunction = isFunction2;
      exports.isMachine = isMachine2;
      exports.isObservable = isObservable2;
      exports.isPromiseLike = isPromiseLike2;
      exports.isStateLike = isStateLike2;
      exports.isString = isString2;
      exports.keys = keys;
      exports.mapContext = mapContext2;
      exports.mapFilterValues = mapFilterValues2;
      exports.mapValues = mapValues2;
      exports.matchesState = matchesState2;
      exports.nestedPath = nestedPath2;
      exports.normalizeTarget = normalizeTarget2;
      exports.partition = partition2;
      exports.path = path2;
      exports.pathToStateValue = pathToStateValue2;
      exports.pathsToStateValue = pathsToStateValue;
      exports.reportUnhandledExceptionOnInvocation = reportUnhandledExceptionOnInvocation2;
      exports.symbolObservable = symbolObservable2;
      exports.toArray = toArray2;
      exports.toArrayStrict = toArrayStrict2;
      exports.toEventObject = toEventObject2;
      exports.toGuard = toGuard2;
      exports.toInvokeSource = toInvokeSource3;
      exports.toObserver = toObserver2;
      exports.toSCXMLEvent = toSCXMLEvent2;
      exports.toStatePath = toStatePath2;
      exports.toStatePaths = toStatePaths2;
      exports.toStateValue = toStateValue2;
      exports.toTransitionConfigArray = toTransitionConfigArray2;
      exports.uniqueId = uniqueId2;
      exports.updateContext = updateContext2;
      exports.updateHistoryStates = updateHistoryStates2;
      exports.updateHistoryValue = updateHistoryValue2;
    }
  });

  // node_modules/xstate/lib/actions.js
  var require_actions = __commonJS({
    "node_modules/xstate/lib/actions.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var _tslib = require_tslib();
      var types = require_types();
      var actionTypes = require_actionTypes();
      var utils = require_utils();
      var environment = require_environment();
      var initEvent2 = /* @__PURE__ */ utils.toSCXMLEvent({
        type: actionTypes.init
      });
      function getActionFunction2(actionType, actionFunctionMap) {
        return actionFunctionMap ? actionFunctionMap[actionType] || void 0 : void 0;
      }
      function toActionObject2(action, actionFunctionMap) {
        var actionObject;
        if (utils.isString(action) || typeof action === "number") {
          var exec = getActionFunction2(action, actionFunctionMap);
          if (utils.isFunction(exec)) {
            actionObject = {
              type: action,
              exec
            };
          } else if (exec) {
            actionObject = exec;
          } else {
            actionObject = {
              type: action,
              exec: void 0
            };
          }
        } else if (utils.isFunction(action)) {
          actionObject = {
            type: action.name || action.toString(),
            exec: action
          };
        } else {
          var exec = getActionFunction2(action.type, actionFunctionMap);
          if (utils.isFunction(exec)) {
            actionObject = _tslib.__assign(_tslib.__assign({}, action), {
              exec
            });
          } else if (exec) {
            var actionType = exec.type || action.type;
            actionObject = _tslib.__assign(_tslib.__assign(_tslib.__assign({}, exec), action), {
              type: actionType
            });
          } else {
            actionObject = action;
          }
        }
        return actionObject;
      }
      var toActionObjects2 = function(action, actionFunctionMap) {
        if (!action) {
          return [];
        }
        var actions = utils.isArray(action) ? action : [action];
        return actions.map(function(subAction) {
          return toActionObject2(subAction, actionFunctionMap);
        });
      };
      function toActivityDefinition2(action) {
        var actionObject = toActionObject2(action);
        return _tslib.__assign(_tslib.__assign({
          id: utils.isString(action) ? action : actionObject.id
        }, actionObject), {
          type: actionObject.type
        });
      }
      function raise3(event2) {
        if (!utils.isString(event2)) {
          return send4(event2, {
            to: types.SpecialTargets.Internal
          });
        }
        return {
          type: actionTypes.raise,
          event: event2
        };
      }
      function resolveRaise2(action) {
        return {
          type: actionTypes.raise,
          _event: utils.toSCXMLEvent(action.event)
        };
      }
      function send4(event2, options) {
        return {
          to: options ? options.to : void 0,
          type: actionTypes.send,
          event: utils.isFunction(event2) ? event2 : utils.toEventObject(event2),
          delay: options ? options.delay : void 0,
          id: options && options.id !== void 0 ? options.id : utils.isFunction(event2) ? event2.name : utils.getEventType(event2)
        };
      }
      function resolveSend2(action, ctx, _event, delaysMap) {
        var meta = {
          _event
        };
        var resolvedEvent = utils.toSCXMLEvent(utils.isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
        var resolvedDelay;
        if (utils.isString(action.delay)) {
          var configDelay = delaysMap && delaysMap[action.delay];
          resolvedDelay = utils.isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
        } else {
          resolvedDelay = utils.isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
        }
        var resolvedTarget = utils.isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
        return _tslib.__assign(_tslib.__assign({}, action), {
          to: resolvedTarget,
          _event: resolvedEvent,
          event: resolvedEvent.data,
          delay: resolvedDelay
        });
      }
      function sendParent2(event2, options) {
        return send4(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: types.SpecialTargets.Parent
        }));
      }
      function sendTo(actor, event2, options) {
        return send4(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: actor
        }));
      }
      function sendUpdate2() {
        return sendParent2(actionTypes.update);
      }
      function respond(event2, options) {
        return send4(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: function(_2, __, _a2) {
            var _event = _a2._event;
            return _event.origin;
          }
        }));
      }
      var defaultLogExpr = function(context, event2) {
        return {
          context,
          event: event2
        };
      };
      function log2(expr, label) {
        if (expr === void 0) {
          expr = defaultLogExpr;
        }
        return {
          type: actionTypes.log,
          label,
          expr
        };
      }
      var resolveLog2 = function(action, ctx, _event) {
        return _tslib.__assign(_tslib.__assign({}, action), {
          value: utils.isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
            _event
          })
        });
      };
      var cancel3 = function(sendId) {
        return {
          type: actionTypes.cancel,
          sendId
        };
      };
      function start3(activity) {
        var activityDef = toActivityDefinition2(activity);
        return {
          type: types.ActionTypes.Start,
          activity: activityDef,
          exec: void 0
        };
      }
      function stop3(actorRef) {
        var activity = utils.isFunction(actorRef) ? actorRef : toActivityDefinition2(actorRef);
        return {
          type: types.ActionTypes.Stop,
          activity,
          exec: void 0
        };
      }
      function resolveStop2(action, context, _event) {
        var actorRefOrString = utils.isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
        var resolvedActorRef = typeof actorRefOrString === "string" ? {
          id: actorRefOrString
        } : actorRefOrString;
        var actionObject = {
          type: types.ActionTypes.Stop,
          activity: resolvedActorRef
        };
        return actionObject;
      }
      var assign4 = function(assignment) {
        return {
          type: actionTypes.assign,
          assignment
        };
      };
      function isActionObject(action) {
        return typeof action === "object" && "type" in action;
      }
      function after3(delayRef, id) {
        var idSuffix = id ? "#".concat(id) : "";
        return "".concat(types.ActionTypes.After, "(").concat(delayRef, ")").concat(idSuffix);
      }
      function done2(id, data) {
        var type = "".concat(types.ActionTypes.DoneState, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function doneInvoke2(id, data) {
        var type = "".concat(types.ActionTypes.DoneInvoke, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function error3(id, data) {
        var type = "".concat(types.ActionTypes.ErrorPlatform, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function pure3(getActions) {
        return {
          type: types.ActionTypes.Pure,
          get: getActions
        };
      }
      function forwardTo2(target, options) {
        return send4(function(_2, event2) {
          return event2;
        }, _tslib.__assign(_tslib.__assign({}, options), {
          to: target
        }));
      }
      function escalate(errorData, options) {
        return sendParent2(function(context, event2, meta) {
          return {
            type: actionTypes.error,
            data: utils.isFunction(errorData) ? errorData(context, event2, meta) : errorData
          };
        }, _tslib.__assign(_tslib.__assign({}, options), {
          to: types.SpecialTargets.Parent
        }));
      }
      function choose2(conds) {
        return {
          type: types.ActionTypes.Choose,
          conds
        };
      }
      function resolveActions2(machine, currentState, currentContext, _event, actions, preserveActionOrder) {
        if (preserveActionOrder === void 0) {
          preserveActionOrder = false;
        }
        var _a2 = _tslib.__read(preserveActionOrder ? [[], actions] : utils.partition(actions, function(action) {
          return action.type === actionTypes.assign;
        }), 2), assignActions = _a2[0], otherActions = _a2[1];
        var updatedContext = assignActions.length ? utils.updateContext(currentContext, _event, assignActions, currentState) : currentContext;
        var preservedContexts = preserveActionOrder ? [currentContext] : void 0;
        var resolvedActions = utils.flatten(otherActions.map(function(actionObject) {
          var _a3;
          switch (actionObject.type) {
            case actionTypes.raise:
              return resolveRaise2(actionObject);
            case actionTypes.send:
              var sendAction = resolveSend2(actionObject, updatedContext, _event, machine.options.delays);
              if (!environment.IS_PRODUCTION) {
                utils.warn(!utils.isString(actionObject.delay) || typeof sendAction.delay === "number", "No delay reference for delay expression '".concat(actionObject.delay, "' was found on machine '").concat(machine.id, "'"));
              }
              return sendAction;
            case actionTypes.log:
              return resolveLog2(actionObject, updatedContext, _event);
            case actionTypes.choose: {
              var chooseAction = actionObject;
              var matchedActions = (_a3 = chooseAction.conds.find(function(condition) {
                var guard = utils.toGuard(condition.cond, machine.options.guards);
                return !guard || utils.evaluateGuard(machine, guard, updatedContext, _event, currentState);
              })) === null || _a3 === void 0 ? void 0 : _a3.actions;
              if (!matchedActions) {
                return [];
              }
              var _b = _tslib.__read(resolveActions2(machine, currentState, updatedContext, _event, toActionObjects2(utils.toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromChoose = _b[0], resolvedContextFromChoose = _b[1];
              updatedContext = resolvedContextFromChoose;
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              return resolvedActionsFromChoose;
            }
            case actionTypes.pure: {
              var matchedActions = actionObject.get(updatedContext, _event.data);
              if (!matchedActions) {
                return [];
              }
              var _c = _tslib.__read(resolveActions2(machine, currentState, updatedContext, _event, toActionObjects2(utils.toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromPure = _c[0], resolvedContext = _c[1];
              updatedContext = resolvedContext;
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              return resolvedActionsFromPure;
            }
            case actionTypes.stop: {
              return resolveStop2(actionObject, updatedContext, _event);
            }
            case actionTypes.assign: {
              updatedContext = utils.updateContext(updatedContext, _event, [actionObject], currentState);
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              break;
            }
            default:
              var resolvedActionObject = toActionObject2(actionObject, machine.options.actions);
              var exec_1 = resolvedActionObject.exec;
              if (exec_1 && preservedContexts) {
                var contextIndex_1 = preservedContexts.length - 1;
                resolvedActionObject = _tslib.__assign(_tslib.__assign({}, resolvedActionObject), {
                  exec: function(_ctx) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                      args[_i - 1] = arguments[_i];
                    }
                    exec_1.apply(void 0, _tslib.__spreadArray([preservedContexts[contextIndex_1]], _tslib.__read(args), false));
                  }
                });
              }
              return resolvedActionObject;
          }
        }).filter(function(a3) {
          return !!a3;
        }));
        return [resolvedActions, updatedContext];
      }
      exports.actionTypes = actionTypes;
      exports.after = after3;
      exports.assign = assign4;
      exports.cancel = cancel3;
      exports.choose = choose2;
      exports.done = done2;
      exports.doneInvoke = doneInvoke2;
      exports.error = error3;
      exports.escalate = escalate;
      exports.forwardTo = forwardTo2;
      exports.getActionFunction = getActionFunction2;
      exports.initEvent = initEvent2;
      exports.isActionObject = isActionObject;
      exports.log = log2;
      exports.pure = pure3;
      exports.raise = raise3;
      exports.resolveActions = resolveActions2;
      exports.resolveLog = resolveLog2;
      exports.resolveRaise = resolveRaise2;
      exports.resolveSend = resolveSend2;
      exports.resolveStop = resolveStop2;
      exports.respond = respond;
      exports.send = send4;
      exports.sendParent = sendParent2;
      exports.sendTo = sendTo;
      exports.sendUpdate = sendUpdate2;
      exports.start = start3;
      exports.stop = stop3;
      exports.toActionObject = toActionObject2;
      exports.toActionObjects = toActionObjects2;
      exports.toActivityDefinition = toActivityDefinition2;
    }
  });

  // node_modules/@lit/reactive-element/css-tag.js
  var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
  var e = Symbol();
  var n = /* @__PURE__ */ new Map();
  var s = class {
    constructor(t3, n6) {
      if (this._$cssResult$ = true, n6 !== e)
        throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = t3;
    }
    get styleSheet() {
      let e5 = n.get(this.cssText);
      return t && e5 === void 0 && (n.set(this.cssText, e5 = new CSSStyleSheet()), e5.replaceSync(this.cssText)), e5;
    }
    toString() {
      return this.cssText;
    }
  };
  var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
  var i = (e5, n6) => {
    t ? e5.adoptedStyleSheets = n6.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n6.forEach((t3) => {
      const n7 = document.createElement("style"), s5 = window.litNonce;
      s5 !== void 0 && n7.setAttribute("nonce", s5), n7.textContent = t3.cssText, e5.appendChild(n7);
    });
  };
  var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
    let e5 = "";
    for (const n6 of t4.cssRules)
      e5 += n6.cssText;
    return o(e5);
  })(t3) : t3;

  // node_modules/@lit/reactive-element/reactive-element.js
  var s2;
  var e2 = window.trustedTypes;
  var r2 = e2 ? e2.emptyScript : "";
  var h = window.reactiveElementPolyfillSupport;
  var o2 = { toAttribute(t3, i5) {
    switch (i5) {
      case Boolean:
        t3 = t3 ? r2 : null;
        break;
      case Object:
      case Array:
        t3 = t3 == null ? t3 : JSON.stringify(t3);
    }
    return t3;
  }, fromAttribute(t3, i5) {
    let s5 = t3;
    switch (i5) {
      case Boolean:
        s5 = t3 !== null;
        break;
      case Number:
        s5 = t3 === null ? null : Number(t3);
        break;
      case Object:
      case Array:
        try {
          s5 = JSON.parse(t3);
        } catch (t4) {
          s5 = null;
        }
    }
    return s5;
  } };
  var n2 = (t3, i5) => i5 !== t3 && (i5 == i5 || t3 == t3);
  var l = { attribute: true, type: String, converter: o2, reflect: false, hasChanged: n2 };
  var a = class extends HTMLElement {
    constructor() {
      super(), this._$Et = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
    }
    static addInitializer(t3) {
      var i5;
      (i5 = this.l) !== null && i5 !== void 0 || (this.l = []), this.l.push(t3);
    }
    static get observedAttributes() {
      this.finalize();
      const t3 = [];
      return this.elementProperties.forEach((i5, s5) => {
        const e5 = this._$Eh(s5, i5);
        e5 !== void 0 && (this._$Eu.set(e5, s5), t3.push(e5));
      }), t3;
    }
    static createProperty(t3, i5 = l) {
      if (i5.state && (i5.attribute = false), this.finalize(), this.elementProperties.set(t3, i5), !i5.noAccessor && !this.prototype.hasOwnProperty(t3)) {
        const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e5 = this.getPropertyDescriptor(t3, s5, i5);
        e5 !== void 0 && Object.defineProperty(this.prototype, t3, e5);
      }
    }
    static getPropertyDescriptor(t3, i5, s5) {
      return { get() {
        return this[i5];
      }, set(e5) {
        const r4 = this[t3];
        this[i5] = e5, this.requestUpdate(t3, r4, s5);
      }, configurable: true, enumerable: true };
    }
    static getPropertyOptions(t3) {
      return this.elementProperties.get(t3) || l;
    }
    static finalize() {
      if (this.hasOwnProperty("finalized"))
        return false;
      this.finalized = true;
      const t3 = Object.getPrototypeOf(this);
      if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
        const t4 = this.properties, i5 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
        for (const s5 of i5)
          this.createProperty(s5, t4[s5]);
      }
      return this.elementStyles = this.finalizeStyles(this.styles), true;
    }
    static finalizeStyles(i5) {
      const s5 = [];
      if (Array.isArray(i5)) {
        const e5 = new Set(i5.flat(1 / 0).reverse());
        for (const i6 of e5)
          s5.unshift(S(i6));
      } else
        i5 !== void 0 && s5.push(S(i5));
      return s5;
    }
    static _$Eh(t3, i5) {
      const s5 = i5.attribute;
      return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
    }
    o() {
      var t3;
      this._$Ep = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$Em(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
    }
    addController(t3) {
      var i5, s5;
      ((i5 = this._$Eg) !== null && i5 !== void 0 ? i5 : this._$Eg = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
    }
    removeController(t3) {
      var i5;
      (i5 = this._$Eg) === null || i5 === void 0 || i5.splice(this._$Eg.indexOf(t3) >>> 0, 1);
    }
    _$Em() {
      this.constructor.elementProperties.forEach((t3, i5) => {
        this.hasOwnProperty(i5) && (this._$Et.set(i5, this[i5]), delete this[i5]);
      });
    }
    createRenderRoot() {
      var t3;
      const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
      return i(s5, this.constructor.elementStyles), s5;
    }
    connectedCallback() {
      var t3;
      this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i5;
        return (i5 = t4.hostConnected) === null || i5 === void 0 ? void 0 : i5.call(t4);
      });
    }
    enableUpdating(t3) {
    }
    disconnectedCallback() {
      var t3;
      (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i5;
        return (i5 = t4.hostDisconnected) === null || i5 === void 0 ? void 0 : i5.call(t4);
      });
    }
    attributeChangedCallback(t3, i5, s5) {
      this._$AK(t3, s5);
    }
    _$ES(t3, i5, s5 = l) {
      var e5, r4;
      const h3 = this.constructor._$Eh(t3, s5);
      if (h3 !== void 0 && s5.reflect === true) {
        const n6 = ((r4 = (e5 = s5.converter) === null || e5 === void 0 ? void 0 : e5.toAttribute) !== null && r4 !== void 0 ? r4 : o2.toAttribute)(i5, s5.type);
        this._$Ei = t3, n6 == null ? this.removeAttribute(h3) : this.setAttribute(h3, n6), this._$Ei = null;
      }
    }
    _$AK(t3, i5) {
      var s5, e5, r4;
      const h3 = this.constructor, n6 = h3._$Eu.get(t3);
      if (n6 !== void 0 && this._$Ei !== n6) {
        const t4 = h3.getPropertyOptions(n6), l4 = t4.converter, a3 = (r4 = (e5 = (s5 = l4) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e5 !== void 0 ? e5 : typeof l4 == "function" ? l4 : null) !== null && r4 !== void 0 ? r4 : o2.fromAttribute;
        this._$Ei = n6, this[n6] = a3(i5, t4.type), this._$Ei = null;
      }
    }
    requestUpdate(t3, i5, s5) {
      let e5 = true;
      t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || n2)(this[t3], i5) ? (this._$AL.has(t3) || this._$AL.set(t3, i5), s5.reflect === true && this._$Ei !== t3 && (this._$EC === void 0 && (this._$EC = /* @__PURE__ */ new Map()), this._$EC.set(t3, s5))) : e5 = false), !this.isUpdatePending && e5 && (this._$Ep = this._$E_());
    }
    async _$E_() {
      this.isUpdatePending = true;
      try {
        await this._$Ep;
      } catch (t4) {
        Promise.reject(t4);
      }
      const t3 = this.scheduleUpdate();
      return t3 != null && await t3, !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      var t3;
      if (!this.isUpdatePending)
        return;
      this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i6) => this[i6] = t4), this._$Et = void 0);
      let i5 = false;
      const s5 = this._$AL;
      try {
        i5 = this.shouldUpdate(s5), i5 ? (this.willUpdate(s5), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
          var i6;
          return (i6 = t4.hostUpdate) === null || i6 === void 0 ? void 0 : i6.call(t4);
        }), this.update(s5)) : this._$EU();
      } catch (t4) {
        throw i5 = false, this._$EU(), t4;
      }
      i5 && this._$AE(s5);
    }
    willUpdate(t3) {
    }
    _$AE(t3) {
      var i5;
      (i5 = this._$Eg) === null || i5 === void 0 || i5.forEach((t4) => {
        var i6;
        return (i6 = t4.hostUpdated) === null || i6 === void 0 ? void 0 : i6.call(t4);
      }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
    }
    _$EU() {
      this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$Ep;
    }
    shouldUpdate(t3) {
      return true;
    }
    update(t3) {
      this._$EC !== void 0 && (this._$EC.forEach((t4, i5) => this._$ES(i5, this[i5], t4)), this._$EC = void 0), this._$EU();
    }
    updated(t3) {
    }
    firstUpdated(t3) {
    }
  };
  a.finalized = true, a.elementProperties = /* @__PURE__ */ new Map(), a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, h == null || h({ ReactiveElement: a }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.3.2");

  // node_modules/lit-html/lit-html.js
  var t2;
  var i2 = globalThis.trustedTypes;
  var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var e3 = `lit$${(Math.random() + "").slice(9)}$`;
  var o3 = "?" + e3;
  var n3 = `<${o3}>`;
  var l2 = document;
  var h2 = (t3 = "") => l2.createComment(t3);
  var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
  var d = Array.isArray;
  var u = (t3) => {
    var i5;
    return d(t3) || typeof ((i5 = t3) === null || i5 === void 0 ? void 0 : i5[Symbol.iterator]) == "function";
  };
  var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var v = /-->/g;
  var a2 = />/g;
  var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
  var _ = /'/g;
  var m = /"/g;
  var g = /^(?:script|style|textarea|title)$/i;
  var p = (t3) => (i5, ...s5) => ({ _$litType$: t3, strings: i5, values: s5 });
  var $ = p(1);
  var y = p(2);
  var b = Symbol.for("lit-noChange");
  var w = Symbol.for("lit-nothing");
  var T = /* @__PURE__ */ new WeakMap();
  var x = (t3, i5, s5) => {
    var e5, o6;
    const n6 = (e5 = s5 == null ? void 0 : s5.renderBefore) !== null && e5 !== void 0 ? e5 : i5;
    let l4 = n6._$litPart$;
    if (l4 === void 0) {
      const t4 = (o6 = s5 == null ? void 0 : s5.renderBefore) !== null && o6 !== void 0 ? o6 : null;
      n6._$litPart$ = l4 = new N(i5.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
    }
    return l4._$AI(t3), l4;
  };
  var A = l2.createTreeWalker(l2, 129, null, false);
  var C = (t3, i5) => {
    const o6 = t3.length - 1, l4 = [];
    let h3, r4 = i5 === 2 ? "<svg>" : "", d2 = c;
    for (let i6 = 0; i6 < o6; i6++) {
      const s5 = t3[i6];
      let o7, u3, p2 = -1, $2 = 0;
      for (; $2 < s5.length && (d2.lastIndex = $2, u3 = d2.exec(s5), u3 !== null); )
        $2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a2 : u3[2] !== void 0 ? (g.test(u3[2]) && (h3 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h3 != null ? h3 : c, p2 = -1) : u3[1] === void 0 ? p2 = -2 : (p2 = d2.lastIndex - u3[2].length, o7 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a2 ? d2 = c : (d2 = f, h3 = void 0);
      const y2 = d2 === f && t3[i6 + 1].startsWith("/>") ? " " : "";
      r4 += d2 === c ? s5 + n3 : p2 >= 0 ? (l4.push(o7), s5.slice(0, p2) + "$lit$" + s5.slice(p2) + e3 + y2) : s5 + e3 + (p2 === -2 ? (l4.push(void 0), i6) : y2);
    }
    const u2 = r4 + (t3[o6] || "<?>") + (i5 === 2 ? "</svg>" : "");
    if (!Array.isArray(t3) || !t3.hasOwnProperty("raw"))
      throw Error("invalid template strings array");
    return [s3 !== void 0 ? s3.createHTML(u2) : u2, l4];
  };
  var E = class {
    constructor({ strings: t3, _$litType$: s5 }, n6) {
      let l4;
      this.parts = [];
      let r4 = 0, d2 = 0;
      const u2 = t3.length - 1, c2 = this.parts, [v2, a3] = C(t3, s5);
      if (this.el = E.createElement(v2, n6), A.currentNode = this.el.content, s5 === 2) {
        const t4 = this.el.content, i5 = t4.firstChild;
        i5.remove(), t4.append(...i5.childNodes);
      }
      for (; (l4 = A.nextNode()) !== null && c2.length < u2; ) {
        if (l4.nodeType === 1) {
          if (l4.hasAttributes()) {
            const t4 = [];
            for (const i5 of l4.getAttributeNames())
              if (i5.endsWith("$lit$") || i5.startsWith(e3)) {
                const s6 = a3[d2++];
                if (t4.push(i5), s6 !== void 0) {
                  const t5 = l4.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i6 = /([.?@])?(.*)/.exec(s6);
                  c2.push({ type: 1, index: r4, name: i6[2], strings: t5, ctor: i6[1] === "." ? M : i6[1] === "?" ? H : i6[1] === "@" ? I : S2 });
                } else
                  c2.push({ type: 6, index: r4 });
              }
            for (const i5 of t4)
              l4.removeAttribute(i5);
          }
          if (g.test(l4.tagName)) {
            const t4 = l4.textContent.split(e3), s6 = t4.length - 1;
            if (s6 > 0) {
              l4.textContent = i2 ? i2.emptyScript : "";
              for (let i5 = 0; i5 < s6; i5++)
                l4.append(t4[i5], h2()), A.nextNode(), c2.push({ type: 2, index: ++r4 });
              l4.append(t4[s6], h2());
            }
          }
        } else if (l4.nodeType === 8)
          if (l4.data === o3)
            c2.push({ type: 2, index: r4 });
          else {
            let t4 = -1;
            for (; (t4 = l4.data.indexOf(e3, t4 + 1)) !== -1; )
              c2.push({ type: 7, index: r4 }), t4 += e3.length - 1;
          }
        r4++;
      }
    }
    static createElement(t3, i5) {
      const s5 = l2.createElement("template");
      return s5.innerHTML = t3, s5;
    }
  };
  function P(t3, i5, s5 = t3, e5) {
    var o6, n6, l4, h3;
    if (i5 === b)
      return i5;
    let d2 = e5 !== void 0 ? (o6 = s5._$Cl) === null || o6 === void 0 ? void 0 : o6[e5] : s5._$Cu;
    const u2 = r3(i5) ? void 0 : i5._$litDirective$;
    return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n6 = d2 == null ? void 0 : d2._$AO) === null || n6 === void 0 || n6.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e5)), e5 !== void 0 ? ((l4 = (h3 = s5)._$Cl) !== null && l4 !== void 0 ? l4 : h3._$Cl = [])[e5] = d2 : s5._$Cu = d2), d2 !== void 0 && (i5 = P(t3, d2._$AS(t3, i5.values), d2, e5)), i5;
  }
  var V = class {
    constructor(t3, i5) {
      this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    p(t3) {
      var i5;
      const { el: { content: s5 }, parts: e5 } = this._$AD, o6 = ((i5 = t3 == null ? void 0 : t3.creationScope) !== null && i5 !== void 0 ? i5 : l2).importNode(s5, true);
      A.currentNode = o6;
      let n6 = A.nextNode(), h3 = 0, r4 = 0, d2 = e5[0];
      for (; d2 !== void 0; ) {
        if (h3 === d2.index) {
          let i6;
          d2.type === 2 ? i6 = new N(n6, n6.nextSibling, this, t3) : d2.type === 1 ? i6 = new d2.ctor(n6, d2.name, d2.strings, this, t3) : d2.type === 6 && (i6 = new L(n6, this, t3)), this.v.push(i6), d2 = e5[++r4];
        }
        h3 !== (d2 == null ? void 0 : d2.index) && (n6 = A.nextNode(), h3++);
      }
      return o6;
    }
    m(t3) {
      let i5 = 0;
      for (const s5 of this.v)
        s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i5), i5 += s5.strings.length - 2) : s5._$AI(t3[i5])), i5++;
    }
  };
  var N = class {
    constructor(t3, i5, s5, e5) {
      var o6;
      this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s5, this.options = e5, this._$Cg = (o6 = e5 == null ? void 0 : e5.isConnected) === null || o6 === void 0 || o6;
    }
    get _$AU() {
      var t3, i5;
      return (i5 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i5 !== void 0 ? i5 : this._$Cg;
    }
    get parentNode() {
      let t3 = this._$AA.parentNode;
      const i5 = this._$AM;
      return i5 !== void 0 && t3.nodeType === 11 && (t3 = i5.parentNode), t3;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t3, i5 = this) {
      t3 = P(this, t3, i5), r3(t3) ? t3 === w || t3 == null || t3 === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.k(t3) : u(t3) ? this.S(t3) : this.$(t3);
    }
    M(t3, i5 = this._$AB) {
      return this._$AA.parentNode.insertBefore(t3, i5);
    }
    k(t3) {
      this._$AH !== t3 && (this._$AR(), this._$AH = this.M(t3));
    }
    $(t3) {
      this._$AH !== w && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.k(l2.createTextNode(t3)), this._$AH = t3;
    }
    T(t3) {
      var i5;
      const { values: s5, _$litType$: e5 } = t3, o6 = typeof e5 == "number" ? this._$AC(t3) : (e5.el === void 0 && (e5.el = E.createElement(e5.h, this.options)), e5);
      if (((i5 = this._$AH) === null || i5 === void 0 ? void 0 : i5._$AD) === o6)
        this._$AH.m(s5);
      else {
        const t4 = new V(o6, this), i6 = t4.p(this.options);
        t4.m(s5), this.k(i6), this._$AH = t4;
      }
    }
    _$AC(t3) {
      let i5 = T.get(t3.strings);
      return i5 === void 0 && T.set(t3.strings, i5 = new E(t3)), i5;
    }
    S(t3) {
      d(this._$AH) || (this._$AH = [], this._$AR());
      const i5 = this._$AH;
      let s5, e5 = 0;
      for (const o6 of t3)
        e5 === i5.length ? i5.push(s5 = new N(this.M(h2()), this.M(h2()), this, this.options)) : s5 = i5[e5], s5._$AI(o6), e5++;
      e5 < i5.length && (this._$AR(s5 && s5._$AB.nextSibling, e5), i5.length = e5);
    }
    _$AR(t3 = this._$AA.nextSibling, i5) {
      var s5;
      for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i5); t3 && t3 !== this._$AB; ) {
        const i6 = t3.nextSibling;
        t3.remove(), t3 = i6;
      }
    }
    setConnected(t3) {
      var i5;
      this._$AM === void 0 && (this._$Cg = t3, (i5 = this._$AP) === null || i5 === void 0 || i5.call(this, t3));
    }
  };
  var S2 = class {
    constructor(t3, i5, s5, e5, o6) {
      this.type = 1, this._$AH = w, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e5, this.options = o6, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = w;
    }
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3, i5 = this, s5, e5) {
      const o6 = this.strings;
      let n6 = false;
      if (o6 === void 0)
        t3 = P(this, t3, i5, 0), n6 = !r3(t3) || t3 !== this._$AH && t3 !== b, n6 && (this._$AH = t3);
      else {
        const e6 = t3;
        let l4, h3;
        for (t3 = o6[0], l4 = 0; l4 < o6.length - 1; l4++)
          h3 = P(this, e6[s5 + l4], i5, l4), h3 === b && (h3 = this._$AH[l4]), n6 || (n6 = !r3(h3) || h3 !== this._$AH[l4]), h3 === w ? t3 = w : t3 !== w && (t3 += (h3 != null ? h3 : "") + o6[l4 + 1]), this._$AH[l4] = h3;
      }
      n6 && !e5 && this.C(t3);
    }
    C(t3) {
      t3 === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
    }
  };
  var M = class extends S2 {
    constructor() {
      super(...arguments), this.type = 3;
    }
    C(t3) {
      this.element[this.name] = t3 === w ? void 0 : t3;
    }
  };
  var k = i2 ? i2.emptyScript : "";
  var H = class extends S2 {
    constructor() {
      super(...arguments), this.type = 4;
    }
    C(t3) {
      t3 && t3 !== w ? this.element.setAttribute(this.name, k) : this.element.removeAttribute(this.name);
    }
  };
  var I = class extends S2 {
    constructor(t3, i5, s5, e5, o6) {
      super(t3, i5, s5, e5, o6), this.type = 5;
    }
    _$AI(t3, i5 = this) {
      var s5;
      if ((t3 = (s5 = P(this, t3, i5, 0)) !== null && s5 !== void 0 ? s5 : w) === b)
        return;
      const e5 = this._$AH, o6 = t3 === w && e5 !== w || t3.capture !== e5.capture || t3.once !== e5.once || t3.passive !== e5.passive, n6 = t3 !== w && (e5 === w || o6);
      o6 && this.element.removeEventListener(this.name, this, e5), n6 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
    }
    handleEvent(t3) {
      var i5, s5;
      typeof this._$AH == "function" ? this._$AH.call((s5 = (i5 = this.options) === null || i5 === void 0 ? void 0 : i5.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
    }
  };
  var L = class {
    constructor(t3, i5, s5) {
      this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s5;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t3) {
      P(this, t3);
    }
  };
  var z = window.litHtmlPolyfillSupport;
  z == null || z(E, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.2.4");

  // node_modules/lit-element/lit-element.js
  var l3;
  var o4;
  var s4 = class extends a {
    constructor() {
      super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
    }
    createRenderRoot() {
      var t3, e5;
      const i5 = super.createRenderRoot();
      return (t3 = (e5 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e5.renderBefore = i5.firstChild), i5;
    }
    update(t3) {
      const i5 = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = x(i5, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
      var t3;
      super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
    }
    disconnectedCallback() {
      var t3;
      super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
    }
    render() {
      return b;
    }
  };
  s4.finalized = true, s4._$litElement$ = true, (l3 = globalThis.litElementHydrateSupport) === null || l3 === void 0 || l3.call(globalThis, { LitElement: s4 });
  var n4 = globalThis.litElementPolyfillSupport;
  n4 == null || n4({ LitElement: s4 });
  ((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.2.0");

  // node_modules/@lit/reactive-element/decorators/custom-element.js
  var n5 = (n6) => (e5) => typeof e5 == "function" ? ((n7, e6) => (window.customElements.define(n7, e6), e6))(n6, e5) : ((n7, e6) => {
    const { kind: t3, elements: i5 } = e6;
    return { kind: t3, elements: i5, finisher(e7) {
      window.customElements.define(n7, e7);
    } };
  })(n6, e5);

  // node_modules/@xstate/inspect/es/_virtual/_tslib.js
  var __assign = function() {
    __assign = Object.assign || function __assign3(t3) {
      for (var s5, i5 = 1, n6 = arguments.length; i5 < n6; i5++) {
        s5 = arguments[i5];
        for (var p2 in s5)
          if (Object.prototype.hasOwnProperty.call(s5, p2))
            t3[p2] = s5[p2];
      }
      return t3;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s5, e5) {
    var t3 = {};
    for (var p2 in s5)
      if (Object.prototype.hasOwnProperty.call(s5, p2) && e5.indexOf(p2) < 0)
        t3[p2] = s5[p2];
    if (s5 != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i5 = 0, p2 = Object.getOwnPropertySymbols(s5); i5 < p2.length; i5++) {
        if (e5.indexOf(p2[i5]) < 0 && Object.prototype.propertyIsEnumerable.call(s5, p2[i5]))
          t3[p2[i5]] = s5[p2[i5]];
      }
    return t3;
  }
  function __values(o6) {
    var s5 = typeof Symbol === "function" && Symbol.iterator, m2 = s5 && o6[s5], i5 = 0;
    if (m2)
      return m2.call(o6);
    if (o6 && typeof o6.length === "number")
      return {
        next: function() {
          if (o6 && i5 >= o6.length)
            o6 = void 0;
          return { value: o6 && o6[i5++], done: !o6 };
        }
      };
    throw new TypeError(s5 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  // node_modules/xstate/es/_virtual/_tslib.js
  var __assign2 = function() {
    __assign2 = Object.assign || function __assign3(t3) {
      for (var s5, i5 = 1, n6 = arguments.length; i5 < n6; i5++) {
        s5 = arguments[i5];
        for (var p2 in s5)
          if (Object.prototype.hasOwnProperty.call(s5, p2))
            t3[p2] = s5[p2];
      }
      return t3;
    };
    return __assign2.apply(this, arguments);
  };
  function __rest2(s5, e5) {
    var t3 = {};
    for (var p2 in s5)
      if (Object.prototype.hasOwnProperty.call(s5, p2) && e5.indexOf(p2) < 0)
        t3[p2] = s5[p2];
    if (s5 != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i5 = 0, p2 = Object.getOwnPropertySymbols(s5); i5 < p2.length; i5++) {
        if (e5.indexOf(p2[i5]) < 0 && Object.prototype.propertyIsEnumerable.call(s5, p2[i5]))
          t3[p2[i5]] = s5[p2[i5]];
      }
    return t3;
  }
  function __values2(o6) {
    var s5 = typeof Symbol === "function" && Symbol.iterator, m2 = s5 && o6[s5], i5 = 0;
    if (m2)
      return m2.call(o6);
    if (o6 && typeof o6.length === "number")
      return {
        next: function() {
          if (o6 && i5 >= o6.length)
            o6 = void 0;
          return { value: o6 && o6[i5++], done: !o6 };
        }
      };
    throw new TypeError(s5 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o6, n6) {
    var m2 = typeof Symbol === "function" && o6[Symbol.iterator];
    if (!m2)
      return o6;
    var i5 = m2.call(o6), r4, ar = [], e5;
    try {
      while ((n6 === void 0 || n6-- > 0) && !(r4 = i5.next()).done)
        ar.push(r4.value);
    } catch (error3) {
      e5 = { error: error3 };
    } finally {
      try {
        if (r4 && !r4.done && (m2 = i5["return"]))
          m2.call(i5);
      } finally {
        if (e5)
          throw e5.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i5 = 0, l4 = from.length, ar; i5 < l4; i5++) {
        if (ar || !(i5 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i5);
          ar[i5] = from[i5];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/xstate/es/types.js
  var ActionTypes;
  (function(ActionTypes2) {
    ActionTypes2["Start"] = "xstate.start";
    ActionTypes2["Stop"] = "xstate.stop";
    ActionTypes2["Raise"] = "xstate.raise";
    ActionTypes2["Send"] = "xstate.send";
    ActionTypes2["Cancel"] = "xstate.cancel";
    ActionTypes2["NullEvent"] = "";
    ActionTypes2["Assign"] = "xstate.assign";
    ActionTypes2["After"] = "xstate.after";
    ActionTypes2["DoneState"] = "done.state";
    ActionTypes2["DoneInvoke"] = "done.invoke";
    ActionTypes2["Log"] = "xstate.log";
    ActionTypes2["Init"] = "xstate.init";
    ActionTypes2["Invoke"] = "xstate.invoke";
    ActionTypes2["ErrorExecution"] = "error.execution";
    ActionTypes2["ErrorCommunication"] = "error.communication";
    ActionTypes2["ErrorPlatform"] = "error.platform";
    ActionTypes2["ErrorCustom"] = "xstate.error";
    ActionTypes2["Update"] = "xstate.update";
    ActionTypes2["Pure"] = "xstate.pure";
    ActionTypes2["Choose"] = "xstate.choose";
  })(ActionTypes || (ActionTypes = {}));
  var SpecialTargets;
  (function(SpecialTargets2) {
    SpecialTargets2["Parent"] = "#_parent";
    SpecialTargets2["Internal"] = "#_internal";
  })(SpecialTargets || (SpecialTargets = {}));

  // node_modules/xstate/es/actionTypes.js
  var start = ActionTypes.Start;
  var stop = ActionTypes.Stop;
  var raise = ActionTypes.Raise;
  var send = ActionTypes.Send;
  var cancel = ActionTypes.Cancel;
  var nullEvent = ActionTypes.NullEvent;
  var assign = ActionTypes.Assign;
  var after = ActionTypes.After;
  var doneState = ActionTypes.DoneState;
  var log = ActionTypes.Log;
  var init = ActionTypes.Init;
  var invoke = ActionTypes.Invoke;
  var errorExecution = ActionTypes.ErrorExecution;
  var errorPlatform = ActionTypes.ErrorPlatform;
  var error = ActionTypes.ErrorCustom;
  var update = ActionTypes.Update;
  var choose = ActionTypes.Choose;
  var pure = ActionTypes.Pure;

  // node_modules/xstate/es/constants.js
  var STATE_DELIMITER = ".";
  var EMPTY_ACTIVITY_MAP = {};
  var DEFAULT_GUARD_TYPE = "xstate.guard";
  var TARGETLESS_KEY = "";

  // node_modules/xstate/es/environment.js
  var IS_PRODUCTION = false;

  // node_modules/xstate/es/utils.js
  var _a;
  function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) {
      delimiter = STATE_DELIMITER;
    }
    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);
    if (isString(childStateValue)) {
      if (isString(parentStateValue)) {
        return childStateValue === parentStateValue;
      }
      return false;
    }
    if (isString(parentStateValue)) {
      return parentStateValue in childStateValue;
    }
    return Object.keys(parentStateValue).every(function(key) {
      if (!(key in childStateValue)) {
        return false;
      }
      return matchesState(parentStateValue[key], childStateValue[key]);
    });
  }
  function getEventType(event2) {
    try {
      return isString(event2) || typeof event2 === "number" ? "".concat(event2) : event2.type;
    } catch (e5) {
      throw new Error("Events must be strings or objects with a string event.type property.");
    }
  }
  function toStatePath(stateId, delimiter) {
    try {
      if (isArray(stateId)) {
        return stateId;
      }
      return stateId.toString().split(delimiter);
    } catch (e5) {
      throw new Error("'".concat(stateId, "' is not a valid state path."));
    }
  }
  function isStateLike(state) {
    return typeof state === "object" && "value" in state && "context" in state && "event" in state && "_event" in state;
  }
  function toStateValue(stateValue, delimiter) {
    if (isStateLike(stateValue)) {
      return stateValue.value;
    }
    if (isArray(stateValue)) {
      return pathToStateValue(stateValue);
    }
    if (typeof stateValue !== "string") {
      return stateValue;
    }
    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
  }
  function pathToStateValue(statePath) {
    if (statePath.length === 1) {
      return statePath[0];
    }
    var value = {};
    var marker = value;
    for (var i5 = 0; i5 < statePath.length - 1; i5++) {
      if (i5 === statePath.length - 2) {
        marker[statePath[i5]] = statePath[i5 + 1];
      } else {
        marker[statePath[i5]] = {};
        marker = marker[statePath[i5]];
      }
    }
    return value;
  }
  function mapValues(collection, iteratee) {
    var result = {};
    var collectionKeys = Object.keys(collection);
    for (var i5 = 0; i5 < collectionKeys.length; i5++) {
      var key = collectionKeys[i5];
      result[key] = iteratee(collection[key], key, collection, i5);
    }
    return result;
  }
  function mapFilterValues(collection, iteratee, predicate) {
    var e_1, _a2;
    var result = {};
    try {
      for (var _b = __values2(Object.keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var item = collection[key];
        if (!predicate(item)) {
          continue;
        }
        result[key] = iteratee(item, key, collection);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a2 = _b.return))
          _a2.call(_b);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    return result;
  }
  var path = function(props) {
    return function(object) {
      var e_2, _a2;
      var result = object;
      try {
        for (var props_1 = __values2(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
          var prop = props_1_1.value;
          result = result[prop];
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (props_1_1 && !props_1_1.done && (_a2 = props_1.return))
            _a2.call(props_1);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      return result;
    };
  };
  function nestedPath(props, accessorProp) {
    return function(object) {
      var e_3, _a2;
      var result = object;
      try {
        for (var props_2 = __values2(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
          var prop = props_2_1.value;
          result = result[accessorProp][prop];
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (props_2_1 && !props_2_1.done && (_a2 = props_2.return))
            _a2.call(props_2);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      return result;
    };
  }
  function toStatePaths(stateValue) {
    if (!stateValue) {
      return [[]];
    }
    if (isString(stateValue)) {
      return [[stateValue]];
    }
    var result = flatten(Object.keys(stateValue).map(function(key) {
      var subStateValue = stateValue[key];
      if (typeof subStateValue !== "string" && (!subStateValue || !Object.keys(subStateValue).length)) {
        return [[key]];
      }
      return toStatePaths(stateValue[key]).map(function(subPath) {
        return [key].concat(subPath);
      });
    }));
    return result;
  }
  function flatten(array) {
    var _a2;
    return (_a2 = []).concat.apply(_a2, __spreadArray([], __read(array), false));
  }
  function toArrayStrict(value) {
    if (isArray(value)) {
      return value;
    }
    return [value];
  }
  function toArray(value) {
    if (value === void 0) {
      return [];
    }
    return toArrayStrict(value);
  }
  function mapContext(mapper, context, _event) {
    var e_5, _a2;
    if (isFunction(mapper)) {
      return mapper(context, _event.data);
    }
    var result = {};
    try {
      for (var _b = __values2(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var subMapper = mapper[key];
        if (isFunction(subMapper)) {
          result[key] = subMapper(context, _event.data);
        } else {
          result[key] = subMapper;
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a2 = _b.return))
          _a2.call(_b);
      } finally {
        if (e_5)
          throw e_5.error;
      }
    }
    return result;
  }
  function isBuiltInEvent(eventType) {
    return /^(done|error)\./.test(eventType);
  }
  function isPromiseLike(value) {
    if (value instanceof Promise) {
      return true;
    }
    if (value !== null && (isFunction(value) || typeof value === "object") && isFunction(value.then)) {
      return true;
    }
    return false;
  }
  function isBehavior(value) {
    return value !== null && typeof value === "object" && "transition" in value && typeof value.transition === "function";
  }
  function partition(items, predicate) {
    var e_6, _a2;
    var _b = __read([[], []], 2), truthy = _b[0], falsy = _b[1];
    try {
      for (var items_1 = __values2(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
        var item = items_1_1.value;
        if (predicate(item)) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }
    } catch (e_6_1) {
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (items_1_1 && !items_1_1.done && (_a2 = items_1.return))
          _a2.call(items_1);
      } finally {
        if (e_6)
          throw e_6.error;
      }
    }
    return [truthy, falsy];
  }
  function updateHistoryStates(hist, stateValue) {
    return mapValues(hist.states, function(subHist, key) {
      if (!subHist) {
        return void 0;
      }
      var subStateValue = (isString(stateValue) ? void 0 : stateValue[key]) || (subHist ? subHist.current : void 0);
      if (!subStateValue) {
        return void 0;
      }
      return {
        current: subStateValue,
        states: updateHistoryStates(subHist, subStateValue)
      };
    });
  }
  function updateHistoryValue(hist, stateValue) {
    return {
      current: stateValue,
      states: updateHistoryStates(hist, stateValue)
    };
  }
  function updateContext(context, _event, assignActions, state) {
    if (!IS_PRODUCTION) {
      warn(!!context, "Attempting to update undefined context");
    }
    var updatedContext = context ? assignActions.reduce(function(acc, assignAction) {
      var e_7, _a2;
      var assignment = assignAction.assignment;
      var meta = {
        state,
        action: assignAction,
        _event
      };
      var partialUpdate = {};
      if (isFunction(assignment)) {
        partialUpdate = assignment(acc, _event.data, meta);
      } else {
        try {
          for (var _b = __values2(Object.keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var propAssignment = assignment[key];
            partialUpdate[key] = isFunction(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
          }
        } catch (e_7_1) {
          e_7 = {
            error: e_7_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return))
              _a2.call(_b);
          } finally {
            if (e_7)
              throw e_7.error;
          }
        }
      }
      return Object.assign({}, acc, partialUpdate);
    }, context) : context;
    return updatedContext;
  }
  var warn = function() {
  };
  if (!IS_PRODUCTION) {
    warn = function(condition, message) {
      var error3 = condition instanceof Error ? condition : void 0;
      if (!error3 && condition) {
        return;
      }
      if (console !== void 0) {
        var args = ["Warning: ".concat(message)];
        if (error3) {
          args.push(error3);
        }
        console.warn.apply(console, args);
      }
    };
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isString(value) {
    return typeof value === "string";
  }
  function toGuard(condition, guardMap) {
    if (!condition) {
      return void 0;
    }
    if (isString(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition,
        predicate: guardMap ? guardMap[condition] : void 0
      };
    }
    if (isFunction(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition.name,
        predicate: condition
      };
    }
    return condition;
  }
  function isObservable(value) {
    try {
      return "subscribe" in value && isFunction(value.subscribe);
    } catch (e5) {
      return false;
    }
  }
  var symbolObservable = /* @__PURE__ */ function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  }();
  var interopSymbols = (_a = {}, _a[symbolObservable] = function() {
    return this;
  }, _a[Symbol.observable] = function() {
    return this;
  }, _a);
  function isMachine(value) {
    return !!value && "__xstatenode" in value;
  }
  function isActor(value) {
    return !!value && typeof value.send === "function";
  }
  function toEventObject(event2, payload) {
    if (isString(event2) || typeof event2 === "number") {
      return __assign2({
        type: event2
      }, payload);
    }
    return event2;
  }
  function toSCXMLEvent(event2, scxmlEvent) {
    if (!isString(event2) && "$$type" in event2 && event2.$$type === "scxml") {
      return event2;
    }
    var eventObject = toEventObject(event2);
    return __assign2({
      name: eventObject.type,
      data: eventObject,
      $$type: "scxml",
      type: "external"
    }, scxmlEvent);
  }
  function toTransitionConfigArray(event2, configLike) {
    var transitions = toArrayStrict(configLike).map(function(transitionLike) {
      if (typeof transitionLike === "undefined" || typeof transitionLike === "string" || isMachine(transitionLike)) {
        return {
          target: transitionLike,
          event: event2
        };
      }
      return __assign2(__assign2({}, transitionLike), {
        event: event2
      });
    });
    return transitions;
  }
  function normalizeTarget(target) {
    if (target === void 0 || target === TARGETLESS_KEY) {
      return void 0;
    }
    return toArray(target);
  }
  function reportUnhandledExceptionOnInvocation(originalError, currentError, id) {
    if (!IS_PRODUCTION) {
      var originalStackTrace = originalError.stack ? " Stacktrace was '".concat(originalError.stack, "'") : "";
      if (originalError === currentError) {
        console.error("Missing onError handler for invocation '".concat(id, "', error was '").concat(originalError, "'.").concat(originalStackTrace));
      } else {
        var stackTrace = currentError.stack ? " Stacktrace was '".concat(currentError.stack, "'") : "";
        console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '".concat(id, "'. ") + "Original error: '".concat(originalError, "'. ").concat(originalStackTrace, " Current error is '").concat(currentError, "'.").concat(stackTrace));
      }
    }
  }
  function evaluateGuard(machine, guard, context, _event, state) {
    var guards = machine.options.guards;
    var guardMeta = {
      state,
      cond: guard,
      _event
    };
    if (guard.type === DEFAULT_GUARD_TYPE) {
      return ((guards === null || guards === void 0 ? void 0 : guards[guard.name]) || guard.predicate)(context, _event.data, guardMeta);
    }
    var condFn = guards === null || guards === void 0 ? void 0 : guards[guard.type];
    if (!condFn) {
      throw new Error("Guard '".concat(guard.type, "' is not implemented on machine '").concat(machine.id, "'."));
    }
    return condFn(context, _event.data, guardMeta);
  }
  function toInvokeSource(src) {
    if (typeof src === "string") {
      return {
        type: src
      };
    }
    return src;
  }
  function toObserver(nextHandler, errorHandler, completionHandler) {
    if (typeof nextHandler === "object") {
      return nextHandler;
    }
    var noop = function() {
      return void 0;
    };
    return {
      next: nextHandler,
      error: errorHandler || noop,
      complete: completionHandler || noop
    };
  }
  function createInvokeId(stateNodeId, index) {
    return "".concat(stateNodeId, ":invocation[").concat(index, "]");
  }

  // node_modules/xstate/es/actions.js
  var initEvent = /* @__PURE__ */ toSCXMLEvent({
    type: init
  });
  function getActionFunction(actionType, actionFunctionMap) {
    return actionFunctionMap ? actionFunctionMap[actionType] || void 0 : void 0;
  }
  function toActionObject(action, actionFunctionMap) {
    var actionObject;
    if (isString(action) || typeof action === "number") {
      var exec = getActionFunction(action, actionFunctionMap);
      if (isFunction(exec)) {
        actionObject = {
          type: action,
          exec
        };
      } else if (exec) {
        actionObject = exec;
      } else {
        actionObject = {
          type: action,
          exec: void 0
        };
      }
    } else if (isFunction(action)) {
      actionObject = {
        type: action.name || action.toString(),
        exec: action
      };
    } else {
      var exec = getActionFunction(action.type, actionFunctionMap);
      if (isFunction(exec)) {
        actionObject = __assign2(__assign2({}, action), {
          exec
        });
      } else if (exec) {
        var actionType = exec.type || action.type;
        actionObject = __assign2(__assign2(__assign2({}, exec), action), {
          type: actionType
        });
      } else {
        actionObject = action;
      }
    }
    return actionObject;
  }
  var toActionObjects = function(action, actionFunctionMap) {
    if (!action) {
      return [];
    }
    var actions = isArray(action) ? action : [action];
    return actions.map(function(subAction) {
      return toActionObject(subAction, actionFunctionMap);
    });
  };
  function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign2(__assign2({
      id: isString(action) ? action : actionObject.id
    }, actionObject), {
      type: actionObject.type
    });
  }
  function raise2(event2) {
    if (!isString(event2)) {
      return send2(event2, {
        to: SpecialTargets.Internal
      });
    }
    return {
      type: raise,
      event: event2
    };
  }
  function resolveRaise(action) {
    return {
      type: raise,
      _event: toSCXMLEvent(action.event)
    };
  }
  function send2(event2, options) {
    return {
      to: options ? options.to : void 0,
      type: send,
      event: isFunction(event2) ? event2 : toEventObject(event2),
      delay: options ? options.delay : void 0,
      id: options && options.id !== void 0 ? options.id : isFunction(event2) ? event2.name : getEventType(event2)
    };
  }
  function resolveSend(action, ctx, _event, delaysMap) {
    var meta = {
      _event
    };
    var resolvedEvent = toSCXMLEvent(isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
    var resolvedDelay;
    if (isString(action.delay)) {
      var configDelay = delaysMap && delaysMap[action.delay];
      resolvedDelay = isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
    } else {
      resolvedDelay = isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
    }
    var resolvedTarget = isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
    return __assign2(__assign2({}, action), {
      to: resolvedTarget,
      _event: resolvedEvent,
      event: resolvedEvent.data,
      delay: resolvedDelay
    });
  }
  var resolveLog = function(action, ctx, _event) {
    return __assign2(__assign2({}, action), {
      value: isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
        _event
      })
    });
  };
  var cancel2 = function(sendId) {
    return {
      type: cancel,
      sendId
    };
  };
  function start2(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
      type: ActionTypes.Start,
      activity: activityDef,
      exec: void 0
    };
  }
  function stop2(actorRef) {
    var activity = isFunction(actorRef) ? actorRef : toActivityDefinition(actorRef);
    return {
      type: ActionTypes.Stop,
      activity,
      exec: void 0
    };
  }
  function resolveStop(action, context, _event) {
    var actorRefOrString = isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
    var resolvedActorRef = typeof actorRefOrString === "string" ? {
      id: actorRefOrString
    } : actorRefOrString;
    var actionObject = {
      type: ActionTypes.Stop,
      activity: resolvedActorRef
    };
    return actionObject;
  }
  var assign2 = function(assignment) {
    return {
      type: assign,
      assignment
    };
  };
  function after2(delayRef, id) {
    var idSuffix = id ? "#".concat(id) : "";
    return "".concat(ActionTypes.After, "(").concat(delayRef, ")").concat(idSuffix);
  }
  function done(id, data) {
    var type = "".concat(ActionTypes.DoneState, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function doneInvoke(id, data) {
    var type = "".concat(ActionTypes.DoneInvoke, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function error2(id, data) {
    var type = "".concat(ActionTypes.ErrorPlatform, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function resolveActions(machine, currentState, currentContext, _event, actions, preserveActionOrder) {
    if (preserveActionOrder === void 0) {
      preserveActionOrder = false;
    }
    var _a2 = __read(preserveActionOrder ? [[], actions] : partition(actions, function(action) {
      return action.type === assign;
    }), 2), assignActions = _a2[0], otherActions = _a2[1];
    var updatedContext = assignActions.length ? updateContext(currentContext, _event, assignActions, currentState) : currentContext;
    var preservedContexts = preserveActionOrder ? [currentContext] : void 0;
    var resolvedActions = flatten(otherActions.map(function(actionObject) {
      var _a3;
      switch (actionObject.type) {
        case raise:
          return resolveRaise(actionObject);
        case send:
          var sendAction = resolveSend(actionObject, updatedContext, _event, machine.options.delays);
          if (!IS_PRODUCTION) {
            warn(!isString(actionObject.delay) || typeof sendAction.delay === "number", "No delay reference for delay expression '".concat(actionObject.delay, "' was found on machine '").concat(machine.id, "'"));
          }
          return sendAction;
        case log:
          return resolveLog(actionObject, updatedContext, _event);
        case choose: {
          var chooseAction = actionObject;
          var matchedActions = (_a3 = chooseAction.conds.find(function(condition) {
            var guard = toGuard(condition.cond, machine.options.guards);
            return !guard || evaluateGuard(machine, guard, updatedContext, _event, currentState);
          })) === null || _a3 === void 0 ? void 0 : _a3.actions;
          if (!matchedActions) {
            return [];
          }
          var _b = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromChoose = _b[0], resolvedContextFromChoose = _b[1];
          updatedContext = resolvedContextFromChoose;
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          return resolvedActionsFromChoose;
        }
        case pure: {
          var matchedActions = actionObject.get(updatedContext, _event.data);
          if (!matchedActions) {
            return [];
          }
          var _c = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromPure = _c[0], resolvedContext = _c[1];
          updatedContext = resolvedContext;
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          return resolvedActionsFromPure;
        }
        case stop: {
          return resolveStop(actionObject, updatedContext, _event);
        }
        case assign: {
          updatedContext = updateContext(updatedContext, _event, [actionObject], currentState);
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          break;
        }
        default:
          var resolvedActionObject = toActionObject(actionObject, machine.options.actions);
          var exec_1 = resolvedActionObject.exec;
          if (exec_1 && preservedContexts) {
            var contextIndex_1 = preservedContexts.length - 1;
            resolvedActionObject = __assign2(__assign2({}, resolvedActionObject), {
              exec: function(_ctx) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                  args[_i - 1] = arguments[_i];
                }
                exec_1.apply(void 0, __spreadArray([preservedContexts[contextIndex_1]], __read(args), false));
              }
            });
          }
          return resolvedActionObject;
      }
    }).filter(function(a3) {
      return !!a3;
    }));
    return [resolvedActions, updatedContext];
  }

  // node_modules/xstate/es/serviceScope.js
  var serviceStack = [];
  var provide = function(service, fn) {
    serviceStack.push(service);
    var result = fn(service);
    serviceStack.pop();
    return result;
  };

  // node_modules/xstate/es/Actor.js
  function createNullActor(id) {
    var _a2;
    return _a2 = {
      id,
      send: function() {
        return void 0;
      },
      subscribe: function() {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      },
      getSnapshot: function() {
        return void 0;
      },
      toJSON: function() {
        return {
          id
        };
      }
    }, _a2[symbolObservable] = function() {
      return this;
    }, _a2;
  }
  function createInvocableActor(invokeDefinition, machine, context, _event) {
    var _a2;
    var invokeSrc = toInvokeSource(invokeDefinition.src);
    var serviceCreator = (_a2 = machine === null || machine === void 0 ? void 0 : machine.options.services) === null || _a2 === void 0 ? void 0 : _a2[invokeSrc.type];
    var resolvedData = invokeDefinition.data ? mapContext(invokeDefinition.data, context, _event) : void 0;
    var tempActor = serviceCreator ? createDeferredActor(serviceCreator, invokeDefinition.id, resolvedData) : createNullActor(invokeDefinition.id);
    tempActor.meta = invokeDefinition;
    return tempActor;
  }
  function createDeferredActor(entity, id, data) {
    var tempActor = createNullActor(id);
    tempActor.deferred = true;
    if (isMachine(entity)) {
      var initialState_1 = tempActor.state = provide(void 0, function() {
        return (data ? entity.withContext(data) : entity).initialState;
      });
      tempActor.getSnapshot = function() {
        return initialState_1;
      };
    }
    return tempActor;
  }
  function isActor2(item) {
    try {
      return typeof item.send === "function";
    } catch (e5) {
      return false;
    }
  }
  function isSpawnedActor(item) {
    return isActor2(item) && "id" in item;
  }
  function toActorRef(actorRefLike) {
    var _a2;
    return __assign2((_a2 = {
      subscribe: function() {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      },
      id: "anonymous",
      getSnapshot: function() {
        return void 0;
      }
    }, _a2[symbolObservable] = function() {
      return this;
    }, _a2), actorRefLike);
  }

  // node_modules/xstate/es/stateUtils.js
  var isLeafNode = function(stateNode) {
    return stateNode.type === "atomic" || stateNode.type === "final";
  };
  function getChildren(stateNode) {
    return Object.keys(stateNode.states).map(function(key) {
      return stateNode.states[key];
    }).filter(function(sn) {
      return sn.type !== "history";
    });
  }
  function getAllStateNodes(stateNode) {
    var stateNodes = [stateNode];
    if (isLeafNode(stateNode)) {
      return stateNodes;
    }
    return stateNodes.concat(flatten(getChildren(stateNode).map(getAllStateNodes)));
  }
  function getConfiguration(prevStateNodes, stateNodes) {
    var e_1, _a2, e_2, _b, e_3, _c, e_4, _d;
    var prevConfiguration = new Set(prevStateNodes);
    var prevAdjList = getAdjList(prevConfiguration);
    var configuration = new Set(stateNodes);
    try {
      for (var configuration_1 = __values2(configuration), configuration_1_1 = configuration_1.next(); !configuration_1_1.done; configuration_1_1 = configuration_1.next()) {
        var s5 = configuration_1_1.value;
        var m2 = s5.parent;
        while (m2 && !configuration.has(m2)) {
          configuration.add(m2);
          m2 = m2.parent;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (configuration_1_1 && !configuration_1_1.done && (_a2 = configuration_1.return))
          _a2.call(configuration_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    var adjList = getAdjList(configuration);
    try {
      for (var configuration_2 = __values2(configuration), configuration_2_1 = configuration_2.next(); !configuration_2_1.done; configuration_2_1 = configuration_2.next()) {
        var s5 = configuration_2_1.value;
        if (s5.type === "compound" && (!adjList.get(s5) || !adjList.get(s5).length)) {
          if (prevAdjList.get(s5)) {
            prevAdjList.get(s5).forEach(function(sn) {
              return configuration.add(sn);
            });
          } else {
            s5.initialStateNodes.forEach(function(sn) {
              return configuration.add(sn);
            });
          }
        } else {
          if (s5.type === "parallel") {
            try {
              for (var _e = (e_3 = void 0, __values2(getChildren(s5))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;
                if (!configuration.has(child)) {
                  configuration.add(child);
                  if (prevAdjList.get(child)) {
                    prevAdjList.get(child).forEach(function(sn) {
                      return configuration.add(sn);
                    });
                  } else {
                    child.initialStateNodes.forEach(function(sn) {
                      return configuration.add(sn);
                    });
                  }
                }
              }
            } catch (e_3_1) {
              e_3 = {
                error: e_3_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_c = _e.return))
                  _c.call(_e);
              } finally {
                if (e_3)
                  throw e_3.error;
              }
            }
          }
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (configuration_2_1 && !configuration_2_1.done && (_b = configuration_2.return))
          _b.call(configuration_2);
      } finally {
        if (e_2)
          throw e_2.error;
      }
    }
    try {
      for (var configuration_3 = __values2(configuration), configuration_3_1 = configuration_3.next(); !configuration_3_1.done; configuration_3_1 = configuration_3.next()) {
        var s5 = configuration_3_1.value;
        var m2 = s5.parent;
        while (m2 && !configuration.has(m2)) {
          configuration.add(m2);
          m2 = m2.parent;
        }
      }
    } catch (e_4_1) {
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (configuration_3_1 && !configuration_3_1.done && (_d = configuration_3.return))
          _d.call(configuration_3);
      } finally {
        if (e_4)
          throw e_4.error;
      }
    }
    return configuration;
  }
  function getValueFromAdj(baseNode, adjList) {
    var childStateNodes = adjList.get(baseNode);
    if (!childStateNodes) {
      return {};
    }
    if (baseNode.type === "compound") {
      var childStateNode = childStateNodes[0];
      if (childStateNode) {
        if (isLeafNode(childStateNode)) {
          return childStateNode.key;
        }
      } else {
        return {};
      }
    }
    var stateValue = {};
    childStateNodes.forEach(function(csn) {
      stateValue[csn.key] = getValueFromAdj(csn, adjList);
    });
    return stateValue;
  }
  function getAdjList(configuration) {
    var e_5, _a2;
    var adjList = /* @__PURE__ */ new Map();
    try {
      for (var configuration_4 = __values2(configuration), configuration_4_1 = configuration_4.next(); !configuration_4_1.done; configuration_4_1 = configuration_4.next()) {
        var s5 = configuration_4_1.value;
        if (!adjList.has(s5)) {
          adjList.set(s5, []);
        }
        if (s5.parent) {
          if (!adjList.has(s5.parent)) {
            adjList.set(s5.parent, []);
          }
          adjList.get(s5.parent).push(s5);
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (configuration_4_1 && !configuration_4_1.done && (_a2 = configuration_4.return))
          _a2.call(configuration_4);
      } finally {
        if (e_5)
          throw e_5.error;
      }
    }
    return adjList;
  }
  function getValue(rootNode, configuration) {
    var config = getConfiguration([rootNode], configuration);
    return getValueFromAdj(rootNode, getAdjList(config));
  }
  function has(iterable, item) {
    if (Array.isArray(iterable)) {
      return iterable.some(function(member) {
        return member === item;
      });
    }
    if (iterable instanceof Set) {
      return iterable.has(item);
    }
    return false;
  }
  function nextEvents(configuration) {
    return __spreadArray([], __read(new Set(flatten(__spreadArray([], __read(configuration.map(function(sn) {
      return sn.ownEvents;
    })), false)))), false);
  }
  function isInFinalState(configuration, stateNode) {
    if (stateNode.type === "compound") {
      return getChildren(stateNode).some(function(s5) {
        return s5.type === "final" && has(configuration, s5);
      });
    }
    if (stateNode.type === "parallel") {
      return getChildren(stateNode).every(function(sn) {
        return isInFinalState(configuration, sn);
      });
    }
    return false;
  }
  function getMeta(configuration) {
    if (configuration === void 0) {
      configuration = [];
    }
    return configuration.reduce(function(acc, stateNode) {
      if (stateNode.meta !== void 0) {
        acc[stateNode.id] = stateNode.meta;
      }
      return acc;
    }, {});
  }
  function getTagsFromConfiguration(configuration) {
    return new Set(flatten(configuration.map(function(sn) {
      return sn.tags;
    })));
  }

  // node_modules/xstate/es/State.js
  function stateValuesEqual(a3, b2) {
    if (a3 === b2) {
      return true;
    }
    if (a3 === void 0 || b2 === void 0) {
      return false;
    }
    if (isString(a3) || isString(b2)) {
      return a3 === b2;
    }
    var aKeys = Object.keys(a3);
    var bKeys = Object.keys(b2);
    return aKeys.length === bKeys.length && aKeys.every(function(key) {
      return stateValuesEqual(a3[key], b2[key]);
    });
  }
  function isStateConfig(state) {
    if (typeof state !== "object" || state === null) {
      return false;
    }
    return "value" in state && "_event" in state;
  }
  function bindActionToState(action, state) {
    var exec = action.exec;
    var boundAction = __assign2(__assign2({}, action), {
      exec: exec !== void 0 ? function() {
        return exec(state.context, state.event, {
          action,
          state,
          _event: state._event
        });
      } : void 0
    });
    return boundAction;
  }
  var State = /* @__PURE__ */ function() {
    function State2(config) {
      var _this = this;
      var _a2;
      this.actions = [];
      this.activities = EMPTY_ACTIVITY_MAP;
      this.meta = {};
      this.events = [];
      this.value = config.value;
      this.context = config.context;
      this._event = config._event;
      this._sessionid = config._sessionid;
      this.event = this._event.data;
      this.historyValue = config.historyValue;
      this.history = config.history;
      this.actions = config.actions || [];
      this.activities = config.activities || EMPTY_ACTIVITY_MAP;
      this.meta = getMeta(config.configuration);
      this.events = config.events || [];
      this.matches = this.matches.bind(this);
      this.toStrings = this.toStrings.bind(this);
      this.configuration = config.configuration;
      this.transitions = config.transitions;
      this.children = config.children;
      this.done = !!config.done;
      this.tags = (_a2 = Array.isArray(config.tags) ? new Set(config.tags) : config.tags) !== null && _a2 !== void 0 ? _a2 : /* @__PURE__ */ new Set();
      this.machine = config.machine;
      Object.defineProperty(this, "nextEvents", {
        get: function() {
          return nextEvents(_this.configuration);
        }
      });
    }
    State2.from = function(stateValue, context) {
      if (stateValue instanceof State2) {
        if (stateValue.context !== context) {
          return new State2({
            value: stateValue.value,
            context,
            _event: stateValue._event,
            _sessionid: null,
            historyValue: stateValue.historyValue,
            history: stateValue.history,
            actions: [],
            activities: stateValue.activities,
            meta: {},
            events: [],
            configuration: [],
            transitions: [],
            children: {}
          });
        }
        return stateValue;
      }
      var _event = initEvent;
      return new State2({
        value: stateValue,
        context,
        _event,
        _sessionid: null,
        historyValue: void 0,
        history: void 0,
        actions: [],
        activities: void 0,
        meta: void 0,
        events: [],
        configuration: [],
        transitions: [],
        children: {}
      });
    };
    State2.create = function(config) {
      return new State2(config);
    };
    State2.inert = function(stateValue, context) {
      if (stateValue instanceof State2) {
        if (!stateValue.actions.length) {
          return stateValue;
        }
        var _event = initEvent;
        return new State2({
          value: stateValue.value,
          context,
          _event,
          _sessionid: null,
          historyValue: stateValue.historyValue,
          history: stateValue.history,
          activities: stateValue.activities,
          configuration: stateValue.configuration,
          transitions: [],
          children: {}
        });
      }
      return State2.from(stateValue, context);
    };
    State2.prototype.toStrings = function(stateValue, delimiter) {
      var _this = this;
      if (stateValue === void 0) {
        stateValue = this.value;
      }
      if (delimiter === void 0) {
        delimiter = ".";
      }
      if (isString(stateValue)) {
        return [stateValue];
      }
      var valueKeys = Object.keys(stateValue);
      return valueKeys.concat.apply(valueKeys, __spreadArray([], __read(valueKeys.map(function(key) {
        return _this.toStrings(stateValue[key], delimiter).map(function(s5) {
          return key + delimiter + s5;
        });
      })), false));
    };
    State2.prototype.toJSON = function() {
      var _a2 = this;
      _a2.configuration;
      _a2.transitions;
      var tags = _a2.tags;
      _a2.machine;
      var jsonValues = __rest2(_a2, ["configuration", "transitions", "tags", "machine"]);
      return __assign2(__assign2({}, jsonValues), {
        tags: Array.from(tags)
      });
    };
    State2.prototype.matches = function(parentStateValue) {
      return matchesState(parentStateValue, this.value);
    };
    State2.prototype.hasTag = function(tag) {
      return this.tags.has(tag);
    };
    State2.prototype.can = function(event2) {
      var _a2;
      if (IS_PRODUCTION) {
        warn(!!this.machine, "state.can(...) used outside of a machine-created State object; this will always return false.");
      }
      var transitionData = (_a2 = this.machine) === null || _a2 === void 0 ? void 0 : _a2.getTransitionData(this, event2);
      return !!(transitionData === null || transitionData === void 0 ? void 0 : transitionData.transitions.length) && transitionData.transitions.some(function(t3) {
        return t3.target !== void 0 || t3.actions.length;
      });
    };
    return State2;
  }();

  // node_modules/xstate/es/scheduler.js
  var defaultOptions = {
    deferEvents: false
  };
  var Scheduler = /* @__PURE__ */ function() {
    function Scheduler2(options) {
      this.processingEvent = false;
      this.queue = [];
      this.initialized = false;
      this.options = __assign2(__assign2({}, defaultOptions), options);
    }
    Scheduler2.prototype.initialize = function(callback) {
      this.initialized = true;
      if (callback) {
        if (!this.options.deferEvents) {
          this.schedule(callback);
          return;
        }
        this.process(callback);
      }
      this.flushEvents();
    };
    Scheduler2.prototype.schedule = function(task) {
      if (!this.initialized || this.processingEvent) {
        this.queue.push(task);
        return;
      }
      if (this.queue.length !== 0) {
        throw new Error("Event queue should be empty when it is not processing events");
      }
      this.process(task);
      this.flushEvents();
    };
    Scheduler2.prototype.clear = function() {
      this.queue = [];
    };
    Scheduler2.prototype.flushEvents = function() {
      var nextCallback = this.queue.shift();
      while (nextCallback) {
        this.process(nextCallback);
        nextCallback = this.queue.shift();
      }
    };
    Scheduler2.prototype.process = function(callback) {
      this.processingEvent = true;
      try {
        callback();
      } catch (e5) {
        this.clear();
        throw e5;
      } finally {
        this.processingEvent = false;
      }
    };
    return Scheduler2;
  }();

  // node_modules/xstate/es/registry.js
  var children = /* @__PURE__ */ new Map();
  var sessionIdIndex = 0;
  var registry = {
    bookId: function() {
      return "x:".concat(sessionIdIndex++);
    },
    register: function(id, actor) {
      children.set(id, actor);
      return id;
    },
    get: function(id) {
      return children.get(id);
    },
    free: function(id) {
      children.delete(id);
    }
  };

  // node_modules/xstate/es/devTools.js
  function getGlobal() {
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    if (!IS_PRODUCTION) {
      console.warn("XState could not find a global object in this environment. Please let the maintainers know and raise an issue here: https://github.com/statelyai/xstate/issues");
    }
  }
  function getDevTools() {
    var global2 = getGlobal();
    if (global2 && "__xstate__" in global2) {
      return global2.__xstate__;
    }
    return void 0;
  }
  function registerService(service) {
    if (!getGlobal()) {
      return;
    }
    var devTools = getDevTools();
    if (devTools) {
      devTools.register(service);
    }
  }

  // node_modules/xstate/es/behaviors.js
  function spawnBehavior(behavior, options) {
    if (options === void 0) {
      options = {};
    }
    var state = behavior.initialState;
    var observers = /* @__PURE__ */ new Set();
    var mailbox = [];
    var flushing = false;
    var flush = function() {
      if (flushing) {
        return;
      }
      flushing = true;
      while (mailbox.length > 0) {
        var event_1 = mailbox.shift();
        state = behavior.transition(state, event_1, actorCtx);
        observers.forEach(function(observer) {
          return observer.next(state);
        });
      }
      flushing = false;
    };
    var actor = toActorRef({
      id: options.id,
      send: function(event2) {
        mailbox.push(event2);
        flush();
      },
      getSnapshot: function() {
        return state;
      },
      subscribe: function(next, handleError, complete) {
        var observer = toObserver(next, handleError, complete);
        observers.add(observer);
        observer.next(state);
        return {
          unsubscribe: function() {
            observers.delete(observer);
          }
        };
      }
    });
    var actorCtx = {
      parent: options.parent,
      self: actor,
      id: options.id || "anonymous",
      observers
    };
    state = behavior.start ? behavior.start(actorCtx) : state;
    return actor;
  }

  // node_modules/xstate/es/interpreter.js
  var DEFAULT_SPAWN_OPTIONS = {
    sync: false,
    autoForward: false
  };
  var InterpreterStatus;
  (function(InterpreterStatus2) {
    InterpreterStatus2[InterpreterStatus2["NotStarted"] = 0] = "NotStarted";
    InterpreterStatus2[InterpreterStatus2["Running"] = 1] = "Running";
    InterpreterStatus2[InterpreterStatus2["Stopped"] = 2] = "Stopped";
  })(InterpreterStatus || (InterpreterStatus = {}));
  var Interpreter = /* @__PURE__ */ function() {
    function Interpreter2(machine, options) {
      var _this = this;
      if (options === void 0) {
        options = Interpreter2.defaultOptions;
      }
      this.machine = machine;
      this.delayedEventsMap = {};
      this.listeners = /* @__PURE__ */ new Set();
      this.contextListeners = /* @__PURE__ */ new Set();
      this.stopListeners = /* @__PURE__ */ new Set();
      this.doneListeners = /* @__PURE__ */ new Set();
      this.eventListeners = /* @__PURE__ */ new Set();
      this.sendListeners = /* @__PURE__ */ new Set();
      this.initialized = false;
      this.status = InterpreterStatus.NotStarted;
      this.children = /* @__PURE__ */ new Map();
      this.forwardTo = /* @__PURE__ */ new Set();
      this.init = this.start;
      this.send = function(event2, payload) {
        if (isArray(event2)) {
          _this.batch(event2);
          return _this.state;
        }
        var _event = toSCXMLEvent(toEventObject(event2, payload));
        if (_this.status === InterpreterStatus.Stopped) {
          if (!IS_PRODUCTION) {
            warn(false, 'Event "'.concat(_event.name, '" was sent to stopped service "').concat(_this.machine.id, '". This service has already reached its final state, and will not transition.\nEvent: ').concat(JSON.stringify(_event.data)));
          }
          return _this.state;
        }
        if (_this.status !== InterpreterStatus.Running && !_this.options.deferEvents) {
          throw new Error('Event "'.concat(_event.name, '" was sent to uninitialized service "').concat(_this.machine.id, '". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.\nEvent: ').concat(JSON.stringify(_event.data)));
        }
        _this.scheduler.schedule(function() {
          _this.forward(_event);
          var nextState = _this.nextState(_event);
          _this.update(nextState, _event);
        });
        return _this._state;
      };
      this.sendTo = function(event2, to) {
        var isParent = _this.parent && (to === SpecialTargets.Parent || _this.parent.id === to);
        var target = isParent ? _this.parent : isString(to) ? _this.children.get(to) || registry.get(to) : isActor(to) ? to : void 0;
        if (!target) {
          if (!isParent) {
            throw new Error("Unable to send event to child '".concat(to, "' from service '").concat(_this.id, "'."));
          }
          if (!IS_PRODUCTION) {
            warn(false, "Service '".concat(_this.id, "' has no parent: unable to send event ").concat(event2.type));
          }
          return;
        }
        if ("machine" in target) {
          target.send(__assign2(__assign2({}, event2), {
            name: event2.name === error ? "".concat(error2(_this.id)) : event2.name,
            origin: _this.sessionId
          }));
        } else {
          target.send(event2.data);
        }
      };
      var resolvedOptions = __assign2(__assign2({}, Interpreter2.defaultOptions), options);
      var clock = resolvedOptions.clock, logger = resolvedOptions.logger, parent = resolvedOptions.parent, id = resolvedOptions.id;
      var resolvedId = id !== void 0 ? id : machine.id;
      this.id = resolvedId;
      this.logger = logger;
      this.clock = clock;
      this.parent = parent;
      this.options = resolvedOptions;
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
      this.sessionId = registry.bookId();
    }
    Object.defineProperty(Interpreter2.prototype, "initialState", {
      get: function() {
        var _this = this;
        if (this._initialState) {
          return this._initialState;
        }
        return provide(this, function() {
          _this._initialState = _this.machine.initialState;
          return _this._initialState;
        });
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Interpreter2.prototype, "state", {
      get: function() {
        if (!IS_PRODUCTION) {
          warn(this.status !== InterpreterStatus.NotStarted, "Attempted to read state from uninitialized service '".concat(this.id, "'. Make sure the service is started first."));
        }
        return this._state;
      },
      enumerable: false,
      configurable: true
    });
    Interpreter2.prototype.execute = function(state, actionsConfig) {
      var e_1, _a2;
      try {
        for (var _b = __values2(state.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
          var action = _c.value;
          this.exec(action, state, actionsConfig);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    Interpreter2.prototype.update = function(state, _event) {
      var e_2, _a2, e_3, _b, e_4, _c, e_5, _d;
      var _this = this;
      state._sessionid = this.sessionId;
      this._state = state;
      if (this.options.execute) {
        this.execute(this.state);
      }
      this.children.forEach(function(child) {
        _this.state.children[child.id] = child;
      });
      if (this.devTools) {
        this.devTools.send(_event.data, state);
      }
      if (state.event) {
        try {
          for (var _e = __values2(this.eventListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
            var listener = _f.value;
            listener(state.event);
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (_f && !_f.done && (_a2 = _e.return))
              _a2.call(_e);
          } finally {
            if (e_2)
              throw e_2.error;
          }
        }
      }
      try {
        for (var _g = __values2(this.listeners), _h = _g.next(); !_h.done; _h = _g.next()) {
          var listener = _h.value;
          listener(state, state.event);
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_h && !_h.done && (_b = _g.return))
            _b.call(_g);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      try {
        for (var _j = __values2(this.contextListeners), _k = _j.next(); !_k.done; _k = _j.next()) {
          var contextListener = _k.value;
          contextListener(this.state.context, this.state.history ? this.state.history.context : void 0);
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_k && !_k.done && (_c = _j.return))
            _c.call(_j);
        } finally {
          if (e_4)
            throw e_4.error;
        }
      }
      var isDone = isInFinalState(state.configuration || [], this.machine);
      if (this.state.configuration && isDone) {
        var finalChildStateNode = state.configuration.find(function(sn) {
          return sn.type === "final" && sn.parent === _this.machine;
        });
        var doneData = finalChildStateNode && finalChildStateNode.doneData ? mapContext(finalChildStateNode.doneData, state.context, _event) : void 0;
        try {
          for (var _l = __values2(this.doneListeners), _m = _l.next(); !_m.done; _m = _l.next()) {
            var listener = _m.value;
            listener(doneInvoke(this.id, doneData));
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_m && !_m.done && (_d = _l.return))
              _d.call(_l);
          } finally {
            if (e_5)
              throw e_5.error;
          }
        }
        this.stop();
      }
    };
    Interpreter2.prototype.onTransition = function(listener) {
      this.listeners.add(listener);
      if (this.status === InterpreterStatus.Running) {
        listener(this.state, this.state.event);
      }
      return this;
    };
    Interpreter2.prototype.subscribe = function(nextListenerOrObserver, _2, completeListener) {
      var _this = this;
      if (!nextListenerOrObserver) {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      }
      var listener;
      var resolvedCompleteListener = completeListener;
      if (typeof nextListenerOrObserver === "function") {
        listener = nextListenerOrObserver;
      } else {
        listener = nextListenerOrObserver.next.bind(nextListenerOrObserver);
        resolvedCompleteListener = nextListenerOrObserver.complete.bind(nextListenerOrObserver);
      }
      this.listeners.add(listener);
      if (this.status !== InterpreterStatus.NotStarted) {
        listener(this.state);
      }
      if (resolvedCompleteListener) {
        if (this.status === InterpreterStatus.Stopped) {
          resolvedCompleteListener();
        } else {
          this.onDone(resolvedCompleteListener);
        }
      }
      return {
        unsubscribe: function() {
          listener && _this.listeners.delete(listener);
          resolvedCompleteListener && _this.doneListeners.delete(resolvedCompleteListener);
        }
      };
    };
    Interpreter2.prototype.onEvent = function(listener) {
      this.eventListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onSend = function(listener) {
      this.sendListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onChange = function(listener) {
      this.contextListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onStop = function(listener) {
      this.stopListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onDone = function(listener) {
      this.doneListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.off = function(listener) {
      this.listeners.delete(listener);
      this.eventListeners.delete(listener);
      this.sendListeners.delete(listener);
      this.stopListeners.delete(listener);
      this.doneListeners.delete(listener);
      this.contextListeners.delete(listener);
      return this;
    };
    Interpreter2.prototype.start = function(initialState) {
      var _this = this;
      if (this.status === InterpreterStatus.Running) {
        return this;
      }
      this.machine._init();
      registry.register(this.sessionId, this);
      this.initialized = true;
      this.status = InterpreterStatus.Running;
      var resolvedState = initialState === void 0 ? this.initialState : provide(this, function() {
        return isStateConfig(initialState) ? _this.machine.resolveState(initialState) : _this.machine.resolveState(State.from(initialState, _this.machine.context));
      });
      if (this.options.devTools) {
        this.attachDev();
      }
      this.scheduler.initialize(function() {
        _this.update(resolvedState, initEvent);
      });
      return this;
    };
    Interpreter2.prototype.stop = function() {
      var e_6, _a2, e_7, _b, e_8, _c, e_9, _d, e_10, _e;
      var _this = this;
      try {
        for (var _f = __values2(this.listeners), _g = _f.next(); !_g.done; _g = _f.next()) {
          var listener = _g.value;
          this.listeners.delete(listener);
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (_g && !_g.done && (_a2 = _f.return))
            _a2.call(_f);
        } finally {
          if (e_6)
            throw e_6.error;
        }
      }
      try {
        for (var _h = __values2(this.stopListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
          var listener = _j.value;
          listener();
          this.stopListeners.delete(listener);
        }
      } catch (e_7_1) {
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (_j && !_j.done && (_b = _h.return))
            _b.call(_h);
        } finally {
          if (e_7)
            throw e_7.error;
        }
      }
      try {
        for (var _k = __values2(this.contextListeners), _l = _k.next(); !_l.done; _l = _k.next()) {
          var listener = _l.value;
          this.contextListeners.delete(listener);
        }
      } catch (e_8_1) {
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (_l && !_l.done && (_c = _k.return))
            _c.call(_k);
        } finally {
          if (e_8)
            throw e_8.error;
        }
      }
      try {
        for (var _m = __values2(this.doneListeners), _o = _m.next(); !_o.done; _o = _m.next()) {
          var listener = _o.value;
          this.doneListeners.delete(listener);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (_o && !_o.done && (_d = _m.return))
            _d.call(_m);
        } finally {
          if (e_9)
            throw e_9.error;
        }
      }
      if (!this.initialized) {
        return this;
      }
      __spreadArray([], __read(this.state.configuration), false).sort(function(a3, b2) {
        return b2.order - a3.order;
      }).forEach(function(stateNode) {
        var e_11, _a3;
        try {
          for (var _b2 = __values2(stateNode.definition.exit), _c2 = _b2.next(); !_c2.done; _c2 = _b2.next()) {
            var action = _c2.value;
            _this.exec(action, _this.state);
          }
        } catch (e_11_1) {
          e_11 = {
            error: e_11_1
          };
        } finally {
          try {
            if (_c2 && !_c2.done && (_a3 = _b2.return))
              _a3.call(_b2);
          } finally {
            if (e_11)
              throw e_11.error;
          }
        }
      });
      this.children.forEach(function(child) {
        if (isFunction(child.stop)) {
          child.stop();
        }
      });
      this.children.clear();
      try {
        for (var _p = __values2(Object.keys(this.delayedEventsMap)), _q = _p.next(); !_q.done; _q = _p.next()) {
          var key = _q.value;
          this.clock.clearTimeout(this.delayedEventsMap[key]);
        }
      } catch (e_10_1) {
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (_q && !_q.done && (_e = _p.return))
            _e.call(_p);
        } finally {
          if (e_10)
            throw e_10.error;
        }
      }
      this.scheduler.clear();
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
      this.initialized = false;
      this.status = InterpreterStatus.Stopped;
      this._initialState = void 0;
      registry.free(this.sessionId);
      return this;
    };
    Interpreter2.prototype.batch = function(events) {
      var _this = this;
      if (this.status === InterpreterStatus.NotStarted && this.options.deferEvents) {
        if (!IS_PRODUCTION) {
          warn(false, "".concat(events.length, ' event(s) were sent to uninitialized service "').concat(this.machine.id, '" and are deferred. Make sure .start() is called for this service.\nEvent: ').concat(JSON.stringify(event)));
        }
      } else if (this.status !== InterpreterStatus.Running) {
        throw new Error("".concat(events.length, ' event(s) were sent to uninitialized service "').concat(this.machine.id, '". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.'));
      }
      this.scheduler.schedule(function() {
        var e_12, _a2;
        var nextState = _this.state;
        var batchChanged = false;
        var batchedActions = [];
        var _loop_1 = function(event_12) {
          var _event = toSCXMLEvent(event_12);
          _this.forward(_event);
          nextState = provide(_this, function() {
            return _this.machine.transition(nextState, _event);
          });
          batchedActions.push.apply(batchedActions, __spreadArray([], __read(nextState.actions.map(function(a3) {
            return bindActionToState(a3, nextState);
          })), false));
          batchChanged = batchChanged || !!nextState.changed;
        };
        try {
          for (var events_1 = __values2(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
            var event_1 = events_1_1.value;
            _loop_1(event_1);
          }
        } catch (e_12_1) {
          e_12 = {
            error: e_12_1
          };
        } finally {
          try {
            if (events_1_1 && !events_1_1.done && (_a2 = events_1.return))
              _a2.call(events_1);
          } finally {
            if (e_12)
              throw e_12.error;
          }
        }
        nextState.changed = batchChanged;
        nextState.actions = batchedActions;
        _this.update(nextState, toSCXMLEvent(events[events.length - 1]));
      });
    };
    Interpreter2.prototype.sender = function(event2) {
      return this.send.bind(this, event2);
    };
    Interpreter2.prototype.nextState = function(event2) {
      var _this = this;
      var _event = toSCXMLEvent(event2);
      if (_event.name.indexOf(errorPlatform) === 0 && !this.state.nextEvents.some(function(nextEvent) {
        return nextEvent.indexOf(errorPlatform) === 0;
      })) {
        throw _event.data.data;
      }
      var nextState = provide(this, function() {
        return _this.machine.transition(_this.state, _event);
      });
      return nextState;
    };
    Interpreter2.prototype.forward = function(event2) {
      var e_13, _a2;
      try {
        for (var _b = __values2(this.forwardTo), _c = _b.next(); !_c.done; _c = _b.next()) {
          var id = _c.value;
          var child = this.children.get(id);
          if (!child) {
            throw new Error("Unable to forward event '".concat(event2, "' from interpreter '").concat(this.id, "' to nonexistant child '").concat(id, "'."));
          }
          child.send(event2);
        }
      } catch (e_13_1) {
        e_13 = {
          error: e_13_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_13)
            throw e_13.error;
        }
      }
    };
    Interpreter2.prototype.defer = function(sendAction) {
      var _this = this;
      this.delayedEventsMap[sendAction.id] = this.clock.setTimeout(function() {
        if (sendAction.to) {
          _this.sendTo(sendAction._event, sendAction.to);
        } else {
          _this.send(sendAction._event);
        }
      }, sendAction.delay);
    };
    Interpreter2.prototype.cancel = function(sendId) {
      this.clock.clearTimeout(this.delayedEventsMap[sendId]);
      delete this.delayedEventsMap[sendId];
    };
    Interpreter2.prototype.exec = function(action, state, actionFunctionMap) {
      if (actionFunctionMap === void 0) {
        actionFunctionMap = this.machine.options.actions;
      }
      var context = state.context, _event = state._event;
      var actionOrExec = action.exec || getActionFunction(action.type, actionFunctionMap);
      var exec = isFunction(actionOrExec) ? actionOrExec : actionOrExec ? actionOrExec.exec : action.exec;
      if (exec) {
        try {
          return exec(context, _event.data, {
            action,
            state: this.state,
            _event
          });
        } catch (err) {
          if (this.parent) {
            this.parent.send({
              type: "xstate.error",
              data: err
            });
          }
          throw err;
        }
      }
      switch (action.type) {
        case send:
          var sendAction = action;
          if (typeof sendAction.delay === "number") {
            this.defer(sendAction);
            return;
          } else {
            if (sendAction.to) {
              this.sendTo(sendAction._event, sendAction.to);
            } else {
              this.send(sendAction._event);
            }
          }
          break;
        case cancel:
          this.cancel(action.sendId);
          break;
        case start: {
          if (this.status !== InterpreterStatus.Running) {
            return;
          }
          var activity = action.activity;
          if (!this.state.activities[activity.id || activity.type]) {
            break;
          }
          if (activity.type === ActionTypes.Invoke) {
            var invokeSource = toInvokeSource(activity.src);
            var serviceCreator = this.machine.options.services ? this.machine.options.services[invokeSource.type] : void 0;
            var id = activity.id, data = activity.data;
            if (!IS_PRODUCTION) {
              warn(!("forward" in activity), "`forward` property is deprecated (found in invocation of '".concat(activity.src, "' in in machine '").concat(this.machine.id, "'). ") + "Please use `autoForward` instead.");
            }
            var autoForward = "autoForward" in activity ? activity.autoForward : !!activity.forward;
            if (!serviceCreator) {
              if (!IS_PRODUCTION) {
                warn(false, "No service found for invocation '".concat(activity.src, "' in machine '").concat(this.machine.id, "'."));
              }
              return;
            }
            var resolvedData = data ? mapContext(data, context, _event) : void 0;
            if (typeof serviceCreator === "string") {
              return;
            }
            var source = isFunction(serviceCreator) ? serviceCreator(context, _event.data, {
              data: resolvedData,
              src: invokeSource,
              meta: activity.meta
            }) : serviceCreator;
            if (!source) {
              return;
            }
            var options = void 0;
            if (isMachine(source)) {
              source = resolvedData ? source.withContext(resolvedData) : source;
              options = {
                autoForward
              };
            }
            this.spawn(source, id, options);
          } else {
            this.spawnActivity(activity);
          }
          break;
        }
        case stop: {
          this.stopChild(action.activity.id);
          break;
        }
        case log:
          var label = action.label, value = action.value;
          if (label) {
            this.logger(label, value);
          } else {
            this.logger(value);
          }
          break;
        default:
          if (!IS_PRODUCTION) {
            warn(false, "No implementation found for action type '".concat(action.type, "'"));
          }
          break;
      }
      return void 0;
    };
    Interpreter2.prototype.removeChild = function(childId) {
      var _a2;
      this.children.delete(childId);
      this.forwardTo.delete(childId);
      (_a2 = this.state) === null || _a2 === void 0 ? true : delete _a2.children[childId];
    };
    Interpreter2.prototype.stopChild = function(childId) {
      var child = this.children.get(childId);
      if (!child) {
        return;
      }
      this.removeChild(childId);
      if (isFunction(child.stop)) {
        child.stop();
      }
    };
    Interpreter2.prototype.spawn = function(entity, name, options) {
      if (isPromiseLike(entity)) {
        return this.spawnPromise(Promise.resolve(entity), name);
      } else if (isFunction(entity)) {
        return this.spawnCallback(entity, name);
      } else if (isSpawnedActor(entity)) {
        return this.spawnActor(entity, name);
      } else if (isObservable(entity)) {
        return this.spawnObservable(entity, name);
      } else if (isMachine(entity)) {
        return this.spawnMachine(entity, __assign2(__assign2({}, options), {
          id: name
        }));
      } else if (isBehavior(entity)) {
        return this.spawnBehavior(entity, name);
      } else {
        throw new Error('Unable to spawn entity "'.concat(name, '" of type "').concat(typeof entity, '".'));
      }
    };
    Interpreter2.prototype.spawnMachine = function(machine, options) {
      var _this = this;
      if (options === void 0) {
        options = {};
      }
      var childService = new Interpreter2(machine, __assign2(__assign2({}, this.options), {
        parent: this,
        id: options.id || machine.id
      }));
      var resolvedOptions = __assign2(__assign2({}, DEFAULT_SPAWN_OPTIONS), options);
      if (resolvedOptions.sync) {
        childService.onTransition(function(state) {
          _this.send(update, {
            state,
            id: childService.id
          });
        });
      }
      var actor = childService;
      this.children.set(childService.id, actor);
      if (resolvedOptions.autoForward) {
        this.forwardTo.add(childService.id);
      }
      childService.onDone(function(doneEvent) {
        _this.removeChild(childService.id);
        _this.send(toSCXMLEvent(doneEvent, {
          origin: childService.id
        }));
      }).start();
      return actor;
    };
    Interpreter2.prototype.spawnBehavior = function(behavior, id) {
      var actorRef = spawnBehavior(behavior, {
        id,
        parent: this
      });
      this.children.set(id, actorRef);
      return actorRef;
    };
    Interpreter2.prototype.spawnPromise = function(promise, id) {
      var _a2;
      var _this = this;
      var canceled = false;
      var resolvedData;
      promise.then(function(response) {
        if (!canceled) {
          resolvedData = response;
          _this.removeChild(id);
          _this.send(toSCXMLEvent(doneInvoke(id, response), {
            origin: id
          }));
        }
      }, function(errorData) {
        if (!canceled) {
          _this.removeChild(id);
          var errorEvent = error2(id, errorData);
          try {
            _this.send(toSCXMLEvent(errorEvent, {
              origin: id
            }));
          } catch (error3) {
            reportUnhandledExceptionOnInvocation(errorData, error3, id);
            if (_this.devTools) {
              _this.devTools.send(errorEvent, _this.state);
            }
            if (_this.machine.strict) {
              _this.stop();
            }
          }
        }
      });
      var actor = (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function(next, handleError, complete) {
          var observer = toObserver(next, handleError, complete);
          var unsubscribed = false;
          promise.then(function(response) {
            if (unsubscribed) {
              return;
            }
            observer.next(response);
            if (unsubscribed) {
              return;
            }
            observer.complete();
          }, function(err) {
            if (unsubscribed) {
              return;
            }
            observer.error(err);
          });
          return {
            unsubscribe: function() {
              return unsubscribed = true;
            }
          };
        },
        stop: function() {
          canceled = true;
        },
        toJSON: function() {
          return {
            id
          };
        },
        getSnapshot: function() {
          return resolvedData;
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnCallback = function(callback, id) {
      var _a2;
      var _this = this;
      var canceled = false;
      var receivers = /* @__PURE__ */ new Set();
      var listeners = /* @__PURE__ */ new Set();
      var emitted;
      var receive = function(e5) {
        emitted = e5;
        listeners.forEach(function(listener) {
          return listener(e5);
        });
        if (canceled) {
          return;
        }
        _this.send(toSCXMLEvent(e5, {
          origin: id
        }));
      };
      var callbackStop;
      try {
        callbackStop = callback(receive, function(newListener) {
          receivers.add(newListener);
        });
      } catch (err) {
        this.send(error2(id, err));
      }
      if (isPromiseLike(callbackStop)) {
        return this.spawnPromise(callbackStop, id);
      }
      var actor = (_a2 = {
        id,
        send: function(event2) {
          return receivers.forEach(function(receiver) {
            return receiver(event2);
          });
        },
        subscribe: function(next) {
          var observer = toObserver(next);
          listeners.add(observer.next);
          return {
            unsubscribe: function() {
              listeners.delete(observer.next);
            }
          };
        },
        stop: function() {
          canceled = true;
          if (isFunction(callbackStop)) {
            callbackStop();
          }
        },
        toJSON: function() {
          return {
            id
          };
        },
        getSnapshot: function() {
          return emitted;
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnObservable = function(source, id) {
      var _a2;
      var _this = this;
      var emitted;
      var subscription = source.subscribe(function(value) {
        emitted = value;
        _this.send(toSCXMLEvent(value, {
          origin: id
        }));
      }, function(err) {
        _this.removeChild(id);
        _this.send(toSCXMLEvent(error2(id, err), {
          origin: id
        }));
      }, function() {
        _this.removeChild(id);
        _this.send(toSCXMLEvent(doneInvoke(id), {
          origin: id
        }));
      });
      var actor = (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function(next, handleError, complete) {
          return source.subscribe(next, handleError, complete);
        },
        stop: function() {
          return subscription.unsubscribe();
        },
        getSnapshot: function() {
          return emitted;
        },
        toJSON: function() {
          return {
            id
          };
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnActor = function(actor, name) {
      this.children.set(name, actor);
      return actor;
    };
    Interpreter2.prototype.spawnActivity = function(activity) {
      var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity.type] : void 0;
      if (!implementation) {
        if (!IS_PRODUCTION) {
          warn(false, "No implementation found for activity '".concat(activity.type, "'"));
        }
        return;
      }
      var dispose = implementation(this.state.context, activity);
      this.spawnEffect(activity.id, dispose);
    };
    Interpreter2.prototype.spawnEffect = function(id, dispose) {
      var _a2;
      this.children.set(id, (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function() {
          return {
            unsubscribe: function() {
              return void 0;
            }
          };
        },
        stop: dispose || void 0,
        getSnapshot: function() {
          return void 0;
        },
        toJSON: function() {
          return {
            id
          };
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2));
    };
    Interpreter2.prototype.attachDev = function() {
      var global2 = getGlobal();
      if (this.options.devTools && global2) {
        if (global2.__REDUX_DEVTOOLS_EXTENSION__) {
          var devToolsOptions = typeof this.options.devTools === "object" ? this.options.devTools : void 0;
          this.devTools = global2.__REDUX_DEVTOOLS_EXTENSION__.connect(__assign2(__assign2({
            name: this.id,
            autoPause: true,
            stateSanitizer: function(state) {
              return {
                value: state.value,
                context: state.context,
                actions: state.actions
              };
            }
          }, devToolsOptions), {
            features: __assign2({
              jump: false,
              skip: false
            }, devToolsOptions ? devToolsOptions.features : void 0)
          }), this.machine);
          this.devTools.init(this.state);
        }
        registerService(this);
      }
    };
    Interpreter2.prototype.toJSON = function() {
      return {
        id: this.id
      };
    };
    Interpreter2.prototype[symbolObservable] = function() {
      return this;
    };
    Interpreter2.prototype.getSnapshot = function() {
      if (this.status === InterpreterStatus.NotStarted) {
        return this.initialState;
      }
      return this._state;
    };
    Interpreter2.defaultOptions = {
      execute: true,
      deferEvents: true,
      clock: {
        setTimeout: function(fn, ms) {
          return setTimeout(fn, ms);
        },
        clearTimeout: function(id) {
          return clearTimeout(id);
        }
      },
      logger: /* @__PURE__ */ console.log.bind(console),
      devTools: false
    };
    Interpreter2.interpret = interpret;
    return Interpreter2;
  }();
  function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
  }

  // node_modules/xstate/es/invokeUtils.js
  function toInvokeSource2(src) {
    if (typeof src === "string") {
      var simpleSrc = {
        type: src
      };
      simpleSrc.toString = function() {
        return src;
      };
      return simpleSrc;
    }
    return src;
  }
  function toInvokeDefinition(invokeConfig) {
    return __assign2(__assign2({
      type: invoke
    }, invokeConfig), {
      toJSON: function() {
        invokeConfig.onDone;
        invokeConfig.onError;
        var invokeDef = __rest2(invokeConfig, ["onDone", "onError"]);
        return __assign2(__assign2({}, invokeDef), {
          type: invoke,
          src: toInvokeSource2(invokeConfig.src)
        });
      }
    });
  }

  // node_modules/xstate/es/StateNode.js
  var NULL_EVENT = "";
  var STATE_IDENTIFIER = "#";
  var WILDCARD = "*";
  var EMPTY_OBJECT = {};
  var isStateId = function(str) {
    return str[0] === STATE_IDENTIFIER;
  };
  var createDefaultOptions = function() {
    return {
      actions: {},
      guards: {},
      services: {},
      activities: {},
      delays: {}
    };
  };
  var validateArrayifiedTransitions = function(stateNode, event2, transitions) {
    var hasNonLastUnguardedTarget = transitions.slice(0, -1).some(function(transition) {
      return !("cond" in transition) && !("in" in transition) && (isString(transition.target) || isMachine(transition.target));
    });
    var eventText = event2 === NULL_EVENT ? "the transient event" : "event '".concat(event2, "'");
    warn(!hasNonLastUnguardedTarget, "One or more transitions for ".concat(eventText, " on state '").concat(stateNode.id, "' are unreachable. ") + "Make sure that the default transition is the last one defined.");
  };
  var StateNode = /* @__PURE__ */ function() {
    function StateNode2(config, options, _context, _stateInfo) {
      var _this = this;
      if (_context === void 0) {
        _context = "context" in config ? config.context : void 0;
      }
      var _a2;
      this.config = config;
      this._context = _context;
      this.order = -1;
      this.__xstatenode = true;
      this.__cache = {
        events: void 0,
        relativeValue: /* @__PURE__ */ new Map(),
        initialStateValue: void 0,
        initialState: void 0,
        on: void 0,
        transitions: void 0,
        candidates: {},
        delayedTransitions: void 0
      };
      this.idMap = {};
      this.tags = [];
      this.options = Object.assign(createDefaultOptions(), options);
      this.parent = _stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.parent;
      this.key = this.config.key || (_stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.key) || this.config.id || "(machine)";
      this.machine = this.parent ? this.parent.machine : this;
      this.path = this.parent ? this.parent.path.concat(this.key) : [];
      this.delimiter = this.config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER);
      this.id = this.config.id || __spreadArray([this.machine.key], __read(this.path), false).join(this.delimiter);
      this.version = this.parent ? this.parent.version : this.config.version;
      this.type = this.config.type || (this.config.parallel ? "parallel" : this.config.states && Object.keys(this.config.states).length ? "compound" : this.config.history ? "history" : "atomic");
      this.schema = this.parent ? this.machine.schema : (_a2 = this.config.schema) !== null && _a2 !== void 0 ? _a2 : {};
      this.description = this.config.description;
      if (!IS_PRODUCTION) {
        warn(!("parallel" in this.config), 'The "parallel" property is deprecated and will be removed in version 4.1. '.concat(this.config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '".concat(this.type, "'`"), " in the config for state node '").concat(this.id, "' instead."));
      }
      this.initial = this.config.initial;
      this.states = this.config.states ? mapValues(this.config.states, function(stateConfig, key) {
        var _a3;
        var stateNode = new StateNode2(stateConfig, {}, void 0, {
          parent: _this,
          key
        });
        Object.assign(_this.idMap, __assign2((_a3 = {}, _a3[stateNode.id] = stateNode, _a3), stateNode.idMap));
        return stateNode;
      }) : EMPTY_OBJECT;
      var order = 0;
      function dfs(stateNode) {
        var e_1, _a3;
        stateNode.order = order++;
        try {
          for (var _b = __values2(getChildren(stateNode)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            dfs(child);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
      }
      dfs(this);
      this.history = this.config.history === true ? "shallow" : this.config.history || false;
      this._transient = !!this.config.always || (!this.config.on ? false : Array.isArray(this.config.on) ? this.config.on.some(function(_a3) {
        var event2 = _a3.event;
        return event2 === NULL_EVENT;
      }) : NULL_EVENT in this.config.on);
      this.strict = !!this.config.strict;
      this.onEntry = toArray(this.config.entry || this.config.onEntry).map(function(action) {
        return toActionObject(action);
      });
      this.onExit = toArray(this.config.exit || this.config.onExit).map(function(action) {
        return toActionObject(action);
      });
      this.meta = this.config.meta;
      this.doneData = this.type === "final" ? this.config.data : void 0;
      this.invoke = toArray(this.config.invoke).map(function(invokeConfig, i5) {
        var _a3, _b;
        if (isMachine(invokeConfig)) {
          var invokeId = createInvokeId(_this.id, i5);
          _this.machine.options.services = __assign2((_a3 = {}, _a3[invokeId] = invokeConfig, _a3), _this.machine.options.services);
          return toInvokeDefinition({
            src: invokeId,
            id: invokeId
          });
        } else if (isString(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i5);
          return toInvokeDefinition(__assign2(__assign2({}, invokeConfig), {
            id: invokeId,
            src: invokeConfig.src
          }));
        } else if (isMachine(invokeConfig.src) || isFunction(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i5);
          _this.machine.options.services = __assign2((_b = {}, _b[invokeId] = invokeConfig.src, _b), _this.machine.options.services);
          return toInvokeDefinition(__assign2(__assign2({
            id: invokeId
          }, invokeConfig), {
            src: invokeId
          }));
        } else {
          var invokeSource = invokeConfig.src;
          return toInvokeDefinition(__assign2(__assign2({
            id: createInvokeId(_this.id, i5)
          }, invokeConfig), {
            src: invokeSource
          }));
        }
      });
      this.activities = toArray(this.config.activities).concat(this.invoke).map(function(activity) {
        return toActivityDefinition(activity);
      });
      this.transition = this.transition.bind(this);
      this.tags = toArray(this.config.tags);
    }
    StateNode2.prototype._init = function() {
      if (this.__cache.transitions) {
        return;
      }
      getAllStateNodes(this).forEach(function(stateNode) {
        return stateNode.on;
      });
    };
    StateNode2.prototype.withConfig = function(options, context) {
      var _a2 = this.options, actions = _a2.actions, activities = _a2.activities, guards = _a2.guards, services = _a2.services, delays = _a2.delays;
      return new StateNode2(this.config, {
        actions: __assign2(__assign2({}, actions), options.actions),
        activities: __assign2(__assign2({}, activities), options.activities),
        guards: __assign2(__assign2({}, guards), options.guards),
        services: __assign2(__assign2({}, services), options.services),
        delays: __assign2(__assign2({}, delays), options.delays)
      }, context !== null && context !== void 0 ? context : this.context);
    };
    StateNode2.prototype.withContext = function(context) {
      return new StateNode2(this.config, this.options, context);
    };
    Object.defineProperty(StateNode2.prototype, "context", {
      get: function() {
        return isFunction(this._context) ? this._context() : this._context;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "definition", {
      get: function() {
        return {
          id: this.id,
          key: this.key,
          version: this.version,
          context: this.context,
          type: this.type,
          initial: this.initial,
          history: this.history,
          states: mapValues(this.states, function(state) {
            return state.definition;
          }),
          on: this.on,
          transitions: this.transitions,
          entry: this.onEntry,
          exit: this.onExit,
          activities: this.activities || [],
          meta: this.meta,
          order: this.order || -1,
          data: this.doneData,
          invoke: this.invoke,
          description: this.description,
          tags: this.tags
        };
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.toJSON = function() {
      return this.definition;
    };
    Object.defineProperty(StateNode2.prototype, "on", {
      get: function() {
        if (this.__cache.on) {
          return this.__cache.on;
        }
        var transitions = this.transitions;
        return this.__cache.on = transitions.reduce(function(map, transition) {
          map[transition.eventType] = map[transition.eventType] || [];
          map[transition.eventType].push(transition);
          return map;
        }, {});
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "after", {
      get: function() {
        return this.__cache.delayedTransitions || (this.__cache.delayedTransitions = this.getDelayedTransitions(), this.__cache.delayedTransitions);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "transitions", {
      get: function() {
        return this.__cache.transitions || (this.__cache.transitions = this.formatTransitions(), this.__cache.transitions);
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getCandidates = function(eventName) {
      if (this.__cache.candidates[eventName]) {
        return this.__cache.candidates[eventName];
      }
      var transient = eventName === NULL_EVENT;
      var candidates = this.transitions.filter(function(transition) {
        var sameEventType = transition.eventType === eventName;
        return transient ? sameEventType : sameEventType || transition.eventType === WILDCARD;
      });
      this.__cache.candidates[eventName] = candidates;
      return candidates;
    };
    StateNode2.prototype.getDelayedTransitions = function() {
      var _this = this;
      var afterConfig = this.config.after;
      if (!afterConfig) {
        return [];
      }
      var mutateEntryExit = function(delay, i5) {
        var delayRef = isFunction(delay) ? "".concat(_this.id, ":delay[").concat(i5, "]") : delay;
        var eventType = after2(delayRef, _this.id);
        _this.onEntry.push(send2(eventType, {
          delay
        }));
        _this.onExit.push(cancel2(eventType));
        return eventType;
      };
      var delayedTransitions = isArray(afterConfig) ? afterConfig.map(function(transition, i5) {
        var eventType = mutateEntryExit(transition.delay, i5);
        return __assign2(__assign2({}, transition), {
          event: eventType
        });
      }) : flatten(Object.keys(afterConfig).map(function(delay, i5) {
        var configTransition = afterConfig[delay];
        var resolvedTransition = isString(configTransition) ? {
          target: configTransition
        } : configTransition;
        var resolvedDelay = !isNaN(+delay) ? +delay : delay;
        var eventType = mutateEntryExit(resolvedDelay, i5);
        return toArray(resolvedTransition).map(function(transition) {
          return __assign2(__assign2({}, transition), {
            event: eventType,
            delay: resolvedDelay
          });
        });
      }));
      return delayedTransitions.map(function(delayedTransition) {
        var delay = delayedTransition.delay;
        return __assign2(__assign2({}, _this.formatTransition(delayedTransition)), {
          delay
        });
      });
    };
    StateNode2.prototype.getStateNodes = function(state) {
      var _a2;
      var _this = this;
      if (!state) {
        return [];
      }
      var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);
      if (isString(stateValue)) {
        var initialStateValue = this.getStateNode(stateValue).initial;
        return initialStateValue !== void 0 ? this.getStateNodes((_a2 = {}, _a2[stateValue] = initialStateValue, _a2)) : [this, this.states[stateValue]];
      }
      var subStateKeys = Object.keys(stateValue);
      var subStateNodes = [this];
      subStateNodes.push.apply(subStateNodes, __spreadArray([], __read(flatten(subStateKeys.map(function(subStateKey) {
        return _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);
      }))), false));
      return subStateNodes;
    };
    StateNode2.prototype.handles = function(event2) {
      var eventType = getEventType(event2);
      return this.events.includes(eventType);
    };
    StateNode2.prototype.resolveState = function(state) {
      var stateFromConfig = state instanceof State ? state : State.create(state);
      var configuration = Array.from(getConfiguration([], this.getStateNodes(stateFromConfig.value)));
      return new State(__assign2(__assign2({}, stateFromConfig), {
        value: this.resolve(stateFromConfig.value),
        configuration,
        done: isInFinalState(configuration, this),
        tags: getTagsFromConfiguration(configuration),
        machine: this.machine
      }));
    };
    StateNode2.prototype.transitionLeafNode = function(stateValue, state, _event) {
      var stateNode = this.getStateNode(stateValue);
      var next = stateNode.next(state, _event);
      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }
      return next;
    };
    StateNode2.prototype.transitionCompoundNode = function(stateValue, state, _event) {
      var subStateKeys = Object.keys(stateValue);
      var stateNode = this.getStateNode(subStateKeys[0]);
      var next = stateNode._transition(stateValue[subStateKeys[0]], state, _event);
      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }
      return next;
    };
    StateNode2.prototype.transitionParallelNode = function(stateValue, state, _event) {
      var e_2, _a2;
      var transitionMap = {};
      try {
        for (var _b = __values2(Object.keys(stateValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var subStateKey = _c.value;
          var subStateValue = stateValue[subStateKey];
          if (!subStateValue) {
            continue;
          }
          var subStateNode = this.getStateNode(subStateKey);
          var next = subStateNode._transition(subStateValue, state, _event);
          if (next) {
            transitionMap[subStateKey] = next;
          }
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      var stateTransitions = Object.keys(transitionMap).map(function(key) {
        return transitionMap[key];
      });
      var enabledTransitions = flatten(stateTransitions.map(function(st) {
        return st.transitions;
      }));
      var willTransition = stateTransitions.some(function(st) {
        return st.transitions.length > 0;
      });
      if (!willTransition) {
        return this.next(state, _event);
      }
      var entryNodes = flatten(stateTransitions.map(function(t3) {
        return t3.entrySet;
      }));
      var configuration = flatten(Object.keys(transitionMap).map(function(key) {
        return transitionMap[key].configuration;
      }));
      return {
        transitions: enabledTransitions,
        entrySet: entryNodes,
        exitSet: flatten(stateTransitions.map(function(t3) {
          return t3.exitSet;
        })),
        configuration,
        source: state,
        actions: flatten(Object.keys(transitionMap).map(function(key) {
          return transitionMap[key].actions;
        }))
      };
    };
    StateNode2.prototype._transition = function(stateValue, state, _event) {
      if (isString(stateValue)) {
        return this.transitionLeafNode(stateValue, state, _event);
      }
      if (Object.keys(stateValue).length === 1) {
        return this.transitionCompoundNode(stateValue, state, _event);
      }
      return this.transitionParallelNode(stateValue, state, _event);
    };
    StateNode2.prototype.getTransitionData = function(state, event2) {
      return this._transition(state.value, state, toSCXMLEvent(event2));
    };
    StateNode2.prototype.next = function(state, _event) {
      var e_3, _a2;
      var _this = this;
      var eventName = _event.name;
      var actions = [];
      var nextStateNodes = [];
      var selectedTransition;
      try {
        for (var _b = __values2(this.getCandidates(eventName)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var candidate = _c.value;
          var cond = candidate.cond, stateIn = candidate.in;
          var resolvedContext = state.context;
          var isInState = stateIn ? isString(stateIn) && isStateId(stateIn) ? state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
          var guardPassed = false;
          try {
            guardPassed = !cond || evaluateGuard(this.machine, cond, resolvedContext, _event, state);
          } catch (err) {
            throw new Error("Unable to evaluate guard '".concat(cond.name || cond.type, "' in transition for event '").concat(eventName, "' in state node '").concat(this.id, "':\n").concat(err.message));
          }
          if (guardPassed && isInState) {
            if (candidate.target !== void 0) {
              nextStateNodes = candidate.target;
            }
            actions.push.apply(actions, __spreadArray([], __read(candidate.actions), false));
            selectedTransition = candidate;
            break;
          }
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      if (!selectedTransition) {
        return void 0;
      }
      if (!nextStateNodes.length) {
        return {
          transitions: [selectedTransition],
          entrySet: [],
          exitSet: [],
          configuration: state.value ? [this] : [],
          source: state,
          actions
        };
      }
      var allNextStateNodes = flatten(nextStateNodes.map(function(stateNode) {
        return _this.getRelativeStateNodes(stateNode, state.historyValue);
      }));
      var isInternal = !!selectedTransition.internal;
      var reentryNodes = isInternal ? [] : flatten(allNextStateNodes.map(function(n6) {
        return _this.nodesFromChild(n6);
      }));
      return {
        transitions: [selectedTransition],
        entrySet: reentryNodes,
        exitSet: isInternal ? [] : [this],
        configuration: allNextStateNodes,
        source: state,
        actions
      };
    };
    StateNode2.prototype.nodesFromChild = function(childStateNode) {
      if (childStateNode.escapes(this)) {
        return [];
      }
      var nodes = [];
      var marker = childStateNode;
      while (marker && marker !== this) {
        nodes.push(marker);
        marker = marker.parent;
      }
      nodes.push(this);
      return nodes;
    };
    StateNode2.prototype.escapes = function(stateNode) {
      if (this === stateNode) {
        return false;
      }
      var parent = this.parent;
      while (parent) {
        if (parent === stateNode) {
          return false;
        }
        parent = parent.parent;
      }
      return true;
    };
    StateNode2.prototype.getActions = function(transition, currentContext, _event, prevState) {
      var e_4, _a2, e_5, _b;
      var prevConfig = getConfiguration([], prevState ? this.getStateNodes(prevState.value) : [this]);
      var resolvedConfig = transition.configuration.length ? getConfiguration(prevConfig, transition.configuration) : prevConfig;
      try {
        for (var resolvedConfig_1 = __values2(resolvedConfig), resolvedConfig_1_1 = resolvedConfig_1.next(); !resolvedConfig_1_1.done; resolvedConfig_1_1 = resolvedConfig_1.next()) {
          var sn = resolvedConfig_1_1.value;
          if (!has(prevConfig, sn)) {
            transition.entrySet.push(sn);
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (resolvedConfig_1_1 && !resolvedConfig_1_1.done && (_a2 = resolvedConfig_1.return))
            _a2.call(resolvedConfig_1);
        } finally {
          if (e_4)
            throw e_4.error;
        }
      }
      try {
        for (var prevConfig_1 = __values2(prevConfig), prevConfig_1_1 = prevConfig_1.next(); !prevConfig_1_1.done; prevConfig_1_1 = prevConfig_1.next()) {
          var sn = prevConfig_1_1.value;
          if (!has(resolvedConfig, sn) || has(transition.exitSet, sn.parent)) {
            transition.exitSet.push(sn);
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (prevConfig_1_1 && !prevConfig_1_1.done && (_b = prevConfig_1.return))
            _b.call(prevConfig_1);
        } finally {
          if (e_5)
            throw e_5.error;
        }
      }
      var doneEvents = flatten(transition.entrySet.map(function(sn2) {
        var events = [];
        if (sn2.type !== "final") {
          return events;
        }
        var parent = sn2.parent;
        if (!parent.parent) {
          return events;
        }
        events.push(done(sn2.id, sn2.doneData), done(parent.id, sn2.doneData ? mapContext(sn2.doneData, currentContext, _event) : void 0));
        var grandparent = parent.parent;
        if (grandparent.type === "parallel") {
          if (getChildren(grandparent).every(function(parentNode) {
            return isInFinalState(transition.configuration, parentNode);
          })) {
            events.push(done(grandparent.id));
          }
        }
        return events;
      }));
      transition.exitSet.sort(function(a3, b2) {
        return b2.order - a3.order;
      });
      transition.entrySet.sort(function(a3, b2) {
        return a3.order - b2.order;
      });
      var entryStates = new Set(transition.entrySet);
      var exitStates = new Set(transition.exitSet);
      var _c = __read([flatten(Array.from(entryStates).map(function(stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.activities.map(function(activity) {
          return start2(activity);
        })), false), __read(stateNode.onEntry), false);
      })).concat(doneEvents.map(raise2)), flatten(Array.from(exitStates).map(function(stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.onExit), false), __read(stateNode.activities.map(function(activity) {
          return stop2(activity);
        })), false);
      }))], 2), entryActions = _c[0], exitActions = _c[1];
      var actions = toActionObjects(exitActions.concat(transition.actions).concat(entryActions), this.machine.options.actions);
      return actions;
    };
    StateNode2.prototype.transition = function(state, event2, context) {
      if (state === void 0) {
        state = this.initialState;
      }
      var _event = toSCXMLEvent(event2);
      var currentState;
      if (state instanceof State) {
        currentState = context === void 0 ? state : this.resolveState(State.from(state, context));
      } else {
        var resolvedStateValue = isString(state) ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : this.resolve(state);
        var resolvedContext = context !== null && context !== void 0 ? context : this.machine.context;
        currentState = this.resolveState(State.from(resolvedStateValue, resolvedContext));
      }
      if (!IS_PRODUCTION && _event.name === WILDCARD) {
        throw new Error("An event cannot have the wildcard type ('".concat(WILDCARD, "')"));
      }
      if (this.strict) {
        if (!this.events.includes(_event.name) && !isBuiltInEvent(_event.name)) {
          throw new Error("Machine '".concat(this.id, "' does not accept event '").concat(_event.name, "'"));
        }
      }
      var stateTransition = this._transition(currentState.value, currentState, _event) || {
        transitions: [],
        configuration: [],
        entrySet: [],
        exitSet: [],
        source: currentState,
        actions: []
      };
      var prevConfig = getConfiguration([], this.getStateNodes(currentState.value));
      var resolvedConfig = stateTransition.configuration.length ? getConfiguration(prevConfig, stateTransition.configuration) : prevConfig;
      stateTransition.configuration = __spreadArray([], __read(resolvedConfig), false);
      return this.resolveTransition(stateTransition, currentState, currentState.context, _event);
    };
    StateNode2.prototype.resolveRaisedTransition = function(state, _event, originalEvent) {
      var _a2;
      var currentActions = state.actions;
      state = this.transition(state, _event);
      state._event = originalEvent;
      state.event = originalEvent.data;
      (_a2 = state.actions).unshift.apply(_a2, __spreadArray([], __read(currentActions), false));
      return state;
    };
    StateNode2.prototype.resolveTransition = function(stateTransition, currentState, context, _event) {
      var e_6, _a2;
      var _this = this;
      if (_event === void 0) {
        _event = initEvent;
      }
      var configuration = stateTransition.configuration;
      var willTransition = !currentState || stateTransition.transitions.length > 0;
      var resolvedStateValue = willTransition ? getValue(this.machine, configuration) : void 0;
      var historyValue = currentState ? currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : void 0 : void 0;
      var actions = this.getActions(stateTransition, context, _event, currentState);
      var activities = currentState ? __assign2({}, currentState.activities) : {};
      try {
        for (var actions_1 = __values2(actions), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
          var action = actions_1_1.value;
          if (action.type === start) {
            activities[action.activity.id || action.activity.type] = action;
          } else if (action.type === stop) {
            activities[action.activity.id || action.activity.type] = false;
          }
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (actions_1_1 && !actions_1_1.done && (_a2 = actions_1.return))
            _a2.call(actions_1);
        } finally {
          if (e_6)
            throw e_6.error;
        }
      }
      var _b = __read(resolveActions(this, currentState, context, _event, actions, this.machine.config.preserveActionOrder), 2), resolvedActions = _b[0], updatedContext = _b[1];
      var _c = __read(partition(resolvedActions, function(action2) {
        return action2.type === raise || action2.type === send && action2.to === SpecialTargets.Internal;
      }), 2), raisedEvents = _c[0], nonRaisedActions = _c[1];
      var invokeActions = resolvedActions.filter(function(action2) {
        var _a3;
        return action2.type === start && ((_a3 = action2.activity) === null || _a3 === void 0 ? void 0 : _a3.type) === invoke;
      });
      var children2 = invokeActions.reduce(function(acc, action2) {
        acc[action2.activity.id] = createInvocableActor(action2.activity, _this.machine, updatedContext, _event);
        return acc;
      }, currentState ? __assign2({}, currentState.children) : {});
      var resolvedConfiguration = willTransition ? stateTransition.configuration : currentState ? currentState.configuration : [];
      var isDone = isInFinalState(resolvedConfiguration, this);
      var nextState = new State({
        value: resolvedStateValue || currentState.value,
        context: updatedContext,
        _event,
        _sessionid: currentState ? currentState._sessionid : null,
        historyValue: resolvedStateValue ? historyValue ? updateHistoryValue(historyValue, resolvedStateValue) : void 0 : currentState ? currentState.historyValue : void 0,
        history: !resolvedStateValue || stateTransition.source ? currentState : void 0,
        actions: resolvedStateValue ? nonRaisedActions : [],
        activities: resolvedStateValue ? activities : currentState ? currentState.activities : {},
        events: [],
        configuration: resolvedConfiguration,
        transitions: stateTransition.transitions,
        children: children2,
        done: isDone,
        tags: getTagsFromConfiguration(resolvedConfiguration),
        machine: this
      });
      var didUpdateContext = context !== updatedContext;
      nextState.changed = _event.name === update || didUpdateContext;
      var history = nextState.history;
      if (history) {
        delete history.history;
      }
      var isTransient = !isDone && (this._transient || configuration.some(function(stateNode) {
        return stateNode._transient;
      }));
      if (!willTransition && (!isTransient || _event.name === NULL_EVENT)) {
        return nextState;
      }
      var maybeNextState = nextState;
      if (!isDone) {
        if (isTransient) {
          maybeNextState = this.resolveRaisedTransition(maybeNextState, {
            type: nullEvent
          }, _event);
        }
        while (raisedEvents.length) {
          var raisedEvent = raisedEvents.shift();
          maybeNextState = this.resolveRaisedTransition(maybeNextState, raisedEvent._event, _event);
        }
      }
      var changed = maybeNextState.changed || (history ? !!maybeNextState.actions.length || didUpdateContext || typeof history.value !== typeof maybeNextState.value || !stateValuesEqual(maybeNextState.value, history.value) : void 0);
      maybeNextState.changed = changed;
      maybeNextState.history = history;
      return maybeNextState;
    };
    StateNode2.prototype.getStateNode = function(stateKey) {
      if (isStateId(stateKey)) {
        return this.machine.getStateNodeById(stateKey);
      }
      if (!this.states) {
        throw new Error("Unable to retrieve child state '".concat(stateKey, "' from '").concat(this.id, "'; no child states exist."));
      }
      var result = this.states[stateKey];
      if (!result) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }
      return result;
    };
    StateNode2.prototype.getStateNodeById = function(stateId) {
      var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;
      if (resolvedStateId === this.id) {
        return this;
      }
      var stateNode = this.machine.idMap[resolvedStateId];
      if (!stateNode) {
        throw new Error("Child state node '#".concat(resolvedStateId, "' does not exist on machine '").concat(this.id, "'"));
      }
      return stateNode;
    };
    StateNode2.prototype.getStateNodeByPath = function(statePath) {
      if (typeof statePath === "string" && isStateId(statePath)) {
        try {
          return this.getStateNodeById(statePath.slice(1));
        } catch (e5) {
        }
      }
      var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
      var currentStateNode = this;
      while (arrayStatePath.length) {
        var key = arrayStatePath.shift();
        if (!key.length) {
          break;
        }
        currentStateNode = currentStateNode.getStateNode(key);
      }
      return currentStateNode;
    };
    StateNode2.prototype.resolve = function(stateValue) {
      var _a2;
      var _this = this;
      if (!stateValue) {
        return this.initialStateValue || EMPTY_OBJECT;
      }
      switch (this.type) {
        case "parallel":
          return mapValues(this.initialStateValue, function(subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
          });
        case "compound":
          if (isString(stateValue)) {
            var subStateNode = this.getStateNode(stateValue);
            if (subStateNode.type === "parallel" || subStateNode.type === "compound") {
              return _a2 = {}, _a2[stateValue] = subStateNode.initialStateValue, _a2;
            }
            return stateValue;
          }
          if (!Object.keys(stateValue).length) {
            return this.initialStateValue || {};
          }
          return mapValues(stateValue, function(subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
          });
        default:
          return stateValue || EMPTY_OBJECT;
      }
    };
    StateNode2.prototype.getResolvedPath = function(stateIdentifier) {
      if (isStateId(stateIdentifier)) {
        var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];
        if (!stateNode) {
          throw new Error("Unable to find state node '".concat(stateIdentifier, "'"));
        }
        return stateNode.path;
      }
      return toStatePath(stateIdentifier, this.delimiter);
    };
    Object.defineProperty(StateNode2.prototype, "initialStateValue", {
      get: function() {
        var _a2;
        if (this.__cache.initialStateValue) {
          return this.__cache.initialStateValue;
        }
        var initialStateValue;
        if (this.type === "parallel") {
          initialStateValue = mapFilterValues(this.states, function(state) {
            return state.initialStateValue || EMPTY_OBJECT;
          }, function(stateNode) {
            return !(stateNode.type === "history");
          });
        } else if (this.initial !== void 0) {
          if (!this.states[this.initial]) {
            throw new Error("Initial state '".concat(this.initial, "' not found on '").concat(this.key, "'"));
          }
          initialStateValue = isLeafNode(this.states[this.initial]) ? this.initial : (_a2 = {}, _a2[this.initial] = this.states[this.initial].initialStateValue, _a2);
        } else {
          initialStateValue = {};
        }
        this.__cache.initialStateValue = initialStateValue;
        return this.__cache.initialStateValue;
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getInitialState = function(stateValue, context) {
      this._init();
      var configuration = this.getStateNodes(stateValue);
      return this.resolveTransition({
        configuration,
        entrySet: configuration,
        exitSet: [],
        transitions: [],
        source: void 0,
        actions: []
      }, void 0, context !== null && context !== void 0 ? context : this.machine.context, void 0);
    };
    Object.defineProperty(StateNode2.prototype, "initialState", {
      get: function() {
        var initialStateValue = this.initialStateValue;
        if (!initialStateValue) {
          throw new Error("Cannot retrieve initial state from simple state '".concat(this.id, "'."));
        }
        return this.getInitialState(initialStateValue);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "target", {
      get: function() {
        var target;
        if (this.type === "history") {
          var historyConfig = this.config;
          if (isString(historyConfig.target)) {
            target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
          } else {
            target = historyConfig.target;
          }
        }
        return target;
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getRelativeStateNodes = function(relativeStateId, historyValue, resolve) {
      if (resolve === void 0) {
        resolve = true;
      }
      return resolve ? relativeStateId.type === "history" ? relativeStateId.resolveHistory(historyValue) : relativeStateId.initialStateNodes : [relativeStateId];
    };
    Object.defineProperty(StateNode2.prototype, "initialStateNodes", {
      get: function() {
        var _this = this;
        if (isLeafNode(this)) {
          return [this];
        }
        if (this.type === "compound" && !this.initial) {
          if (!IS_PRODUCTION) {
            warn(false, "Compound state node '".concat(this.id, "' has no initial state."));
          }
          return [this];
        }
        var initialStateNodePaths = toStatePaths(this.initialStateValue);
        return flatten(initialStateNodePaths.map(function(initialPath) {
          return _this.getFromRelativePath(initialPath);
        }));
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getFromRelativePath = function(relativePath) {
      if (!relativePath.length) {
        return [this];
      }
      var _a2 = __read(relativePath), stateKey = _a2[0], childStatePath = _a2.slice(1);
      if (!this.states) {
        throw new Error("Cannot retrieve subPath '".concat(stateKey, "' from node with no states"));
      }
      var childStateNode = this.getStateNode(stateKey);
      if (childStateNode.type === "history") {
        return childStateNode.resolveHistory();
      }
      if (!this.states[stateKey]) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }
      return this.states[stateKey].getFromRelativePath(childStatePath);
    };
    StateNode2.prototype.historyValue = function(relativeStateValue) {
      if (!Object.keys(this.states).length) {
        return void 0;
      }
      return {
        current: relativeStateValue || this.initialStateValue,
        states: mapFilterValues(this.states, function(stateNode, key) {
          if (!relativeStateValue) {
            return stateNode.historyValue();
          }
          var subStateValue = isString(relativeStateValue) ? void 0 : relativeStateValue[key];
          return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
        }, function(stateNode) {
          return !stateNode.history;
        })
      };
    };
    StateNode2.prototype.resolveHistory = function(historyValue) {
      var _this = this;
      if (this.type !== "history") {
        return [this];
      }
      var parent = this.parent;
      if (!historyValue) {
        var historyTarget = this.target;
        return historyTarget ? flatten(toStatePaths(historyTarget).map(function(relativeChildPath) {
          return parent.getFromRelativePath(relativeChildPath);
        })) : parent.initialStateNodes;
      }
      var subHistoryValue = nestedPath(parent.path, "states")(historyValue).current;
      if (isString(subHistoryValue)) {
        return [parent.getStateNode(subHistoryValue)];
      }
      return flatten(toStatePaths(subHistoryValue).map(function(subStatePath) {
        return _this.history === "deep" ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
      }));
    };
    Object.defineProperty(StateNode2.prototype, "stateIds", {
      get: function() {
        var _this = this;
        var childStateIds = flatten(Object.keys(this.states).map(function(stateKey) {
          return _this.states[stateKey].stateIds;
        }));
        return [this.id].concat(childStateIds);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "events", {
      get: function() {
        var e_7, _a2, e_8, _b;
        if (this.__cache.events) {
          return this.__cache.events;
        }
        var states = this.states;
        var events = new Set(this.ownEvents);
        if (states) {
          try {
            for (var _c = __values2(Object.keys(states)), _d = _c.next(); !_d.done; _d = _c.next()) {
              var stateId = _d.value;
              var state = states[stateId];
              if (state.states) {
                try {
                  for (var _e = (e_8 = void 0, __values2(state.events)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var event_1 = _f.value;
                    events.add("".concat(event_1));
                  }
                } catch (e_8_1) {
                  e_8 = {
                    error: e_8_1
                  };
                } finally {
                  try {
                    if (_f && !_f.done && (_b = _e.return))
                      _b.call(_e);
                  } finally {
                    if (e_8)
                      throw e_8.error;
                  }
                }
              }
            }
          } catch (e_7_1) {
            e_7 = {
              error: e_7_1
            };
          } finally {
            try {
              if (_d && !_d.done && (_a2 = _c.return))
                _a2.call(_c);
            } finally {
              if (e_7)
                throw e_7.error;
            }
          }
        }
        return this.__cache.events = Array.from(events);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "ownEvents", {
      get: function() {
        var events = new Set(this.transitions.filter(function(transition) {
          return !(!transition.target && !transition.actions.length && transition.internal);
        }).map(function(transition) {
          return transition.eventType;
        }));
        return Array.from(events);
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.resolveTarget = function(_target) {
      var _this = this;
      if (_target === void 0) {
        return void 0;
      }
      return _target.map(function(target) {
        if (!isString(target)) {
          return target;
        }
        var isInternalTarget = target[0] === _this.delimiter;
        if (isInternalTarget && !_this.parent) {
          return _this.getStateNodeByPath(target.slice(1));
        }
        var resolvedTarget = isInternalTarget ? _this.key + target : target;
        if (_this.parent) {
          try {
            var targetStateNode = _this.parent.getStateNodeByPath(resolvedTarget);
            return targetStateNode;
          } catch (err) {
            throw new Error("Invalid transition definition for state node '".concat(_this.id, "':\n").concat(err.message));
          }
        } else {
          return _this.getStateNodeByPath(resolvedTarget);
        }
      });
    };
    StateNode2.prototype.formatTransition = function(transitionConfig) {
      var _this = this;
      var normalizedTarget = normalizeTarget(transitionConfig.target);
      var internal = "internal" in transitionConfig ? transitionConfig.internal : normalizedTarget ? normalizedTarget.some(function(_target) {
        return isString(_target) && _target[0] === _this.delimiter;
      }) : true;
      var guards = this.machine.options.guards;
      var target = this.resolveTarget(normalizedTarget);
      var transition = __assign2(__assign2({}, transitionConfig), {
        actions: toActionObjects(toArray(transitionConfig.actions)),
        cond: toGuard(transitionConfig.cond, guards),
        target,
        source: this,
        internal,
        eventType: transitionConfig.event,
        toJSON: function() {
          return __assign2(__assign2({}, transition), {
            target: transition.target ? transition.target.map(function(t3) {
              return "#".concat(t3.id);
            }) : void 0,
            source: "#".concat(_this.id)
          });
        }
      });
      return transition;
    };
    StateNode2.prototype.formatTransitions = function() {
      var e_9, _a2;
      var _this = this;
      var onConfig;
      if (!this.config.on) {
        onConfig = [];
      } else if (Array.isArray(this.config.on)) {
        onConfig = this.config.on;
      } else {
        var _b = this.config.on, _c = WILDCARD, _d = _b[_c], wildcardConfigs = _d === void 0 ? [] : _d, strictTransitionConfigs_1 = __rest2(_b, [typeof _c === "symbol" ? _c : _c + ""]);
        onConfig = flatten(Object.keys(strictTransitionConfigs_1).map(function(key) {
          if (!IS_PRODUCTION && key === NULL_EVENT) {
            warn(false, "Empty string transition configs (e.g., `{ on: { '': ... }}`) for transient transitions are deprecated. Specify the transition in the `{ always: ... }` property instead. " + 'Please check the `on` configuration for "#'.concat(_this.id, '".'));
          }
          var transitionConfigArray = toTransitionConfigArray(key, strictTransitionConfigs_1[key]);
          if (!IS_PRODUCTION) {
            validateArrayifiedTransitions(_this, key, transitionConfigArray);
          }
          return transitionConfigArray;
        }).concat(toTransitionConfigArray(WILDCARD, wildcardConfigs)));
      }
      var eventlessConfig = this.config.always ? toTransitionConfigArray("", this.config.always) : [];
      var doneConfig = this.config.onDone ? toTransitionConfigArray(String(done(this.id)), this.config.onDone) : [];
      if (!IS_PRODUCTION) {
        warn(!(this.config.onDone && !this.parent), 'Root nodes cannot have an ".onDone" transition. Please check the config of "'.concat(this.id, '".'));
      }
      var invokeConfig = flatten(this.invoke.map(function(invokeDef) {
        var settleTransitions = [];
        if (invokeDef.onDone) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(doneInvoke(invokeDef.id)), invokeDef.onDone)), false));
        }
        if (invokeDef.onError) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(error2(invokeDef.id)), invokeDef.onError)), false));
        }
        return settleTransitions;
      }));
      var delayedTransitions = this.after;
      var formattedTransitions = flatten(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(doneConfig), false), __read(invokeConfig), false), __read(onConfig), false), __read(eventlessConfig), false).map(function(transitionConfig) {
        return toArray(transitionConfig).map(function(transition) {
          return _this.formatTransition(transition);
        });
      }));
      try {
        for (var delayedTransitions_1 = __values2(delayedTransitions), delayedTransitions_1_1 = delayedTransitions_1.next(); !delayedTransitions_1_1.done; delayedTransitions_1_1 = delayedTransitions_1.next()) {
          var delayedTransition = delayedTransitions_1_1.value;
          formattedTransitions.push(delayedTransition);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (delayedTransitions_1_1 && !delayedTransitions_1_1.done && (_a2 = delayedTransitions_1.return))
            _a2.call(delayedTransitions_1);
        } finally {
          if (e_9)
            throw e_9.error;
        }
      }
      return formattedTransitions;
    };
    return StateNode2;
  }();

  // node_modules/xstate/es/Machine.js
  function createMachine(config, options) {
    return new StateNode(config, options);
  }

  // node_modules/xstate/es/index.js
  var assign3 = assign2;
  var send3 = send2;

  // node_modules/@xstate/inspect/es/utils.js
  var import_fast_safe_stringify = __toESM(require_fast_safe_stringify());
  function getLazy(value) {
    return typeof value === "function" ? value() : value;
  }
  function stringify(value, replacer) {
    try {
      return JSON.stringify(value, replacer);
    } catch (e5) {
      return (0, import_fast_safe_stringify.default)(value, replacer);
    }
  }

  // node_modules/@xstate/inspect/es/serialize.js
  function selectivelyStringify(value, keys, replacer) {
    var e_1, _a2;
    var selected = {};
    try {
      for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
        var key = keys_1_1.value;
        selected[key] = value[key];
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (keys_1_1 && !keys_1_1.done && (_a2 = keys_1.return))
          _a2.call(keys_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    var serialized = JSON.parse(stringify(selected, replacer));
    return stringify(__assign(__assign({}, value), serialized));
  }
  function stringifyState(state, replacer) {
    state.machine;
    state.configuration;
    state.history;
    var stateToStringify = __rest(state, ["machine", "configuration", "history"]);
    return selectivelyStringify(stateToStringify, ["context", "event", "_event"], replacer);
  }
  function stringifyMachine(machine, replacer) {
    return selectivelyStringify(machine.definition, ["context"], replacer);
  }

  // node_modules/@xstate/inspect/es/inspectMachine.js
  function createInspectMachine(devTools, options) {
    if (devTools === void 0) {
      devTools = globalThis.__xstate__;
    }
    var serviceMap2 = /* @__PURE__ */ new Map();
    var sub = devTools.onRegister(function(service) {
      serviceMap2.set(service.sessionId, service);
    });
    return createMachine({
      initial: "pendingConnection",
      context: {
        client: void 0
      },
      states: {
        pendingConnection: {},
        connected: {
          on: {
            "service.state": {
              actions: function(ctx, e5) {
                return ctx.client.send(e5);
              }
            },
            "service.event": {
              actions: function(ctx, e5) {
                return ctx.client.send(e5);
              }
            },
            "service.register": {
              actions: function(ctx, e5) {
                return ctx.client.send(e5);
              }
            },
            "service.stop": {
              actions: function(ctx, e5) {
                return ctx.client.send(e5);
              }
            },
            "xstate.event": {
              actions: function(_2, e5) {
                var event2 = e5.event;
                var scxmlEventObject = JSON.parse(event2);
                var service = serviceMap2.get(scxmlEventObject.origin);
                service === null || service === void 0 ? void 0 : service.send(scxmlEventObject);
              }
            },
            unload: {
              actions: function(ctx) {
                ctx.client.send({ type: "xstate.disconnect" });
              }
            },
            disconnect: "disconnected"
          }
        },
        disconnected: {
          entry: function() {
            sub.unsubscribe();
          },
          type: "final"
        }
      },
      on: {
        "xstate.inspecting": {
          target: ".connected",
          actions: [
            assign3({
              client: function(_2, e5) {
                return e5.client;
              }
            }),
            function(ctx) {
              devTools.services.forEach(function(service) {
                var _a2;
                (_a2 = ctx.client) === null || _a2 === void 0 ? void 0 : _a2.send({
                  type: "service.register",
                  machine: stringifyMachine(service.machine, options === null || options === void 0 ? void 0 : options.serialize),
                  state: stringifyState(service.state || service.initialState, options === null || options === void 0 ? void 0 : options.serialize),
                  sessionId: service.sessionId
                });
              });
            }
          ]
        }
      }
    });
  }

  // node_modules/@xstate/inspect/es/browser.js
  var serviceMap = /* @__PURE__ */ new Map();
  function createDevTools() {
    var services = /* @__PURE__ */ new Set();
    var serviceListeners = /* @__PURE__ */ new Set();
    return {
      services,
      register: function(service) {
        services.add(service);
        serviceMap.set(service.sessionId, service);
        serviceListeners.forEach(function(listener) {
          return listener(service);
        });
        service.onStop(function() {
          services.delete(service);
          serviceMap.delete(service.sessionId);
        });
      },
      unregister: function(service) {
        services.delete(service);
        serviceMap.delete(service.sessionId);
      },
      onRegister: function(listener) {
        serviceListeners.add(listener);
        services.forEach(function(service) {
          return listener(service);
        });
        return {
          unsubscribe: function() {
            serviceListeners.delete(listener);
          }
        };
      }
    };
  }
  var defaultInspectorOptions = {
    url: "https://stately.ai/viz?inspect",
    iframe: function() {
      return document.querySelector("iframe[data-xstate]");
    },
    devTools: function() {
      var devTools = createDevTools();
      globalThis.__xstate__ = devTools;
      return devTools;
    },
    serialize: void 0
  };
  var getFinalOptions = function(options) {
    var withDefaults = __assign(__assign({}, defaultInspectorOptions), options);
    return __assign(__assign({}, withDefaults), { url: new URL(withDefaults.url), iframe: getLazy(withDefaults.iframe), devTools: getLazy(withDefaults.devTools) });
  };
  var patchedInterpreters = /* @__PURE__ */ new Set();
  function inspect(options) {
    var _a2 = getFinalOptions(options), iframe = _a2.iframe, url = _a2.url, devTools = _a2.devTools;
    if (iframe === null) {
      console.warn("No suitable <iframe> found to embed the inspector. Please pass an <iframe> element to `inspect(iframe)` or create an <iframe data-xstate></iframe> element.");
      return void 0;
    }
    var inspectMachine = createInspectMachine(devTools, options);
    var inspectService = interpret(inspectMachine).start();
    var listeners = /* @__PURE__ */ new Set();
    var sub = inspectService.subscribe(function(state) {
      listeners.forEach(function(listener) {
        return listener.next(state);
      });
    });
    var targetWindow;
    var client;
    var messageHandler = function(event2) {
      if (typeof event2.data === "object" && event2.data !== null && "type" in event2.data) {
        if (iframe && !targetWindow) {
          targetWindow = iframe.contentWindow;
        }
        if (!client) {
          client = {
            send: function(e5) {
              targetWindow.postMessage(e5, url.origin);
            }
          };
        }
        var inspectEvent = __assign(__assign({}, event2.data), { client });
        inspectService.send(inspectEvent);
      }
    };
    window.addEventListener("message", messageHandler);
    window.addEventListener("unload", function() {
      inspectService.send({ type: "unload" });
    });
    var stringifyWithSerializer = function(value) {
      return stringify(value, options === null || options === void 0 ? void 0 : options.serialize);
    };
    devTools.onRegister(function(service) {
      var _a3;
      var state = service.state || service.initialState;
      inspectService.send({
        type: "service.register",
        machine: stringifyMachine(service.machine, options === null || options === void 0 ? void 0 : options.serialize),
        state: stringifyState(state, options === null || options === void 0 ? void 0 : options.serialize),
        sessionId: service.sessionId,
        id: service.id,
        parent: (_a3 = service.parent) === null || _a3 === void 0 ? void 0 : _a3.sessionId
      });
      inspectService.send({
        type: "service.event",
        event: stringifyWithSerializer(state._event),
        sessionId: service.sessionId
      });
      if (!patchedInterpreters.has(service)) {
        patchedInterpreters.add(service);
        var originalSend_1 = service.send.bind(service);
        service.send = function inspectSend(event2, payload) {
          inspectService.send({
            type: "service.event",
            event: stringifyWithSerializer(toSCXMLEvent(toEventObject(event2, payload))),
            sessionId: service.sessionId
          });
          return originalSend_1(event2, payload);
        };
      }
      service.subscribe(function(state2) {
        if (state2 === void 0) {
          return;
        }
        inspectService.send({
          type: "service.state",
          state: stringifyState(state2, options === null || options === void 0 ? void 0 : options.serialize),
          sessionId: service.sessionId
        });
      });
      service.onStop(function() {
        inspectService.send({
          type: "service.stop",
          sessionId: service.sessionId
        });
      });
    });
    if (iframe) {
      iframe.addEventListener("load", function() {
        targetWindow = iframe.contentWindow;
      });
      iframe.setAttribute("src", String(url));
    } else {
      targetWindow = window.open(String(url), "xstateinspector");
    }
    return {
      send: function(event2) {
        inspectService.send(event2);
      },
      subscribe: function(next, onError, onComplete) {
        var observer = toObserver(next, onError, onComplete);
        listeners.add(observer);
        observer.next(inspectService.state);
        return {
          unsubscribe: function() {
            listeners.delete(observer);
          }
        };
      },
      disconnect: function() {
        inspectService.send("disconnect");
        window.removeEventListener("message", messageHandler);
        sub.unsubscribe();
      }
    };
  }

  // node_modules/@lit/reactive-element/decorators/base.js
  var o5 = ({ finisher: e5, descriptor: t3 }) => (o6, n6) => {
    var r4;
    if (n6 === void 0) {
      const n7 = (r4 = o6.originalKey) !== null && r4 !== void 0 ? r4 : o6.key, i5 = t3 != null ? { kind: "method", placement: "prototype", key: n7, descriptor: t3(o6.key) } : { ...o6, key: n7 };
      return e5 != null && (i5.finisher = function(t4) {
        e5(t4, n7);
      }), i5;
    }
    {
      const r5 = o6.constructor;
      t3 !== void 0 && Object.defineProperty(o6, n6, t3(n6)), e5 == null || e5(r5, n6);
    }
  };

  // node_modules/@lit/reactive-element/decorators/query.js
  function i3(i5, n6) {
    return o5({ descriptor: (o6) => {
      const t3 = { get() {
        var o7, n7;
        return (n7 = (o7 = this.renderRoot) === null || o7 === void 0 ? void 0 : o7.querySelector(i5)) !== null && n7 !== void 0 ? n7 : null;
      }, enumerable: true, configurable: true };
      if (n6) {
        const n7 = typeof o6 == "symbol" ? Symbol() : "__" + o6;
        t3.get = function() {
          var o7, t4;
          return this[n7] === void 0 && (this[n7] = (t4 = (o7 = this.renderRoot) === null || o7 === void 0 ? void 0 : o7.querySelector(i5)) !== null && t4 !== void 0 ? t4 : null), this[n7];
        };
      }
      return t3;
    } });
  }

  // src/bs3-routes.ts
  var BS3Routes = class extends s4 {
    render() {
      return $`
        list of routes here...
    `;
    }
  };
  __decorateClass([
    i3("form", true)
  ], BS3Routes.prototype, "form", 2);
  BS3Routes = __decorateClass([
    n5("bs3-routes")
  ], BS3Routes);

  // node_modules/@lit/reactive-element/decorators/property.js
  var i4 = (i5, e5) => e5.kind === "method" && e5.descriptor && !("value" in e5.descriptor) ? { ...e5, finisher(n6) {
    n6.createProperty(e5.key, i5);
  } } : { kind: "field", key: Symbol(), placement: "own", descriptor: {}, originalKey: e5.key, initializer() {
    typeof e5.initializer == "function" && (this[e5.key] = e5.initializer.call(this));
  }, finisher(n6) {
    n6.createProperty(e5.key, i5);
  } };
  function e4(e5) {
    return (n6, t3) => t3 !== void 0 ? ((i5, e6, n7) => {
      e6.constructor.createProperty(n7, i5);
    })(e5, n6, t3) : i4(e5, n6);
  }

  // src/bs3-route.ts
  var BS3Route = class extends s4 {
    render() {
      return $`
    <div>
      <pre><code>${this.pathId}</code></pre>
    </div>
    `;
    }
  };
  __decorateClass([
    e4({ type: String })
  ], BS3Route.prototype, "pathId", 2);
  BS3Route = __decorateClass([
    n5("bs3-route")
  ], BS3Route);

  // src/bs3-route-fallback.ts
  var BS3RouteFallback = class extends s4 {
    handleEvent(_e) {
      _e.preventDefault();
      console.log(_e);
    }
    render() {
      return $`
        <p>That route does not exist, would you like to create it?</p>
        <pre><code>Submitting for: ${window.location.pathname}</code></pre>
        <div>
            <form @submit=${this} method="POST">
                <label for="body">
                    <textarea name="body" id="" cols="30" rows="10"></textarea>
                </label>
                <input type="hidden" value=${window.location.pathname} name="pathname">
                <button type="submit">Submit</button>
            </form>
        </div>
    `;
    }
  };
  __decorateClass([
    i3("form", true)
  ], BS3RouteFallback.prototype, "form", 2);
  BS3RouteFallback = __decorateClass([
    n5("bs3-route-fallback")
  ], BS3RouteFallback);

  // src/machines/app.ts
  var import_actions5 = __toESM(require_actions());

  // node_modules/zod/lib/index.mjs
  var util;
  (function(util2) {
    function assertNever(_x) {
      throw new Error();
    }
    util2.assertNever = assertNever;
    util2.arrayToEnum = (items) => {
      const obj = {};
      for (const item of items) {
        obj[item] = item;
      }
      return obj;
    };
    util2.getValidEnumValues = (obj) => {
      const validKeys = util2.objectKeys(obj).filter((k2) => typeof obj[obj[k2]] !== "number");
      const filtered = {};
      for (const k2 of validKeys) {
        filtered[k2] = obj[k2];
      }
      return util2.objectValues(filtered);
    };
    util2.objectValues = (obj) => {
      return util2.objectKeys(obj).map(function(e5) {
        return obj[e5];
      });
    };
    util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
      const keys = [];
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          keys.push(key);
        }
      }
      return keys;
    };
    util2.find = (arr, checker) => {
      for (const item of arr) {
        if (checker(item))
          return item;
      }
      return void 0;
    };
    util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
      return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
    }
    util2.joinValues = joinValues;
  })(util || (util = {}));
  var ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of"
  ]);
  var quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
  };
  var ZodError = class extends Error {
    constructor(issues) {
      super();
      this.issues = [];
      this.addIssue = (sub) => {
        this.issues = [...this.issues, sub];
      };
      this.addIssues = (subs = []) => {
        this.issues = [...this.issues, ...subs];
      };
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        this.__proto__ = actualProto;
      }
      this.name = "ZodError";
      this.issues = issues;
    }
    get errors() {
      return this.issues;
    }
    format(_mapper) {
      const mapper = _mapper || function(issue) {
        return issue.message;
      };
      const fieldErrors = { _errors: [] };
      const processError = (error3) => {
        for (const issue of error3.issues) {
          if (issue.code === "invalid_union") {
            issue.unionErrors.map(processError);
          } else if (issue.code === "invalid_return_type") {
            processError(issue.returnTypeError);
          } else if (issue.code === "invalid_arguments") {
            processError(issue.argumentsError);
          } else if (issue.path.length === 0) {
            fieldErrors._errors.push(mapper(issue));
          } else {
            let curr = fieldErrors;
            let i5 = 0;
            while (i5 < issue.path.length) {
              const el = issue.path[i5];
              const terminal = i5 === issue.path.length - 1;
              if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
              } else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(mapper(issue));
              }
              curr = curr[el];
              i5++;
            }
          }
        }
      };
      processError(this);
      return fieldErrors;
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, null, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
      const fieldErrors = {};
      const formErrors = [];
      for (const sub of this.issues) {
        if (sub.path.length > 0) {
          fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
          fieldErrors[sub.path[0]].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    get formErrors() {
      return this.flatten();
    }
  };
  ZodError.create = (issues) => {
    const error3 = new ZodError(issues);
    return error3;
  };
  var defaultErrorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === ZodParsedType.undefined) {
          message = "Required";
        } else {
          message = `Expected ${issue.expected}, received ${issue.received}`;
        }
        break;
      case ZodIssueCode.invalid_literal:
        message = `Invalid literal value, expected ${JSON.stringify(issue.expected)}`;
        break;
      case ZodIssueCode.unrecognized_keys:
        message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
        break;
      case ZodIssueCode.invalid_union:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_union_discriminator:
        message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
        break;
      case ZodIssueCode.invalid_enum_value:
        message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
        break;
      case ZodIssueCode.invalid_arguments:
        message = `Invalid function arguments`;
        break;
      case ZodIssueCode.invalid_return_type:
        message = `Invalid function return type`;
        break;
      case ZodIssueCode.invalid_date:
        message = `Invalid date`;
        break;
      case ZodIssueCode.invalid_string:
        if (issue.validation !== "regex")
          message = `Invalid ${issue.validation}`;
        else
          message = "Invalid";
        break;
      case ZodIssueCode.too_small:
        if (issue.type === "array")
          message = `Array must contain ${issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be greater than ${issue.inclusive ? `or equal to ` : ``}${issue.minimum}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.too_big:
        if (issue.type === "array")
          message = `Array must contain ${issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be less than ${issue.inclusive ? `or equal to ` : ``}${issue.maximum}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.custom:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_intersection_types:
        message = `Intersection results could not be merged`;
        break;
      case ZodIssueCode.not_multiple_of:
        message = `Number must be a multiple of ${issue.multipleOf}`;
        break;
      default:
        message = _ctx.defaultError;
        util.assertNever(issue);
    }
    return { message };
  };
  var overrideErrorMap = defaultErrorMap;
  var setErrorMap = (map) => {
    overrideErrorMap = map;
  };
  var ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set"
  ]);
  var getParsedType = (data) => {
    const t3 = typeof data;
    switch (t3) {
      case "undefined":
        return ZodParsedType.undefined;
      case "string":
        return ZodParsedType.string;
      case "number":
        return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
      case "boolean":
        return ZodParsedType.boolean;
      case "function":
        return ZodParsedType.function;
      case "bigint":
        return ZodParsedType.bigint;
      case "object":
        if (Array.isArray(data)) {
          return ZodParsedType.array;
        }
        if (data === null) {
          return ZodParsedType.null;
        }
        if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
          return ZodParsedType.promise;
        }
        if (typeof Map !== "undefined" && data instanceof Map) {
          return ZodParsedType.map;
        }
        if (typeof Set !== "undefined" && data instanceof Set) {
          return ZodParsedType.set;
        }
        if (typeof Date !== "undefined" && data instanceof Date) {
          return ZodParsedType.date;
        }
        return ZodParsedType.object;
      default:
        return ZodParsedType.unknown;
    }
  };
  var makeIssue = (params) => {
    const { data, path: path2, errorMaps, issueData } = params;
    const fullPath = [...path2, ...issueData.path || []];
    const fullIssue = {
      ...issueData,
      path: fullPath
    };
    let errorMessage = "";
    const maps = errorMaps.filter((m2) => !!m2).slice().reverse();
    for (const map of maps) {
      errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message || errorMessage
    };
  };
  var EMPTY_PATH = [];
  function addIssueToContext(ctx, issueData) {
    const issue = makeIssue({
      issueData,
      data: ctx.data,
      path: ctx.path,
      errorMaps: [
        ctx.common.contextualErrorMap,
        ctx.schemaErrorMap,
        overrideErrorMap,
        defaultErrorMap
      ].filter((x2) => !!x2)
    });
    ctx.common.issues.push(issue);
  }
  var ParseStatus = class {
    constructor() {
      this.value = "valid";
    }
    dirty() {
      if (this.value === "valid")
        this.value = "dirty";
    }
    abort() {
      if (this.value !== "aborted")
        this.value = "aborted";
    }
    static mergeArray(status, results) {
      const arrayValue = [];
      for (const s5 of results) {
        if (s5.status === "aborted")
          return INVALID;
        if (s5.status === "dirty")
          status.dirty();
        arrayValue.push(s5.value);
      }
      return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
      const syncPairs = [];
      for (const pair of pairs) {
        syncPairs.push({
          key: await pair.key,
          value: await pair.value
        });
      }
      return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
      const finalObject = {};
      for (const pair of pairs) {
        const { key, value } = pair;
        if (key.status === "aborted")
          return INVALID;
        if (value.status === "aborted")
          return INVALID;
        if (key.status === "dirty")
          status.dirty();
        if (value.status === "dirty")
          status.dirty();
        if (typeof value.value !== "undefined" || pair.alwaysSet) {
          finalObject[key.value] = value.value;
        }
      }
      return { status: status.value, value: finalObject };
    }
  };
  var INVALID = Object.freeze({
    status: "aborted"
  });
  var DIRTY = (value) => ({ status: "dirty", value });
  var OK = (value) => ({ status: "valid", value });
  var isAborted = (x2) => x2.status === "aborted";
  var isDirty = (x2) => x2.status === "dirty";
  var isValid = (x2) => x2.status === "valid";
  var isAsync = (x2) => typeof Promise !== void 0 && x2 instanceof Promise;
  var errorUtil;
  (function(errorUtil2) {
    errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
  })(errorUtil || (errorUtil = {}));
  var ParseInputLazyPath = class {
    constructor(parent, value, path2, key) {
      this.parent = parent;
      this.data = value;
      this._path = path2;
      this._key = key;
    }
    get path() {
      return this._path.concat(this._key);
    }
  };
  var handleResult = (ctx, result) => {
    if (isValid(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }
      const error3 = new ZodError(ctx.common.issues);
      return { success: false, error: error3 };
    }
  };
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid" or "required" in conjunction with custom error map.`);
    }
    if (errorMap)
      return { errorMap, description };
    const customMap = (iss, ctx) => {
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      if (typeof ctx.data === "undefined" && required_error)
        return { message: required_error };
      if (params.invalid_type_error)
        return { message: params.invalid_type_error };
      return { message: ctx.defaultError };
    };
    return { errorMap: customMap, description };
  }
  var ZodType = class {
    constructor(def) {
      this.spa = this.safeParseAsync;
      this.superRefine = this._refinement;
      this._def = def;
      this.parse = this.parse.bind(this);
      this.safeParse = this.safeParse.bind(this);
      this.parseAsync = this.parseAsync.bind(this);
      this.safeParseAsync = this.safeParseAsync.bind(this);
      this.spa = this.spa.bind(this);
      this.refine = this.refine.bind(this);
      this.refinement = this.refinement.bind(this);
      this.superRefine = this.superRefine.bind(this);
      this.optional = this.optional.bind(this);
      this.nullable = this.nullable.bind(this);
      this.nullish = this.nullish.bind(this);
      this.array = this.array.bind(this);
      this.promise = this.promise.bind(this);
      this.or = this.or.bind(this);
      this.and = this.and.bind(this);
      this.transform = this.transform.bind(this);
      this.default = this.default.bind(this);
      this.describe = this.describe.bind(this);
      this.isNullable = this.isNullable.bind(this);
      this.isOptional = this.isOptional.bind(this);
    }
    get description() {
      return this._def.description;
    }
    _getType(input) {
      return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
      return ctx || {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      };
    }
    _processInputParams(input) {
      return {
        status: new ParseStatus(),
        ctx: {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        }
      };
    }
    _parseSync(input) {
      const result = this._parse(input);
      if (isAsync(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input) {
      const result = this._parse(input);
      return Promise.resolve(result);
    }
    parse(data, params) {
      const result = this.safeParse(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    safeParse(data, params) {
      var _a2;
      const ctx = {
        common: {
          issues: [],
          async: (_a2 = params === null || params === void 0 ? void 0 : params.async) !== null && _a2 !== void 0 ? _a2 : false,
          contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
        },
        path: (params === null || params === void 0 ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const result = this._parseSync({ data, path: ctx.path, parent: ctx });
      return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
      const result = await this.safeParseAsync(data, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    async safeParseAsync(data, params) {
      const ctx = {
        common: {
          issues: [],
          contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
          async: true
        },
        path: (params === null || params === void 0 ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data,
        parsedType: getParsedType(data)
      };
      const maybeAsyncResult = this._parse({ data, path: [], parent: ctx });
      const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
      return handleResult(ctx, result);
    }
    refine(check, message) {
      const getIssueProperties = (val) => {
        if (typeof message === "string" || typeof message === "undefined") {
          return { message };
        } else if (typeof message === "function") {
          return message(val);
        } else {
          return message;
        }
      };
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () => ctx.addIssue({
          code: ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
        if (typeof Promise !== "undefined" && result instanceof Promise) {
          return result.then((data) => {
            if (!data) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        if (!result) {
          setError();
          return false;
        } else {
          return true;
        }
      });
    }
    refinement(check, refinementData) {
      return this._refinement((val, ctx) => {
        if (!check(val)) {
          ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
          return false;
        } else {
          return true;
        }
      });
    }
    _refinement(refinement) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "refinement", refinement }
      });
    }
    optional() {
      return ZodOptional.create(this);
    }
    nullable() {
      return ZodNullable.create(this);
    }
    nullish() {
      return this.optional().nullable();
    }
    array() {
      return ZodArray.create(this);
    }
    promise() {
      return ZodPromise.create(this);
    }
    or(option) {
      return ZodUnion.create([this, option]);
    }
    and(incoming) {
      return ZodIntersection.create(this, incoming);
    }
    transform(transform) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "transform", transform }
      });
    }
    default(def) {
      const defaultValueFunc = typeof def === "function" ? def : () => def;
      return new ZodDefault({
        innerType: this,
        defaultValue: defaultValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodDefault
      });
    }
    describe(description) {
      const This = this.constructor;
      return new This({
        ...this._def,
        description
      });
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  };
  var cuidRegex = /^c[^\s-]{8,}$/i;
  var uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
  var emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  var ZodString = class extends ZodType {
    constructor() {
      super(...arguments);
      this._regex = (regex, validation, message) => this.refinement((data) => regex.test(data), {
        validation,
        code: ZodIssueCode.invalid_string,
        ...errorUtil.errToObj(message)
      });
      this.nonempty = (message) => this.min(1, errorUtil.errToObj(message));
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.length < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input.data.length > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "email") {
          if (!emailRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input.data);
          } catch (_a2) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        }
      }
      return { status: status.value, value: input.data };
    }
    _addCheck(check) {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    email(message) {
      return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
      return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
      return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
      return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    regex(regex, message) {
      return this._addCheck({
        kind: "regex",
        regex,
        ...errorUtil.errToObj(message)
      });
    }
    min(minLength, message) {
      return this._addCheck({
        kind: "min",
        value: minLength,
        ...errorUtil.errToObj(message)
      });
    }
    max(maxLength, message) {
      return this._addCheck({
        kind: "max",
        value: maxLength,
        ...errorUtil.errToObj(message)
      });
    }
    length(len, message) {
      return this.min(len, message).max(len, message);
    }
    get isEmail() {
      return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isUUID() {
      return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isCUID() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get minLength() {
      let min = -Infinity;
      this._def.checks.map((ch) => {
        if (ch.kind === "min") {
          if (min === null || ch.value > min) {
            min = ch.value;
          }
        }
      });
      return min;
    }
    get maxLength() {
      let max = null;
      this._def.checks.map((ch) => {
        if (ch.kind === "max") {
          if (max === null || ch.value < max) {
            max = ch.value;
          }
        }
      });
      return max;
    }
  };
  ZodString.create = (params) => {
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      ...processCreateParams(params)
    });
  };
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / Math.pow(10, decCount);
  }
  var ZodNumber = class extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
      this.step = this.multipleOf;
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util.isInteger(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(input.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util.assertNever(check);
        }
      }
      return { status: status.value, value: input.data };
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodNumber({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodNumber({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    int(message) {
      return this._addCheck({
        kind: "int",
        message: errorUtil.toString(message)
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
    get isInt() {
      return !!this._def.checks.find((ch) => ch.kind === "int");
    }
  };
  ZodNumber.create = (params) => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      ...processCreateParams(params)
    });
  };
  var ZodBigInt = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.bigint) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodBigInt.create = (params) => {
    return new ZodBigInt({
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      ...processCreateParams(params)
    });
  };
  var ZodBoolean = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodBoolean.create = (params) => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      ...processCreateParams(params)
    });
  };
  var ZodDate = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.date) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (isNaN(input.data.getTime())) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_date
        });
        return INVALID;
      }
      return {
        status: "valid",
        value: new Date(input.data.getTime())
      };
    }
  };
  ZodDate.create = (params) => {
    return new ZodDate({
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams(params)
    });
  };
  var ZodUndefined = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams(params)
    });
  };
  var ZodNull = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodNull.create = (params) => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams(params)
    });
  };
  var ZodAny = class extends ZodType {
    constructor() {
      super(...arguments);
      this._any = true;
    }
    _parse(input) {
      return OK(input.data);
    }
  };
  ZodAny.create = (params) => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams(params)
    });
  };
  var ZodUnknown = class extends ZodType {
    constructor() {
      super(...arguments);
      this._unknown = true;
    }
    _parse(input) {
      return OK(input.data);
    }
  };
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams(params)
    });
  };
  var ZodNever = class extends ZodType {
    _parse(input) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: ctx.parsedType
      });
      return INVALID;
    }
  };
  ZodNever.create = (params) => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams(params)
    });
  };
  var ZodVoid = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  };
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams(params)
    });
  };
  var ZodArray = class extends ZodType {
    _parse(input) {
      const { ctx, status } = this._processInputParams(input);
      const def = this._def;
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            message: def.minLength.message
          });
          status.dirty();
        }
      }
      if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            message: def.maxLength.message
          });
          status.dirty();
        }
      }
      if (ctx.common.async) {
        return Promise.all(ctx.data.map((item, i5) => {
          return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i5));
        })).then((result2) => {
          return ParseStatus.mergeArray(status, result2);
        });
      }
      const result = ctx.data.map((item, i5) => {
        return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i5));
      });
      return ParseStatus.mergeArray(status, result);
    }
    get element() {
      return this._def.type;
    }
    min(minLength, message) {
      return new ZodArray({
        ...this._def,
        minLength: { value: minLength, message: errorUtil.toString(message) }
      });
    }
    max(maxLength, message) {
      return new ZodArray({
        ...this._def,
        maxLength: { value: maxLength, message: errorUtil.toString(message) }
      });
    }
    length(len, message) {
      return this.min(len, message).max(len, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodArray.create = (schema, params) => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams(params)
    });
  };
  var objectUtil;
  (function(objectUtil2) {
    objectUtil2.mergeShapes = (first, second) => {
      return {
        ...first,
        ...second
      };
    };
  })(objectUtil || (objectUtil = {}));
  var AugmentFactory = (def) => (augmentation) => {
    return new ZodObject({
      ...def,
      shape: () => ({
        ...def.shape(),
        ...augmentation
      })
    });
  };
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return ZodArray.create(deepPartialify(schema.element));
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  var ZodObject = class extends ZodType {
    constructor() {
      super(...arguments);
      this._cached = null;
      this.nonstrict = this.passthrough;
      this.augment = AugmentFactory(this._def);
      this.extend = AugmentFactory(this._def);
    }
    _getCached() {
      if (this._cached !== null)
        return this._cached;
      const shape = this._def.shape();
      const keys = util.objectKeys(shape);
      return this._cached = { shape, keys };
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const { status, ctx } = this._processInputParams(input);
      const { shape, keys: shapeKeys } = this._getCached();
      const extraKeys = [];
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
      const pairs = [];
      for (const key of shapeKeys) {
        const keyValidator = shape[key];
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (this._def.catchall instanceof ZodNever) {
        const unknownKeys = this._def.unknownKeys;
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            pairs.push({
              key: { status: "valid", value: key },
              value: { status: "valid", value: ctx.data[key] }
            });
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys
            });
            status.dirty();
          }
        } else if (unknownKeys === "strip")
          ;
        else {
          throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
        }
      } else {
        const catchall = this._def.catchall;
        for (const key of extraKeys) {
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
      }
      if (ctx.common.async) {
        return Promise.resolve().then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            syncPairs.push({
              key,
              value: await pair.value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        }).then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get shape() {
      return this._def.shape();
    }
    strict(message) {
      errorUtil.errToObj;
      return new ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...message !== void 0 ? {
          errorMap: (issue, ctx) => {
            var _a2, _b, _c, _d;
            const defaultError = (_c = (_b = (_a2 = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a2, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
            if (issue.code === "unrecognized_keys")
              return {
                message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
              };
            return {
              message: defaultError
            };
          }
        } : {}
      });
    }
    strip() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "strip"
      });
    }
    passthrough() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "passthrough"
      });
    }
    setKey(key, schema) {
      return this.augment({ [key]: schema });
    }
    merge(merging) {
      const merged = new ZodObject({
        unknownKeys: merging._def.unknownKeys,
        catchall: merging._def.catchall,
        shape: () => objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        typeName: ZodFirstPartyTypeKind.ZodObject
      });
      return merged;
    }
    catchall(index) {
      return new ZodObject({
        ...this._def,
        catchall: index
      });
    }
    pick(mask) {
      const shape = {};
      util.objectKeys(mask).map((key) => {
        shape[key] = this.shape[key];
      });
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    omit(mask) {
      const shape = {};
      util.objectKeys(this.shape).map((key) => {
        if (util.objectKeys(mask).indexOf(key) === -1) {
          shape[key] = this.shape[key];
        }
      });
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    deepPartial() {
      return deepPartialify(this);
    }
    partial(mask) {
      const newShape = {};
      if (mask) {
        util.objectKeys(this.shape).map((key) => {
          if (util.objectKeys(mask).indexOf(key) === -1) {
            newShape[key] = this.shape[key];
          } else {
            newShape[key] = this.shape[key].optional();
          }
        });
        return new ZodObject({
          ...this._def,
          shape: () => newShape
        });
      } else {
        for (const key in this.shape) {
          const fieldSchema = this.shape[key];
          newShape[key] = fieldSchema.optional();
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    required() {
      const newShape = {};
      for (const key in this.shape) {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
  };
  ZodObject.create = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams(params)
    });
  };
  var ZodUnion = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const options = this._def.options;
      function handleResults(results) {
        for (const result of results) {
          if (result.result.status === "valid") {
            return result.result;
          }
        }
        for (const result of results) {
          if (result.result.status === "dirty") {
            ctx.common.issues.push(...result.ctx.common.issues);
            return result.result;
          }
        }
        const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return Promise.all(options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })).then(handleResults);
      } else {
        let dirty = void 0;
        const issues = [];
        for (const option of options) {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          const result = option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          });
          if (result.status === "valid") {
            return result;
          } else if (result.status === "dirty" && !dirty) {
            dirty = { result, ctx: childCtx };
          }
          if (childCtx.common.issues.length) {
            issues.push(childCtx.common.issues);
          }
        }
        if (dirty) {
          ctx.common.issues.push(...dirty.ctx.common.issues);
          return dirty.result;
        }
        const unionErrors = issues.map((issues2) => new ZodError(issues2));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
    }
    get options() {
      return this._def.options;
    }
  };
  ZodUnion.create = (types, params) => {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams(params)
    });
  };
  var ZodDiscriminatedUnion = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const discriminator = this.discriminator;
      const discriminatorValue = ctx.data[discriminator];
      const option = this.options.get(discriminatorValue);
      if (!option) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union_discriminator,
          options: this.validDiscriminatorValues,
          path: [discriminator]
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return option._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      } else {
        return option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get validDiscriminatorValues() {
      return Array.from(this.options.keys());
    }
    get options() {
      return this._def.options;
    }
    static create(discriminator, types, params) {
      const options = /* @__PURE__ */ new Map();
      try {
        types.forEach((type) => {
          const discriminatorValue = type.shape[discriminator].value;
          options.set(discriminatorValue, type);
        });
      } catch (e5) {
        throw new Error("The discriminator value could not be extracted from all the provided schemas");
      }
      if (options.size !== types.length) {
        throw new Error("Some of the discriminator values are not unique");
      }
      return new ZodDiscriminatedUnion({
        typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
        discriminator,
        options,
        ...processCreateParams(params)
      });
    }
  };
  function mergeValues(a3, b2) {
    const aType = getParsedType(a3);
    const bType = getParsedType(b2);
    if (a3 === b2) {
      return { valid: true, data: a3 };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util.objectKeys(b2);
      const sharedKeys = util.objectKeys(a3).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a3, ...b2 };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a3[key], b2[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a3.length !== b2.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a3.length; index++) {
        const itemA = a3[index];
        const itemB = b2[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a3 === +b2) {
      return { valid: true, data: a3 };
    } else {
      return { valid: false };
    }
  }
  var ZodIntersection = class extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const handleParsed = (parsedLeft, parsedRight) => {
        if (isAborted(parsedLeft) || isAborted(parsedRight)) {
          return INVALID;
        }
        const merged = mergeValues(parsedLeft.value, parsedRight.value);
        if (!merged.valid) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_intersection_types
          });
          return INVALID;
        }
        if (isDirty(parsedLeft) || isDirty(parsedRight)) {
          status.dirty();
        }
        return { status: status.value, value: merged.data };
      };
      if (ctx.common.async) {
        return Promise.all([
          this._def.left._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }),
          this._def.right._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          })
        ]).then(([left, right]) => handleParsed(left, right));
      } else {
        return handleParsed(this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }), this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }));
      }
    }
  };
  ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
      left,
      right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams(params)
    });
  };
  var ZodTuple = class extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (ctx.data.length < this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          type: "array"
        });
        return INVALID;
      }
      const rest = this._def.rest;
      if (!rest && ctx.data.length > this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          type: "array"
        });
        status.dirty();
      }
      const items = ctx.data.map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return null;
        return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
      }).filter((x2) => !!x2);
      if (ctx.common.async) {
        return Promise.all(items).then((results) => {
          return ParseStatus.mergeArray(status, results);
        });
      } else {
        return ParseStatus.mergeArray(status, items);
      }
    }
    get items() {
      return this._def.items;
    }
    rest(rest) {
      return new ZodTuple({
        ...this._def,
        rest
      });
    }
  };
  ZodTuple.create = (schemas, params) => {
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams(params)
    });
  };
  var ZodRecord = class extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const pairs = [];
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      for (const key in ctx.data) {
        pairs.push({
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
          value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
        });
      }
      if (ctx.common.async) {
        return ParseStatus.mergeObjectAsync(status, pairs);
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get element() {
      return this._def.valueType;
    }
    static create(first, second, third) {
      if (second instanceof ZodType) {
        return new ZodRecord({
          keyType: first,
          valueType: second,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(third)
        });
      }
      return new ZodRecord({
        keyType: ZodString.create(),
        valueType: first,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(second)
      });
    }
  };
  var ZodMap = class extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.map) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      const pairs = [...ctx.data.entries()].map(([key, value], index) => {
        return {
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
          value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
        };
      });
      if (ctx.common.async) {
        const finalMap = /* @__PURE__ */ new Map();
        return Promise.resolve().then(async () => {
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        });
      } else {
        const finalMap = /* @__PURE__ */ new Map();
        for (const pair of pairs) {
          const key = pair.key;
          const value = pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      }
    }
  };
  ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams(params)
    });
  };
  var ZodSet = class extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.set) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const def = this._def;
      if (def.minSize !== null) {
        if (ctx.data.size < def.minSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            message: def.minSize.message
          });
          status.dirty();
        }
      }
      if (def.maxSize !== null) {
        if (ctx.data.size > def.maxSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            message: def.maxSize.message
          });
          status.dirty();
        }
      }
      const valueType = this._def.valueType;
      function finalizeSet(elements2) {
        const parsedSet = /* @__PURE__ */ new Set();
        for (const element of elements2) {
          if (element.status === "aborted")
            return INVALID;
          if (element.status === "dirty")
            status.dirty();
          parsedSet.add(element.value);
        }
        return { status: status.value, value: parsedSet };
      }
      const elements = [...ctx.data.values()].map((item, i5) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i5)));
      if (ctx.common.async) {
        return Promise.all(elements).then((elements2) => finalizeSet(elements2));
      } else {
        return finalizeSet(elements);
      }
    }
    min(minSize, message) {
      return new ZodSet({
        ...this._def,
        minSize: { value: minSize, message: errorUtil.toString(message) }
      });
    }
    max(maxSize, message) {
      return new ZodSet({
        ...this._def,
        maxSize: { value: maxSize, message: errorUtil.toString(message) }
      });
    }
    size(size, message) {
      return this.min(size, message).max(size, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  };
  ZodSet.create = (valueType, params) => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams(params)
    });
  };
  var ZodFunction = class extends ZodType {
    constructor() {
      super(...arguments);
      this.validate = this.implement;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.function) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.function,
          received: ctx.parsedType
        });
        return INVALID;
      }
      function makeArgsIssue(args, error3) {
        return makeIssue({
          data: args,
          path: ctx.path,
          errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            overrideErrorMap,
            defaultErrorMap
          ].filter((x2) => !!x2),
          issueData: {
            code: ZodIssueCode.invalid_arguments,
            argumentsError: error3
          }
        });
      }
      function makeReturnsIssue(returns, error3) {
        return makeIssue({
          data: returns,
          path: ctx.path,
          errorMaps: [
            ctx.common.contextualErrorMap,
            ctx.schemaErrorMap,
            overrideErrorMap,
            defaultErrorMap
          ].filter((x2) => !!x2),
          issueData: {
            code: ZodIssueCode.invalid_return_type,
            returnTypeError: error3
          }
        });
      }
      const params = { errorMap: ctx.common.contextualErrorMap };
      const fn = ctx.data;
      if (this._def.returns instanceof ZodPromise) {
        return OK(async (...args) => {
          const error3 = new ZodError([]);
          const parsedArgs = await this._def.args.parseAsync(args, params).catch((e5) => {
            error3.addIssue(makeArgsIssue(args, e5));
            throw error3;
          });
          const result = await fn(...parsedArgs);
          const parsedReturns = await this._def.returns._def.type.parseAsync(result, params).catch((e5) => {
            error3.addIssue(makeReturnsIssue(result, e5));
            throw error3;
          });
          return parsedReturns;
        });
      } else {
        return OK((...args) => {
          const parsedArgs = this._def.args.safeParse(args, params);
          if (!parsedArgs.success) {
            throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
          }
          const result = fn(...parsedArgs.data);
          const parsedReturns = this._def.returns.safeParse(result, params);
          if (!parsedReturns.success) {
            throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
          }
          return parsedReturns.data;
        });
      }
    }
    parameters() {
      return this._def.args;
    }
    returnType() {
      return this._def.returns;
    }
    args(...items) {
      return new ZodFunction({
        ...this._def,
        args: ZodTuple.create(items).rest(ZodUnknown.create())
      });
    }
    returns(returnType) {
      return new ZodFunction({
        ...this._def,
        returns: returnType
      });
    }
    implement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
    strictImplement(func) {
      const validatedFunc = this.parse(func);
      return validatedFunc;
    }
  };
  ZodFunction.create = (args, returns, params) => {
    return new ZodFunction({
      args: args ? args.rest(ZodUnknown.create()) : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  };
  var ZodLazy = class extends ZodType {
    get schema() {
      return this._def.getter();
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      const lazySchema = this._def.getter();
      return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
  };
  ZodLazy.create = (getter, params) => {
    return new ZodLazy({
      getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams(params)
    });
  };
  var ZodLiteral = class extends ZodType {
    _parse(input) {
      if (input.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
    }
    get value() {
      return this._def.value;
    }
  };
  ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
      value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams(params)
    });
  };
  function createZodEnum(values) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum
    });
  }
  var ZodEnum = class extends ZodType {
    _parse(input) {
      if (typeof input.data !== "string") {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (this._def.values.indexOf(input.data) === -1) {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Values() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
  };
  ZodEnum.create = createZodEnum;
  var ZodNativeEnum = class extends ZodType {
    _parse(input) {
      const nativeEnumValues = util.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input);
      if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          expected: util.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (nativeEnumValues.indexOf(input.data) === -1) {
        const expectedValues = util.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
    }
    get enum() {
      return this._def.values;
    }
  };
  ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams(params)
    });
  };
  var ZodPromise = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
      return OK(promisified.then((data) => {
        return this._def.type.parseAsync(data, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      }));
    }
  };
  ZodPromise.create = (schema, params) => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams(params)
    });
  };
  var ZodEffects = class extends ZodType {
    innerType() {
      return this._def.schema;
    }
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
      const effect = this._def.effect || null;
      if (effect.type === "preprocess") {
        const processed = effect.transform(ctx.data);
        if (ctx.common.async) {
          return Promise.resolve(processed).then((processed2) => {
            return this._def.schema._parseAsync({
              data: processed2,
              path: ctx.path,
              parent: ctx
            });
          });
        } else {
          return this._def.schema._parseSync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      const checkCtx = {
        addIssue: (arg) => {
          addIssueToContext(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        }
      };
      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (effect.type === "refinement") {
        const executeRefinement = (acc) => {
          const result = effect.refinement(acc, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(result);
          }
          if (result instanceof Promise) {
            throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
          }
          return acc;
        };
        if (ctx.common.async === false) {
          const inner = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          executeRefinement(inner.value);
          return { status: status.value, value: inner.value };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
        }
      }
      if (effect.type === "transform") {
        if (ctx.common.async === false) {
          const base = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (!isValid(base))
            return base;
          const result = effect.transform(base.value, checkCtx);
          if (result instanceof Promise) {
            throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
          }
          return { status: status.value, value: result };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
            if (!isValid(base))
              return base;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
          });
        }
      }
      util.assertNever(effect);
    }
  };
  ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams(params)
    });
  };
  ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams(params)
    });
  };
  var ZodOptional = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.undefined) {
        return OK(void 0);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodOptional.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  var ZodNullable = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.null) {
        return OK(null);
      }
      return this._def.innerType._parse(input);
    }
    unwrap() {
      return this._def.innerType;
    }
  };
  ZodNullable.create = (type, params) => {
    return new ZodNullable({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams(params)
    });
  };
  var ZodDefault = class extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
      let data = ctx.data;
      if (ctx.parsedType === ZodParsedType.undefined) {
        data = this._def.defaultValue();
      }
      return this._def.innerType._parse({
        data,
        path: ctx.path,
        parent: ctx
      });
    }
    removeDefault() {
      return this._def.innerType;
    }
  };
  ZodDefault.create = (type, params) => {
    return new ZodOptional({
      innerType: type,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams(params)
    });
  };
  var ZodNaN = class extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
    }
  };
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams(params)
    });
  };
  var custom = (check, params) => {
    if (check)
      return ZodAny.create().refine(check, params);
    return ZodAny.create();
  };
  var late = {
    object: ZodObject.lazycreate
  };
  var ZodFirstPartyTypeKind;
  (function(ZodFirstPartyTypeKind2) {
    ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  var instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
  }) => custom((data) => data instanceof cls, params);
  var stringType = ZodString.create;
  var numberType = ZodNumber.create;
  var nanType = ZodNaN.create;
  var bigIntType = ZodBigInt.create;
  var booleanType = ZodBoolean.create;
  var dateType = ZodDate.create;
  var undefinedType = ZodUndefined.create;
  var nullType = ZodNull.create;
  var anyType = ZodAny.create;
  var unknownType = ZodUnknown.create;
  var neverType = ZodNever.create;
  var voidType = ZodVoid.create;
  var arrayType = ZodArray.create;
  var objectType = ZodObject.create;
  var strictObjectType = ZodObject.strictCreate;
  var unionType = ZodUnion.create;
  var discriminatedUnionType = ZodDiscriminatedUnion.create;
  var intersectionType = ZodIntersection.create;
  var tupleType = ZodTuple.create;
  var recordType = ZodRecord.create;
  var mapType = ZodMap.create;
  var setType = ZodSet.create;
  var functionType = ZodFunction.create;
  var lazyType = ZodLazy.create;
  var literalType = ZodLiteral.create;
  var enumType = ZodEnum.create;
  var nativeEnumType = ZodNativeEnum.create;
  var promiseType = ZodPromise.create;
  var effectsType = ZodEffects.create;
  var optionalType = ZodOptional.create;
  var nullableType = ZodNullable.create;
  var preprocessType = ZodEffects.createWithPreprocess;
  var ostring = () => stringType().optional();
  var onumber = () => numberType().optional();
  var oboolean = () => booleanType().optional();
  var mod = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    ZodParsedType,
    getParsedType,
    makeIssue,
    EMPTY_PATH,
    addIssueToContext,
    ParseStatus,
    INVALID,
    DIRTY,
    OK,
    isAborted,
    isDirty,
    isValid,
    isAsync,
    ZodType,
    ZodString,
    ZodNumber,
    ZodBigInt,
    ZodBoolean,
    ZodDate,
    ZodUndefined,
    ZodNull,
    ZodAny,
    ZodUnknown,
    ZodNever,
    ZodVoid,
    ZodArray,
    get objectUtil() {
      return objectUtil;
    },
    ZodObject,
    ZodUnion,
    ZodDiscriminatedUnion,
    ZodIntersection,
    ZodTuple,
    ZodRecord,
    ZodMap,
    ZodSet,
    ZodFunction,
    ZodLazy,
    ZodLiteral,
    ZodEnum,
    ZodNativeEnum,
    ZodPromise,
    ZodEffects,
    ZodTransformer: ZodEffects,
    ZodOptional,
    ZodNullable,
    ZodDefault,
    ZodNaN,
    custom,
    Schema: ZodType,
    ZodSchema: ZodType,
    late,
    get ZodFirstPartyTypeKind() {
      return ZodFirstPartyTypeKind;
    },
    any: anyType,
    array: arrayType,
    bigint: bigIntType,
    boolean: booleanType,
    date: dateType,
    discriminatedUnion: discriminatedUnionType,
    effect: effectsType,
    "enum": enumType,
    "function": functionType,
    "instanceof": instanceOfType,
    intersection: intersectionType,
    lazy: lazyType,
    literal: literalType,
    map: mapType,
    nan: nanType,
    nativeEnum: nativeEnumType,
    never: neverType,
    "null": nullType,
    nullable: nullableType,
    number: numberType,
    object: objectType,
    oboolean,
    onumber,
    optional: optionalType,
    ostring,
    preprocess: preprocessType,
    promise: promiseType,
    record: recordType,
    set: setType,
    strictObject: strictObjectType,
    string: stringType,
    transformer: effectsType,
    tuple: tupleType,
    "undefined": undefinedType,
    union: unionType,
    unknown: unknownType,
    "void": voidType,
    ZodIssueCode,
    quotelessJson,
    ZodError,
    defaultErrorMap,
    get overrideErrorMap() {
      return overrideErrorMap;
    },
    setErrorMap
  });

  // src/machines/app.ts
  var appMachine = createMachine({
    id: "app",
    initial: "initial",
    context: {
      pathname: window.location.pathname,
      named: "waiting"
    },
    invoke: {
      id: "popstate-listener",
      src: "popstate-listener-service"
    },
    states: {
      initial: {
        entry: "initial-route-resolution",
        on: {
          "navigate": { actions: "try-navigate", target: "navigating" }
        }
      },
      navigating: {
        on: {
          "navigation-complete": { actions: "assign-route", target: "settled" },
          "navigate": { actions: "try-navigate", target: "navigating" }
        }
      },
      settled: {
        entry: send3("broadcast-settled"),
        on: {
          "navigate": { actions: "try-navigate", target: "navigating" }
        }
      }
    }
  }, {
    actions: {
      "assign-route": assign3({
        named: (_2, evt) => {
          const parsed = navigationCompleteEvent.parse(evt);
          return parsed.named;
        }
      }),
      "initial-route-resolution": (0, import_actions5.pure)((ctx, evt) => {
        if (!ctx.pathname.startsWith("/__bs3/api")) {
          const evt2 = createNavEvent({
            type: "navigate",
            named: "unknown"
          });
          return send3(evt2);
        }
        if (ctx.pathname === "/__bs3/api/routes") {
          return send3(createNavEvent({
            type: "navigate",
            named: "routes"
          }));
        }
        return [];
      }),
      "try-navigate": (0, import_actions5.pure)((ctx, evt) => {
        const parsed = navEvent.parse(evt);
        switch (parsed.named) {
          case "unknown":
          case "routes": {
            return send3(createNavigationCompleteEvent({ type: "navigation-complete", named: parsed.named }));
          }
          default:
            "unsupported";
        }
        return [];
      })
    },
    services: {
      "popstate-listener-service": (ctx, evt) => (send4, rec) => {
        const goto = (pathname) => {
          if (pathname.startsWith("/__bs3/api")) {
            const sliced = namedRoutes.parse(pathname.slice(11));
            send4(createNavEvent({
              type: "navigate",
              named: sliced
            }));
          } else {
            send4(createNavEvent({
              type: "navigate",
              named: "unknown"
            }));
          }
        };
        window.addEventListener("popstate", (e5) => {
          goto(window.location.pathname);
        });
        window.addEventListener("click", (e5) => {
          const isNonNavigationClick = e5.button !== 0 || e5.metaKey || e5.ctrlKey || e5.shiftKey;
          if (e5.defaultPrevented || isNonNavigationClick) {
            return;
          }
          const anchor = e5.composedPath().find((n6) => n6.tagName === "A");
          if (anchor === void 0 || anchor.target !== "" || anchor.hasAttribute("download") || anchor.getAttribute("rel") === "external") {
            return;
          }
          const href = anchor.href;
          if (href === "" || href.startsWith("mailto:")) {
            return;
          }
          const location = window.location;
          if (anchor.origin !== origin) {
            return;
          }
          e5.preventDefault();
          if (href !== location.href) {
            window.history.pushState({}, "", href);
            goto(anchor.pathname);
          }
        });
      }
    }
  });
  var namedRoutes = mod.union([mod.literal("unknown"), mod.literal("routes")]);
  var navEvent = mod.object({
    type: mod.literal("navigate"),
    named: namedRoutes
  });
  function createNavEvent(d2) {
    return navEvent.parse(d2);
  }
  var navigationCompleteEvent = mod.object({
    type: mod.literal("navigation-complete"),
    named: namedRoutes
  });
  function createNavigationCompleteEvent(d2) {
    return navigationCompleteEvent.parse(d2);
  }

  // src/index.ts
  inspect({ iframe: false });
  var MachineController = class {
    constructor(host, machine) {
      (this.host = host).addController(this);
      this.store = interpret(machine, { devTools: true }).start();
      this.subscription = this.store.subscribe(() => {
        this.host.requestUpdate();
      });
    }
    hostDisconnected() {
      this.subscription?.unsubscribe();
    }
  };
  var Test1 = class extends s4 {
    constructor() {
      super(...arguments);
      this.machine = new MachineController(this, appMachine).store;
    }
    get currentRoute() {
      switch (this.machine.state.context.named) {
        case "waiting":
          return $`<p>Please wait...</p>`;
        case "unknown":
          return $`<bs3-route-fallback></bs3-route-fallback>`;
        case "routes":
          return $`<bs3-routes></bs3-routes>`;
        default:
          return $`Not sure...`;
      }
    }
    render() {
      return $`
      <pre><code>${JSON.stringify(this.machine.state.value)}</code></pre>
      <pre><code>${JSON.stringify(this.machine.state.context.named)}</code></pre>
      ${this.currentRoute}
      <p><a href="/__bs3/api/routes">See all routes</a></p>
      <p><a href="/shane">See an unknown route</a></p>
    `;
    }
  };
  Test1 = __decorateClass([
    n5("router-test-1")
  ], Test1);
})();
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
