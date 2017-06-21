(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.QV = factory());
}(this, (function () { 'use strict';

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var selector = {
    s: function s() {
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        //单个
        return document.querySelector(selector);
    },
    m: function m() {
        var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        // 集合
        return document.querySelectorAll(selector);
    },
    id: function id() {
        var _id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

        return document.getElementById(_id);
    }
};

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var For = {
    name: "for",
    general: function general(el) {}
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var dsl_prefix = "dsl-";

var dslMap = {};

var DSL = function () {
    function DSL() {
        classCallCheck(this, DSL);

        this.initAll();
    }

    createClass(DSL, [{
        key: "initAll",
        value: function initAll() {
            dslMap["" + dsl_prefix + For.name] = For;
        }
    }, {
        key: "dslMap",
        get: function get$$1() {
            return dslMap;
        }
    }]);
    return DSL;
}();

var dsl = new DSL();

var attrRE = /([:\w-]+)|['"]{1}([^'"]*)['"]{1}/g;

// create optimized lookup object for
// void elements as listed here:
// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements

var lookup = Object.create ? Object.create(null) : {};
lookup.area = true;
lookup.base = true;
lookup.br = true;
lookup.col = true;
lookup.embed = true;
lookup.hr = true;
lookup.img = true;
lookup.input = true;
lookup.keygen = true;
lookup.link = true;
lookup.menuitem = true;
lookup.meta = true;
lookup.param = true;
lookup.source = true;
lookup.track = true;
lookup.wbr = true;

var parseTag = function (tag) {
    var i = 0;
    var key;
    var res = {
        type: 'tag',
        name: '',
        voidElement: false,
        attrs: {},
        children: [],
        dsl: []
    };

    tag.replace(attrRE, function (match) {

        if (dsl.dslMap[match]) {
            // res.dsl.push(match);
        }

        if (i % 2) {
            key = match;
        } else {
            if (i === 0) {
                if (lookup[match] || tag.charAt(tag.length - 2) === '/') {
                    res.voidElement = true;
                }
                res.name = match;
            } else {
                res.attrs[key] = match.replace(/['"]/g, '');
            }
        }
        i++;
    });

    return res;
};

/**
 * Created by zhengqiguang on 2017/6/15.
 */
var tagRE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;

var empty = Object.create ? Object.create(null) : {};

var htmlParse = function (html, options) {
    options || (options = {});
    options.components || (options.components = empty);
    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var byTag = {};
    var inComponent = false;

    html.replace(tagRE, function (tag, index) {
        if (inComponent) {
            if (tag !== '</' + current.name + '>') {
                return;
            } else {
                inComponent = false;
            }
        }
        var isOpen = tag.charAt(1) !== '/';
        var start = index + tag.length;
        var nextChar = html.charAt(start);
        var parent;

        if (isOpen) {
            level++;

            current = parseTag(tag);
            if (current.type === 'tag' && options.components[current.name]) {
                current.type = 'component';
                inComponent = true;
            }

            if (!current.voidElement && !inComponent && nextChar && nextChar !== '<') {
                current.children.push({
                    type: 'text',
                    content: html.slice(start, html.indexOf('<', start)),
                    parent: current
                });
            }

            byTag[current.tagName] = current;

            // if we're at root, push new base node
            if (level === 0) {
                result.push(current);
            }

            parent = arr[level - 1];

            if (parent) {
                current.prev = parent.children[parent.children.length - 1];
                parent.children[parent.children.length - 1].next = current;
                parent.children.push(current);
                current.parent = parent;
            }

            arr[level] = current;
        }

        if (!isOpen || current.voidElement) {
            level--;
            if (!inComponent && nextChar !== '<' && nextChar) {
                // trailing text node
                arr[level].children.push({
                    type: 'text',
                    content: html.slice(start, html.indexOf('<', start)),
                    parent: arr[level]
                });
            }
        }
    });

    return result;
};

/**
 * Created by zhengqiguang on 2017/6/15.
 * 修改 by  https://github.com/HenrikJoreteg/html-parse-stringify/
 */

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var render = {
    mount: function mount($node, $data) {

        var $newDom = this.generalDom($node.$tplfn($data));

        this.replaceNode($newDom, $node);
    },
    generalDom: function generalDom(domStr) {
        var $temp = document.createElement("div");
        $temp.innerHTML = domStr.trim(); //不然会有多余的空格等东西
        return $temp.childNodes[0];
    },
    replaceNode: function replaceNode(newDom, node) {
        var $el = node.$el;

        $el.parentNode.replaceChild(newDom, $el);

        node.$el = newDom;
    }
};

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var compiler_helper = {
    _c: function _c(tagName, attrs) {
        var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var data = arguments[3];


        console.log(data);
    },
    _t: function _t(text, data) {

        console.log(text, data);
    },

    //
    // generaltplFn(){
    //
    //     let a = new Function("that", "with(that){; return _tt()}");
    //
    //     a(this);
    //
    //
    // },

    generaltplFn: function generaltplFn($ast) {

        var $tempFn = this.generalNode($ast);

        $tempFn = "with(that){return " + $tempFn + "}";

        console.log($tempFn);

        var a = new Function("that", "data", "" + $tempFn);

        console.log(a(this, { a: 1, sdf: "hello", ccc: "nimei" }));

        return {};
    },
    generalNode: function generalNode($node) {
        var _this = this;

        if ($node.dsl && $node.dsl.length) {//存在 dsl

        } else if ($node.type === "tag") {
            return "_c('" + $node.name + "', " + JSON.stringify($node.attrs) + ",[" + $node.children.map(function (item) {
                return _this.generalNode(item);
            }) + "],data)";
        } else if ($node.type === "text") {
            $node.content = $node.content.replace(/\n/g, "");

            return "_t('" + $node.content.trim() + "',data)";
        }
    }
};

var Compiler = function () {
    function Compiler(tpl) {
        classCallCheck(this, Compiler);

        this.$tpl = render.generalDom(tpl);
        this.tpl = this.$tpl.outerHTML;
        this.$ast = htmlParse(tpl);

        compiler_helper.generaltplFn(this.$ast[0]);

        // console.log(htmlStringify(this.$ast));

        // this.init(compiler_helper.generaltplFn(this.tpl));
    }

    createClass(Compiler, [{
        key: "init",
        value: function init(_ref) {
            var tplFn = _ref.tplFn,
                linkArgs = _ref.linkArgs;

            this.tplFn = tplFn;
            this.linkArgs = linkArgs;
        }
    }, {
        key: "rebuild",
        value: function rebuild() {}
    }]);
    return Compiler;
}();

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var EventLoop = {
    d_o: function d_o(fn) {
        var p = Promise.resolve();
        p.then(fn).catch(function (e) {
            console.log(e);
        });
    }
};

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var Node = function () {
    function Node(_ref) {
        var el = _ref.el,
            template = _ref.template,
            data = _ref.data;
        classCallCheck(this, Node);

        this.$data = data;
        this.el = el;
        this.template = template;
        this.$el = selector.s(this.el);

        var $t = selector.s(this.template);
        if ($t) {
            this.$template = $t.innerHTML.trim();
        } else {
            //error
        }
        this.$compiler = new Compiler(this.$template);

        this.$args = this.$compiler.linkArgs;
        this.$tplfn = this.$compiler.tplFn;
    }

    createClass(Node, [{
        key: "update",
        value: function update() {
            EventLoop.d_o(render.mount.bind(render, this, this.$data));
        }
    }]);
    return Node;
}();

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var Watcher = function () {
    function Watcher(data) {
        classCallCheck(this, Watcher);

        this.$data = data;
        this.mountWatcher();
    }

    createClass(Watcher, [{
        key: "mountWatcher",
        value: function mountWatcher() {

            var od = this.$data["_od_"];

            for (var key in this.$data) {

                (function (key) {

                    var timeoutHandler = null;

                    if (key !== "_od_" && !od[key].mounted) {
                        if (!od[key]) {
                            throw new Error("data:" + key + " is init ");
                        }
                        Object.defineProperty(this.$data, key, {
                            get: function get$$1() {
                                return od[key].value;
                            },
                            set: function set$$1(value) {
                                clearTimeout(timeoutHandler);
                                setTimeout(function () {
                                    if (value !== od[key].value) {
                                        var $n = od[key].linkNodes;
                                        od[key].value = value;
                                        for (var i = 0, n; n = $n[i]; i++) {
                                            n.update();
                                        }
                                    }
                                }, 1000 / 60); //一帧节流
                            }
                        });
                        od[key].mounted = true;
                    }
                }).bind(this)(key);
            }
        }
    }, {
        key: "linkNode",
        value: function linkNode($node) {

            for (var i = 0, n; n = $node.$args[i]; i++) {
                if (this.$data[n] && this.$data["_od_"][n] && this.$data["_od_"][n].linkNodes.indexOf($node) === -1) {
                    this.$data["_od_"][n].linkNodes.push($node);
                }
            }
        }
    }, {
        key: "updateData",
        value: function updateData() {}
    }]);
    return Watcher;
}();

/**
 * Created by zhengqiguang on 2017/6/15.
 */

var helper = {
    insertOD: function insertOD($targetData, $data) {

        !$targetData && ($targetData = {});

        for (var key in $data) {
            $targetData[key] = {
                value: $data[key],
                linkNodes: [],
                mounted: false
            };
        }

        return $targetData;
    }
};

var Data = function () {
    function Data() {
        classCallCheck(this, Data);
    }

    createClass(Data, null, [{
        key: "formatData",
        value: function formatData() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            data["_od_"] = helper.insertOD(data["_od_"], data);
            return data;
        }
    }]);
    return Data;
}();

/**
 * Created by zhengqiguang on 2017/6/14.
 */

var QV = function () {
    function QV() {
        var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, QV);

        this._$opt = opt;

        this.formatOption(opt);

        this.mountRoot();
    }

    createClass(QV, [{
        key: "formatOption",
        value: function formatOption(opt) {

            this.$data = Data.formatData(opt.data);

            this.$root = new Node(opt);

            this.$watcher = new Watcher(this.$data);

            this.$watcher.linkNode(this.$root);
        }
    }, {
        key: "mountRoot",
        value: function mountRoot() {
            render.mount(this.$root, this.$data);
        }
    }]);
    return QV;
}();

/**
 * Created by zhengqiguang on 2017/6/14.
 */

return QV;

})));
//# sourceMappingURL=bundle.js.map
