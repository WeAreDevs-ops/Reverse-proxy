/*! For license information please see reactLogin.bundle.min.js.LICENSE.txt */ ! function() {
    var e = {
            8375: function(e, n) {
                "use strict";
                var t = this && this.__spreadArray || function(e, n, t) {
                    if (t || 2 === arguments.length)
                        for (var r, o = 0, i = n.length; o < i; o++) !r && o in n || (r || (r = Array.prototype.slice.call(n, 0, o)), r[o] = n[o]);
                    return e.concat(r || Array.prototype.slice.call(n))
                };
                Object.defineProperty(n, "__esModule", {
                    value: !0
                }), n.dual = n.getEndomorphismMonoid = n.SK = n.hole = n.constVoid = n.constUndefined = n.constNull = n.constFalse = n.constTrue = n.unsafeCoerce = n.apply = n.getRing = n.getSemiring = n.getMonoid = n.getSemigroup = n.getBooleanAlgebra = void 0, n.identity = r, n.constant = o, n.flip = function(e) {
                    return function() {
                        for (var n = [], t = 0; t < arguments.length; t++) n[t] = arguments[t];
                        return n.length > 1 ? e(n[1], n[0]) : function(t) {
                            return e(t)(n[0])
                        }
                    }
                }, n.flow = i, n.tuple = function() {
                    for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
                    return e
                }, n.increment = function(e) {
                    return e + 1
                }, n.decrement = function(e) {
                    return e - 1
                }, n.absurd = a, n.tupled = function(e) {
                    return function(n) {
                        return e.apply(void 0, n)
                    }
                }, n.untupled = function(e) {
                    return function() {
                        for (var n = [], t = 0; t < arguments.length; t++) n[t] = arguments[t];
                        return e(n)
                    }
                }, n.pipe = function(e, n, t, r, o, i, a, u, c) {
                    switch (arguments.length) {
                        case 1:
                            return e;
                        case 2:
                            return n(e);
                        case 3:
                            return t(n(e));
                        case 4:
                            return r(t(n(e)));
                        case 5:
                            return o(r(t(n(e))));
                        case 6:
                            return i(o(r(t(n(e)))));
                        case 7:
                            return a(i(o(r(t(n(e))))));
                        case 8:
                            return u(a(i(o(r(t(n(e)))))));
                        case 9:
                            return c(u(a(i(o(r(t(n(e))))))));
                        default:
                            for (var l = arguments[0], s = 1; s < arguments.length; s++) l = arguments[s](l);
                            return l
                    }
                }, n.not = function(e) {
                    return function(n) {
                        return !e(n)
                    }
                };
                n.getBooleanAlgebra = function(e) {
                    return function() {
                        return {
                            meet: function(n, t) {
                                return function(r) {
                                    return e.meet(n(r), t(r))
                                }
                            },
                            join: function(n, t) {
                                return function(r) {
                                    return e.join(n(r), t(r))
                                }
                            },
                            zero: function() {
                                return e.zero
                            },
                            one: function() {
                                return e.one
                            },
                            implies: function(n, t) {
                                return function(r) {
                                    return e.implies(n(r), t(r))
                                }
                            },
                            not: function(n) {
                                return function(t) {
                                    return e.not(n(t))
                                }
                            }
                        }
                    }
                };
                n.getSemigroup = function(e) {
                    return function() {
                        return {
                            concat: function(n, t) {
                                return function(r) {
                                    return e.concat(n(r), t(r))
                                }
                            }
                        }
                    }
                };
                n.getMonoid = function(e) {
                    var t = (0, n.getSemigroup)(e);
                    return function() {
                        return {
                            concat: t().concat,
                            empty: function() {
                                return e.empty
                            }
                        }
                    }
                };
                n.getSemiring = function(e) {
                    return {
                        add: function(n, t) {
                            return function(r) {
                                return e.add(n(r), t(r))
                            }
                        },
                        zero: function() {
                            return e.zero
                        },
                        mul: function(n, t) {
                            return function(r) {
                                return e.mul(n(r), t(r))
                            }
                        },
                        one: function() {
                            return e.one
                        }
                    }
                };
                n.getRing = function(e) {
                    var t = (0, n.getSemiring)(e);
                    return {
                        add: t.add,
                        mul: t.mul,
                        one: t.one,
                        zero: t.zero,
                        sub: function(n, t) {
                            return function(r) {
                                return e.sub(n(r), t(r))
                            }
                        }
                    }
                };

                function r(e) {
                    return e
                }

                function o(e) {
                    return function() {
                        return e
                    }
                }

                function i(e, n, t, r, o, i, a, u, c) {
                    switch (arguments.length) {
                        case 1:
                            return e;
                        case 2:
                            return function() {
                                return n(e.apply(this, arguments))
                            };
                        case 3:
                            return function() {
                                return t(n(e.apply(this, arguments)))
                            };
                        case 4:
                            return function() {
                                return r(t(n(e.apply(this, arguments))))
                            };
                        case 5:
                            return function() {
                                return o(r(t(n(e.apply(this, arguments)))))
                            };
                        case 6:
                            return function() {
                                return i(o(r(t(n(e.apply(this, arguments))))))
                            };
                        case 7:
                            return function() {
                                return a(i(o(r(t(n(e.apply(this, arguments)))))))
                            };
                        case 8:
                            return function() {
                                return u(a(i(o(r(t(n(e.apply(this, arguments))))))))
                            };
                        case 9:
                            return function() {
                                return c(u(a(i(o(r(t(n(e.apply(this, arguments)))))))))
                            }
                    }
                }

                function a(e) {
                    throw new Error("Called `absurd` function which should be uncallable")
                }
                n.apply = function(e) {
                    return function(n) {
                        return n(e)
                    }
                }, n.unsafeCoerce = r, n.constTrue = o(!0), n.constFalse = o(!1), n.constNull = o(null), n.constUndefined = o(void 0), n.constVoid = n.constUndefined, n.hole = a;
                n.SK = function(e, n) {
                    return n
                };
                n.getEndomorphismMonoid = function() {
                    return {
                        concat: function(e, n) {
                            return i(e, n)
                        },
                        empty: r
                    }
                };
                n.dual = function(e, n) {
                    var r = "number" == typeof e ? function(n) {
                        return n.length >= e
                    } : e;
                    return function() {
                        var e = Array.from(arguments);
                        return r(arguments) ? n.apply(this, e) : function(r) {
                            return n.apply(void 0, t([r], e, !1))
                        }
                    }
                }
            },
            5250: function(e, n, t) {
                var r;
                e = t.nmd(e),
                    function() {
                        var o, i = "Expected a function",
                            a = "__lodash_hash_undefined__",
                            u = "__lodash_placeholder__",
                            c = 16,
                            l = 32,
                            s = 64,
                            f = 128,
                            d = 256,
                            h = 1 / 0,
                            p = 9007199254740991,
                            v = NaN,
                            g = 4294967295,
                            m = [
                                ["ary", f],
                                ["bind", 1],
                                ["bindKey", 2],
                                ["curry", 8],
                                ["curryRight", c],
                                ["flip", 512],
                                ["partial", l],
                                ["partialRight", s],
                                ["rearg", d]
                            ],
                            y = "[object Arguments]",
                            b = "[object Array]",
                            w = "[object Boolean]",
                            S = "[object Date]",
                            _ = "[object Error]",
                            A = "[object Function]",
                            E = "[object GeneratorFunction]",
                            L = "[object Map]",
                            k = "[object Number]",
                            C = "[object Object]",
                            T = "[object Promise]",
                            x = "[object RegExp]",
                            I = "[object Set]",
                            U = "[object String]",
                            P = "[object Symbol]",
                            O = "[object WeakMap]",
                            R = "[object ArrayBuffer]",
                            F = "[object DataView]",
                            D = "[object Float32Array]",
                            N = "[object Float64Array]",
                            j = "[object Int8Array]",
                            M = "[object Int16Array]",
                            B = "[object Int32Array]",
                            z = "[object Uint8Array]",
                            W = "[object Uint8ClampedArray]",
                            V = "[object Uint16Array]",
                            q = "[object Uint32Array]",
                            H = /\b__p \+= '';/g,
                            G = /\b(__p \+=) '' \+/g,
                            $ = /(__e\(.*?\)|\b__t\)) \+\n'';/g,
                            K = /&(?:amp|lt|gt|quot|#39);/g,
                            Y = /[&<>"']/g,
                            Q = RegExp(K.source),
                            J = RegExp(Y.source),
                            Z = /<%-([\s\S]+?)%>/g,
                            X = /<%([\s\S]+?)%>/g,
                            ee = /<%=([\s\S]+?)%>/g,
                            ne = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
                            te = /^\w*$/,
                            re = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
                            oe = /[\\^$.*+?()[\]{}|]/g,
                            ie = RegExp(oe.source),
                            ae = /^\s+/,
                            ue = /\s/,
                            ce = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
                            le = /\{\n\/\* \[wrapped with (.+)\] \*/,
                            se = /,? & /,
                            fe = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,
                            de = /[()=,{}\[\]\/\s]/,
                            he = /\\(\\)?/g,
                            pe = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,
                            ve = /\w*$/,
                            ge = /^[-+]0x[0-9a-f]+$/i,
                            me = /^0b[01]+$/i,
                            ye = /^\[object .+?Constructor\]$/,
                            be = /^0o[0-7]+$/i,
                            we = /^(?:0|[1-9]\d*)$/,
                            Se = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,
                            _e = /($^)/,
                            Ae = /['\n\r\u2028\u2029\\]/g,
                            Ee = "\\ud800-\\udfff",
                            Le = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff",
                            ke = "\\u2700-\\u27bf",
                            Ce = "a-z\\xdf-\\xf6\\xf8-\\xff",
                            Te = "A-Z\\xc0-\\xd6\\xd8-\\xde",
                            xe = "\\ufe0e\\ufe0f",
                            Ie = "\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000",
                            Ue = "['â€™]",
                            Pe = "[" + Ee + "]",
                            Oe = "[" + Ie + "]",
                            Re = "[" + Le + "]",
                            Fe = "\\d+",
                            De = "[" + ke + "]",
                            Ne = "[" + Ce + "]",
                            je = "[^" + Ee + Ie + Fe + ke + Ce + Te + "]",
                            Me = "\\ud83c[\\udffb-\\udfff]",
                            Be = "[^" + Ee + "]",
                            ze = "(?:\\ud83c[\\udde6-\\uddff]){2}",
                            We = "[\\ud800-\\udbff][\\udc00-\\udfff]",
                            Ve = "[" + Te + "]",
                            qe = "\\u200d",
                            He = "(?:" + Ne + "|" + je + ")",
                            Ge = "(?:" + Ve + "|" + je + ")",
                            $e = "(?:['â€™](?:d|ll|m|re|s|t|ve))?",
                            Ke = "(?:['â€™](?:D|LL|M|RE|S|T|VE))?",
                            Ye = "(?:" + Re + "|" + Me + ")" + "?",
                            Qe = "[" + xe + "]?",
                            Je = Qe + Ye + ("(?:" + qe + "(?:" + [Be, ze, We].join("|") + ")" + Qe + Ye + ")*"),
                            Ze = "(?:" + [De, ze, We].join("|") + ")" + Je,
                            Xe = "(?:" + [Be + Re + "?", Re, ze, We, Pe].join("|") + ")",
                            en = RegExp(Ue, "g"),
                            nn = RegExp(Re, "g"),
                            tn = RegExp(Me + "(?=" + Me + ")|" + Xe + Je, "g"),
                            rn = RegExp([Ve + "?" + Ne + "+" + $e + "(?=" + [Oe, Ve, "$"].join("|") + ")", Ge + "+" + Ke + "(?=" + [Oe, Ve + He, "$"].join("|") + ")", Ve + "?" + He + "+" + $e, Ve + "+" + Ke, "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Fe, Ze].join("|"), "g"),
                            on = RegExp("[" + qe + Ee + Le + xe + "]"),
                            an = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,
                            un = ["Array", "Buffer", "DataView", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Map", "Math", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "_", "clearTimeout", "isFinite", "parseInt", "setTimeout"],
                            cn = -1,
                            ln = {};
                        ln[D] = ln[N] = ln[j] = ln[M] = ln[B] = ln[z] = ln[W] = ln[V] = ln[q] = !0, ln[y] = ln[b] = ln[R] = ln[w] = ln[F] = ln[S] = ln[_] = ln[A] = ln[L] = ln[k] = ln[C] = ln[x] = ln[I] = ln[U] = ln[O] = !1;
                        var sn = {};
                        sn[y] = sn[b] = sn[R] = sn[F] = sn[w] = sn[S] = sn[D] = sn[N] = sn[j] = sn[M] = sn[B] = sn[L] = sn[k] = sn[C] = sn[x] = sn[I] = sn[U] = sn[P] = sn[z] = sn[W] = sn[V] = sn[q] = !0, sn[_] = sn[A] = sn[O] = !1;
                        var fn = {
                                "\\": "\\",
                                "'": "'",
                                "\n": "n",
                                "\r": "r",
                                "\u2028": "u2028",
                                "\u2029": "u2029"
                            },
                            dn = parseFloat,
                            hn = parseInt,
                            pn = "object" == typeof t.g && t.g && t.g.Object === Object && t.g,
                            vn = "object" == typeof self && self && self.Object === Object && self,
                            gn = pn || vn || Function("return this")(),
                            mn = n && !n.nodeType && n,
                            yn = mn && e && !e.nodeType && e,
                            bn = yn && yn.exports === mn,
                            wn = bn && pn.process,
                            Sn = function() {
                                try {
                                    var e = yn && yn.require && yn.require("util").types;
                                    return e || wn && wn.binding && wn.binding("util")
                                } catch (e) {}
                            }(),
                            _n = Sn && Sn.isArrayBuffer,
                            An = Sn && Sn.isDate,
                            En = Sn && Sn.isMap,
                            Ln = Sn && Sn.isRegExp,
                            kn = Sn && Sn.isSet,
                            Cn = Sn && Sn.isTypedArray;

                        function Tn(e, n, t) {
                            switch (t.length) {
                                case 0:
                                    return e.call(n);
                                case 1:
                                    return e.call(n, t[0]);
                                case 2:
                                    return e.call(n, t[0], t[1]);
                                case 3:
                                    return e.call(n, t[0], t[1], t[2])
                            }
                            return e.apply(n, t)
                        }

                        function xn(e, n, t, r) {
                            for (var o = -1, i = null == e ? 0 : e.length; ++o < i;) {
                                var a = e[o];
                                n(r, a, t(a), e)
                            }
                            return r
                        }

                        function In(e, n) {
                            for (var t = -1, r = null == e ? 0 : e.length; ++t < r && !1 !== n(e[t], t, e););
                            return e
                        }

                        function Un(e, n) {
                            for (var t = null == e ? 0 : e.length; t-- && !1 !== n(e[t], t, e););
                            return e
                        }

                        function Pn(e, n) {
                            for (var t = -1, r = null == e ? 0 : e.length; ++t < r;)
                                if (!n(e[t], t, e)) return !1;
                            return !0
                        }

                        function On(e, n) {
                            for (var t = -1, r = null == e ? 0 : e.length, o = 0, i = []; ++t < r;) {
                                var a = e[t];
                                n(a, t, e) && (i[o++] = a)
                            }
                            return i
                        }

                        function Rn(e, n) {
                            return !!(null == e ? 0 : e.length) && qn(e, n, 0) > -1
                        }

                        function Fn(e, n, t) {
                            for (var r = -1, o = null == e ? 0 : e.length; ++r < o;)
                                if (t(n, e[r])) return !0;
                            return !1
                        }

                        function Dn(e, n) {
                            for (var t = -1, r = null == e ? 0 : e.length, o = Array(r); ++t < r;) o[t] = n(e[t], t, e);
                            return o
                        }

                        function Nn(e, n) {
                            for (var t = -1, r = n.length, o = e.length; ++t < r;) e[o + t] = n[t];
                            return e
                        }

                        function jn(e, n, t, r) {
                            var o = -1,
                                i = null == e ? 0 : e.length;
                            for (r && i && (t = e[++o]); ++o < i;) t = n(t, e[o], o, e);
                            return t
                        }

                        function Mn(e, n, t, r) {
                            var o = null == e ? 0 : e.length;
                            for (r && o && (t = e[--o]); o--;) t = n(t, e[o], o, e);
                            return t
                        }

                        function Bn(e, n) {
                            for (var t = -1, r = null == e ? 0 : e.length; ++t < r;)
                                if (n(e[t], t, e)) return !0;
                            return !1
                        }
                        var zn = Kn("length");

                        function Wn(e, n, t) {
                            var r;
                            return t(e, (function(e, t, o) {
                                if (n(e, t, o)) return r = t, !1
                            })), r
                        }

                        function Vn(e, n, t, r) {
                            for (var o = e.length, i = t + (r ? 1 : -1); r ? i-- : ++i < o;)
                                if (n(e[i], i, e)) return i;
                            return -1
                        }

                        function qn(e, n, t) {
                            return n == n ? function(e, n, t) {
                                var r = t - 1,
                                    o = e.length;
                                for (; ++r < o;)
                                    if (e[r] === n) return r;
                                return -1
                            }(e, n, t) : Vn(e, Gn, t)
                        }

                        function Hn(e, n, t, r) {
                            for (var o = t - 1, i = e.length; ++o < i;)
                                if (r(e[o], n)) return o;
                            return -1
                        }

                        function Gn(e) {
                            return e != e
                        }

                        function $n(e, n) {
                            var t = null == e ? 0 : e.length;
                            return t ? Jn(e, n) / t : v
                        }

                        function Kn(e) {
                            return function(n) {
                                return null == n ? o : n[e]
                            }
                        }

                        function Yn(e) {
                            return function(n) {
                                return null == e ? o : e[n]
                            }
                        }

                        function Qn(e, n, t, r, o) {
                            return o(e, (function(e, o, i) {
                                t = r ? (r = !1, e) : n(t, e, o, i)
                            })), t
                        }

                        function Jn(e, n) {
                            for (var t, r = -1, i = e.length; ++r < i;) {
                                var a = n(e[r]);
                                a !== o && (t = t === o ? a : t + a)
                            }
                            return t
                        }

                        function Zn(e, n) {
                            for (var t = -1, r = Array(e); ++t < e;) r[t] = n(t);
                            return r
                        }

                        function Xn(e) {
                            return e ? e.slice(0, gt(e) + 1).replace(ae, "") : e
                        }

                        function et(e) {
                            return function(n) {
                                return e(n)
                            }
                        }

                        function nt(e, n) {
                            return Dn(n, (function(n) {
                                return e[n]
                            }))
                        }

                        function tt(e, n) {
                            return e.has(n)
                        }

                        function rt(e, n) {
                            for (var t = -1, r = e.length; ++t < r && qn(n, e[t], 0) > -1;);
                            return t
                        }

                        function ot(e, n) {
                            for (var t = e.length; t-- && qn(n, e[t], 0) > -1;);
                            return t
                        }
                        var it = Yn({
                                "Ã€": "A",
                                "Ã": "A",
                                "Ã‚": "A",
                                "Ãƒ": "A",
                                "Ã„": "A",
                                "Ã…": "A",
                                "Ã ": "a",
                                "Ã¡": "a",
                                "Ã¢": "a",
                                "Ã£": "a",
                                "Ã¤": "a",
                                "Ã¥": "a",
                                "Ã‡": "C",
                                "Ã§": "c",
                                "Ã": "D",
                                "Ã°": "d",
                                "Ãˆ": "E",
                                "Ã‰": "E",
                                "ÃŠ": "E",
                                "Ã‹": "E",
                                "Ã¨": "e",
                                "Ã©": "e",
                                "Ãª": "e",
                                "Ã«": "e",
                                "ÃŒ": "I",
                                "Ã": "I",
                                "ÃŽ": "I",
                                "Ã": "I",
                                "Ã¬": "i",
                                "Ã­": "i",
                                "Ã®": "i",
                                "Ã¯": "i",
                                "Ã‘": "N",
                                "Ã±": "n",
                                "Ã’": "O",
                                "Ã“": "O",
                                "Ã”": "O",
                                "Ã•": "O",
                                "Ã–": "O",
                                "Ã˜": "O",
                                "Ã²": "o",
                                "Ã³": "o",
                                "Ã´": "o",
                                "Ãµ": "o",
                                "Ã¶": "o",
                                "Ã¸": "o",
                                "Ã™": "U",
                                "Ãš": "U",
                                "Ã›": "U",
                                "Ãœ": "U",
                                "Ã¹": "u",
                                "Ãº": "u",
                                "Ã»": "u",
                                "Ã¼": "u",
                                "Ã": "Y",
                                "Ã½": "y",
                                "Ã¿": "y",
                                "Ã†": "Ae",
                                "Ã¦": "ae",
                                "Ãž": "Th",
                                "Ã¾": "th",
                                "ÃŸ": "ss",
                                "Ä€": "A",
                                "Ä‚": "A",
                                "Ä„": "A",
                                "Ä": "a",
                                "Äƒ": "a",
                                "Ä…": "a",
                                "Ä†": "C",
                                "Äˆ": "C",
                                "ÄŠ": "C",
                                "ÄŒ": "C",
                                "Ä‡": "c",
                                "Ä‰": "c",
                                "Ä‹": "c",
                                "Ä": "c",
                                "ÄŽ": "D",
                                "Ä": "D",
                                "Ä": "d",
                                "Ä‘": "d",
                                "Ä’": "E",
                                "Ä”": "E",
                                "Ä–": "E",
                                "Ä˜": "E",
                                "Äš": "E",
                                "Ä“": "e",
                                "Ä•": "e",
                                "Ä—": "e",
                                "Ä™": "e",
                                "Ä›": "e",
                                "Äœ": "G",
                                "Äž": "G",
                                "Ä ": "G",
                                "Ä¢": "G",
                                "Ä": "g",
                                "ÄŸ": "g",
                                "Ä¡": "g",
                                "Ä£": "g",
                                "Ä¤": "H",
                                "Ä¦": "H",
                                "Ä¥": "h",
                                "Ä§": "h",
                                "Ä¨": "I",
                                "Äª": "I",
                                "Ä¬": "I",
                                "Ä®": "I",
                                "Ä°": "I",
                                "Ä©": "i",
                                "Ä«": "i",
                                "Ä­": "i",
                                "Ä¯": "i",
                                "Ä±": "i",
                                "Ä´": "J",
                                "Äµ": "j",
                                "Ä¶": "K",
                                "Ä·": "k",
                                "Ä¸": "k",
                                "Ä¹": "L",
                                "Ä»": "L",
                                "Ä½": "L",
                                "Ä¿": "L",
                                "Å": "L",
                                "Äº": "l",
                                "Ä¼": "l",
                                "Ä¾": "l",
                                "Å€": "l",
                                "Å‚": "l",
                                "Åƒ": "N",
                                "Å…": "N",
                                "Å‡": "N",
                                "ÅŠ": "N",
                                "Å„": "n",
                                "Å†": "n",
                                "Åˆ": "n",
                                "Å‹": "n",
                                "ÅŒ": "O",
                                "ÅŽ": "O",
                                "Å": "O",
                                "Å": "o",
                                "Å": "o",
                                "Å‘": "o",
                                "Å”": "R",
                                "Å–": "R",
                                "Å˜": "R",
                                "Å•": "r",
                                "Å—": "r",
                                "Å™": "r",
                                "Åš": "S",
                                "Åœ": "S",
                                "Åž": "S",
                                "Å ": "S",
                                "Å›": "s",
                                "Å": "s",
                                "ÅŸ": "s",
                                "Å¡": "s",
                                "Å¢": "T",
                                "Å¤": "T",
                                "Å¦": "T",
                                "Å£": "t",
                                "Å¥": "t",
                                "Å§": "t",
                                "Å¨": "U",
                                "Åª": "U",
                                "Å¬": "U",
                                "Å®": "U",
                                "Å°": "U",
                                "Å²": "U",
                                "Å©": "u",
                                "Å«": "u",
                                "Å­": "u",
                                "Å¯": "u",
                                "Å±": "u",
                                "Å³": "u",
                                "Å´": "W",
                                "Åµ": "w",
                                "Å¶": "Y",
                                "Å·": "y",
                                "Å¸": "Y",
                                "Å¹": "Z",
                                "Å»": "Z",
                                "Å½": "Z",
                                "Åº": "z",
                                "Å¼": "z",
                                "Å¾": "z",
                                "Ä²": "IJ",
                                "Ä³": "ij",
                                "Å’": "Oe",
                                "Å“": "oe",
                                "Å‰": "'n",
                                "Å¿": "s"
                            }),
                            at = Yn({
                                "&": "&amp;",
                                "<": "&lt;",
                                ">": "&gt;",
                                '"': "&quot;",
                                "'": "&#39;"
                            });

                        function ut(e) {
                            return "\\" + fn[e]
                        }

                        function ct(e) {
                            return on.test(e)
                        }

                        function lt(e) {
                            var n = -1,
                                t = Array(e.size);
                            return e.forEach((function(e, r) {
                                t[++n] = [r, e]
                            })), t
                        }

                        function st(e, n) {
                            return function(t) {
                                return e(n(t))
                            }
                        }

                        function ft(e, n) {
                            for (var t = -1, r = e.length, o = 0, i = []; ++t < r;) {
                                var a = e[t];
                                a !== n && a !== u || (e[t] = u, i[o++] = t)
                            }
                            return i
                        }

                        function dt(e) {
                            var n = -1,
                                t = Array(e.size);
                            return e.forEach((function(e) {
                                t[++n] = e
                            })), t
                        }

                        function ht(e) {
                            var n = -1,
                                t = Array(e.size);
                            return e.forEach((function(e) {
                                t[++n] = [e, e]
                            })), t
                        }

                        function pt(e) {
                            return ct(e) ? function(e) {
                                var n = tn.lastIndex = 0;
                                for (; tn.test(e);) ++n;
                                return n
                            }(e) : zn(e)
                        }

                        function vt(e) {
                            return ct(e) ? function(e) {
                                return e.match(tn) || []
                            }(e) : function(e) {
                                return e.split("")
                            }(e)
                        }

                        function gt(e) {
                            for (var n = e.length; n-- && ue.test(e.charAt(n)););
                            return n
                        }
                        var mt = Yn({
                            "&amp;": "&",
                            "&lt;": "<",
                            "&gt;": ">",
                            "&quot;": '"',
                            "&#39;": "'"
                        });
                        var yt = function e(n) {
                            var t, r = (n = null == n ? gn : yt.defaults(gn.Object(), n, yt.pick(gn, un))).Array,
                                ue = n.Date,
                                Ee = n.Error,
                                Le = n.Function,
                                ke = n.Math,
                                Ce = n.Object,
                                Te = n.RegExp,
                                xe = n.String,
                                Ie = n.TypeError,
                                Ue = r.prototype,
                                Pe = Le.prototype,
                                Oe = Ce.prototype,
                                Re = n["__core-js_shared__"],
                                Fe = Pe.toString,
                                De = Oe.hasOwnProperty,
                                Ne = 0,
                                je = (t = /[^.]+$/.exec(Re && Re.keys && Re.keys.IE_PROTO || "")) ? "Symbol(src)_1." + t : "",
                                Me = Oe.toString,
                                Be = Fe.call(Ce),
                                ze = gn._,
                                We = Te("^" + Fe.call(De).replace(oe, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"),
                                Ve = bn ? n.Buffer : o,
                                qe = n.Symbol,
                                He = n.Uint8Array,
                                Ge = Ve ? Ve.allocUnsafe : o,
                                $e = st(Ce.getPrototypeOf, Ce),
                                Ke = Ce.create,
                                Ye = Oe.propertyIsEnumerable,
                                Qe = Ue.splice,
                                Je = qe ? qe.isConcatSpreadable : o,
                                Ze = qe ? qe.iterator : o,
                                Xe = qe ? qe.toStringTag : o,
                                tn = function() {
                                    try {
                                        var e = hi(Ce, "defineProperty");
                                        return e({}, "", {}), e
                                    } catch (e) {}
                                }(),
                                on = n.clearTimeout !== gn.clearTimeout && n.clearTimeout,
                                fn = ue && ue.now !== gn.Date.now && ue.now,
                                pn = n.setTimeout !== gn.setTimeout && n.setTimeout,
                                vn = ke.ceil,
                                mn = ke.floor,
                                yn = Ce.getOwnPropertySymbols,
                                wn = Ve ? Ve.isBuffer : o,
                                Sn = n.isFinite,
                                zn = Ue.join,
                                Yn = st(Ce.keys, Ce),
                                bt = ke.max,
                                wt = ke.min,
                                St = ue.now,
                                _t = n.parseInt,
                                At = ke.random,
                                Et = Ue.reverse,
                                Lt = hi(n, "DataView"),
                                kt = hi(n, "Map"),
                                Ct = hi(n, "Promise"),
                                Tt = hi(n, "Set"),
                                xt = hi(n, "WeakMap"),
                                It = hi(Ce, "create"),
                                Ut = xt && new xt,
                                Pt = {},
                                Ot = Mi(Lt),
                                Rt = Mi(kt),
                                Ft = Mi(Ct),
                                Dt = Mi(Tt),
                                Nt = Mi(xt),
                                jt = qe ? qe.prototype : o,
                                Mt = jt ? jt.valueOf : o,
                                Bt = jt ? jt.toString : o;

                            function zt(e) {
                                if (tu(e) && !Ha(e) && !(e instanceof Ht)) {
                                    if (e instanceof qt) return e;
                                    if (De.call(e, "__wrapped__")) return Bi(e)
                                }
                                return new qt(e)
                            }
                            var Wt = function() {
                                function e() {}
                                return function(n) {
                                    if (!nu(n)) return {};
                                    if (Ke) return Ke(n);
                                    e.prototype = n;
                                    var t = new e;
                                    return e.prototype = o, t
                                }
                            }();

                            function Vt() {}

                            function qt(e, n) {
                                this.__wrapped__ = e, this.__actions__ = [], this.__chain__ = !!n, this.__index__ = 0, this.__values__ = o
                            }

                            function Ht(e) {
                                this.__wrapped__ = e, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = g, this.__views__ = []
                            }

                            function Gt(e) {
                                var n = -1,
                                    t = null == e ? 0 : e.length;
                                for (this.clear(); ++n < t;) {
                                    var r = e[n];
                                    this.set(r[0], r[1])
                                }
                            }

                            function $t(e) {
                                var n = -1,
                                    t = null == e ? 0 : e.length;
                                for (this.clear(); ++n < t;) {
                                    var r = e[n];
                                    this.set(r[0], r[1])
                                }
                            }

                            function Kt(e) {
                                var n = -1,
                                    t = null == e ? 0 : e.length;
                                for (this.clear(); ++n < t;) {
                                    var r = e[n];
                                    this.set(r[0], r[1])
                                }
                            }

                            function Yt(e) {
                                var n = -1,
                                    t = null == e ? 0 : e.length;
                                for (this.__data__ = new Kt; ++n < t;) this.add(e[n])
                            }

                            function Qt(e) {
                                var n = this.__data__ = new $t(e);
                                this.size = n.size
                            }

                            function Jt(e, n) {
                                var t = Ha(e),
                                    r = !t && qa(e),
                                    o = !t && !r && Ya(e),
                                    i = !t && !r && !o && su(e),
                                    a = t || r || o || i,
                                    u = a ? Zn(e.length, xe) : [],
                                    c = u.length;
                                for (var l in e) !n && !De.call(e, l) || a && ("length" == l || o && ("offset" == l || "parent" == l) || i && ("buffer" == l || "byteLength" == l || "byteOffset" == l) || wi(l, c)) || u.push(l);
                                return u
                            }

                            function Zt(e) {
                                var n = e.length;
                                return n ? e[Yr(0, n - 1)] : o
                            }

                            function Xt(e, n) {
                                return Di(Uo(e), cr(n, 0, e.length))
                            }

                            function er(e) {
                                return Di(Uo(e))
                            }

                            function nr(e, n, t) {
                                (t !== o && !za(e[n], t) || t === o && !(n in e)) && ar(e, n, t)
                            }

                            function tr(e, n, t) {
                                var r = e[n];
                                De.call(e, n) && za(r, t) && (t !== o || n in e) || ar(e, n, t)
                            }

                            function rr(e, n) {
                                for (var t = e.length; t--;)
                                    if (za(e[t][0], n)) return t;
                                return -1
                            }

                            function or(e, n, t, r) {
                                return hr(e, (function(e, o, i) {
                                    n(r, e, t(e), i)
                                })), r
                            }

                            function ir(e, n) {
                                return e && Po(n, Pu(n), e)
                            }

                            function ar(e, n, t) {
                                "__proto__" == n && tn ? tn(e, n, {
                                    configurable: !0,
                                    enumerable: !0,
                                    value: t,
                                    writable: !0
                                }) : e[n] = t
                            }

                            function ur(e, n) {
                                for (var t = -1, i = n.length, a = r(i), u = null == e; ++t < i;) a[t] = u ? o : Cu(e, n[t]);
                                return a
                            }

                            function cr(e, n, t) {
                                return e == e && (t !== o && (e = e <= t ? e : t), n !== o && (e = e >= n ? e : n)), e
                            }

                            function lr(e, n, t, r, i, a) {
                                var u, c = 1 & n,
                                    l = 2 & n,
                                    s = 4 & n;
                                if (t && (u = i ? t(e, r, i, a) : t(e)), u !== o) return u;
                                if (!nu(e)) return e;
                                var f = Ha(e);
                                if (f) {
                                    if (u = function(e) {
                                            var n = e.length,
                                                t = new e.constructor(n);
                                            n && "string" == typeof e[0] && De.call(e, "index") && (t.index = e.index, t.input = e.input);
                                            return t
                                        }(e), !c) return Uo(e, u)
                                } else {
                                    var d = gi(e),
                                        h = d == A || d == E;
                                    if (Ya(e)) return Lo(e, c);
                                    if (d == C || d == y || h && !i) {
                                        if (u = l || h ? {} : yi(e), !c) return l ? function(e, n) {
                                            return Po(e, vi(e), n)
                                        }(e, function(e, n) {
                                            return e && Po(n, Ou(n), e)
                                        }(u, e)) : function(e, n) {
                                            return Po(e, pi(e), n)
                                        }(e, ir(u, e))
                                    } else {
                                        if (!sn[d]) return i ? e : {};
                                        u = function(e, n, t) {
                                            var r = e.constructor;
                                            switch (n) {
                                                case R:
                                                    return ko(e);
                                                case w:
                                                case S:
                                                    return new r(+e);
                                                case F:
                                                    return function(e, n) {
                                                        var t = n ? ko(e.buffer) : e.buffer;
                                                        return new e.constructor(t, e.byteOffset, e.byteLength)
                                                    }(e, t);
                                                case D:
                                                case N:
                                                case j:
                                                case M:
                                                case B:
                                                case z:
                                                case W:
                                                case V:
                                                case q:
                                                    return Co(e, t);
                                                case L:
                                                    return new r;
                                                case k:
                                                case U:
                                                    return new r(e);
                                                case x:
                                                    return function(e) {
                                                        var n = new e.constructor(e.source, ve.exec(e));
                                                        return n.lastIndex = e.lastIndex, n
                                                    }(e);
                                                case I:
                                                    return new r;
                                                case P:
                                                    return o = e, Mt ? Ce(Mt.call(o)) : {}
                                            }
                                            var o
                                        }(e, d, c)
                                    }
                                }
                                a || (a = new Qt);
                                var p = a.get(e);
                                if (p) return p;
                                a.set(e, u), uu(e) ? e.forEach((function(r) {
                                    u.add(lr(r, n, t, r, e, a))
                                })) : ru(e) && e.forEach((function(r, o) {
                                    u.set(o, lr(r, n, t, o, e, a))
                                }));
                                var v = f ? o : (s ? l ? ai : ii : l ? Ou : Pu)(e);
                                return In(v || e, (function(r, o) {
                                    v && (r = e[o = r]), tr(u, o, lr(r, n, t, o, e, a))
                                })), u
                            }

                            function sr(e, n, t) {
                                var r = t.length;
                                if (null == e) return !r;
                                for (e = Ce(e); r--;) {
                                    var i = t[r],
                                        a = n[i],
                                        u = e[i];
                                    if (u === o && !(i in e) || !a(u)) return !1
                                }
                                return !0
                            }

                            function fr(e, n, t) {
                                if ("function" != typeof e) throw new Ie(i);
                                return Pi((function() {
                                    e.apply(o, t)
                                }), n)
                            }

                            function dr(e, n, t, r) {
                                var o = -1,
                                    i = Rn,
                                    a = !0,
                                    u = e.length,
                                    c = [],
                                    l = n.length;
                                if (!u) return c;
                                t && (n = Dn(n, et(t))), r ? (i = Fn, a = !1) : n.length >= 200 && (i = tt, a = !1, n = new Yt(n));
                                e: for (; ++o < u;) {
                                    var s = e[o],
                                        f = null == t ? s : t(s);
                                    if (s = r || 0 !== s ? s : 0, a && f == f) {
                                        for (var d = l; d--;)
                                            if (n[d] === f) continue e;
                                        c.push(s)
                                    } else i(n, f, r) || c.push(s)
                                }
                                return c
                            }
                            zt.templateSettings = {
                                escape: Z,
                                evaluate: X,
                                interpolate: ee,
                                variable: "",
                                imports: {
                                    _: zt
                                }
                            }, zt.prototype = Vt.prototype, zt.prototype.constructor = zt, qt.prototype = Wt(Vt.prototype), qt.prototype.constructor = qt, Ht.prototype = Wt(Vt.prototype), Ht.prototype.constructor = Ht, Gt.prototype.clear = function() {
                                this.__data__ = It ? It(null) : {}, this.size = 0
                            }, Gt.prototype.delete = function(e) {
                                var n = this.has(e) && delete this.__data__[e];
                                return this.size -= n ? 1 : 0, n
                            }, Gt.prototype.get = function(e) {
                                var n = this.__data__;
                                if (It) {
                                    var t = n[e];
                                    return t === a ? o : t
                                }
                                return De.call(n, e) ? n[e] : o
                            }, Gt.prototype.has = function(e) {
                                var n = this.__data__;
                                return It ? n[e] !== o : De.call(n, e)
                            }, Gt.prototype.set = function(e, n) {
                                var t = this.__data__;
                                return this.size += this.has(e) ? 0 : 1, t[e] = It && n === o ? a : n, this
                            }, $t.prototype.clear = function() {
                                this.__data__ = [], this.size = 0
                            }, $t.prototype.delete = function(e) {
                                var n = this.__data__,
                                    t = rr(n, e);
                                return !(t < 0) && (t == n.length - 1 ? n.pop() : Qe.call(n, t, 1), --this.size, !0)
                            }, $t.prototype.get = function(e) {
                                var n = this.__data__,
                                    t = rr(n, e);
                                return t < 0 ? o : n[t][1]
                            }, $t.prototype.has = function(e) {
                                return rr(this.__data__, e) > -1
                            }, $t.prototype.set = function(e, n) {
                                var t = this.__data__,
                                    r = rr(t, e);
                                return r < 0 ? (++this.size, t.push([e, n])) : t[r][1] = n, this
                            }, Kt.prototype.clear = function() {
                                this.size = 0, this.__data__ = {
                                    hash: new Gt,
                                    map: new(kt || $t),
                                    string: new Gt
                                }
                            }, Kt.prototype.delete = function(e) {
                                var n = fi(this, e).delete(e);
                                return this.size -= n ? 1 : 0, n
                            }, Kt.prototype.get = function(e) {
                                return fi(this, e).get(e)
                            }, Kt.prototype.has = function(e) {
                                return fi(this, e).has(e)
                            }, Kt.prototype.set = function(e, n) {
                                var t = fi(this, e),
                                    r = t.size;
                                return t.set(e, n), this.size += t.size == r ? 0 : 1, this
                            }, Yt.prototype.add = Yt.prototype.push = function(e) {
                                return this.__data__.set(e, a), this
                            }, Yt.prototype.has = function(e) {
                                return this.__data__.has(e)
                            }, Qt.prototype.clear = function() {
                                this.__data__ = new $t, this.size = 0
                            }, Qt.prototype.delete = function(e) {
                                var n = this.__data__,
                                    t = n.delete(e);
                                return this.size = n.size, t
                            }, Qt.prototype.get = function(e) {
                                return this.__data__.get(e)
                            }, Qt.prototype.has = function(e) {
                                return this.__data__.has(e)
                            }, Qt.prototype.set = function(e, n) {
                                var t = this.__data__;
                                if (t instanceof $t) {
                                    var r = t.__data__;
                                    if (!kt || r.length < 199) return r.push([e, n]), this.size = ++t.size, this;
                                    t = this.__data__ = new Kt(r)
                                }
                                return t.set(e, n), this.size = t.size, this
                            };
                            var hr = Fo(Sr),
                                pr = Fo(_r, !0);

                            function vr(e, n) {
                                var t = !0;
                                return hr(e, (function(e, r, o) {
                                    return t = !!n(e, r, o)
                                })), t
                            }

                            function gr(e, n, t) {
                                for (var r = -1, i = e.length; ++r < i;) {
                                    var a = e[r],
                                        u = n(a);
                                    if (null != u && (c === o ? u == u && !lu(u) : t(u, c))) var c = u,
                                        l = a
                                }
                                return l
                            }

                            function mr(e, n) {
                                var t = [];
                                return hr(e, (function(e, r, o) {
                                    n(e, r, o) && t.push(e)
                                })), t
                            }

                            function yr(e, n, t, r, o) {
                                var i = -1,
                                    a = e.length;
                                for (t || (t = bi), o || (o = []); ++i < a;) {
                                    var u = e[i];
                                    n > 0 && t(u) ? n > 1 ? yr(u, n - 1, t, r, o) : Nn(o, u) : r || (o[o.length] = u)
                                }
                                return o
                            }
                            var br = Do(),
                                wr = Do(!0);

                            function Sr(e, n) {
                                return e && br(e, n, Pu)
                            }

                            function _r(e, n) {
                                return e && wr(e, n, Pu)
                            }

                            function Ar(e, n) {
                                return On(n, (function(n) {
                                    return Za(e[n])
                                }))
                            }

                            function Er(e, n) {
                                for (var t = 0, r = (n = So(n, e)).length; null != e && t < r;) e = e[ji(n[t++])];
                                return t && t == r ? e : o
                            }

                            function Lr(e, n, t) {
                                var r = n(e);
                                return Ha(e) ? r : Nn(r, t(e))
                            }

                            function kr(e) {
                                return null == e ? e === o ? "[object Undefined]" : "[object Null]" : Xe && Xe in Ce(e) ? function(e) {
                                    var n = De.call(e, Xe),
                                        t = e[Xe];
                                    try {
                                        e[Xe] = o;
                                        var r = !0
                                    } catch (e) {}
                                    var i = Me.call(e);
                                    r && (n ? e[Xe] = t : delete e[Xe]);
                                    return i
                                }(e) : function(e) {
                                    return Me.call(e)
                                }(e)
                            }

                            function Cr(e, n) {
                                return e > n
                            }

                            function Tr(e, n) {
                                return null != e && De.call(e, n)
                            }

                            function xr(e, n) {
                                return null != e && n in Ce(e)
                            }

                            function Ir(e, n, t) {
                                for (var i = t ? Fn : Rn, a = e[0].length, u = e.length, c = u, l = r(u), s = 1 / 0, f = []; c--;) {
                                    var d = e[c];
                                    c && n && (d = Dn(d, et(n))), s = wt(d.length, s), l[c] = !t && (n || a >= 120 && d.length >= 120) ? new Yt(c && d) : o
                                }
                                d = e[0];
                                var h = -1,
                                    p = l[0];
                                e: for (; ++h < a && f.length < s;) {
                                    var v = d[h],
                                        g = n ? n(v) : v;
                                    if (v = t || 0 !== v ? v : 0, !(p ? tt(p, g) : i(f, g, t))) {
                                        for (c = u; --c;) {
                                            var m = l[c];
                                            if (!(m ? tt(m, g) : i(e[c], g, t))) continue e
                                        }
                                        p && p.push(g), f.push(v)
                                    }
                                }
                                return f
                            }

                            function Ur(e, n, t) {
                                var r = null == (e = xi(e, n = So(n, e))) ? e : e[ji(Ji(n))];
                                return null == r ? o : Tn(r, e, t)
                            }

                            function Pr(e) {
                                return tu(e) && kr(e) == y
                            }

                            function Or(e, n, t, r, i) {
                                return e === n || (null == e || null == n || !tu(e) && !tu(n) ? e != e && n != n : function(e, n, t, r, i, a) {
                                    var u = Ha(e),
                                        c = Ha(n),
                                        l = u ? b : gi(e),
                                        s = c ? b : gi(n),
                                        f = (l = l == y ? C : l) == C,
                                        d = (s = s == y ? C : s) == C,
                                        h = l == s;
                                    if (h && Ya(e)) {
                                        if (!Ya(n)) return !1;
                                        u = !0, f = !1
                                    }
                                    if (h && !f) return a || (a = new Qt), u || su(e) ? ri(e, n, t, r, i, a) : function(e, n, t, r, o, i, a) {
                                        switch (t) {
                                            case F:
                                                if (e.byteLength != n.byteLength || e.byteOffset != n.byteOffset) return !1;
                                                e = e.buffer, n = n.buffer;
                                            case R:
                                                return !(e.byteLength != n.byteLength || !i(new He(e), new He(n)));
                                            case w:
                                            case S:
                                            case k:
                                                return za(+e, +n);
                                            case _:
                                                return e.name == n.name && e.message == n.message;
                                            case x:
                                            case U:
                                                return e == n + "";
                                            case L:
                                                var u = lt;
                                            case I:
                                                var c = 1 & r;
                                                if (u || (u = dt), e.size != n.size && !c) return !1;
                                                var l = a.get(e);
                                                if (l) return l == n;
                                                r |= 2, a.set(e, n);
                                                var s = ri(u(e), u(n), r, o, i, a);
                                                return a.delete(e), s;
                                            case P:
                                                if (Mt) return Mt.call(e) == Mt.call(n)
                                        }
                                        return !1
                                    }(e, n, l, t, r, i, a);
                                    if (!(1 & t)) {
                                        var p = f && De.call(e, "__wrapped__"),
                                            v = d && De.call(n, "__wrapped__");
                                        if (p || v) {
                                            var g = p ? e.value() : e,
                                                m = v ? n.value() : n;
                                            return a || (a = new Qt), i(g, m, t, r, a)
                                        }
                                    }
                                    if (!h) return !1;
                                    return a || (a = new Qt),
                                        function(e, n, t, r, i, a) {
                                            var u = 1 & t,
                                                c = ii(e),
                                                l = c.length,
                                                s = ii(n),
                                                f = s.length;
                                            if (l != f && !u) return !1;
                                            var d = l;
                                            for (; d--;) {
                                                var h = c[d];
                                                if (!(u ? h in n : De.call(n, h))) return !1
                                            }
                                            var p = a.get(e),
                                                v = a.get(n);
                                            if (p && v) return p == n && v == e;
                                            var g = !0;
                                            a.set(e, n), a.set(n, e);
                                            var m = u;
                                            for (; ++d < l;) {
                                                var y = e[h = c[d]],
                                                    b = n[h];
                                                if (r) var w = u ? r(b, y, h, n, e, a) : r(y, b, h, e, n, a);
                                                if (!(w === o ? y === b || i(y, b, t, r, a) : w)) {
                                                    g = !1;
                                                    break
                                                }
                                                m || (m = "constructor" == h)
                                            }
                                            if (g && !m) {
                                                var S = e.constructor,
                                                    _ = n.constructor;
                                                S == _ || !("constructor" in e) || !("constructor" in n) || "function" == typeof S && S instanceof S && "function" == typeof _ && _ instanceof _ || (g = !1)
                                            }
                                            return a.delete(e), a.delete(n), g
                                        }(e, n, t, r, i, a)
                                }(e, n, t, r, Or, i))
                            }

                            function Rr(e, n, t, r) {
                                var i = t.length,
                                    a = i,
                                    u = !r;
                                if (null == e) return !a;
                                for (e = Ce(e); i--;) {
                                    var c = t[i];
                                    if (u && c[2] ? c[1] !== e[c[0]] : !(c[0] in e)) return !1
                                }
                                for (; ++i < a;) {
                                    var l = (c = t[i])[0],
                                        s = e[l],
                                        f = c[1];
                                    if (u && c[2]) {
                                        if (s === o && !(l in e)) return !1
                                    } else {
                                        var d = new Qt;
                                        if (r) var h = r(s, f, l, e, n, d);
                                        if (!(h === o ? Or(f, s, 3, r, d) : h)) return !1
                                    }
                                }
                                return !0
                            }

                            function Fr(e) {
                                return !(!nu(e) || (n = e, je && je in n)) && (Za(e) ? We : ye).test(Mi(e));
                                var n
                            }

                            function Dr(e) {
                                return "function" == typeof e ? e : null == e ? oc : "object" == typeof e ? Ha(e) ? Wr(e[0], e[1]) : zr(e) : hc(e)
                            }

                            function Nr(e) {
                                if (!Li(e)) return Yn(e);
                                var n = [];
                                for (var t in Ce(e)) De.call(e, t) && "constructor" != t && n.push(t);
                                return n
                            }

                            function jr(e) {
                                if (!nu(e)) return function(e) {
                                    var n = [];
                                    if (null != e)
                                        for (var t in Ce(e)) n.push(t);
                                    return n
                                }(e);
                                var n = Li(e),
                                    t = [];
                                for (var r in e)("constructor" != r || !n && De.call(e, r)) && t.push(r);
                                return t
                            }

                            function Mr(e, n) {
                                return e < n
                            }

                            function Br(e, n) {
                                var t = -1,
                                    o = $a(e) ? r(e.length) : [];
                                return hr(e, (function(e, r, i) {
                                    o[++t] = n(e, r, i)
                                })), o
                            }

                            function zr(e) {
                                var n = di(e);
                                return 1 == n.length && n[0][2] ? Ci(n[0][0], n[0][1]) : function(t) {
                                    return t === e || Rr(t, e, n)
                                }
                            }

                            function Wr(e, n) {
                                return _i(e) && ki(n) ? Ci(ji(e), n) : function(t) {
                                    var r = Cu(t, e);
                                    return r === o && r === n ? Tu(t, e) : Or(n, r, 3)
                                }
                            }

                            function Vr(e, n, t, r, i) {
                                e !== n && br(n, (function(a, u) {
                                    if (i || (i = new Qt), nu(a)) ! function(e, n, t, r, i, a, u) {
                                        var c = Ii(e, t),
                                            l = Ii(n, t),
                                            s = u.get(l);
                                        if (s) return void nr(e, t, s);
                                        var f = a ? a(c, l, t + "", e, n, u) : o,
                                            d = f === o;
                                        if (d) {
                                            var h = Ha(l),
                                                p = !h && Ya(l),
                                                v = !h && !p && su(l);
                                            f = l, h || p || v ? Ha(c) ? f = c : Ka(c) ? f = Uo(c) : p ? (d = !1, f = Lo(l, !0)) : v ? (d = !1, f = Co(l, !0)) : f = [] : iu(l) || qa(l) ? (f = c, qa(c) ? f = yu(c) : nu(c) && !Za(c) || (f = yi(l))) : d = !1
                                        }
                                        d && (u.set(l, f), i(f, l, r, a, u), u.delete(l));
                                        nr(e, t, f)
                                    }(e, n, u, t, Vr, r, i);
                                    else {
                                        var c = r ? r(Ii(e, u), a, u + "", e, n, i) : o;
                                        c === o && (c = a), nr(e, u, c)
                                    }
                                }), Ou)
                            }

                            function qr(e, n) {
                                var t = e.length;
                                if (t) return wi(n += n < 0 ? t : 0, t) ? e[n] : o
                            }

                            function Hr(e, n, t) {
                                n = n.length ? Dn(n, (function(e) {
                                    return Ha(e) ? function(n) {
                                        return Er(n, 1 === e.length ? e[0] : e)
                                    } : e
                                })) : [oc];
                                var r = -1;
                                n = Dn(n, et(si()));
                                var o = Br(e, (function(e, t, o) {
                                    var i = Dn(n, (function(n) {
                                        return n(e)
                                    }));
                                    return {
                                        criteria: i,
                                        index: ++r,
                                        value: e
                                    }
                                }));
                                return function(e, n) {
                                    var t = e.length;
                                    for (e.sort(n); t--;) e[t] = e[t].value;
                                    return e
                                }(o, (function(e, n) {
                                    return function(e, n, t) {
                                        var r = -1,
                                            o = e.criteria,
                                            i = n.criteria,
                                            a = o.length,
                                            u = t.length;
                                        for (; ++r < a;) {
                                            var c = To(o[r], i[r]);
                                            if (c) return r >= u ? c : c * ("desc" == t[r] ? -1 : 1)
                                        }
                                        return e.index - n.index
                                    }(e, n, t)
                                }))
                            }

                            function Gr(e, n, t) {
                                for (var r = -1, o = n.length, i = {}; ++r < o;) {
                                    var a = n[r],
                                        u = Er(e, a);
                                    t(u, a) && eo(i, So(a, e), u)
                                }
                                return i
                            }

                            function $r(e, n, t, r) {
                                var o = r ? Hn : qn,
                                    i = -1,
                                    a = n.length,
                                    u = e;
                                for (e === n && (n = Uo(n)), t && (u = Dn(e, et(t))); ++i < a;)
                                    for (var c = 0, l = n[i], s = t ? t(l) : l;
                                        (c = o(u, s, c, r)) > -1;) u !== e && Qe.call(u, c, 1), Qe.call(e, c, 1);
                                return e
                            }

                            function Kr(e, n) {
                                for (var t = e ? n.length : 0, r = t - 1; t--;) {
                                    var o = n[t];
                                    if (t == r || o !== i) {
                                        var i = o;
                                        wi(o) ? Qe.call(e, o, 1) : ho(e, o)
                                    }
                                }
                                return e
                            }

                            function Yr(e, n) {
                                return e + mn(At() * (n - e + 1))
                            }

                            function Qr(e, n) {
                                var t = "";
                                if (!e || n < 1 || n > p) return t;
                                do {
                                    n % 2 && (t += e), (n = mn(n / 2)) && (e += e)
                                } while (n);
                                return t
                            }

                            function Jr(e, n) {
                                return Oi(Ti(e, n, oc), e + "")
                            }

                            function Zr(e) {
                                return Zt(zu(e))
                            }

                            function Xr(e, n) {
                                var t = zu(e);
                                return Di(t, cr(n, 0, t.length))
                            }

                            function eo(e, n, t, r) {
                                if (!nu(e)) return e;
                                for (var i = -1, a = (n = So(n, e)).length, u = a - 1, c = e; null != c && ++i < a;) {
                                    var l = ji(n[i]),
                                        s = t;
                                    if ("__proto__" === l || "constructor" === l || "prototype" === l) return e;
                                    if (i != u) {
                                        var f = c[l];
                                        (s = r ? r(f, l, c) : o) === o && (s = nu(f) ? f : wi(n[i + 1]) ? [] : {})
                                    }
                                    tr(c, l, s), c = c[l]
                                }
                                return e
                            }
                            var no = Ut ? function(e, n) {
                                    return Ut.set(e, n), e
                                } : oc,
                                to = tn ? function(e, n) {
                                    return tn(e, "toString", {
                                        configurable: !0,
                                        enumerable: !1,
                                        value: nc(n),
                                        writable: !0
                                    })
                                } : oc;

                            function ro(e) {
                                return Di(zu(e))
                            }

                            function oo(e, n, t) {
                                var o = -1,
                                    i = e.length;
                                n < 0 && (n = -n > i ? 0 : i + n), (t = t > i ? i : t) < 0 && (t += i), i = n > t ? 0 : t - n >>> 0, n >>>= 0;
                                for (var a = r(i); ++o < i;) a[o] = e[o + n];
                                return a
                            }

                            function io(e, n) {
                                var t;
                                return hr(e, (function(e, r, o) {
                                    return !(t = n(e, r, o))
                                })), !!t
                            }

                            function ao(e, n, t) {
                                var r = 0,
                                    o = null == e ? r : e.length;
                                if ("number" == typeof n && n == n && o <= 2147483647) {
                                    for (; r < o;) {
                                        var i = r + o >>> 1,
                                            a = e[i];
                                        null !== a && !lu(a) && (t ? a <= n : a < n) ? r = i + 1 : o = i
                                    }
                                    return o
                                }
                                return uo(e, n, oc, t)
                            }

                            function uo(e, n, t, r) {
                                var i = 0,
                                    a = null == e ? 0 : e.length;
                                if (0 === a) return 0;
                                for (var u = (n = t(n)) != n, c = null === n, l = lu(n), s = n === o; i < a;) {
                                    var f = mn((i + a) / 2),
                                        d = t(e[f]),
                                        h = d !== o,
                                        p = null === d,
                                        v = d == d,
                                        g = lu(d);
                                    if (u) var m = r || v;
                                    else m = s ? v && (r || h) : c ? v && h && (r || !p) : l ? v && h && !p && (r || !g) : !p && !g && (r ? d <= n : d < n);
                                    m ? i = f + 1 : a = f
                                }
                                return wt(a, 4294967294)
                            }

                            function co(e, n) {
                                for (var t = -1, r = e.length, o = 0, i = []; ++t < r;) {
                                    var a = e[t],
                                        u = n ? n(a) : a;
                                    if (!t || !za(u, c)) {
                                        var c = u;
                                        i[o++] = 0 === a ? 0 : a
                                    }
                                }
                                return i
                            }

                            function lo(e) {
                                return "number" == typeof e ? e : lu(e) ? v : +e
                            }

                            function so(e) {
                                if ("string" == typeof e) return e;
                                if (Ha(e)) return Dn(e, so) + "";
                                if (lu(e)) return Bt ? Bt.call(e) : "";
                                var n = e + "";
                                return "0" == n && 1 / e == -1 / 0 ? "-0" : n
                            }

                            function fo(e, n, t) {
                                var r = -1,
                                    o = Rn,
                                    i = e.length,
                                    a = !0,
                                    u = [],
                                    c = u;
                                if (t) a = !1, o = Fn;
                                else if (i >= 200) {
                                    var l = n ? null : Jo(e);
                                    if (l) return dt(l);
                                    a = !1, o = tt, c = new Yt
                                } else c = n ? [] : u;
                                e: for (; ++r < i;) {
                                    var s = e[r],
                                        f = n ? n(s) : s;
                                    if (s = t || 0 !== s ? s : 0, a && f == f) {
                                        for (var d = c.length; d--;)
                                            if (c[d] === f) continue e;
                                        n && c.push(f), u.push(s)
                                    } else o(c, f, t) || (c !== u && c.push(f), u.push(s))
                                }
                                return u
                            }

                            function ho(e, n) {
                                return null == (e = xi(e, n = So(n, e))) || delete e[ji(Ji(n))]
                            }

                            function po(e, n, t, r) {
                                return eo(e, n, t(Er(e, n)), r)
                            }

                            function vo(e, n, t, r) {
                                for (var o = e.length, i = r ? o : -1;
                                    (r ? i-- : ++i < o) && n(e[i], i, e););
                                return t ? oo(e, r ? 0 : i, r ? i + 1 : o) : oo(e, r ? i + 1 : 0, r ? o : i)
                            }

                            function go(e, n) {
                                var t = e;
                                return t instanceof Ht && (t = t.value()), jn(n, (function(e, n) {
                                    return n.func.apply(n.thisArg, Nn([e], n.args))
                                }), t)
                            }

                            function mo(e, n, t) {
                                var o = e.length;
                                if (o < 2) return o ? fo(e[0]) : [];
                                for (var i = -1, a = r(o); ++i < o;)
                                    for (var u = e[i], c = -1; ++c < o;) c != i && (a[i] = dr(a[i] || u, e[c], n, t));
                                return fo(yr(a, 1), n, t)
                            }

                            function yo(e, n, t) {
                                for (var r = -1, i = e.length, a = n.length, u = {}; ++r < i;) {
                                    var c = r < a ? n[r] : o;
                                    t(u, e[r], c)
                                }
                                return u
                            }

                            function bo(e) {
                                return Ka(e) ? e : []
                            }

                            function wo(e) {
                                return "function" == typeof e ? e : oc
                            }

                            function So(e, n) {
                                return Ha(e) ? e : _i(e, n) ? [e] : Ni(bu(e))
                            }
                            var _o = Jr;

                            function Ao(e, n, t) {
                                var r = e.length;
                                return t = t === o ? r : t, !n && t >= r ? e : oo(e, n, t)
                            }
                            var Eo = on || function(e) {
                                return gn.clearTimeout(e)
                            };

                            function Lo(e, n) {
                                if (n) return e.slice();
                                var t = e.length,
                                    r = Ge ? Ge(t) : new e.constructor(t);
                                return e.copy(r), r
                            }

                            function ko(e) {
                                var n = new e.constructor(e.byteLength);
                                return new He(n).set(new He(e)), n
                            }

                            function Co(e, n) {
                                var t = n ? ko(e.buffer) : e.buffer;
                                return new e.constructor(t, e.byteOffset, e.length)
                            }

                            function To(e, n) {
                                if (e !== n) {
                                    var t = e !== o,
                                        r = null === e,
                                        i = e == e,
                                        a = lu(e),
                                        u = n !== o,
                                        c = null === n,
                                        l = n == n,
                                        s = lu(n);
                                    if (!c && !s && !a && e > n || a && u && l && !c && !s || r && u && l || !t && l || !i) return 1;
                                    if (!r && !a && !s && e < n || s && t && i && !r && !a || c && t && i || !u && i || !l) return -1
                                }
                                return 0
                            }

                            function xo(e, n, t, o) {
                                for (var i = -1, a = e.length, u = t.length, c = -1, l = n.length, s = bt(a - u, 0), f = r(l + s), d = !o; ++c < l;) f[c] = n[c];
                                for (; ++i < u;)(d || i < a) && (f[t[i]] = e[i]);
                                for (; s--;) f[c++] = e[i++];
                                return f
                            }

                            function Io(e, n, t, o) {
                                for (var i = -1, a = e.length, u = -1, c = t.length, l = -1, s = n.length, f = bt(a - c, 0), d = r(f + s), h = !o; ++i < f;) d[i] = e[i];
                                for (var p = i; ++l < s;) d[p + l] = n[l];
                                for (; ++u < c;)(h || i < a) && (d[p + t[u]] = e[i++]);
                                return d
                            }

                            function Uo(e, n) {
                                var t = -1,
                                    o = e.length;
                                for (n || (n = r(o)); ++t < o;) n[t] = e[t];
                                return n
                            }

                            function Po(e, n, t, r) {
                                var i = !t;
                                t || (t = {});
                                for (var a = -1, u = n.length; ++a < u;) {
                                    var c = n[a],
                                        l = r ? r(t[c], e[c], c, t, e) : o;
                                    l === o && (l = e[c]), i ? ar(t, c, l) : tr(t, c, l)
                                }
                                return t
                            }

                            function Oo(e, n) {
                                return function(t, r) {
                                    var o = Ha(t) ? xn : or,
                                        i = n ? n() : {};
                                    return o(t, e, si(r, 2), i)
                                }
                            }

                            function Ro(e) {
                                return Jr((function(n, t) {
                                    var r = -1,
                                        i = t.length,
                                        a = i > 1 ? t[i - 1] : o,
                                        u = i > 2 ? t[2] : o;
                                    for (a = e.length > 3 && "function" == typeof a ? (i--, a) : o, u && Si(t[0], t[1], u) && (a = i < 3 ? o : a, i = 1), n = Ce(n); ++r < i;) {
                                        var c = t[r];
                                        c && e(n, c, r, a)
                                    }
                                    return n
                                }))
                            }

                            function Fo(e, n) {
                                return function(t, r) {
                                    if (null == t) return t;
                                    if (!$a(t)) return e(t, r);
                                    for (var o = t.length, i = n ? o : -1, a = Ce(t);
                                        (n ? i-- : ++i < o) && !1 !== r(a[i], i, a););
                                    return t
                                }
                            }

                            function Do(e) {
                                return function(n, t, r) {
                                    for (var o = -1, i = Ce(n), a = r(n), u = a.length; u--;) {
                                        var c = a[e ? u : ++o];
                                        if (!1 === t(i[c], c, i)) break
                                    }
                                    return n
                                }
                            }

                            function No(e) {
                                return function(n) {
                                    var t = ct(n = bu(n)) ? vt(n) : o,
                                        r = t ? t[0] : n.charAt(0),
                                        i = t ? Ao(t, 1).join("") : n.slice(1);
                                    return r[e]() + i
                                }
                            }

                            function jo(e) {
                                return function(n) {
                                    return jn(Zu(qu(n).replace(en, "")), e, "")
                                }
                            }

                            function Mo(e) {
                                return function() {
                                    var n = arguments;
                                    switch (n.length) {
                                        case 0:
                                            return new e;
                                        case 1:
                                            return new e(n[0]);
                                        case 2:
                                            return new e(n[0], n[1]);
                                        case 3:
                                            return new e(n[0], n[1], n[2]);
                                        case 4:
                                            return new e(n[0], n[1], n[2], n[3]);
                                        case 5:
                                            return new e(n[0], n[1], n[2], n[3], n[4]);
                                        case 6:
                                            return new e(n[0], n[1], n[2], n[3], n[4], n[5]);
                                        case 7:
                                            return new e(n[0], n[1], n[2], n[3], n[4], n[5], n[6])
                                    }
                                    var t = Wt(e.prototype),
                                        r = e.apply(t, n);
                                    return nu(r) ? r : t
                                }
                            }

                            function Bo(e) {
                                return function(n, t, r) {
                                    var i = Ce(n);
                                    if (!$a(n)) {
                                        var a = si(t, 3);
                                        n = Pu(n), t = function(e) {
                                            return a(i[e], e, i)
                                        }
                                    }
                                    var u = e(n, t, r);
                                    return u > -1 ? i[a ? n[u] : u] : o
                                }
                            }

                            function zo(e) {
                                return oi((function(n) {
                                    var t = n.length,
                                        r = t,
                                        a = qt.prototype.thru;
                                    for (e && n.reverse(); r--;) {
                                        var u = n[r];
                                        if ("function" != typeof u) throw new Ie(i);
                                        if (a && !c && "wrapper" == ci(u)) var c = new qt([], !0)
                                    }
                                    for (r = c ? r : t; ++r < t;) {
                                        var l = ci(u = n[r]),
                                            s = "wrapper" == l ? ui(u) : o;
                                        c = s && Ai(s[0]) && 424 == s[1] && !s[4].length && 1 == s[9] ? c[ci(s[0])].apply(c, s[3]) : 1 == u.length && Ai(u) ? c[l]() : c.thru(u)
                                    }
                                    return function() {
                                        var e = arguments,
                                            r = e[0];
                                        if (c && 1 == e.length && Ha(r)) return c.plant(r).value();
                                        for (var o = 0, i = t ? n[o].apply(this, e) : r; ++o < t;) i = n[o].call(this, i);
                                        return i
                                    }
                                }))
                            }

                            function Wo(e, n, t, i, a, u, c, l, s, d) {
                                var h = n & f,
                                    p = 1 & n,
                                    v = 2 & n,
                                    g = 24 & n,
                                    m = 512 & n,
                                    y = v ? o : Mo(e);
                                return function f() {
                                    for (var b = arguments.length, w = r(b), S = b; S--;) w[S] = arguments[S];
                                    if (g) var _ = li(f),
                                        A = function(e, n) {
                                            for (var t = e.length, r = 0; t--;) e[t] === n && ++r;
                                            return r
                                        }(w, _);
                                    if (i && (w = xo(w, i, a, g)), u && (w = Io(w, u, c, g)), b -= A, g && b < d) {
                                        var E = ft(w, _);
                                        return Yo(e, n, Wo, f.placeholder, t, w, E, l, s, d - b)
                                    }
                                    var L = p ? t : this,
                                        k = v ? L[e] : e;
                                    return b = w.length, l ? w = function(e, n) {
                                        var t = e.length,
                                            r = wt(n.length, t),
                                            i = Uo(e);
                                        for (; r--;) {
                                            var a = n[r];
                                            e[r] = wi(a, t) ? i[a] : o
                                        }
                                        return e
                                    }(w, l) : m && b > 1 && w.reverse(), h && s < b && (w.length = s), this && this !== gn && this instanceof f && (k = y || Mo(k)), k.apply(L, w)
                                }
                            }

                            function Vo(e, n) {
                                return function(t, r) {
                                    return function(e, n, t, r) {
                                        return Sr(e, (function(e, o, i) {
                                            n(r, t(e), o, i)
                                        })), r
                                    }(t, e, n(r), {})
                                }
                            }

                            function qo(e, n) {
                                return function(t, r) {
                                    var i;
                                    if (t === o && r === o) return n;
                                    if (t !== o && (i = t), r !== o) {
                                        if (i === o) return r;
                                        "string" == typeof t || "string" == typeof r ? (t = so(t), r = so(r)) : (t = lo(t), r = lo(r)), i = e(t, r)
                                    }
                                    return i
                                }
                            }

                            function Ho(e) {
                                return oi((function(n) {
                                    return n = Dn(n, et(si())), Jr((function(t) {
                                        var r = this;
                                        return e(n, (function(e) {
                                            return Tn(e, r, t)
                                        }))
                                    }))
                                }))
                            }

                            function Go(e, n) {
                                var t = (n = n === o ? " " : so(n)).length;
                                if (t < 2) return t ? Qr(n, e) : n;
                                var r = Qr(n, vn(e / pt(n)));
                                return ct(n) ? Ao(vt(r), 0, e).join("") : r.slice(0, e)
                            }

                            function $o(e) {
                                return function(n, t, i) {
                                    return i && "number" != typeof i && Si(n, t, i) && (t = i = o), n = pu(n), t === o ? (t = n, n = 0) : t = pu(t),
                                        function(e, n, t, o) {
                                            for (var i = -1, a = bt(vn((n - e) / (t || 1)), 0), u = r(a); a--;) u[o ? a : ++i] = e, e += t;
                                            return u
                                        }(n, t, i = i === o ? n < t ? 1 : -1 : pu(i), e)
                                }
                            }

                            function Ko(e) {
                                return function(n, t) {
                                    return "string" == typeof n && "string" == typeof t || (n = mu(n), t = mu(t)), e(n, t)
                                }
                            }

                            function Yo(e, n, t, r, i, a, u, c, f, d) {
                                var h = 8 & n;
                                n |= h ? l : s, 4 & (n &= ~(h ? s : l)) || (n &= -4);
                                var p = [e, n, i, h ? a : o, h ? u : o, h ? o : a, h ? o : u, c, f, d],
                                    v = t.apply(o, p);
                                return Ai(e) && Ui(v, p), v.placeholder = r, Ri(v, e, n)
                            }

                            function Qo(e) {
                                var n = ke[e];
                                return function(e, t) {
                                    if (e = mu(e), (t = null == t ? 0 : wt(vu(t), 292)) && Sn(e)) {
                                        var r = (bu(e) + "e").split("e");
                                        return +((r = (bu(n(r[0] + "e" + (+r[1] + t))) + "e").split("e"))[0] + "e" + (+r[1] - t))
                                    }
                                    return n(e)
                                }
                            }
                            var Jo = Tt && 1 / dt(new Tt([, -0]))[1] == h ? function(e) {
                                return new Tt(e)
                            } : lc;

                            function Zo(e) {
                                return function(n) {
                                    var t = gi(n);
                                    return t == L ? lt(n) : t == I ? ht(n) : function(e, n) {
                                        return Dn(n, (function(n) {
                                            return [n, e[n]]
                                        }))
                                    }(n, e(n))
                                }
                            }

                            function Xo(e, n, t, a, h, p, v, g) {
                                var m = 2 & n;
                                if (!m && "function" != typeof e) throw new Ie(i);
                                var y = a ? a.length : 0;
                                if (y || (n &= -97, a = h = o), v = v === o ? v : bt(vu(v), 0), g = g === o ? g : vu(g), y -= h ? h.length : 0, n & s) {
                                    var b = a,
                                        w = h;
                                    a = h = o
                                }
                                var S = m ? o : ui(e),
                                    _ = [e, n, t, a, h, b, w, p, v, g];
                                if (S && function(e, n) {
                                        var t = e[1],
                                            r = n[1],
                                            o = t | r,
                                            i = o < 131,
                                            a = r == f && 8 == t || r == f && t == d && e[7].length <= n[8] || 384 == r && n[7].length <= n[8] && 8 == t;
                                        if (!i && !a) return e;
                                        1 & r && (e[2] = n[2], o |= 1 & t ? 0 : 4);
                                        var c = n[3];
                                        if (c) {
                                            var l = e[3];
                                            e[3] = l ? xo(l, c, n[4]) : c, e[4] = l ? ft(e[3], u) : n[4]
                                        }(c = n[5]) && (l = e[5], e[5] = l ? Io(l, c, n[6]) : c, e[6] = l ? ft(e[5], u) : n[6]);
                                        (c = n[7]) && (e[7] = c);
                                        r & f && (e[8] = null == e[8] ? n[8] : wt(e[8], n[8]));
                                        null == e[9] && (e[9] = n[9]);
                                        e[0] = n[0], e[1] = o
                                    }(_, S), e = _[0], n = _[1], t = _[2], a = _[3], h = _[4], !(g = _[9] = _[9] === o ? m ? 0 : e.length : bt(_[9] - y, 0)) && 24 & n && (n &= -25), n && 1 != n) A = 8 == n || n == c ? function(e, n, t) {
                                    var i = Mo(e);
                                    return function a() {
                                        for (var u = arguments.length, c = r(u), l = u, s = li(a); l--;) c[l] = arguments[l];
                                        var f = u < 3 && c[0] !== s && c[u - 1] !== s ? [] : ft(c, s);
                                        return (u -= f.length) < t ? Yo(e, n, Wo, a.placeholder, o, c, f, o, o, t - u) : Tn(this && this !== gn && this instanceof a ? i : e, this, c)
                                    }
                                }(e, n, g) : n != l && 33 != n || h.length ? Wo.apply(o, _) : function(e, n, t, o) {
                                    var i = 1 & n,
                                        a = Mo(e);
                                    return function n() {
                                        for (var u = -1, c = arguments.length, l = -1, s = o.length, f = r(s + c), d = this && this !== gn && this instanceof n ? a : e; ++l < s;) f[l] = o[l];
                                        for (; c--;) f[l++] = arguments[++u];
                                        return Tn(d, i ? t : this, f)
                                    }
                                }(e, n, t, a);
                                else var A = function(e, n, t) {
                                    var r = 1 & n,
                                        o = Mo(e);
                                    return function n() {
                                        return (this && this !== gn && this instanceof n ? o : e).apply(r ? t : this, arguments)
                                    }
                                }(e, n, t);
                                return Ri((S ? no : Ui)(A, _), e, n)
                            }

                            function ei(e, n, t, r) {
                                return e === o || za(e, Oe[t]) && !De.call(r, t) ? n : e
                            }

                            function ni(e, n, t, r, i, a) {
                                return nu(e) && nu(n) && (a.set(n, e), Vr(e, n, o, ni, a), a.delete(n)), e
                            }

                            function ti(e) {
                                return iu(e) ? o : e
                            }

                            function ri(e, n, t, r, i, a) {
                                var u = 1 & t,
                                    c = e.length,
                                    l = n.length;
                                if (c != l && !(u && l > c)) return !1;
                                var s = a.get(e),
                                    f = a.get(n);
                                if (s && f) return s == n && f == e;
                                var d = -1,
                                    h = !0,
                                    p = 2 & t ? new Yt : o;
                                for (a.set(e, n), a.set(n, e); ++d < c;) {
                                    var v = e[d],
                                        g = n[d];
                                    if (r) var m = u ? r(g, v, d, n, e, a) : r(v, g, d, e, n, a);
                                    if (m !== o) {
                                        if (m) continue;
                                        h = !1;
                                        break
                                    }
                                    if (p) {
                                        if (!Bn(n, (function(e, n) {
                                                if (!tt(p, n) && (v === e || i(v, e, t, r, a))) return p.push(n)
                                            }))) {
                                            h = !1;
                                            break
                                        }
                                    } else if (v !== g && !i(v, g, t, r, a)) {
                                        h = !1;
                                        break
                                    }
                                }
                                return a.delete(e), a.delete(n), h
                            }

                            function oi(e) {
                                return Oi(Ti(e, o, Gi), e + "")
                            }

                            function ii(e) {
                                return Lr(e, Pu, pi)
                            }

                            function ai(e) {
                                return Lr(e, Ou, vi)
                            }
                            var ui = Ut ? function(e) {
                                return Ut.get(e)
                            } : lc;

                            function ci(e) {
                                for (var n = e.name + "", t = Pt[n], r = De.call(Pt, n) ? t.length : 0; r--;) {
                                    var o = t[r],
                                        i = o.func;
                                    if (null == i || i == e) return o.name
                                }
                                return n
                            }

                            function li(e) {
                                return (De.call(zt, "placeholder") ? zt : e).placeholder
                            }

                            function si() {
                                var e = zt.iteratee || ic;
                                return e = e === ic ? Dr : e, arguments.length ? e(arguments[0], arguments[1]) : e
                            }

                            function fi(e, n) {
                                var t, r, o = e.__data__;
                                return ("string" == (r = typeof(t = n)) || "number" == r || "symbol" == r || "boolean" == r ? "__proto__" !== t : null === t) ? o["string" == typeof n ? "string" : "hash"] : o.map
                            }

                            function di(e) {
                                for (var n = Pu(e), t = n.length; t--;) {
                                    var r = n[t],
                                        o = e[r];
                                    n[t] = [r, o, ki(o)]
                                }
                                return n
                            }

                            function hi(e, n) {
                                var t = function(e, n) {
                                    return null == e ? o : e[n]
                                }(e, n);
                                return Fr(t) ? t : o
                            }
                            var pi = yn ? function(e) {
                                    return null == e ? [] : (e = Ce(e), On(yn(e), (function(n) {
                                        return Ye.call(e, n)
                                    })))
                                } : gc,
                                vi = yn ? function(e) {
                                    for (var n = []; e;) Nn(n, pi(e)), e = $e(e);
                                    return n
                                } : gc,
                                gi = kr;

                            function mi(e, n, t) {
                                for (var r = -1, o = (n = So(n, e)).length, i = !1; ++r < o;) {
                                    var a = ji(n[r]);
                                    if (!(i = null != e && t(e, a))) break;
                                    e = e[a]
                                }
                                return i || ++r != o ? i : !!(o = null == e ? 0 : e.length) && eu(o) && wi(a, o) && (Ha(e) || qa(e))
                            }

                            function yi(e) {
                                return "function" != typeof e.constructor || Li(e) ? {} : Wt($e(e))
                            }

                            function bi(e) {
                                return Ha(e) || qa(e) || !!(Je && e && e[Je])
                            }

                            function wi(e, n) {
                                var t = typeof e;
                                return !!(n = null == n ? p : n) && ("number" == t || "symbol" != t && we.test(e)) && e > -1 && e % 1 == 0 && e < n
                            }

                            function Si(e, n, t) {
                                if (!nu(t)) return !1;
                                var r = typeof n;
                                return !!("number" == r ? $a(t) && wi(n, t.length) : "string" == r && n in t) && za(t[n], e)
                            }

                            function _i(e, n) {
                                if (Ha(e)) return !1;
                                var t = typeof e;
                                return !("number" != t && "symbol" != t && "boolean" != t && null != e && !lu(e)) || (te.test(e) || !ne.test(e) || null != n && e in Ce(n))
                            }

                            function Ai(e) {
                                var n = ci(e),
                                    t = zt[n];
                                if ("function" != typeof t || !(n in Ht.prototype)) return !1;
                                if (e === t) return !0;
                                var r = ui(t);
                                return !!r && e === r[0]
                            }(Lt && gi(new Lt(new ArrayBuffer(1))) != F || kt && gi(new kt) != L || Ct && gi(Ct.resolve()) != T || Tt && gi(new Tt) != I || xt && gi(new xt) != O) && (gi = function(e) {
                                var n = kr(e),
                                    t = n == C ? e.constructor : o,
                                    r = t ? Mi(t) : "";
                                if (r) switch (r) {
                                    case Ot:
                                        return F;
                                    case Rt:
                                        return L;
                                    case Ft:
                                        return T;
                                    case Dt:
                                        return I;
                                    case Nt:
                                        return O
                                }
                                return n
                            });
                            var Ei = Re ? Za : mc;

                            function Li(e) {
                                var n = e && e.constructor;
                                return e === ("function" == typeof n && n.prototype || Oe)
                            }

                            function ki(e) {
                                return e == e && !nu(e)
                            }

                            function Ci(e, n) {
                                return function(t) {
                                    return null != t && (t[e] === n && (n !== o || e in Ce(t)))
                                }
                            }

                            function Ti(e, n, t) {
                                return n = bt(n === o ? e.length - 1 : n, 0),
                                    function() {
                                        for (var o = arguments, i = -1, a = bt(o.length - n, 0), u = r(a); ++i < a;) u[i] = o[n + i];
                                        i = -1;
                                        for (var c = r(n + 1); ++i < n;) c[i] = o[i];
                                        return c[n] = t(u), Tn(e, this, c)
                                    }
                            }

                            function xi(e, n) {
                                return n.length < 2 ? e : Er(e, oo(n, 0, -1))
                            }

                            function Ii(e, n) {
                                if (("constructor" !== n || "function" != typeof e[n]) && "__proto__" != n) return e[n]
                            }
                            var Ui = Fi(no),
                                Pi = pn || function(e, n) {
                                    return gn.setTimeout(e, n)
                                },
                                Oi = Fi(to);

                            function Ri(e, n, t) {
                                var r = n + "";
                                return Oi(e, function(e, n) {
                                    var t = n.length;
                                    if (!t) return e;
                                    var r = t - 1;
                                    return n[r] = (t > 1 ? "& " : "") + n[r], n = n.join(t > 2 ? ", " : " "), e.replace(ce, "{\n/* [wrapped with " + n + "] */\n")
                                }(r, function(e, n) {
                                    return In(m, (function(t) {
                                        var r = "_." + t[0];
                                        n & t[1] && !Rn(e, r) && e.push(r)
                                    })), e.sort()
                                }(function(e) {
                                    var n = e.match(le);
                                    return n ? n[1].split(se) : []
                                }(r), t)))
                            }

                            function Fi(e) {
                                var n = 0,
                                    t = 0;
                                return function() {
                                    var r = St(),
                                        i = 16 - (r - t);
                                    if (t = r, i > 0) {
                                        if (++n >= 800) return arguments[0]
                                    } else n = 0;
                                    return e.apply(o, arguments)
                                }
                            }

                            function Di(e, n) {
                                var t = -1,
                                    r = e.length,
                                    i = r - 1;
                                for (n = n === o ? r : n; ++t < n;) {
                                    var a = Yr(t, i),
                                        u = e[a];
                                    e[a] = e[t], e[t] = u
                                }
                                return e.length = n, e
                            }
                            var Ni = function(e) {
                                var n = Fa(e, (function(e) {
                                        return 500 === t.size && t.clear(), e
                                    })),
                                    t = n.cache;
                                return n
                            }((function(e) {
                                var n = [];
                                return 46 === e.charCodeAt(0) && n.push(""), e.replace(re, (function(e, t, r, o) {
                                    n.push(r ? o.replace(he, "$1") : t || e)
                                })), n
                            }));

                            function ji(e) {
                                if ("string" == typeof e || lu(e)) return e;
                                var n = e + "";
                                return "0" == n && 1 / e == -1 / 0 ? "-0" : n
                            }

                            function Mi(e) {
                                if (null != e) {
                                    try {
                                        return Fe.call(e)
                                    } catch (e) {}
                                    try {
                                        return e + ""
                                    } catch (e) {}
                                }
                                return ""
                            }

                            function Bi(e) {
                                if (e instanceof Ht) return e.clone();
                                var n = new qt(e.__wrapped__, e.__chain__);
                                return n.__actions__ = Uo(e.__actions__), n.__index__ = e.__index__, n.__values__ = e.__values__, n
                            }
                            var zi = Jr((function(e, n) {
                                    return Ka(e) ? dr(e, yr(n, 1, Ka, !0)) : []
                                })),
                                Wi = Jr((function(e, n) {
                                    var t = Ji(n);
                                    return Ka(t) && (t = o), Ka(e) ? dr(e, yr(n, 1, Ka, !0), si(t, 2)) : []
                                })),
                                Vi = Jr((function(e, n) {
                                    var t = Ji(n);
                                    return Ka(t) && (t = o), Ka(e) ? dr(e, yr(n, 1, Ka, !0), o, t) : []
                                }));

                            function qi(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                if (!r) return -1;
                                var o = null == t ? 0 : vu(t);
                                return o < 0 && (o = bt(r + o, 0)), Vn(e, si(n, 3), o)
                            }

                            function Hi(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                if (!r) return -1;
                                var i = r - 1;
                                return t !== o && (i = vu(t), i = t < 0 ? bt(r + i, 0) : wt(i, r - 1)), Vn(e, si(n, 3), i, !0)
                            }

                            function Gi(e) {
                                return (null == e ? 0 : e.length) ? yr(e, 1) : []
                            }

                            function $i(e) {
                                return e && e.length ? e[0] : o
                            }
                            var Ki = Jr((function(e) {
                                    var n = Dn(e, bo);
                                    return n.length && n[0] === e[0] ? Ir(n) : []
                                })),
                                Yi = Jr((function(e) {
                                    var n = Ji(e),
                                        t = Dn(e, bo);
                                    return n === Ji(t) ? n = o : t.pop(), t.length && t[0] === e[0] ? Ir(t, si(n, 2)) : []
                                })),
                                Qi = Jr((function(e) {
                                    var n = Ji(e),
                                        t = Dn(e, bo);
                                    return (n = "function" == typeof n ? n : o) && t.pop(), t.length && t[0] === e[0] ? Ir(t, o, n) : []
                                }));

                            function Ji(e) {
                                var n = null == e ? 0 : e.length;
                                return n ? e[n - 1] : o
                            }
                            var Zi = Jr(Xi);

                            function Xi(e, n) {
                                return e && e.length && n && n.length ? $r(e, n) : e
                            }
                            var ea = oi((function(e, n) {
                                var t = null == e ? 0 : e.length,
                                    r = ur(e, n);
                                return Kr(e, Dn(n, (function(e) {
                                    return wi(e, t) ? +e : e
                                })).sort(To)), r
                            }));

                            function na(e) {
                                return null == e ? e : Et.call(e)
                            }
                            var ta = Jr((function(e) {
                                    return fo(yr(e, 1, Ka, !0))
                                })),
                                ra = Jr((function(e) {
                                    var n = Ji(e);
                                    return Ka(n) && (n = o), fo(yr(e, 1, Ka, !0), si(n, 2))
                                })),
                                oa = Jr((function(e) {
                                    var n = Ji(e);
                                    return n = "function" == typeof n ? n : o, fo(yr(e, 1, Ka, !0), o, n)
                                }));

                            function ia(e) {
                                if (!e || !e.length) return [];
                                var n = 0;
                                return e = On(e, (function(e) {
                                    if (Ka(e)) return n = bt(e.length, n), !0
                                })), Zn(n, (function(n) {
                                    return Dn(e, Kn(n))
                                }))
                            }

                            function aa(e, n) {
                                if (!e || !e.length) return [];
                                var t = ia(e);
                                return null == n ? t : Dn(t, (function(e) {
                                    return Tn(n, o, e)
                                }))
                            }
                            var ua = Jr((function(e, n) {
                                    return Ka(e) ? dr(e, n) : []
                                })),
                                ca = Jr((function(e) {
                                    return mo(On(e, Ka))
                                })),
                                la = Jr((function(e) {
                                    var n = Ji(e);
                                    return Ka(n) && (n = o), mo(On(e, Ka), si(n, 2))
                                })),
                                sa = Jr((function(e) {
                                    var n = Ji(e);
                                    return n = "function" == typeof n ? n : o, mo(On(e, Ka), o, n)
                                })),
                                fa = Jr(ia);
                            var da = Jr((function(e) {
                                var n = e.length,
                                    t = n > 1 ? e[n - 1] : o;
                                return t = "function" == typeof t ? (e.pop(), t) : o, aa(e, t)
                            }));

                            function ha(e) {
                                var n = zt(e);
                                return n.__chain__ = !0, n
                            }

                            function pa(e, n) {
                                return n(e)
                            }
                            var va = oi((function(e) {
                                var n = e.length,
                                    t = n ? e[0] : 0,
                                    r = this.__wrapped__,
                                    i = function(n) {
                                        return ur(n, e)
                                    };
                                return !(n > 1 || this.__actions__.length) && r instanceof Ht && wi(t) ? ((r = r.slice(t, +t + (n ? 1 : 0))).__actions__.push({
                                    func: pa,
                                    args: [i],
                                    thisArg: o
                                }), new qt(r, this.__chain__).thru((function(e) {
                                    return n && !e.length && e.push(o), e
                                }))) : this.thru(i)
                            }));
                            var ga = Oo((function(e, n, t) {
                                De.call(e, t) ? ++e[t] : ar(e, t, 1)
                            }));
                            var ma = Bo(qi),
                                ya = Bo(Hi);

                            function ba(e, n) {
                                return (Ha(e) ? In : hr)(e, si(n, 3))
                            }

                            function wa(e, n) {
                                return (Ha(e) ? Un : pr)(e, si(n, 3))
                            }
                            var Sa = Oo((function(e, n, t) {
                                De.call(e, t) ? e[t].push(n) : ar(e, t, [n])
                            }));
                            var _a = Jr((function(e, n, t) {
                                    var o = -1,
                                        i = "function" == typeof n,
                                        a = $a(e) ? r(e.length) : [];
                                    return hr(e, (function(e) {
                                        a[++o] = i ? Tn(n, e, t) : Ur(e, n, t)
                                    })), a
                                })),
                                Aa = Oo((function(e, n, t) {
                                    ar(e, t, n)
                                }));

                            function Ea(e, n) {
                                return (Ha(e) ? Dn : Br)(e, si(n, 3))
                            }
                            var La = Oo((function(e, n, t) {
                                e[t ? 0 : 1].push(n)
                            }), (function() {
                                return [
                                    [],
                                    []
                                ]
                            }));
                            var ka = Jr((function(e, n) {
                                    if (null == e) return [];
                                    var t = n.length;
                                    return t > 1 && Si(e, n[0], n[1]) ? n = [] : t > 2 && Si(n[0], n[1], n[2]) && (n = [n[0]]), Hr(e, yr(n, 1), [])
                                })),
                                Ca = fn || function() {
                                    return gn.Date.now()
                                };

                            function Ta(e, n, t) {
                                return n = t ? o : n, n = e && null == n ? e.length : n, Xo(e, f, o, o, o, o, n)
                            }

                            function xa(e, n) {
                                var t;
                                if ("function" != typeof n) throw new Ie(i);
                                return e = vu(e),
                                    function() {
                                        return --e > 0 && (t = n.apply(this, arguments)), e <= 1 && (n = o), t
                                    }
                            }
                            var Ia = Jr((function(e, n, t) {
                                    var r = 1;
                                    if (t.length) {
                                        var o = ft(t, li(Ia));
                                        r |= l
                                    }
                                    return Xo(e, r, n, t, o)
                                })),
                                Ua = Jr((function(e, n, t) {
                                    var r = 3;
                                    if (t.length) {
                                        var o = ft(t, li(Ua));
                                        r |= l
                                    }
                                    return Xo(n, r, e, t, o)
                                }));

                            function Pa(e, n, t) {
                                var r, a, u, c, l, s, f = 0,
                                    d = !1,
                                    h = !1,
                                    p = !0;
                                if ("function" != typeof e) throw new Ie(i);

                                function v(n) {
                                    var t = r,
                                        i = a;
                                    return r = a = o, f = n, c = e.apply(i, t)
                                }

                                function g(e) {
                                    var t = e - s;
                                    return s === o || t >= n || t < 0 || h && e - f >= u
                                }

                                function m() {
                                    var e = Ca();
                                    if (g(e)) return y(e);
                                    l = Pi(m, function(e) {
                                        var t = n - (e - s);
                                        return h ? wt(t, u - (e - f)) : t
                                    }(e))
                                }

                                function y(e) {
                                    return l = o, p && r ? v(e) : (r = a = o, c)
                                }

                                function b() {
                                    var e = Ca(),
                                        t = g(e);
                                    if (r = arguments, a = this, s = e, t) {
                                        if (l === o) return function(e) {
                                            return f = e, l = Pi(m, n), d ? v(e) : c
                                        }(s);
                                        if (h) return Eo(l), l = Pi(m, n), v(s)
                                    }
                                    return l === o && (l = Pi(m, n)), c
                                }
                                return n = mu(n) || 0, nu(t) && (d = !!t.leading, u = (h = "maxWait" in t) ? bt(mu(t.maxWait) || 0, n) : u, p = "trailing" in t ? !!t.trailing : p), b.cancel = function() {
                                    l !== o && Eo(l), f = 0, r = s = a = l = o
                                }, b.flush = function() {
                                    return l === o ? c : y(Ca())
                                }, b
                            }
                            var Oa = Jr((function(e, n) {
                                    return fr(e, 1, n)
                                })),
                                Ra = Jr((function(e, n, t) {
                                    return fr(e, mu(n) || 0, t)
                                }));

                            function Fa(e, n) {
                                if ("function" != typeof e || null != n && "function" != typeof n) throw new Ie(i);
                                var t = function() {
                                    var r = arguments,
                                        o = n ? n.apply(this, r) : r[0],
                                        i = t.cache;
                                    if (i.has(o)) return i.get(o);
                                    var a = e.apply(this, r);
                                    return t.cache = i.set(o, a) || i, a
                                };
                                return t.cache = new(Fa.Cache || Kt), t
                            }

                            function Da(e) {
                                if ("function" != typeof e) throw new Ie(i);
                                return function() {
                                    var n = arguments;
                                    switch (n.length) {
                                        case 0:
                                            return !e.call(this);
                                        case 1:
                                            return !e.call(this, n[0]);
                                        case 2:
                                            return !e.call(this, n[0], n[1]);
                                        case 3:
                                            return !e.call(this, n[0], n[1], n[2])
                                    }
                                    return !e.apply(this, n)
                                }
                            }
                            Fa.Cache = Kt;
                            var Na = _o((function(e, n) {
                                    var t = (n = 1 == n.length && Ha(n[0]) ? Dn(n[0], et(si())) : Dn(yr(n, 1), et(si()))).length;
                                    return Jr((function(r) {
                                        for (var o = -1, i = wt(r.length, t); ++o < i;) r[o] = n[o].call(this, r[o]);
                                        return Tn(e, this, r)
                                    }))
                                })),
                                ja = Jr((function(e, n) {
                                    var t = ft(n, li(ja));
                                    return Xo(e, l, o, n, t)
                                })),
                                Ma = Jr((function(e, n) {
                                    var t = ft(n, li(Ma));
                                    return Xo(e, s, o, n, t)
                                })),
                                Ba = oi((function(e, n) {
                                    return Xo(e, d, o, o, o, n)
                                }));

                            function za(e, n) {
                                return e === n || e != e && n != n
                            }
                            var Wa = Ko(Cr),
                                Va = Ko((function(e, n) {
                                    return e >= n
                                })),
                                qa = Pr(function() {
                                    return arguments
                                }()) ? Pr : function(e) {
                                    return tu(e) && De.call(e, "callee") && !Ye.call(e, "callee")
                                },
                                Ha = r.isArray,
                                Ga = _n ? et(_n) : function(e) {
                                    return tu(e) && kr(e) == R
                                };

                            function $a(e) {
                                return null != e && eu(e.length) && !Za(e)
                            }

                            function Ka(e) {
                                return tu(e) && $a(e)
                            }
                            var Ya = wn || mc,
                                Qa = An ? et(An) : function(e) {
                                    return tu(e) && kr(e) == S
                                };

                            function Ja(e) {
                                if (!tu(e)) return !1;
                                var n = kr(e);
                                return n == _ || "[object DOMException]" == n || "string" == typeof e.message && "string" == typeof e.name && !iu(e)
                            }

                            function Za(e) {
                                if (!nu(e)) return !1;
                                var n = kr(e);
                                return n == A || n == E || "[object AsyncFunction]" == n || "[object Proxy]" == n
                            }

                            function Xa(e) {
                                return "number" == typeof e && e == vu(e)
                            }

                            function eu(e) {
                                return "number" == typeof e && e > -1 && e % 1 == 0 && e <= p
                            }

                            function nu(e) {
                                var n = typeof e;
                                return null != e && ("object" == n || "function" == n)
                            }

                            function tu(e) {
                                return null != e && "object" == typeof e
                            }
                            var ru = En ? et(En) : function(e) {
                                return tu(e) && gi(e) == L
                            };

                            function ou(e) {
                                return "number" == typeof e || tu(e) && kr(e) == k
                            }

                            function iu(e) {
                                if (!tu(e) || kr(e) != C) return !1;
                                var n = $e(e);
                                if (null === n) return !0;
                                var t = De.call(n, "constructor") && n.constructor;
                                return "function" == typeof t && t instanceof t && Fe.call(t) == Be
                            }
                            var au = Ln ? et(Ln) : function(e) {
                                return tu(e) && kr(e) == x
                            };
                            var uu = kn ? et(kn) : function(e) {
                                return tu(e) && gi(e) == I
                            };

                            function cu(e) {
                                return "string" == typeof e || !Ha(e) && tu(e) && kr(e) == U
                            }

                            function lu(e) {
                                return "symbol" == typeof e || tu(e) && kr(e) == P
                            }
                            var su = Cn ? et(Cn) : function(e) {
                                return tu(e) && eu(e.length) && !!ln[kr(e)]
                            };
                            var fu = Ko(Mr),
                                du = Ko((function(e, n) {
                                    return e <= n
                                }));

                            function hu(e) {
                                if (!e) return [];
                                if ($a(e)) return cu(e) ? vt(e) : Uo(e);
                                if (Ze && e[Ze]) return function(e) {
                                    for (var n, t = []; !(n = e.next()).done;) t.push(n.value);
                                    return t
                                }(e[Ze]());
                                var n = gi(e);
                                return (n == L ? lt : n == I ? dt : zu)(e)
                            }

                            function pu(e) {
                                return e ? (e = mu(e)) === h || e === -1 / 0 ? 17976931348623157e292 * (e < 0 ? -1 : 1) : e == e ? e : 0 : 0 === e ? e : 0
                            }

                            function vu(e) {
                                var n = pu(e),
                                    t = n % 1;
                                return n == n ? t ? n - t : n : 0
                            }

                            function gu(e) {
                                return e ? cr(vu(e), 0, g) : 0
                            }

                            function mu(e) {
                                if ("number" == typeof e) return e;
                                if (lu(e)) return v;
                                if (nu(e)) {
                                    var n = "function" == typeof e.valueOf ? e.valueOf() : e;
                                    e = nu(n) ? n + "" : n
                                }
                                if ("string" != typeof e) return 0 === e ? e : +e;
                                e = Xn(e);
                                var t = me.test(e);
                                return t || be.test(e) ? hn(e.slice(2), t ? 2 : 8) : ge.test(e) ? v : +e
                            }

                            function yu(e) {
                                return Po(e, Ou(e))
                            }

                            function bu(e) {
                                return null == e ? "" : so(e)
                            }
                            var wu = Ro((function(e, n) {
                                    if (Li(n) || $a(n)) Po(n, Pu(n), e);
                                    else
                                        for (var t in n) De.call(n, t) && tr(e, t, n[t])
                                })),
                                Su = Ro((function(e, n) {
                                    Po(n, Ou(n), e)
                                })),
                                _u = Ro((function(e, n, t, r) {
                                    Po(n, Ou(n), e, r)
                                })),
                                Au = Ro((function(e, n, t, r) {
                                    Po(n, Pu(n), e, r)
                                })),
                                Eu = oi(ur);
                            var Lu = Jr((function(e, n) {
                                    e = Ce(e);
                                    var t = -1,
                                        r = n.length,
                                        i = r > 2 ? n[2] : o;
                                    for (i && Si(n[0], n[1], i) && (r = 1); ++t < r;)
                                        for (var a = n[t], u = Ou(a), c = -1, l = u.length; ++c < l;) {
                                            var s = u[c],
                                                f = e[s];
                                            (f === o || za(f, Oe[s]) && !De.call(e, s)) && (e[s] = a[s])
                                        }
                                    return e
                                })),
                                ku = Jr((function(e) {
                                    return e.push(o, ni), Tn(Fu, o, e)
                                }));

                            function Cu(e, n, t) {
                                var r = null == e ? o : Er(e, n);
                                return r === o ? t : r
                            }

                            function Tu(e, n) {
                                return null != e && mi(e, n, xr)
                            }
                            var xu = Vo((function(e, n, t) {
                                    null != n && "function" != typeof n.toString && (n = Me.call(n)), e[n] = t
                                }), nc(oc)),
                                Iu = Vo((function(e, n, t) {
                                    null != n && "function" != typeof n.toString && (n = Me.call(n)), De.call(e, n) ? e[n].push(t) : e[n] = [t]
                                }), si),
                                Uu = Jr(Ur);

                            function Pu(e) {
                                return $a(e) ? Jt(e) : Nr(e)
                            }

                            function Ou(e) {
                                return $a(e) ? Jt(e, !0) : jr(e)
                            }
                            var Ru = Ro((function(e, n, t) {
                                    Vr(e, n, t)
                                })),
                                Fu = Ro((function(e, n, t, r) {
                                    Vr(e, n, t, r)
                                })),
                                Du = oi((function(e, n) {
                                    var t = {};
                                    if (null == e) return t;
                                    var r = !1;
                                    n = Dn(n, (function(n) {
                                        return n = So(n, e), r || (r = n.length > 1), n
                                    })), Po(e, ai(e), t), r && (t = lr(t, 7, ti));
                                    for (var o = n.length; o--;) ho(t, n[o]);
                                    return t
                                }));
                            var Nu = oi((function(e, n) {
                                return null == e ? {} : function(e, n) {
                                    return Gr(e, n, (function(n, t) {
                                        return Tu(e, t)
                                    }))
                                }(e, n)
                            }));

                            function ju(e, n) {
                                if (null == e) return {};
                                var t = Dn(ai(e), (function(e) {
                                    return [e]
                                }));
                                return n = si(n), Gr(e, t, (function(e, t) {
                                    return n(e, t[0])
                                }))
                            }
                            var Mu = Zo(Pu),
                                Bu = Zo(Ou);

                            function zu(e) {
                                return null == e ? [] : nt(e, Pu(e))
                            }
                            var Wu = jo((function(e, n, t) {
                                return n = n.toLowerCase(), e + (t ? Vu(n) : n)
                            }));

                            function Vu(e) {
                                return Ju(bu(e).toLowerCase())
                            }

                            function qu(e) {
                                return (e = bu(e)) && e.replace(Se, it).replace(nn, "")
                            }
                            var Hu = jo((function(e, n, t) {
                                    return e + (t ? "-" : "") + n.toLowerCase()
                                })),
                                Gu = jo((function(e, n, t) {
                                    return e + (t ? " " : "") + n.toLowerCase()
                                })),
                                $u = No("toLowerCase");
                            var Ku = jo((function(e, n, t) {
                                return e + (t ? "_" : "") + n.toLowerCase()
                            }));
                            var Yu = jo((function(e, n, t) {
                                return e + (t ? " " : "") + Ju(n)
                            }));
                            var Qu = jo((function(e, n, t) {
                                    return e + (t ? " " : "") + n.toUpperCase()
                                })),
                                Ju = No("toUpperCase");

                            function Zu(e, n, t) {
                                return e = bu(e), (n = t ? o : n) === o ? function(e) {
                                    return an.test(e)
                                }(e) ? function(e) {
                                    return e.match(rn) || []
                                }(e) : function(e) {
                                    return e.match(fe) || []
                                }(e) : e.match(n) || []
                            }
                            var Xu = Jr((function(e, n) {
                                    try {
                                        return Tn(e, o, n)
                                    } catch (e) {
                                        return Ja(e) ? e : new Ee(e)
                                    }
                                })),
                                ec = oi((function(e, n) {
                                    return In(n, (function(n) {
                                        n = ji(n), ar(e, n, Ia(e[n], e))
                                    })), e
                                }));

                            function nc(e) {
                                return function() {
                                    return e
                                }
                            }
                            var tc = zo(),
                                rc = zo(!0);

                            function oc(e) {
                                return e
                            }

                            function ic(e) {
                                return Dr("function" == typeof e ? e : lr(e, 1))
                            }
                            var ac = Jr((function(e, n) {
                                    return function(t) {
                                        return Ur(t, e, n)
                                    }
                                })),
                                uc = Jr((function(e, n) {
                                    return function(t) {
                                        return Ur(e, t, n)
                                    }
                                }));

                            function cc(e, n, t) {
                                var r = Pu(n),
                                    o = Ar(n, r);
                                null != t || nu(n) && (o.length || !r.length) || (t = n, n = e, e = this, o = Ar(n, Pu(n)));
                                var i = !(nu(t) && "chain" in t && !t.chain),
                                    a = Za(e);
                                return In(o, (function(t) {
                                    var r = n[t];
                                    e[t] = r, a && (e.prototype[t] = function() {
                                        var n = this.__chain__;
                                        if (i || n) {
                                            var t = e(this.__wrapped__);
                                            return (t.__actions__ = Uo(this.__actions__)).push({
                                                func: r,
                                                args: arguments,
                                                thisArg: e
                                            }), t.__chain__ = n, t
                                        }
                                        return r.apply(e, Nn([this.value()], arguments))
                                    })
                                })), e
                            }

                            function lc() {}
                            var sc = Ho(Dn),
                                fc = Ho(Pn),
                                dc = Ho(Bn);

                            function hc(e) {
                                return _i(e) ? Kn(ji(e)) : function(e) {
                                    return function(n) {
                                        return Er(n, e)
                                    }
                                }(e)
                            }
                            var pc = $o(),
                                vc = $o(!0);

                            function gc() {
                                return []
                            }

                            function mc() {
                                return !1
                            }
                            var yc = qo((function(e, n) {
                                    return e + n
                                }), 0),
                                bc = Qo("ceil"),
                                wc = qo((function(e, n) {
                                    return e / n
                                }), 1),
                                Sc = Qo("floor");
                            var _c, Ac = qo((function(e, n) {
                                    return e * n
                                }), 1),
                                Ec = Qo("round"),
                                Lc = qo((function(e, n) {
                                    return e - n
                                }), 0);
                            return zt.after = function(e, n) {
                                if ("function" != typeof n) throw new Ie(i);
                                return e = vu(e),
                                    function() {
                                        if (--e < 1) return n.apply(this, arguments)
                                    }
                            }, zt.ary = Ta, zt.assign = wu, zt.assignIn = Su, zt.assignInWith = _u, zt.assignWith = Au, zt.at = Eu, zt.before = xa, zt.bind = Ia, zt.bindAll = ec, zt.bindKey = Ua, zt.castArray = function() {
                                if (!arguments.length) return [];
                                var e = arguments[0];
                                return Ha(e) ? e : [e]
                            }, zt.chain = ha, zt.chunk = function(e, n, t) {
                                n = (t ? Si(e, n, t) : n === o) ? 1 : bt(vu(n), 0);
                                var i = null == e ? 0 : e.length;
                                if (!i || n < 1) return [];
                                for (var a = 0, u = 0, c = r(vn(i / n)); a < i;) c[u++] = oo(e, a, a += n);
                                return c
                            }, zt.compact = function(e) {
                                for (var n = -1, t = null == e ? 0 : e.length, r = 0, o = []; ++n < t;) {
                                    var i = e[n];
                                    i && (o[r++] = i)
                                }
                                return o
                            }, zt.concat = function() {
                                var e = arguments.length;
                                if (!e) return [];
                                for (var n = r(e - 1), t = arguments[0], o = e; o--;) n[o - 1] = arguments[o];
                                return Nn(Ha(t) ? Uo(t) : [t], yr(n, 1))
                            }, zt.cond = function(e) {
                                var n = null == e ? 0 : e.length,
                                    t = si();
                                return e = n ? Dn(e, (function(e) {
                                    if ("function" != typeof e[1]) throw new Ie(i);
                                    return [t(e[0]), e[1]]
                                })) : [], Jr((function(t) {
                                    for (var r = -1; ++r < n;) {
                                        var o = e[r];
                                        if (Tn(o[0], this, t)) return Tn(o[1], this, t)
                                    }
                                }))
                            }, zt.conforms = function(e) {
                                return function(e) {
                                    var n = Pu(e);
                                    return function(t) {
                                        return sr(t, e, n)
                                    }
                                }(lr(e, 1))
                            }, zt.constant = nc, zt.countBy = ga, zt.create = function(e, n) {
                                var t = Wt(e);
                                return null == n ? t : ir(t, n)
                            }, zt.curry = function e(n, t, r) {
                                var i = Xo(n, 8, o, o, o, o, o, t = r ? o : t);
                                return i.placeholder = e.placeholder, i
                            }, zt.curryRight = function e(n, t, r) {
                                var i = Xo(n, c, o, o, o, o, o, t = r ? o : t);
                                return i.placeholder = e.placeholder, i
                            }, zt.debounce = Pa, zt.defaults = Lu, zt.defaultsDeep = ku, zt.defer = Oa, zt.delay = Ra, zt.difference = zi, zt.differenceBy = Wi, zt.differenceWith = Vi, zt.drop = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                return r ? oo(e, (n = t || n === o ? 1 : vu(n)) < 0 ? 0 : n, r) : []
                            }, zt.dropRight = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                return r ? oo(e, 0, (n = r - (n = t || n === o ? 1 : vu(n))) < 0 ? 0 : n) : []
                            }, zt.dropRightWhile = function(e, n) {
                                return e && e.length ? vo(e, si(n, 3), !0, !0) : []
                            }, zt.dropWhile = function(e, n) {
                                return e && e.length ? vo(e, si(n, 3), !0) : []
                            }, zt.fill = function(e, n, t, r) {
                                var i = null == e ? 0 : e.length;
                                return i ? (t && "number" != typeof t && Si(e, n, t) && (t = 0, r = i), function(e, n, t, r) {
                                    var i = e.length;
                                    for ((t = vu(t)) < 0 && (t = -t > i ? 0 : i + t), (r = r === o || r > i ? i : vu(r)) < 0 && (r += i), r = t > r ? 0 : gu(r); t < r;) e[t++] = n;
                                    return e
                                }(e, n, t, r)) : []
                            }, zt.filter = function(e, n) {
                                return (Ha(e) ? On : mr)(e, si(n, 3))
                            }, zt.flatMap = function(e, n) {
                                return yr(Ea(e, n), 1)
                            }, zt.flatMapDeep = function(e, n) {
                                return yr(Ea(e, n), h)
                            }, zt.flatMapDepth = function(e, n, t) {
                                return t = t === o ? 1 : vu(t), yr(Ea(e, n), t)
                            }, zt.flatten = Gi, zt.flattenDeep = function(e) {
                                return (null == e ? 0 : e.length) ? yr(e, h) : []
                            }, zt.flattenDepth = function(e, n) {
                                return (null == e ? 0 : e.length) ? yr(e, n = n === o ? 1 : vu(n)) : []
                            }, zt.flip = function(e) {
                                return Xo(e, 512)
                            }, zt.flow = tc, zt.flowRight = rc, zt.fromPairs = function(e) {
                                for (var n = -1, t = null == e ? 0 : e.length, r = {}; ++n < t;) {
                                    var o = e[n];
                                    r[o[0]] = o[1]
                                }
                                return r
                            }, zt.functions = function(e) {
                                return null == e ? [] : Ar(e, Pu(e))
                            }, zt.functionsIn = function(e) {
                                return null == e ? [] : Ar(e, Ou(e))
                            }, zt.groupBy = Sa, zt.initial = function(e) {
                                return (null == e ? 0 : e.length) ? oo(e, 0, -1) : []
                            }, zt.intersection = Ki, zt.intersectionBy = Yi, zt.intersectionWith = Qi, zt.invert = xu, zt.invertBy = Iu, zt.invokeMap = _a, zt.iteratee = ic, zt.keyBy = Aa, zt.keys = Pu, zt.keysIn = Ou, zt.map = Ea, zt.mapKeys = function(e, n) {
                                var t = {};
                                return n = si(n, 3), Sr(e, (function(e, r, o) {
                                    ar(t, n(e, r, o), e)
                                })), t
                            }, zt.mapValues = function(e, n) {
                                var t = {};
                                return n = si(n, 3), Sr(e, (function(e, r, o) {
                                    ar(t, r, n(e, r, o))
                                })), t
                            }, zt.matches = function(e) {
                                return zr(lr(e, 1))
                            }, zt.matchesProperty = function(e, n) {
                                return Wr(e, lr(n, 1))
                            }, zt.memoize = Fa, zt.merge = Ru, zt.mergeWith = Fu, zt.method = ac, zt.methodOf = uc, zt.mixin = cc, zt.negate = Da, zt.nthArg = function(e) {
                                return e = vu(e), Jr((function(n) {
                                    return qr(n, e)
                                }))
                            }, zt.omit = Du, zt.omitBy = function(e, n) {
                                return ju(e, Da(si(n)))
                            }, zt.once = function(e) {
                                return xa(2, e)
                            }, zt.orderBy = function(e, n, t, r) {
                                return null == e ? [] : (Ha(n) || (n = null == n ? [] : [n]), Ha(t = r ? o : t) || (t = null == t ? [] : [t]), Hr(e, n, t))
                            }, zt.over = sc, zt.overArgs = Na, zt.overEvery = fc, zt.overSome = dc, zt.partial = ja, zt.partialRight = Ma, zt.partition = La, zt.pick = Nu, zt.pickBy = ju, zt.property = hc, zt.propertyOf = function(e) {
                                return function(n) {
                                    return null == e ? o : Er(e, n)
                                }
                            }, zt.pull = Zi, zt.pullAll = Xi, zt.pullAllBy = function(e, n, t) {
                                return e && e.length && n && n.length ? $r(e, n, si(t, 2)) : e
                            }, zt.pullAllWith = function(e, n, t) {
                                return e && e.length && n && n.length ? $r(e, n, o, t) : e
                            }, zt.pullAt = ea, zt.range = pc, zt.rangeRight = vc, zt.rearg = Ba, zt.reject = function(e, n) {
                                return (Ha(e) ? On : mr)(e, Da(si(n, 3)))
                            }, zt.remove = function(e, n) {
                                var t = [];
                                if (!e || !e.length) return t;
                                var r = -1,
                                    o = [],
                                    i = e.length;
                                for (n = si(n, 3); ++r < i;) {
                                    var a = e[r];
                                    n(a, r, e) && (t.push(a), o.push(r))
                                }
                                return Kr(e, o), t
                            }, zt.rest = function(e, n) {
                                if ("function" != typeof e) throw new Ie(i);
                                return Jr(e, n = n === o ? n : vu(n))
                            }, zt.reverse = na, zt.sampleSize = function(e, n, t) {
                                return n = (t ? Si(e, n, t) : n === o) ? 1 : vu(n), (Ha(e) ? Xt : Xr)(e, n)
                            }, zt.set = function(e, n, t) {
                                return null == e ? e : eo(e, n, t)
                            }, zt.setWith = function(e, n, t, r) {
                                return r = "function" == typeof r ? r : o, null == e ? e : eo(e, n, t, r)
                            }, zt.shuffle = function(e) {
                                return (Ha(e) ? er : ro)(e)
                            }, zt.slice = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                return r ? (t && "number" != typeof t && Si(e, n, t) ? (n = 0, t = r) : (n = null == n ? 0 : vu(n), t = t === o ? r : vu(t)), oo(e, n, t)) : []
                            }, zt.sortBy = ka, zt.sortedUniq = function(e) {
                                return e && e.length ? co(e) : []
                            }, zt.sortedUniqBy = function(e, n) {
                                return e && e.length ? co(e, si(n, 2)) : []
                            }, zt.split = function(e, n, t) {
                                return t && "number" != typeof t && Si(e, n, t) && (n = t = o), (t = t === o ? g : t >>> 0) ? (e = bu(e)) && ("string" == typeof n || null != n && !au(n)) && !(n = so(n)) && ct(e) ? Ao(vt(e), 0, t) : e.split(n, t) : []
                            }, zt.spread = function(e, n) {
                                if ("function" != typeof e) throw new Ie(i);
                                return n = null == n ? 0 : bt(vu(n), 0), Jr((function(t) {
                                    var r = t[n],
                                        o = Ao(t, 0, n);
                                    return r && Nn(o, r), Tn(e, this, o)
                                }))
                            }, zt.tail = function(e) {
                                var n = null == e ? 0 : e.length;
                                return n ? oo(e, 1, n) : []
                            }, zt.take = function(e, n, t) {
                                return e && e.length ? oo(e, 0, (n = t || n === o ? 1 : vu(n)) < 0 ? 0 : n) : []
                            }, zt.takeRight = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                return r ? oo(e, (n = r - (n = t || n === o ? 1 : vu(n))) < 0 ? 0 : n, r) : []
                            }, zt.takeRightWhile = function(e, n) {
                                return e && e.length ? vo(e, si(n, 3), !1, !0) : []
                            }, zt.takeWhile = function(e, n) {
                                return e && e.length ? vo(e, si(n, 3)) : []
                            }, zt.tap = function(e, n) {
                                return n(e), e
                            }, zt.throttle = function(e, n, t) {
                                var r = !0,
                                    o = !0;
                                if ("function" != typeof e) throw new Ie(i);
                                return nu(t) && (r = "leading" in t ? !!t.leading : r, o = "trailing" in t ? !!t.trailing : o), Pa(e, n, {
                                    leading: r,
                                    maxWait: n,
                                    trailing: o
                                })
                            }, zt.thru = pa, zt.toArray = hu, zt.toPairs = Mu, zt.toPairsIn = Bu, zt.toPath = function(e) {
                                return Ha(e) ? Dn(e, ji) : lu(e) ? [e] : Uo(Ni(bu(e)))
                            }, zt.toPlainObject = yu, zt.transform = function(e, n, t) {
                                var r = Ha(e),
                                    o = r || Ya(e) || su(e);
                                if (n = si(n, 4), null == t) {
                                    var i = e && e.constructor;
                                    t = o ? r ? new i : [] : nu(e) && Za(i) ? Wt($e(e)) : {}
                                }
                                return (o ? In : Sr)(e, (function(e, r, o) {
                                    return n(t, e, r, o)
                                })), t
                            }, zt.unary = function(e) {
                                return Ta(e, 1)
                            }, zt.union = ta, zt.unionBy = ra, zt.unionWith = oa, zt.uniq = function(e) {
                                return e && e.length ? fo(e) : []
                            }, zt.uniqBy = function(e, n) {
                                return e && e.length ? fo(e, si(n, 2)) : []
                            }, zt.uniqWith = function(e, n) {
                                return n = "function" == typeof n ? n : o, e && e.length ? fo(e, o, n) : []
                            }, zt.unset = function(e, n) {
                                return null == e || ho(e, n)
                            }, zt.unzip = ia, zt.unzipWith = aa, zt.update = function(e, n, t) {
                                return null == e ? e : po(e, n, wo(t))
                            }, zt.updateWith = function(e, n, t, r) {
                                return r = "function" == typeof r ? r : o, null == e ? e : po(e, n, wo(t), r)
                            }, zt.values = zu, zt.valuesIn = function(e) {
                                return null == e ? [] : nt(e, Ou(e))
                            }, zt.without = ua, zt.words = Zu, zt.wrap = function(e, n) {
                                return ja(wo(n), e)
                            }, zt.xor = ca, zt.xorBy = la, zt.xorWith = sa, zt.zip = fa, zt.zipObject = function(e, n) {
                                return yo(e || [], n || [], tr)
                            }, zt.zipObjectDeep = function(e, n) {
                                return yo(e || [], n || [], eo)
                            }, zt.zipWith = da, zt.entries = Mu, zt.entriesIn = Bu, zt.extend = Su, zt.extendWith = _u, cc(zt, zt), zt.add = yc, zt.attempt = Xu, zt.camelCase = Wu, zt.capitalize = Vu, zt.ceil = bc, zt.clamp = function(e, n, t) {
                                return t === o && (t = n, n = o), t !== o && (t = (t = mu(t)) == t ? t : 0), n !== o && (n = (n = mu(n)) == n ? n : 0), cr(mu(e), n, t)
                            }, zt.clone = function(e) {
                                return lr(e, 4)
                            }, zt.cloneDeep = function(e) {
                                return lr(e, 5)
                            }, zt.cloneDeepWith = function(e, n) {
                                return lr(e, 5, n = "function" == typeof n ? n : o)
                            }, zt.cloneWith = function(e, n) {
                                return lr(e, 4, n = "function" == typeof n ? n : o)
                            }, zt.conformsTo = function(e, n) {
                                return null == n || sr(e, n, Pu(n))
                            }, zt.deburr = qu, zt.defaultTo = function(e, n) {
                                return null == e || e != e ? n : e
                            }, zt.divide = wc, zt.endsWith = function(e, n, t) {
                                e = bu(e), n = so(n);
                                var r = e.length,
                                    i = t = t === o ? r : cr(vu(t), 0, r);
                                return (t -= n.length) >= 0 && e.slice(t, i) == n
                            }, zt.eq = za, zt.escape = function(e) {
                                return (e = bu(e)) && J.test(e) ? e.replace(Y, at) : e
                            }, zt.escapeRegExp = function(e) {
                                return (e = bu(e)) && ie.test(e) ? e.replace(oe, "\\$&") : e
                            }, zt.every = function(e, n, t) {
                                var r = Ha(e) ? Pn : vr;
                                return t && Si(e, n, t) && (n = o), r(e, si(n, 3))
                            }, zt.find = ma, zt.findIndex = qi, zt.findKey = function(e, n) {
                                return Wn(e, si(n, 3), Sr)
                            }, zt.findLast = ya, zt.findLastIndex = Hi, zt.findLastKey = function(e, n) {
                                return Wn(e, si(n, 3), _r)
                            }, zt.floor = Sc, zt.forEach = ba, zt.forEachRight = wa, zt.forIn = function(e, n) {
                                return null == e ? e : br(e, si(n, 3), Ou)
                            }, zt.forInRight = function(e, n) {
                                return null == e ? e : wr(e, si(n, 3), Ou)
                            }, zt.forOwn = function(e, n) {
                                return e && Sr(e, si(n, 3))
                            }, zt.forOwnRight = function(e, n) {
                                return e && _r(e, si(n, 3))
                            }, zt.get = Cu, zt.gt = Wa, zt.gte = Va, zt.has = function(e, n) {
                                return null != e && mi(e, n, Tr)
                            }, zt.hasIn = Tu, zt.head = $i, zt.identity = oc, zt.includes = function(e, n, t, r) {
                                e = $a(e) ? e : zu(e), t = t && !r ? vu(t) : 0;
                                var o = e.length;
                                return t < 0 && (t = bt(o + t, 0)), cu(e) ? t <= o && e.indexOf(n, t) > -1 : !!o && qn(e, n, t) > -1
                            }, zt.indexOf = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                if (!r) return -1;
                                var o = null == t ? 0 : vu(t);
                                return o < 0 && (o = bt(r + o, 0)), qn(e, n, o)
                            }, zt.inRange = function(e, n, t) {
                                return n = pu(n), t === o ? (t = n, n = 0) : t = pu(t),
                                    function(e, n, t) {
                                        return e >= wt(n, t) && e < bt(n, t)
                                    }(e = mu(e), n, t)
                            }, zt.invoke = Uu, zt.isArguments = qa, zt.isArray = Ha, zt.isArrayBuffer = Ga, zt.isArrayLike = $a, zt.isArrayLikeObject = Ka, zt.isBoolean = function(e) {
                                return !0 === e || !1 === e || tu(e) && kr(e) == w
                            }, zt.isBuffer = Ya, zt.isDate = Qa, zt.isElement = function(e) {
                                return tu(e) && 1 === e.nodeType && !iu(e)
                            }, zt.isEmpty = function(e) {
                                if (null == e) return !0;
                                if ($a(e) && (Ha(e) || "string" == typeof e || "function" == typeof e.splice || Ya(e) || su(e) || qa(e))) return !e.length;
                                var n = gi(e);
                                if (n == L || n == I) return !e.size;
                                if (Li(e)) return !Nr(e).length;
                                for (var t in e)
                                    if (De.call(e, t)) return !1;
                                return !0
                            }, zt.isEqual = function(e, n) {
                                return Or(e, n)
                            }, zt.isEqualWith = function(e, n, t) {
                                var r = (t = "function" == typeof t ? t : o) ? t(e, n) : o;
                                return r === o ? Or(e, n, o, t) : !!r
                            }, zt.isError = Ja, zt.isFinite = function(e) {
                                return "number" == typeof e && Sn(e)
                            }, zt.isFunction = Za, zt.isInteger = Xa, zt.isLength = eu, zt.isMap = ru, zt.isMatch = function(e, n) {
                                return e === n || Rr(e, n, di(n))
                            }, zt.isMatchWith = function(e, n, t) {
                                return t = "function" == typeof t ? t : o, Rr(e, n, di(n), t)
                            }, zt.isNaN = function(e) {
                                return ou(e) && e != +e
                            }, zt.isNative = function(e) {
                                if (Ei(e)) throw new Ee("Unsupported core-js use. Try https://npms.io/search?q=ponyfill.");
                                return Fr(e)
                            }, zt.isNil = function(e) {
                                return null == e
                            }, zt.isNull = function(e) {
                                return null === e
                            }, zt.isNumber = ou, zt.isObject = nu, zt.isObjectLike = tu, zt.isPlainObject = iu, zt.isRegExp = au, zt.isSafeInteger = function(e) {
                                return Xa(e) && e >= -9007199254740991 && e <= p
                            }, zt.isSet = uu, zt.isString = cu, zt.isSymbol = lu, zt.isTypedArray = su, zt.isUndefined = function(e) {
                                return e === o
                            }, zt.isWeakMap = function(e) {
                                return tu(e) && gi(e) == O
                            }, zt.isWeakSet = function(e) {
                                return tu(e) && "[object WeakSet]" == kr(e)
                            }, zt.join = function(e, n) {
                                return null == e ? "" : zn.call(e, n)
                            }, zt.kebabCase = Hu, zt.last = Ji, zt.lastIndexOf = function(e, n, t) {
                                var r = null == e ? 0 : e.length;
                                if (!r) return -1;
                                var i = r;
                                return t !== o && (i = (i = vu(t)) < 0 ? bt(r + i, 0) : wt(i, r - 1)), n == n ? function(e, n, t) {
                                    for (var r = t + 1; r--;)
                                        if (e[r] === n) return r;
                                    return r
                                }(e, n, i) : Vn(e, Gn, i, !0)
                            }, zt.lowerCase = Gu, zt.lowerFirst = $u, zt.lt = fu, zt.lte = du, zt.max = function(e) {
                                return e && e.length ? gr(e, oc, Cr) : o
                            }, zt.maxBy = function(e, n) {
                                return e && e.length ? gr(e, si(n, 2), Cr) : o
                            }, zt.mean = function(e) {
                                return $n(e, oc)
                            }, zt.meanBy = function(e, n) {
                                return $n(e, si(n, 2))
                            }, zt.min = function(e) {
                                return e && e.length ? gr(e, oc, Mr) : o
                            }, zt.minBy = function(e, n) {
                                return e && e.length ? gr(e, si(n, 2), Mr) : o
                            }, zt.stubArray = gc, zt.stubFalse = mc, zt.stubObject = function() {
                                return {}
                            }, zt.stubString = function() {
                                return ""
                            }, zt.stubTrue = function() {
                                return !0
                            }, zt.multiply = Ac, zt.nth = function(e, n) {
                                return e && e.length ? qr(e, vu(n)) : o
                            }, zt.noConflict = function() {
                                return gn._ === this && (gn._ = ze), this
                            }, zt.noop = lc, zt.now = Ca, zt.pad = function(e, n, t) {
                                e = bu(e);
                                var r = (n = vu(n)) ? pt(e) : 0;
                                if (!n || r >= n) return e;
                                var o = (n - r) / 2;
                                return Go(mn(o), t) + e + Go(vn(o), t)
                            }, zt.padEnd = function(e, n, t) {
                                e = bu(e);
                                var r = (n = vu(n)) ? pt(e) : 0;
                                return n && r < n ? e + Go(n - r, t) : e
                            }, zt.padStart = function(e, n, t) {
                                e = bu(e);
                                var r = (n = vu(n)) ? pt(e) : 0;
                                return n && r < n ? Go(n - r, t) + e : e
                            }, zt.parseInt = function(e, n, t) {
                                return t || null == n ? n = 0 : n && (n = +n), _t(bu(e).replace(ae, ""), n || 0)
                            }, zt.random = function(e, n, t) {
                                if (t && "boolean" != typeof t && Si(e, n, t) && (n = t = o), t === o && ("boolean" == typeof n ? (t = n, n = o) : "boolean" == typeof e && (t = e, e = o)), e === o && n === o ? (e = 0, n = 1) : (e = pu(e), n === o ? (n = e, e = 0) : n = pu(n)), e > n) {
                                    var r = e;
                                    e = n, n = r
                                }
                                if (t || e % 1 || n % 1) {
                                    var i = At();
                                    return wt(e + i * (n - e + dn("1e-" + ((i + "").length - 1))), n)
                                }
                                return Yr(e, n)
                            }, zt.reduce = function(e, n, t) {
                                var r = Ha(e) ? jn : Qn,
                                    o = arguments.length < 3;
                                return r(e, si(n, 4), t, o, hr)
                            }, zt.reduceRight = function(e, n, t) {
                                var r = Ha(e) ? Mn : Qn,
                                    o = arguments.length < 3;
                                return r(e, si(n, 4), t, o, pr)
                            }, zt.repeat = function(e, n, t) {
                                return n = (t ? Si(e, n, t) : n === o) ? 1 : vu(n), Qr(bu(e), n)
                            }, zt.replace = function() {
                                var e = arguments,
                                    n = bu(e[0]);
                                return e.length < 3 ? n : n.replace(e[1], e[2])
                            }, zt.result = function(e, n, t) {
                                var r = -1,
                                    i = (n = So(n, e)).length;
                                for (i || (i = 1, e = o); ++r < i;) {
                                    var a = null == e ? o : e[ji(n[r])];
                                    a === o && (r = i, a = t), e = Za(a) ? a.call(e) : a
                                }
                                return e
                            }, zt.round = Ec, zt.runInContext = e, zt.sample = function(e) {
                                return (Ha(e) ? Zt : Zr)(e)
                            }, zt.size = function(e) {
                                if (null == e) return 0;
                                if ($a(e)) return cu(e) ? pt(e) : e.length;
                                var n = gi(e);
                                return n == L || n == I ? e.size : Nr(e).length
                            }, zt.snakeCase = Ku, zt.some = function(e, n, t) {
                                var r = Ha(e) ? Bn : io;
                                return t && Si(e, n, t) && (n = o), r(e, si(n, 3))
                            }, zt.sortedIndex = function(e, n) {
                                return ao(e, n)
                            }, zt.sortedIndexBy = function(e, n, t) {
                                return uo(e, n, si(t, 2))
                            }, zt.sortedIndexOf = function(e, n) {
                                var t = null == e ? 0 : e.length;
                                if (t) {
                                    var r = ao(e, n);
                                    if (r < t && za(e[r], n)) return r
                                }
                                return -1
                            }, zt.sortedLastIndex = function(e, n) {
                                return ao(e, n, !0)
                            }, zt.sortedLastIndexBy = function(e, n, t) {
                                return uo(e, n, si(t, 2), !0)
                            }, zt.sortedLastIndexOf = function(e, n) {
                                if (null == e ? 0 : e.length) {
                                    var t = ao(e, n, !0) - 1;
                                    if (za(e[t], n)) return t
                                }
                                return -1
                            }, zt.startCase = Yu, zt.startsWith = function(e, n, t) {
                                return e = bu(e), t = null == t ? 0 : cr(vu(t), 0, e.length), n = so(n), e.slice(t, t + n.length) == n
                            }, zt.subtract = Lc, zt.sum = function(e) {
                                return e && e.length ? Jn(e, oc) : 0
                            }, zt.sumBy = function(e, n) {
                                return e && e.length ? Jn(e, si(n, 2)) : 0
                            }, zt.template = function(e, n, t) {
                                var r = zt.templateSettings;
                                t && Si(e, n, t) && (n = o), e = bu(e), n = _u({}, n, r, ei);
                                var i, a, u = _u({}, n.imports, r.imports, ei),
                                    c = Pu(u),
                                    l = nt(u, c),
                                    s = 0,
                                    f = n.interpolate || _e,
                                    d = "__p += '",
                                    h = Te((n.escape || _e).source + "|" + f.source + "|" + (f === ee ? pe : _e).source + "|" + (n.evaluate || _e).source + "|$", "g"),
                                    p = "//# sourceURL=" + (De.call(n, "sourceURL") ? (n.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++cn + "]") + "\n";
                                e.replace(h, (function(n, t, r, o, u, c) {
                                    return r || (r = o), d += e.slice(s, c).replace(Ae, ut), t && (i = !0, d += "' +\n__e(" + t + ") +\n'"), u && (a = !0, d += "';\n" + u + ";\n__p += '"), r && (d += "' +\n((__t = (" + r + ")) == null ? '' : __t) +\n'"), s = c + n.length, n
                                })), d += "';\n";
                                var v = De.call(n, "variable") && n.variable;
                                if (v) {
                                    if (de.test(v)) throw new Ee("Invalid `variable` option passed into `_.template`")
                                } else d = "with (obj) {\n" + d + "\n}\n";
                                d = (a ? d.replace(H, "") : d).replace(G, "$1").replace($, "$1;"), d = "function(" + (v || "obj") + ") {\n" + (v ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (i ? ", __e = _.escape" : "") + (a ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + d + "return __p\n}";
                                var g = Xu((function() {
                                    return Le(c, p + "return " + d).apply(o, l)
                                }));
                                if (g.source = d, Ja(g)) throw g;
                                return g
                            }, zt.times = function(e, n) {
                                if ((e = vu(e)) < 1 || e > p) return [];
                                var t = g,
                                    r = wt(e, g);
                                n = si(n), e -= g;
                                for (var o = Zn(r, n); ++t < e;) n(t);
                                return o
                            }, zt.toFinite = pu, zt.toInteger = vu, zt.toLength = gu, zt.toLower = function(e) {
                                return bu(e).toLowerCase()
                            }, zt.toNumber = mu, zt.toSafeInteger = function(e) {
                                return e ? cr(vu(e), -9007199254740991, p) : 0 === e ? e : 0
                            }, zt.toString = bu, zt.toUpper = function(e) {
                                return bu(e).toUpperCase()
                            }, zt.trim = function(e, n, t) {
                                if ((e = bu(e)) && (t || n === o)) return Xn(e);
                                if (!e || !(n = so(n))) return e;
                                var r = vt(e),
                                    i = vt(n);
                                return Ao(r, rt(r, i), ot(r, i) + 1).join("")
                            }, zt.trimEnd = function(e, n, t) {
                                if ((e = bu(e)) && (t || n === o)) return e.slice(0, gt(e) + 1);
                                if (!e || !(n = so(n))) return e;
                                var r = vt(e);
                                return Ao(r, 0, ot(r, vt(n)) + 1).join("")
                            }, zt.trimStart = function(e, n, t) {
                                if ((e = bu(e)) && (t || n === o)) return e.replace(ae, "");
                                if (!e || !(n = so(n))) return e;
                                var r = vt(e);
                                return Ao(r, rt(r, vt(n))).join("")
                            }, zt.truncate = function(e, n) {
                                var t = 30,
                                    r = "...";
                                if (nu(n)) {
                                    var i = "separator" in n ? n.separator : i;
                                    t = "length" in n ? vu(n.length) : t, r = "omission" in n ? so(n.omission) : r
                                }
                                var a = (e = bu(e)).length;
                                if (ct(e)) {
                                    var u = vt(e);
                                    a = u.length
                                }
                                if (t >= a) return e;
                                var c = t - pt(r);
                                if (c < 1) return r;
                                var l = u ? Ao(u, 0, c).join("") : e.slice(0, c);
                                if (i === o) return l + r;
                                if (u && (c += l.length - c), au(i)) {
                                    if (e.slice(c).search(i)) {
                                        var s, f = l;
                                        for (i.global || (i = Te(i.source, bu(ve.exec(i)) + "g")), i.lastIndex = 0; s = i.exec(f);) var d = s.index;
                                        l = l.slice(0, d === o ? c : d)
                                    }
                                } else if (e.indexOf(so(i), c) != c) {
                                    var h = l.lastIndexOf(i);
                                    h > -1 && (l = l.slice(0, h))
                                }
                                return l + r
                            }, zt.unescape = function(e) {
                                return (e = bu(e)) && Q.test(e) ? e.replace(K, mt) : e
                            }, zt.uniqueId = function(e) {
                                var n = ++Ne;
                                return bu(e) + n
                            }, zt.upperCase = Qu, zt.upperFirst = Ju, zt.each = ba, zt.eachRight = wa, zt.first = $i, cc(zt, (_c = {}, Sr(zt, (function(e, n) {
                                De.call(zt.prototype, n) || (_c[n] = e)
                            })), _c), {
                                chain: !1
                            }), zt.VERSION = "4.17.21", In(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], (function(e) {
                                zt[e].placeholder = zt
                            })), In(["drop", "take"], (function(e, n) {
                                Ht.prototype[e] = function(t) {
                                    t = t === o ? 1 : bt(vu(t), 0);
                                    var r = this.__filtered__ && !n ? new Ht(this) : this.clone();
                                    return r.__filtered__ ? r.__takeCount__ = wt(t, r.__takeCount__) : r.__views__.push({
                                        size: wt(t, g),
                                        type: e + (r.__dir__ < 0 ? "Right" : "")
                                    }), r
                                }, Ht.prototype[e + "Right"] = function(n) {
                                    return this.reverse()[e](n).reverse()
                                }
                            })), In(["filter", "map", "takeWhile"], (function(e, n) {
                                var t = n + 1,
                                    r = 1 == t || 3 == t;
                                Ht.prototype[e] = function(e) {
                                    var n = this.clone();
                                    return n.__iteratees__.push({
                                        iteratee: si(e, 3),
                                        type: t
                                    }), n.__filtered__ = n.__filtered__ || r, n
                                }
                            })), In(["head", "last"], (function(e, n) {
                                var t = "take" + (n ? "Right" : "");
                                Ht.prototype[e] = function() {
                                    return this[t](1).value()[0]
                                }
                            })), In(["initial", "tail"], (function(e, n) {
                                var t = "drop" + (n ? "" : "Right");
                                Ht.prototype[e] = function() {
                                    return this.__filtered__ ? new Ht(this) : this[t](1)
                                }
                            })), Ht.prototype.compact = function() {
                                return this.filter(oc)
                            }, Ht.prototype.find = function(e) {
                                return this.filter(e).head()
                            }, Ht.prototype.findLast = function(e) {
                                return this.reverse().find(e)
                            }, Ht.prototype.invokeMap = Jr((function(e, n) {
                                return "function" == typeof e ? new Ht(this) : this.map((function(t) {
                                    return Ur(t, e, n)
                                }))
                            })), Ht.prototype.reject = function(e) {
                                return this.filter(Da(si(e)))
                            }, Ht.prototype.slice = function(e, n) {
                                e = vu(e);
                                var t = this;
                                return t.__filtered__ && (e > 0 || n < 0) ? new Ht(t) : (e < 0 ? t = t.takeRight(-e) : e && (t = t.drop(e)), n !== o && (t = (n = vu(n)) < 0 ? t.dropRight(-n) : t.take(n - e)), t)
                            }, Ht.prototype.takeRightWhile = function(e) {
                                return this.reverse().takeWhile(e).reverse()
                            }, Ht.prototype.toArray = function() {
                                return this.take(g)
                            }, Sr(Ht.prototype, (function(e, n) {
                                var t = /^(?:filter|find|map|reject)|While$/.test(n),
                                    r = /^(?:head|last)$/.test(n),
                                    i = zt[r ? "take" + ("last" == n ? "Right" : "") : n],
                                    a = r || /^find/.test(n);
                                i && (zt.prototype[n] = function() {
                                    var n = this.__wrapped__,
                                        u = r ? [1] : arguments,
                                        c = n instanceof Ht,
                                        l = u[0],
                                        s = c || Ha(n),
                                        f = function(e) {
                                            var n = i.apply(zt, Nn([e], u));
                                            return r && d ? n[0] : n
                                        };
                                    s && t && "function" == typeof l && 1 != l.length && (c = s = !1);
                                    var d = this.__chain__,
                                        h = !!this.__actions__.length,
                                        p = a && !d,
                                        v = c && !h;
                                    if (!a && s) {
                                        n = v ? n : new Ht(this);
                                        var g = e.apply(n, u);
                                        return g.__actions__.push({
                                            func: pa,
                                            args: [f],
                                            thisArg: o
                                        }), new qt(g, d)
                                    }
                                    return p && v ? e.apply(this, u) : (g = this.thru(f), p ? r ? g.value()[0] : g.value() : g)
                                })
                            })), In(["pop", "push", "shift", "sort", "splice", "unshift"], (function(e) {
                                var n = Ue[e],
                                    t = /^(?:push|sort|unshift)$/.test(e) ? "tap" : "thru",
                                    r = /^(?:pop|shift)$/.test(e);
                                zt.prototype[e] = function() {
                                    var e = arguments;
                                    if (r && !this.__chain__) {
                                        var o = this.value();
                                        return n.apply(Ha(o) ? o : [], e)
                                    }
                                    return this[t]((function(t) {
                                        return n.apply(Ha(t) ? t : [], e)
                                    }))
                                }
                            })), Sr(Ht.prototype, (function(e, n) {
                                var t = zt[n];
                                if (t) {
                                    var r = t.name + "";
                                    De.call(Pt, r) || (Pt[r] = []), Pt[r].push({
                                        name: n,
                                        func: t
                                    })
                                }
                            })), Pt[Wo(o, 2).name] = [{
                                name: "wrapper",
                                func: o
                            }], Ht.prototype.clone = function() {
                                var e = new Ht(this.__wrapped__);
                                return e.__actions__ = Uo(this.__actions__), e.__dir__ = this.__dir__, e.__filtered__ = this.__filtered__, e.__iteratees__ = Uo(this.__iteratees__), e.__takeCount__ = this.__takeCount__, e.__views__ = Uo(this.__views__), e
                            }, Ht.prototype.reverse = function() {
                                if (this.__filtered__) {
                                    var e = new Ht(this);
                                    e.__dir__ = -1, e.__filtered__ = !0
                                } else(e = this.clone()).__dir__ *= -1;
                                return e
                            }, Ht.prototype.value = function() {
                                var e = this.__wrapped__.value(),
                                    n = this.__dir__,
                                    t = Ha(e),
                                    r = n < 0,
                                    o = t ? e.length : 0,
                                    i = function(e, n, t) {
                                        var r = -1,
                                            o = t.length;
                                        for (; ++r < o;) {
                                            var i = t[r],
                                                a = i.size;
                                            switch (i.type) {
                                                case "drop":
                                                    e += a;
                                                    break;
                                                case "dropRight":
                                                    n -= a;
                                                    break;
                                                case "take":
                                                    n = wt(n, e + a);
                                                    break;
                                                case "takeRight":
                                                    e = bt(e, n - a)
                                            }
                                        }
                                        return {
                                            start: e,
                                            end: n
                                        }
                                    }(0, o, this.__views__),
                                    a = i.start,
                                    u = i.end,
                                    c = u - a,
                                    l = r ? u : a - 1,
                                    s = this.__iteratees__,
                                    f = s.length,
                                    d = 0,
                                    h = wt(c, this.__takeCount__);
                                if (!t || !r && o == c && h == c) return go(e, this.__actions__);
                                var p = [];
                                e: for (; c-- && d < h;) {
                                    for (var v = -1, g = e[l += n]; ++v < f;) {
                                        var m = s[v],
                                            y = m.iteratee,
                                            b = m.type,
                                            w = y(g);
                                        if (2 == b) g = w;
                                        else if (!w) {
                                            if (1 == b) continue e;
                                            break e
                                        }
                                    }
                                    p[d++] = g
                                }
                                return p
                            }, zt.prototype.at = va, zt.prototype.chain = function() {
                                return ha(this)
                            }, zt.prototype.commit = function() {
                                return new qt(this.value(), this.__chain__)
                            }, zt.prototype.next = function() {
                                this.__values__ === o && (this.__values__ = hu(this.value()));
                                var e = this.__index__ >= this.__values__.length;
                                return {
                                    done: e,
                                    value: e ? o : this.__values__[this.__index__++]
                                }
                            }, zt.prototype.plant = function(e) {
                                for (var n, t = this; t instanceof Vt;) {
                                    var r = Bi(t);
                                    r.__index__ = 0, r.__values__ = o, n ? i.__wrapped__ = r : n = r;
                                    var i = r;
                                    t = t.__wrapped__
                                }
                                return i.__wrapped__ = e, n
                            }, zt.prototype.reverse = function() {
                                var e = this.__wrapped__;
                                if (e instanceof Ht) {
                                    var n = e;
                                    return this.__actions__.length && (n = new Ht(this)), (n = n.reverse()).__actions__.push({
                                        func: pa,
                                        args: [na],
                                        thisArg: o
                                    }), new qt(n, this.__chain__)
                                }
                                return this.thru(na)
                            }, zt.prototype.toJSON = zt.prototype.valueOf = zt.prototype.value = function() {
                                return go(this.__wrapped__, this.__actions__)
                            }, zt.prototype.first = zt.prototype.head, Ze && (zt.prototype[Ze] = function() {
                                return this
                            }), zt
                        }();
                        gn._ = yt, (r = function() {
                            return yt
                        }.call(n, t, n, e)) === o || (e.exports = r)
                    }.call(this)
            }
        },
        n = {};

    function t(r) {
        var o = n[r];
        if (void 0 !== o) return o.exports;
        var i = n[r] = {
            id: r,
            loaded: !1,
            exports: {}
        };
        return e[r].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports
    }
    t.n = function(e) {
            var n = e && e.__esModule ? function() {
                return e.default
            } : function() {
                return e
            };
            return t.d(n, {
                a: n
            }), n
        }, t.d = function(e, n) {
            for (var r in n) t.o(n, r) && !t.o(e, r) && Object.defineProperty(e, r, {
                enumerable: !0,
                get: n[r]
            })
        }, t.g = function() {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")()
            } catch (e) {
                if ("object" == typeof window) return window
            }
        }(), t.o = function(e, n) {
            return Object.prototype.hasOwnProperty.call(e, n)
        }, t.nmd = function(e) {
            return e.paths = [], e.children || (e.children = []), e
        },
        function() {
            "use strict";
            var e = React,
                n = t.n(e),
                r = ReactDOM,
                o = CoreUtilities,
                i = Roblox,
                a = HeaderScripts,
                u = ReactUtilities,
                c = ReactStyleGuide,
                l = CoreRobloxUtilities,
                s = function(e, n) {
                    return s = Object.setPrototypeOf || {
                        __proto__: []
                    }
                    instanceof Array && function(e, n) {
                        e.__proto__ = n
                    } || function(e, n) {
                        for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t])
                    }, s(e, n)
                };

            function f(e, n) {
                if ("function" != typeof n && null !== n) throw new TypeError("Class extends value " + String(n) + " is not a constructor or null");

                function t() {
                    this.constructor = e
                }
                s(e, n), e.prototype = null === n ? Object.create(n) : (t.prototype = n.prototype, new t)
            }
            var d = function() {
                return d = Object.assign || function(e) {
                    for (var n, t = 1, r = arguments.length; t < r; t++)
                        for (var o in n = arguments[t]) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
                    return e
                }, d.apply(this, arguments)
            };

            function h(e, n, t, r) {
                return new(t || (t = Promise))((function(o, i) {
                    function a(e) {
                        try {
                            c(r.next(e))
                        } catch (e) {
                            i(e)
                        }
                    }

                    function u(e) {
                        try {
                            c(r.throw(e))
                        } catch (e) {
                            i(e)
                        }
                    }

                    function c(e) {
                        var n;
                        e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                            e(n)
                        }))).then(a, u)
                    }
                    c((r = r.apply(e, n || [])).next())
                }))
            }

            function p(e, n) {
                var t, r, o, i = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    },
                    a = Object.create(("function" == typeof Iterator ? Iterator : Object).prototype);
                return a.next = u(0), a.throw = u(1), a.return = u(2), "function" == typeof Symbol && (a[Symbol.iterator] = function() {
                    return this
                }), a;

                function u(u) {
                    return function(c) {
                        return function(u) {
                            if (t) throw new TypeError("Generator is already executing.");
                            for (; a && (a = 0, u[0] && (i = 0)), i;) try {
                                if (t = 1, r && (o = 2 & u[0] ? r.return : u[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, u[1])).done) return o;
                                switch (r = 0, o && (u = [2 & u[0], o.value]), u[0]) {
                                    case 0:
                                    case 1:
                                        o = u;
                                        break;
                                    case 4:
                                        return i.label++, {
                                            value: u[1],
                                            done: !1
                                        };
                                    case 5:
                                        i.label++, r = u[1], u = [0];
                                        continue;
                                    case 7:
                                        u = i.ops.pop(), i.trys.pop();
                                        continue;
                                    default:
                                        if (!((o = (o = i.trys).length > 0 && o[o.length - 1]) || 6 !== u[0] && 2 !== u[0])) {
                                            i = 0;
                                            continue
                                        }
                                        if (3 === u[0] && (!o || u[1] > o[0] && u[1] < o[3])) {
                                            i.label = u[1];
                                            break
                                        }
                                        if (6 === u[0] && i.label < o[1]) {
                                            i.label = o[1], o = u;
                                            break
                                        }
                                        if (o && i.label < o[2]) {
                                            i.label = o[2], i.ops.push(u);
                                            break
                                        }
                                        o[2] && i.ops.pop(), i.trys.pop();
                                        continue
                                }
                                u = n.call(e, i)
                            } catch (e) {
                                u = [6, e], r = 0
                            } finally {
                                t = o = 0
                            }
                            if (5 & u[0]) throw u[1];
                            return {
                                value: u[0] ? u[1] : void 0,
                                done: !0
                            }
                        }([u, c])
                    }
                }
            }

            function v(e) {
                return v = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                    return typeof e
                } : function(e) {
                    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                }, v(e)
            }
            "function" == typeof SuppressedError && SuppressedError;
            var g, m = "x-csrf-token",
                y = m,
                b = function() {
                    function e() {
                        var e;
                        try {
                            if ("undefined" != typeof window) return void(this.currentToken = null !== (e = localStorage.getItem(y)) && void 0 !== e ? e : "")
                        } catch (e) {
                            console.warn("Error reading localStorage key â€œ".concat(y, "â€:"), e)
                        }
                        this.currentToken = ""
                    }
                    return e.prototype.storeCRSFToken = function(e) {
                        this.currentToken = e;
                        try {
                            "undefined" != typeof window && localStorage.setItem(y, e)
                        } catch (e) {
                            console.warn("Error setting localStorage key â€œ".concat(y, "â€:"), e)
                        }
                    }, e.prototype.pre = function(e) {
                        var n = e.url,
                            t = e.init,
                            r = this.currentToken;
                        return t.headers && "object" == v(t.headers) && m in t.headers && (r = t.headers[m]) && this.storeCRSFToken(r), "POST" === t.method || "PATCH" === t.method || "DELETE" === t.method || "PUT" === t.method ? Promise.resolve({
                            url: n,
                            init: this.prepareRequestInit(t)
                        }) : Promise.resolve({
                            url: n,
                            init: t
                        })
                    }, e.prototype.post = function(e) {
                        var n = e.fetch,
                            t = e.url,
                            r = e.init,
                            o = e.response,
                            i = o.headers.get(m);
                        return 403 === o.status && o.headers.has(m) && null !== i ? (this.storeCRSFToken(i), n(t, this.prepareRequestInit(r))) : Promise.resolve(o)
                    }, e.prototype.prepareRequestInit = function(e) {
                        var n;
                        return d(d({}, e), {
                            headers: d(d({}, e.headers), (n = {}, n[m] = this.currentToken, n))
                        })
                    }, e
                }(),
                w = "rblx-challenge-id",
                S = "rblx-challenge-type",
                _ = "rblx-challenge-metadata";
            ! function(e) {
                e.UNKNOWN = "unknown", e.INVALIDATED = "invalidated", e.ABANDONED = "abandoned", e.LOADFAILED = "loadfailed"
            }(g || (g = {}));
            var A = function(e) {
                    function n(n) {
                        var t = e.call(this, "challenge error for challenge kind ".concat(n.kind)) || this;
                        return t.parameters = n, t
                    }
                    return f(n, e), n.prototype.match = function(e) {
                        return this.parameters.kind === e.parameters.kind && JSON.stringify(this.parameters.data) === JSON.stringify(e.parameters.data)
                    }, n.prototype.matchAbandoned = function(e) {
                        return this.match(e) && e.parameters.kind === g.ABANDONED
                    }, n
                }(Error),
                E = function() {
                    function e(e, n) {
                        void 0 === n && (n = "iframe"), this.robloxSiteDomain = e, this.genericChallengeMiddlewareType = n, this.challengeLifecycleListener = null
                    }
                    return e.prototype.getTargetSubdomain = function() {
                        return window.location.hostname.split(".").slice(0, -2).join(".")
                    }, e.prototype.constructHybridChallengeFrameURL = function(e) {
                        var n, t, r, o, i = new URLSearchParams([
                            ["challenge-type", "generic"],
                            ["dark-mode", "true"],
                            ["barista-mode", "true"],
                            ["generic-challenge-type", null !== (n = e.headers.get(S)) && void 0 !== n ? n : ""],
                            ["generic-challenge-id", null !== (t = e.headers.get(w)) && void 0 !== t ? t : ""],
                            ["challenge-metadata-json", null !== (r = e.headers.get(_)) && void 0 !== r ? r : ""],
                            ["origin", null !== (o = this.getTargetSubdomain()) && void 0 !== o ? o : ""]
                        ]);
                        return new URL("https://www.".concat(this.robloxSiteDomain, "/challenge/cdn/hybrid?").concat(i.toString()))
                    }, e.prototype.removeChallengeLifecycleListener = function() {
                        this.challengeLifecycleListener && window.removeEventListener("message", this.challengeLifecycleListener, !1)
                    }, e.prototype.createChallengeLifecycleListener = function(e, n, t, r) {
                        var o = this;
                        return function(i) {
                            var a, u, c, l, s, f;
                            if (i.data && i.data.genericChallengeResponse) {
                                var h = n.fetch,
                                    p = n.url,
                                    v = n.init,
                                    m = n.response;
                                switch (i.data.genericChallengeResponse.type) {
                                    case "challengeAbandoned":
                                        o.removeChallengeLifecycleListener(), e.remove(), r(new A({
                                            kind: g.ABANDONED,
                                            data: {
                                                challengeType: null !== (a = m.headers.get(S)) && void 0 !== a ? a : ""
                                            }
                                        }));
                                        break;
                                    case "challengeDisplayed":
                                        break;
                                    case "challengeCompleted":
                                        o.removeChallengeLifecycleListener(), e.remove(), (y = i.data.genericChallengeResponse.data).challengeType && y.metadata ? t(h(p, function(e, n, t) {
                                            var r, o, i;
                                            return d(d({}, e), {
                                                headers: d(d({}, e.headers), (r = {}, r[w] = null !== (o = n.headers.get(w)) && void 0 !== o ? o : "", r[_] = btoa(JSON.stringify(t)), r[S] = null !== (i = n.headers.get(S)) && void 0 !== i ? i : "", r))
                                            })
                                        }(v, m, y.metadata))) : r(new A({
                                            kind: g.UNKNOWN,
                                            data: {
                                                challengeType: null !== (u = m.headers.get(S)) && void 0 !== u ? u : ""
                                            }
                                        }));
                                        break;
                                    case "challengeInvalidated":
                                        o.removeChallengeLifecycleListener(), e.remove(), (y = i.data.genericChallengeResponse.data) && y.challengeType && y.metadata ? r(new A({
                                            kind: g.INVALIDATED,
                                            data: y
                                        })) : r(new A({
                                            kind: g.INVALIDATED,
                                            data: {
                                                challengeType: null !== (c = m.headers.get(S)) && void 0 !== c ? c : ""
                                            }
                                        }));
                                        break;
                                    case "challengeParsed":
                                        !1 === (y = i.data.genericChallengeResponse.data).parsed && (o.removeChallengeLifecycleListener(), e.remove(), r(new A({
                                            kind: g.UNKNOWN,
                                            data: {
                                                challengeType: null !== (l = m.headers.get(S)) && void 0 !== l ? l : ""
                                            }
                                        })));
                                        break;
                                    case "challengeInitialized":
                                        !1 === (y = i.data.genericChallengeResponse.data).initialized && (o.removeChallengeLifecycleListener(), e.remove(), r(new A({
                                            kind: g.UNKNOWN,
                                            data: {
                                                challengeType: null !== (s = m.headers.get(S)) && void 0 !== s ? s : ""
                                            }
                                        })));
                                        break;
                                    case "challengePageLoaded":
                                        var y;
                                        !1 === (y = i.data.genericChallengeResponse.data).pageLoaded && (o.removeChallengeLifecycleListener(), e.remove(), r(new A({
                                            kind: g.LOADFAILED,
                                            data: {
                                                challengeType: null !== (f = m.headers.get(S)) && void 0 !== f ? f : ""
                                            }
                                        })))
                                }
                            }
                        }
                    }, e.prototype.startChallengeLifecycleListener = function(e, n, t, r) {
                        window && e && (this.challengeLifecycleListener = this.createChallengeLifecycleListener(e, n, t, r), window.addEventListener("message", this.challengeLifecycleListener, !1))
                    }, e.prototype.post = function(e) {
                        var n = this,
                            t = e.response;
                        return 403 === t.status && t.headers.has(w) && t.headers.has(S) && t.headers.has(_) && "iframe" === this.genericChallengeMiddlewareType ? new Promise((function(r, o) {
                            var i, a;
                            n.startChallengeLifecycleListener(function(e) {
                                return document && document.body ? document.body.appendChild(e) : null
                            }((i = n.constructHybridChallengeFrameURL(t), (a = document.createElement("iframe")).id = "challenge-frame", a.allowFullscreen = !0, a.setAttribute("allowtransparency", "true"), a.setAttribute("allow", "publickey-credentials-get;publickey-credentials-create"), a.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; visibility: hidden; color-scheme: normal; border: none; z-index: 2147483647;", a.src = i.toString(), a.onload = function() {
                                a.style.visibility = "visible"
                            }, a)), e, r, o)
                        })) : Promise.resolve(t)
                    }, e
                }(),
                L = function() {
                    var e = window.location.hostname.split(".").slice(0, -2).join(".");
                    return e.includes("create") ? "creator_hub" : e.includes("advertise") ? "ads_manager" : "creator_hub"
                },
                k = function(e, n) {
                    var t = "https://apis.".concat(e, "/account-security-service/v1/metrics/record");
                    try {
                        fetch(t, {
                            method: "POST",
                            body: JSON.stringify({
                                name: "load_time_hba_frame",
                                value: n,
                                labelValues: {
                                    origin_site: L()
                                }
                            })
                        })
                    } catch (e) {}
                },
                C = function(e, n) {
                    var t = "https://apis.".concat(e, "/account-security-service/v1/metrics/record");
                    try {
                        fetch(t, {
                            method: "POST",
                            body: JSON.stringify({
                                name: "response_time_hba_frame",
                                value: n,
                                labelValues: {
                                    origin_site: L()
                                }
                            })
                        })
                    } catch (e) {}
                },
                T = function(e, n, t, r, o, i, a) {
                    var u;
                    if (void 0 === a && (a = I), window) {
                        var c = performance.now(),
                            l = window.setTimeout((function() {
                                C(t, performance.now() - c),
                                    function(e) {
                                        var n = "https://apis.".concat(e, "/account-security-service/v1/metrics/record");
                                        try {
                                            fetch(n, {
                                                method: "POST",
                                                body: JSON.stringify({
                                                    name: "event_hba_frame",
                                                    value: 1,
                                                    labelValues: {
                                                        event_type: "FrameResponseTimedOut",
                                                        origin_site: L()
                                                    }
                                                })
                                            })
                                        } catch (e) {}
                                    }(t), e({
                                        url: o.url,
                                        init: o.init
                                    })
                            }), a),
                            s = function(e, n, t, r, o, i, a) {
                                return function n(u) {
                                    var c = u.data,
                                        l = r.url,
                                        s = r.init;
                                    if (u.origin === "https://www.".concat(t) && "dataFromHbaFrame" === c.msg && "batHeader" === c.data.type && (!c.data.identifier || c.data.identifier === o))
                                        if (!c.data.isError && c.data.batHeader) {
                                            window.clearTimeout(i), window.removeEventListener("message", n, !1), C(t, performance.now() - a);
                                            var f = c.data.batHeader;
                                            e({
                                                url: l,
                                                init: d(d({}, s), {
                                                    headers: d(d({}, s.headers), {
                                                        "x-bound-auth-token": f["x-bound-auth-token"]
                                                    })
                                                })
                                            })
                                        } else window.clearTimeout(i), window.removeEventListener("message", n, !1), C(t, performance.now() - a), e({
                                            url: l,
                                            init: s
                                        })
                                }
                            }(e, 0, t, o, i, l, c);
                        window.addEventListener("message", s, !1), null === (u = r.contentWindow) || void 0 === u || u.postMessage({
                            msg: "signSubdomainRequest",
                            identifier: i,
                            serializedSubdomainRequestData: JSON.stringify({
                                url: o.url,
                                requestInit: o.init
                            })
                        }, "https://www.".concat(t))
                    }
                },
                x = 1500,
                I = 100,
                U = function() {
                    function e(e, n, t) {
                        void 0 === n && (n = x), void 0 === t && (t = I);
                        var r = this;
                        this.getOrCreateHbaFrame = function() {
                            if (document) {
                                var e = document.getElementById("hba-frame");
                                return null === e && (e = function(e) {
                                    return (null === document || void 0 === document ? void 0 : document.body) ? document.body.appendChild(e) : null
                                }(function(e) {
                                    var n = document.createElement("iframe");
                                    return n.id = "hba-frame", n.style.cssText = "position: fixed; top: 0; left: 0; width: 0%; height: 0%; z-index: -1", n.src = "https://www.".concat(e, "/hba/iframe"), n
                                }(r.robloxSiteDomain))), e
                            }
                            return null
                        }, this.robloxSiteDomain = e, this.hbaFrameAlreadyLoaded = !1, this.hbaFrameLoadFailed = !1, this.hbaFrame = null, this.loadTimeOut = n, this.dataTimeOut = t
                    }
                    return e.prototype.pre = function(e) {
                        var n = this;
                        return new Promise((function(t, r) {
                            var o = e.url,
                                i = e.init;
                            if (n.hbaFrame = n.getOrCreateHbaFrame(), null !== n.hbaFrame) {
                                var a = crypto.randomUUID();
                                n.hbaFrameAlreadyLoaded ? T(t, 0, n.robloxSiteDomain, n.hbaFrame, e, a, n.dataTimeOut) : n.hbaFrameLoadFailed ? t({
                                    url: o,
                                    init: i
                                }) : function(e, n, t) {
                                    return void 0 === t && (t = x), new Promise((function(r, o) {
                                        var i, a = performance.now(),
                                            u = window.setTimeout((function() {
                                                k(e, performance.now() - a),
                                                    function(e) {
                                                        var n = "https://apis.".concat(e, "/account-security-service/v1/metrics/record");
                                                        try {
                                                            fetch(n, {
                                                                method: "POST",
                                                                body: JSON.stringify({
                                                                    name: "event_hba_frame",
                                                                    value: 1,
                                                                    labelValues: {
                                                                        event_type: "FrameLoadTimedOut",
                                                                        origin_site: L()
                                                                    }
                                                                })
                                                            })
                                                        } catch (e) {}
                                                    }(e), o(new Error("Promise timed out after ".concat(t, " ms")))
                                            }), t),
                                            c = function(e, n, t, r, o) {
                                                return function n(i) {
                                                    var a = i.data;
                                                    i.origin === "https://www.".concat(t) && "dataFromHbaFrame" === a.msg && "loaded" === a.data.type && (window.removeEventListener("message", n, !1), window.clearTimeout(r), k(t, performance.now() - o), e())
                                                }
                                            }(r, 0, e, u, a);
                                        window.addEventListener("message", c, !1), null === (i = n.contentWindow) || void 0 === i || i.postMessage({
                                            msg: "checkLoadedRequest"
                                        }, "https://www.".concat(e))
                                    }))
                                }(n.robloxSiteDomain, n.hbaFrame, n.loadTimeOut).then((function() {
                                    n.hbaFrame ? (n.hbaFrameAlreadyLoaded = !0, T(t, 0, n.robloxSiteDomain, n.hbaFrame, e, a, n.dataTimeOut)) : t({
                                        url: o,
                                        init: i
                                    })
                                })).catch((function() {
                                    n.hbaFrameLoadFailed = !0, t({
                                        url: o,
                                        init: i
                                    })
                                }))
                            } else t({
                                url: o,
                                init: i
                            })
                        }))
                    }, e
                }(),
                P = function() {
                    function e(e) {
                        this.unifiedLogger = e
                    }
                    return e.prototype.post = function(e) {
                        return this.unifiedLogger.logApiVitalsEvent({
                            eventName: "apiVitals",
                            parameters: {
                                elapsedTime: String(e.elapsedTime),
                                apiUrl: e.url,
                                statusCode: String(e.response.status)
                            }
                        }), Promise.resolve(e.response)
                    }, e
                }(),
                O = function() {
                    function e() {
                        this.observers = []
                    }
                    return e.prototype.subscribe = function(e) {
                        var n = this;
                        return this.observers.push(e),
                            function() {
                                return n.unsubscribe(e)
                            }
                    }, e.prototype.unsubscribe = function(e) {
                        this.observers = this.observers.filter((function(n) {
                            return n !== e
                        }))
                    }, e.prototype.post = function(e) {
                        var n = e.url,
                            t = e.response;
                        return 503 === t.status && this.observers.forEach((function(e) {
                            return e(n)
                        })), Promise.resolve(t)
                    }, e
                }(),
                R = function() {
                    function e() {}
                    return e.prototype.parseUrl = function(e) {
                        return e.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/\d+/, "/number")
                    }, e.prototype.post = function(e) {
                        var n = this;
                        return Promise.resolve().then((function() {
                            var e = new Error("Cannot find module '@sentry/nextjs'");
                            throw e.code = "MODULE_NOT_FOUND", e
                        })).then((function(t) {
                            var r, o = t.captureException;
                            return !1 === e.response.ok && !1 === [401, 403, 404].includes(e.response.status) && o(new Error("Network error"), {
                                tags: {
                                    apiUrl: n.parseUrl(e.url),
                                    apiStatus: null === (r = e.response) || void 0 === r ? void 0 : r.status,
                                    cors: !1
                                }
                            }), e.response
                        }))
                    }, e.prototype.onError = function(e) {
                        var n = this;
                        return Promise.resolve().then((function() {
                            var e = new Error("Cannot find module '@sentry/nextjs'");
                            throw e.code = "MODULE_NOT_FOUND", e
                        })).then((function(t) {
                            var r;
                            return (0, t.captureException)(new Error("Network error"), {
                                tags: {
                                    apiUrl: n.parseUrl(e.url),
                                    apiStatus: null === (r = e.response) || void 0 === r ? void 0 : r.status,
                                    cors: !0
                                }
                            }), e.response
                        }))
                    }, e
                }(),
                F = function() {
                    function e(e) {
                        void 0 === e && (e = {}), this.configuration = e
                    }
                    return Object.defineProperty(e.prototype, "config", {
                        set: function(e) {
                            this.configuration = e
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "basePath", {
                        get: function() {
                            return this.configuration.basePath
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "fetchApi", {
                        get: function() {
                            return this.configuration.fetchApi || window.fetch.bind(window)
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "middleware", {
                        get: function() {
                            return this.configuration.middleware || []
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "queryParamsStringify", {
                        get: function() {
                            return this.configuration.queryParamsStringify || W
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "username", {
                        get: function() {
                            return this.configuration.username
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "password", {
                        get: function() {
                            return this.configuration.password
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "apiKey", {
                        get: function() {
                            var e = this.configuration.apiKey;
                            if (e) return "function" == typeof e ? e : function() {
                                return e
                            }
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "accessToken", {
                        get: function() {
                            var e = this,
                                n = this.configuration.accessToken;
                            if (n) return "function" == typeof n ? n : function() {
                                return h(e, void 0, void 0, (function() {
                                    return p(this, (function(e) {
                                        return [2, n]
                                    }))
                                }))
                            }
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "headers", {
                        get: function() {
                            return this.configuration.headers
                        },
                        enumerable: !1,
                        configurable: !0
                    }), Object.defineProperty(e.prototype, "credentials", {
                        get: function() {
                            return this.configuration.credentials
                        },
                        enumerable: !1,
                        configurable: !0
                    }), e
                }(),
                D = new F,
                N = function() {
                    function e(e) {
                        void 0 === e && (e = D);
                        var n = this;
                        this.configuration = e, this.fetchApi = function(e, t) {
                            return h(n, void 0, void 0, (function() {
                                var n, r, o, i, a, u, c, l, s, f, h, v;
                                return p(this, (function(p) {
                                    switch (p.label) {
                                        case 0:
                                            n = {
                                                url: e,
                                                init: t
                                            }, r = 0, o = this.middleware, p.label = 1;
                                        case 1:
                                            return r < o.length ? (v = o[r]).pre ? [4, v.pre(d({
                                                fetch: this.fetchApi
                                            }, n))] : [3, 3] : [3, 4];
                                        case 2:
                                            n = p.sent() || n, p.label = 3;
                                        case 3:
                                            return r++, [3, 1];
                                        case 4:
                                            i = void 0, a = performance.now(), p.label = 5;
                                        case 5:
                                            return p.trys.push([5, 7, , 12]), [4, (this.configuration.fetchApi || fetch)(n.url, n.init)];
                                        case 6:
                                            return i = p.sent(), u = performance.now(), [3, 12];
                                        case 7:
                                            c = p.sent(), u = performance.now(), l = 0, s = this.middleware, p.label = 8;
                                        case 8:
                                            return l < s.length ? (v = s[l]).onError ? [4, v.onError({
                                                fetch: this.fetchApi,
                                                url: n.url,
                                                init: n.init,
                                                error: c,
                                                response: i ? i.clone() : void 0
                                            })] : [3, 10] : [3, 11];
                                        case 9:
                                            i = p.sent() || i, p.label = 10;
                                        case 10:
                                            return l++, [3, 8];
                                        case 11:
                                            if (void 0 === i) throw c instanceof Error ? new B(c, "The request failed and the interceptors did not return an alternative response") : c;
                                            return [3, 12];
                                        case 12:
                                            f = 0, h = this.middleware, p.label = 13;
                                        case 13:
                                            return f < h.length ? (v = h[f]).post ? [4, v.post({
                                                fetch: this.fetchApi,
                                                url: n.url,
                                                init: n.init,
                                                response: i.clone(),
                                                elapsedTime: u - a
                                            })] : [3, 15] : [3, 16];
                                        case 14:
                                            i = p.sent() || i, p.label = 15;
                                        case 15:
                                            return f++, [3, 13];
                                        case 16:
                                            return [2, i]
                                    }
                                }))
                            }))
                        }, this.middleware = e.middleware
                    }
                    return e.prototype.withMiddleware = function() {
                        for (var e, n = [], t = 0; t < arguments.length; t++) n[t] = arguments[t];
                        var r = this.clone();
                        return r.middleware = (e = r.middleware).concat.apply(e, n), r
                    }, e.prototype.withPreMiddleware = function() {
                        for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
                        var t = e.map((function(e) {
                            return {
                                pre: e
                            }
                        }));
                        return this.withMiddleware.apply(this, t)
                    }, e.prototype.withPostMiddleware = function() {
                        for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
                        var t = e.map((function(e) {
                            return {
                                post: e
                            }
                        }));
                        return this.withMiddleware.apply(this, t)
                    }, e.prototype.isJsonMime = function(n) {
                        return !!n && e.jsonRegex.test(n)
                    }, e.prototype.request = function(e, n) {
                        return h(this, void 0, void 0, (function() {
                            var t, r, o, i;
                            return p(this, (function(a) {
                                switch (a.label) {
                                    case 0:
                                        return [4, this.createFetchParams(e, n)];
                                    case 1:
                                        return t = a.sent(), r = t.url, o = t.init, [4, this.fetchApi(r, o)];
                                    case 2:
                                        if ((i = a.sent()) && i.status >= 200 && i.status < 300) return [2, i];
                                        throw new M(i, "Response from ".concat(i.url, " returned an error code ").concat(i.status))
                                }
                            }))
                        }))
                    }, e.prototype.createFetchParams = function(e, n) {
                        return h(this, void 0, void 0, (function() {
                            var t, r, o, i, a, u, c, l = this;
                            return p(this, (function(s) {
                                switch (s.label) {
                                    case 0:
                                        return t = this.configuration.basePath + e.path, void 0 !== e.query && 0 !== Object.keys(e.query).length && (t += "?" + this.configuration.queryParamsStringify(e.query)), r = Object.assign({}, this.configuration.headers, e.headers), Object.keys(r).forEach((function(e) {
                                            return void 0 === r[e] ? delete r[e] : {}
                                        })), o = "function" == typeof n ? n : function() {
                                            return h(l, void 0, void 0, (function() {
                                                return p(this, (function(e) {
                                                    return [2, n]
                                                }))
                                            }))
                                        }, i = {
                                            method: e.method,
                                            headers: r,
                                            body: e.body,
                                            credentials: this.configuration.credentials
                                        }, u = [d({}, i)], [4, o({
                                            init: i,
                                            context: e
                                        })];
                                    case 1:
                                        return a = d.apply(void 0, u.concat([s.sent()])), c = d(d({}, a), {
                                            body: (f = a.body, "undefined" != typeof FormData && f instanceof FormData || a.body instanceof URLSearchParams || j(a.body) ? a.body : JSON.stringify(a.body))
                                        }), [2, {
                                            url: t,
                                            init: c
                                        }]
                                }
                                var f
                            }))
                        }))
                    }, e.prototype.clone = function() {
                        var e = new(0, this.constructor)(this.configuration);
                        return e.middleware = this.middleware.slice(), e
                    }, e.jsonRegex = new RegExp("^(:?application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(:?;.*)?$", "i"), e
                }();

            function j(e) {
                return "undefined" != typeof Blob && e instanceof Blob
            }
            var M = function(e) {
                    function n(n, t) {
                        var r = e.call(this, t) || this;
                        return r.response = n, r.name = "ResponseError", r
                    }
                    return f(n, e), n
                }(Error),
                B = function(e) {
                    function n(n, t) {
                        var r = e.call(this, t) || this;
                        return r.cause = n, r.name = "FetchError", r
                    }
                    return f(n, e), n
                }(Error);
            ! function(e) {
                function n(n, t) {
                    var r = e.call(this, t) || this;
                    return r.field = n, r.name = "RequiredError", r
                }
                f(n, e)
            }(Error);

            function z(e, n) {
                return null != e[n]
            }

            function W(e, n) {
                return void 0 === n && (n = ""), Object.keys(e).map((function(t) {
                    return V(t, e[t], n)
                })).filter((function(e) {
                    return e.length > 0
                })).join("&")
            }

            function V(e, n, t) {
                void 0 === t && (t = "");
                var r = t + (t.length ? "[".concat(e, "]") : e);
                if (n instanceof Array) {
                    var o = n.map((function(e) {
                        return encodeURIComponent(String(e))
                    })).join("&".concat(encodeURIComponent(r), "="));
                    return "".concat(encodeURIComponent(r), "=").concat(o)
                }
                return n instanceof Set ? V(e, Array.from(n), t) : n instanceof Date ? "".concat(encodeURIComponent(r), "=").concat(encodeURIComponent(n.toISOString())) : n instanceof Object ? W(n, r) : "".concat(encodeURIComponent(r), "=").concat(encodeURIComponent(String(n)))
            }
            var q = function() {
                    function e(e, n) {
                        void 0 === n && (n = function(e) {
                            return e
                        }), this.raw = e, this.transformer = n
                    }
                    return e.prototype.value = function() {
                        return h(this, void 0, void 0, (function() {
                            var e;
                            return p(this, (function(n) {
                                switch (n.label) {
                                    case 0:
                                        return e = this.transformer, [4, this.raw.json()];
                                    case 1:
                                        return [2, e.apply(this, [n.sent()])]
                                }
                            }))
                        }))
                    }, e
                }(),
                H = (function() {
                    function e(e) {
                        this.raw = e
                    }
                    e.prototype.value = function() {
                        return h(this, void 0, void 0, (function() {
                            return p(this, (function(e) {
                                return [2, void 0]
                            }))
                        }))
                    }
                }(), function() {
                    function e(e) {
                        this.raw = e
                    }
                    e.prototype.value = function() {
                        return h(this, void 0, void 0, (function() {
                            return p(this, (function(e) {
                                switch (e.label) {
                                    case 0:
                                        return [4, this.raw.blob()];
                                    case 1:
                                        return [2, e.sent()]
                                }
                            }))
                        }))
                    }
                }(), function() {
                    function e(e) {
                        this.raw = e
                    }
                    e.prototype.value = function() {
                        return h(this, void 0, void 0, (function() {
                            return p(this, (function(e) {
                                switch (e.label) {
                                    case 0:
                                        return [4, this.raw.text()];
                                    case 1:
                                        return [2, e.sent()]
                                }
                            }))
                        }))
                    }
                }(), new b),
                G = new O,
                $ = [function(e) {
                    return !0 === e.enableSentry ? new R : void 0
                }, function(e) {
                    return e.robloxSiteDomain && e.enableBoundAuthToken ? new U(e.robloxSiteDomain, e.boundAuthTokenLoadTimeout, e.boundAuthTokenDataTimeout) : void 0
                }, function(e) {
                    return e.robloxSiteDomain ? new E(e.robloxSiteDomain, e.genericChallengeMiddlewareType) : void 0
                }, function(e) {
                    return e.unifiedLogger ? new P(e.unifiedLogger) : void 0
                }, function() {
                    return H
                }, function() {
                    return G
                }],
                K = function(e) {
                    function n(n) {
                        void 0 === n && (n = {});
                        var t = d({}, n),
                            r = t.middleware || [];
                        return r.unshift.apply(r, $.map((function(e) {
                            return e(t)
                        })).filter((function(e) {
                            return void 0 !== e
                        }))), t.middleware = r, e.call(this, t) || this
                    }
                    return f(n, e), n
                }(F);

            function Y(e) {
                return function(e) {
                    return null == e ? e : {
                        enableIndexedDbTelemetry: z(e, "enableIndexedDbTelemetry") ? e.enableIndexedDbTelemetry : void 0,
                        enableNewSAIOn2SV: z(e, "enableNewSAIOn2SV") ? e.enableNewSAIOn2SV : void 0,
                        enableNewSAIOnSessionManagement: z(e, "enableNewSAIOnSessionManagement") ? e.enableNewSAIOnSessionManagement : void 0,
                        enableNewSAIOnPWReset: z(e, "enableNewSAIOnPWReset") ? e.enableNewSAIOnPWReset : void 0,
                        enableNewSAIOnLogin: z(e, "enableNewSAIOnLogin") ? e.enableNewSAIOnLogin : void 0
                    }
                }(e)
            }
            var Q = function(e) {
                    function n() {
                        return null !== e && e.apply(this, arguments) || this
                    }
                    return f(n, e), n.prototype.metadataGetMetadataRaw = function(e) {
                        return h(this, void 0, void 0, (function() {
                            var n, t, r;
                            return p(this, (function(o) {
                                switch (o.label) {
                                    case 0:
                                        return n = {}, t = {}, [4, this.request({
                                            path: "/v1/metadata",
                                            method: "GET",
                                            headers: t,
                                            query: n
                                        }, e)];
                                    case 1:
                                        return r = o.sent(), [2, new q(r, (function(e) {
                                            return Y(e)
                                        }))]
                                }
                            }))
                        }))
                    }, n.prototype.metadataGetMetadata = function(e) {
                        return h(this, void 0, void 0, (function() {
                            return p(this, (function(n) {
                                switch (n.label) {
                                    case 0:
                                        return [4, this.metadataGetMetadataRaw(e)];
                                    case 1:
                                        return [4, n.sent().value()];
                                    case 2:
                                        return [2, n.sent()]
                                }
                            }))
                        }))
                    }, n
                }(N),
                J = function(e, n) {
                    return function(t) {
                        return t ? n() : e()
                    }
                },
                Z = t(8375);

            function X(e) {
                return function(n, t) {
                    return e.chain(n, (function(n) {
                        return e.map(t(n), (function() {
                            return n
                        }))
                    }))
                }
            }
            var ee = function(e, n, t) {
                if (t || 2 === arguments.length)
                    for (var r, o = 0, i = n.length; o < i; o++) !r && o in n || (r || (r = Array.prototype.slice.call(n, 0, o)), r[o] = n[o]);
                return e.concat(r || Array.prototype.slice.call(n))
            };

            function ne(e, n, t, r, o, i, a, u, c) {
                switch (arguments.length) {
                    case 1:
                        return e;
                    case 2:
                        return function() {
                            return n(e.apply(this, arguments))
                        };
                    case 3:
                        return function() {
                            return t(n(e.apply(this, arguments)))
                        };
                    case 4:
                        return function() {
                            return r(t(n(e.apply(this, arguments))))
                        };
                    case 5:
                        return function() {
                            return o(r(t(n(e.apply(this, arguments)))))
                        };
                    case 6:
                        return function() {
                            return i(o(r(t(n(e.apply(this, arguments))))))
                        };
                    case 7:
                        return function() {
                            return a(i(o(r(t(n(e.apply(this, arguments)))))))
                        };
                    case 8:
                        return function() {
                            return u(a(i(o(r(t(n(e.apply(this, arguments))))))))
                        };
                    case 9:
                        return function() {
                            return c(u(a(i(o(r(t(n(e.apply(this, arguments)))))))))
                        }
                }
            }

            function te(e, n, t, r, o, i, a, u, c) {
                switch (arguments.length) {
                    case 1:
                        return e;
                    case 2:
                        return n(e);
                    case 3:
                        return t(n(e));
                    case 4:
                        return r(t(n(e)));
                    case 5:
                        return o(r(t(n(e))));
                    case 6:
                        return i(o(r(t(n(e)))));
                    case 7:
                        return a(i(o(r(t(n(e))))));
                    case 8:
                        return u(a(i(o(r(t(n(e)))))));
                    case 9:
                        return c(u(a(i(o(r(t(n(e))))))));
                    default:
                        for (var l = arguments[0], s = 1; s < arguments.length; s++) l = arguments[s](l);
                        return l
                }
            }
            var re = function(e, n) {
                var t = "number" == typeof e ? function(n) {
                    return n.length >= e
                } : e;
                return function() {
                    var e = Array.from(arguments);
                    return t(arguments) ? n.apply(this, e) : function(t) {
                        return n.apply(void 0, ee([t], e, !1))
                    }
                }
            };

            function oe(e, n) {
                return function(t) {
                    return function(r) {
                        return e.map(r, (function(e) {
                            return n.map(e, t)
                        }))
                    }
                }
            }

            function ie(e) {
                return function(n, t) {
                    return e.map(n, (function() {
                        return t
                    }))
                }
            }

            function ae(e) {
                var n = ie(e);
                return function(e) {
                    return n(e, void 0)
                }
            }
            var ue = function(e) {
                    return {
                        _tag: "Left",
                        left: e
                    }
                },
                ce = function(e) {
                    return {
                        _tag: "Right",
                        right: e
                    }
                },
                le = (Object.prototype.hasOwnProperty, ue),
                se = ce,
                fe = re(2, (function(e, n) {
                    return _e(e) ? e : n(e.right)
                })),
                de = function(e, n) {
                    return te(e, ve(n))
                },
                he = function(e, n) {
                    return te(e, me(n))
                },
                pe = "Either",
                ve = function(e) {
                    return function(n) {
                        return _e(n) ? n : se(e(n.right))
                    }
                },
                ge = {
                    URI: pe,
                    map: de
                },
                me = (re(2, ie(ge)), ae(ge), function(e) {
                    return function(n) {
                        return _e(n) ? n : _e(e) ? e : se(n.right(e.right))
                    }
                }),
                ye = {
                    URI: pe,
                    map: de,
                    ap: he
                },
                be = {
                    URI: pe,
                    map: de,
                    ap: he,
                    chain: fe
                },
                we = function(e, n) {
                    return function(t) {
                        return _e(t) ? le(e(t.left)) : se(n(t.right))
                    }
                },
                Se = function(e) {
                    return function(n) {
                        return _e(n) ? le(e(n.left)) : n
                    }
                },
                _e = function(e) {
                    return "Left" === e._tag
                },
                Ae = function(e, n) {
                    return function(t) {
                        return _e(t) ? e(t.left) : n(t.right)
                    }
                },
                Ee = Ae;
            X(be);

            function Le(e) {
                return function(n) {
                    return e.map(n, se)
                }
            }

            function ke(e) {
                return oe(e, ge)
            }

            function Ce(e) {
                return function(e, n) {
                    return function(t) {
                        return function(r) {
                            return e.ap(e.map(r, (function(e) {
                                return function(t) {
                                    return n.ap(e, t)
                                }
                            })), t)
                        }
                    }
                }(e, ye)
            }

            function Te(e) {
                return function(n, t) {
                    return e.chain(n, (function(n) {
                        return _e(n) ? e.of(n) : t(n.right)
                    }))
                }
            }

            function xe(e) {
                return function(n, t, r) {
                    return e.map(n, we(t, r))
                }
            }

            function Ie(e) {
                return function(n, t) {
                    return e.map(n, Se(t))
                }
            }

            function Ue(e) {
                return function(n) {
                    return function(t) {
                        return e.chain(t, Ee(n, e.of))
                    }
                }
            }

            function Pe(e) {
                return function(n) {
                    return function(t) {
                        return e.chain(t, (function(t) {
                            return _e(t) ? n(t.left) : e.of(t)
                        }))
                    }
                }
            }

            function Oe(e) {
                var n = Pe(e);
                return function(t, r) {
                    return te(t, n((function(n) {
                        return e.map(r(n), (function(e) {
                            return _e(e) ? e : le(n)
                        }))
                    })))
                }
            }

            function Re(e) {
                return function(n) {
                    return ne(n, e.fromEither)
                }
            }

            function Fe(e, n) {
                var t = Re(e),
                    r = X(n);
                return function(e, n) {
                    return r(e, t(n))
                }
            }

            function De(e, n) {
                var t = X(n);
                return function(n, r) {
                    return t(n, ne(r, e.fromIO))
                }
            }

            function Ne(e, n) {
                var t = X(n);
                return function(n, r) {
                    return t(n, ne(r, e.fromTask))
                }
            }
            var je = function(e) {
                return function() {
                    return Promise.resolve().then(e)
                }
            };
            var Me = function(e, n) {
                    return te(e, ze(n))
                },
                Be = function(e, n) {
                    return te(e, We(n))
                },
                ze = function(e) {
                    return function(n) {
                        return function() {
                            return Promise.resolve().then(n).then(e)
                        }
                    }
                },
                We = function(e) {
                    return function(n) {
                        return function() {
                            return Promise.all([Promise.resolve().then(n), Promise.resolve().then(e)]).then((function(e) {
                                return (0, e[0])(e[1])
                            }))
                        }
                    }
                },
                Ve = function(e) {
                    return function() {
                        return Promise.resolve(e)
                    }
                },
                qe = re(2, (function(e, n) {
                    return function() {
                        return Promise.resolve().then(e).then((function(e) {
                            return n(e)()
                        }))
                    }
                })),
                He = "Task";
            var Ge = {
                    URI: He,
                    map: Me
                },
                $e = (re(2, ie(Ge)), ae(Ge), {
                    URI: He,
                    map: Me,
                    ap: Be
                }),
                Ke = {
                    URI: He,
                    map: Me,
                    ap: Be,
                    chain: qe
                },
                Ye = {
                    URI: He,
                    map: Me,
                    of: Ve,
                    ap: Be,
                    chain: qe
                },
                Qe = {
                    URI: He,
                    fromIO: je
                },
                Je = (function(e, n) {}({
                    fromIO: Qe.fromIO
                }, {
                    flatMap: qe
                }), X(Ke), De(Qe, Ke), function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                }),
                Ze = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(u) {
                        return function(c) {
                            return function(u) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; i && (i = 0, u[0] && (a = 0)), a;) try {
                                    if (t = 1, r && (o = 2 & u[0] ? r.return : u[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, u[1])).done) return o;
                                    switch (r = 0, o && (u = [2 & u[0], o.value]), u[0]) {
                                        case 0:
                                        case 1:
                                            o = u;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: u[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = u[1], u = [0];
                                            continue;
                                        case 7:
                                            u = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== u[0] && 2 !== u[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === u[0] && (!o || u[1] > o[0] && u[1] < o[3])) {
                                                a.label = u[1];
                                                break
                                            }
                                            if (6 === u[0] && a.label < o[1]) {
                                                a.label = o[1], o = u;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(u);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    u = n.call(e, a)
                                } catch (e) {
                                    u = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & u[0]) throw u[1];
                                return {
                                    value: u[0] ? u[1] : void 0,
                                    done: !0
                                }
                            }([u, c])
                        }
                    }
                },
                Xe = Le(Ge),
                en = ne(je, Xe),
                nn = en,
                tn = Xe,
                rn = Ve,
                on = Ue(Ye),
                an = function(e, n) {
                    return function() {
                        return Je(void 0, void 0, void 0, (function() {
                            var t;
                            return Ze(this, (function(r) {
                                switch (r.label) {
                                    case 0:
                                        return r.trys.push([0, 2, , 3]), [4, e().then(ce)];
                                    case 1:
                                        return [2, r.sent()];
                                    case 2:
                                        return t = r.sent(), [2, ue(n(t))];
                                    case 3:
                                        return [2]
                                }
                            }))
                        }))
                    }
                },
                un = (Oe(Ye), function(e, n) {
                    return te(e, ln(n))
                }),
                cn = function(e, n) {
                    return te(e, sn(n))
                },
                ln = ke(Ge),
                sn = (xe(Ge), Ie(Ge), Ce($e)),
                fn = re(2, Te(Ye)),
                dn = "TaskEither";
            var hn = {
                    URI: dn,
                    map: un
                },
                pn = (re(2, ie(hn)), ae(hn), {
                    URI: dn,
                    map: un,
                    ap: cn,
                    chain: fn
                }),
                vn = {
                    URI: dn,
                    fromEither: rn
                },
                gn = {
                    URI: dn,
                    fromIO: nn
                },
                mn = {
                    URI: dn,
                    fromIO: nn,
                    fromTask: tn
                };
            X(pn), Fe(vn, pn), De(gn, pn), Ne(mn, pn);
            var yn, bn = {
                    ActionSwitch: "Action.Switch",
                    ActionAdd: "Action.Add",
                    ActionAddAccount: "Action.AddAccount",
                    ActionLogOutAllAccounts: "Action.LogoutAllAccounts",
                    HeadingSwitchAccount: "Heading.SwitchAccount",
                    LabelAddAccountWithoutLoggingOut: "Label.AddAccountWithoutLoggingOut",
                    LabelAddOrSwitchAccount: "Label.AddOrSwitchAccount",
                    DescriptionAccountLimit: "Description.AccountLimit"
                },
                wn = {
                    HeadingAccountLimitReached: "Heading.AccountLimitReached",
                    LabelAccountLimitReached: "Label.AccountLimitReached",
                    ActionOK: "Action.OK"
                },
                Sn = {
                    LogoutAll: "logoutAll",
                    LoginAccountLimit: "loginAccountLimit",
                    SignupAccountLimit: "signupAccountLimit",
                    UnavailableError: "unavailableError",
                    SwitchError: "switchError",
                    LoginEmptyBlobRequiredError: "loginEmptyBlobRequiredError",
                    SignupEmptyBlobRequiredError: "signupEmptyBlobRequiredError",
                    LoginVpcEmptyBlobRequiredError: "loginVpcEmptyBlobRequiredError",
                    SignupVpcEmptyBlobRequiredError: "signupVpcEmptyBlobRequiredError"
                },
                _n = "Header.LogOutOfOtherAccounts",
                An = "Action.Logout",
                En = "Action.Cancel",
                Ln = "Description.LogoutConfirmation",
                kn = "Description.ParentLogoutConfirmation",
                Cn = (i.EnvironmentUrls.websiteUrl, "RBXASBlob");
            ! function(e) {
                e[e.AccountSwitcherModalType = 0] = "AccountSwitcherModalType", e[e.LogoutAllAccountsModalType = 1] = "LogoutAllAccountsModalType", e[e.LoginConfirmationForLogoutAllAccountsModalType = 2] = "LoginConfirmationForLogoutAllAccountsModalType", e[e.SignupConfirmationForLogoutAllAccountsModalType = 3] = "SignupConfirmationForLogoutAllAccountsModalType"
            }(yn || (yn = {}));
            var Tn, xn, In = {
                    ActionSignUpCapitalized: "Action.SignUpCapitalized",
                    ActionLogInCapitalized: "Action.LogInCapitalized",
                    ActionDeviceCode: "Action.DeviceCode",
                    ActionResendEmail: "Action.ResendEmail",
                    ActionSendVerificationEmail: "Action.SendVerificationEmail",
                    ActionOk: "Action.Ok",
                    ActionAnotherLoggedInDevice: "Action.AnotherLoggedInDevice",
                    ActionForgotPasswordOrUsernameQuestionCapitalized: "Action.ForgotPasswordOrUsernameQuestionCapitalized",
                    ActionLogInEmailOneTimeCode: "Action.LogInEmailOneTimeCode",
                    ActionLogInWithOneTimeCode: "Action.LogInWithOneTimeCode",
                    ActionLogInAnotherDevice: "Action.LogInAnotherDevice",
                    ActionLogInPasskey: "Action.LogInPasskey",
                    ActionNeedHelp: "Action.NeedHelp",
                    ActionUseAnotherDevice: "Action.UseAnotherDevice",
                    ActionCreateANewAccount: "Action.CreateANewAccount",
                    ActionAddAccount: "Action.AddAccount",
                    ActionRecoverYourAccount: "Action.RecoverYourAccount",
                    DescriptionCurfewMessage: "Description.CurfewMessage",
                    DescriptionAccountSelectorHelp: "Description.AccountSelectorHelp",
                    DescriptionEnterOneTimeCodeHelp: "Description.EnterOneTimeCodeHelp",
                    DescriptionGetOneTimeCodeHelp: "Description.GetOneTimeCodeHelp",
                    DescriptionAccountSelectorOtpTimeWarning: "Description.AccountSelectorOtpTimeWarning",
                    DescriptionLogBackIn: "Description.LogBackIn",
                    DescriptionLogoutFirst: "Description.LogoutFirst",
                    DescriptionRecoverYourAccount: "Description.RecoverYourAccount",
                    HeadingLoginRoblox: "Heading.LoginRoblox",
                    HeadingLoginRobloxAccountSwitching: "Heading.LoginRobloxAccountSwitching",
                    HeadingContinueToEnjoyRoblox: "Heading.ContinueToEnjoyRoblox",
                    HeadingLoginRequired: "Heading.LoginRequired",
                    HeadingYouHaveLoggedOut: "Heading.YouHaveLoggedOut",
                    HeadingAddAccount: "Heading.AddAccount",
                    HeadingSecurityNotification: "Heading.SecurityNotification",
                    LabelEnterOneTimeCode: "Label.EnterOneTimeCode",
                    LabelGetOneTimeCode: "Label.GetOneTimeCode",
                    LabelNoAccount: "Label.NoAccount",
                    LabelPassword: "Label.Password",
                    LabelUsername: "Label.Username",
                    LabelUsernameEmailPhone: "Label.UsernameEmailPhone",
                    LabelLoginWithYour: "Label.LoginWithYour",
                    LabelUnverifiedEmailInstructions: "Label.UnverifiedEmailInstructions",
                    LabelNotReceived: "Label.NotReceived",
                    LabelVerificationEmailSent: "Label.VerificationEmailSent",
                    LabelEmailNeedsVerification: "Label.EmailNeedsVerification",
                    LabelAccountSelector: "Label.AccountSelectorTitle",
                    LabelLoginSwitchAccounts: "Label.LoginSwitchAccounts",
                    LabelChooseAccountToUse: "Label.ChooseAccountToUse",
                    MessageUnknownErrorTryAgain: "Message.UnknownErrorTryAgain",
                    MessageUsernameAndPasswordRequired: "Message.UsernameAndPasswordRequired",
                    ResponseAccountNotFound: "Response.AccountNotFound",
                    ResponseAccountIssueErrorContactSupport: "Response.AccountIssueErrorContactSupport",
                    ResponseTooManyAttemptsPleaseWait: "Response.TooManyAttemptsPleaseWait",
                    ResponseCaptchaErrorFailedToLoad: "Response.CaptchaErrorFailedToLoad",
                    ResponseCaptchaErrorFailedToVerify: "Response.CaptchaErrorFailedToVerify",
                    ResponseGlobalAppAccessError: "Response.GlobalAppAccessError",
                    ResponseIncorrectCredentials: "Response.IncorrectCredentialsForgotPasswordMessage",
                    ResponseIncorrectEmailOrPassword: "Response.IncorrectEmailOrPassword",
                    ResponseIncorrectPhoneOrPassword: "Response.IncorrectPhoneOrPassword",
                    ResponseIncorrectUsernamePassword: "Response.IncorrectUsernamePassword",
                    ResponseEmailLinkedToMultipleAccountsLoginWithUsername: "Response.EmailLinkedToMultipleAccountsLoginWithUsername",
                    ResponseLoginWithUsername: "Response.LoginWithUsername",
                    ResponseUnverifiedEmailLoginWithUsername: "Response.UnverifiedEmailLoginWithUsername",
                    ResponseUnverifiedPhoneLoginWithUsername: "Response.UnverifiedPhoneLoginWithUsername",
                    ResponseVerificationError: "Response.VerificationError",
                    ResponseOtpUnder13NotAllowed: "Response.OtpUnder13NotAllowed",
                    ResponseLoginBlocked: "Response.LoginBlocked",
                    ResponseInvalidPasskeyCredential: "Response.InvalidPasskeyCredential",
                    ErrorPasskeyOnlyAccount: "Error.PasskeyOnlyAccount"
                },
                Un = i.Endpoints.getAbsoluteUrl,
                Pn = {
                    securityNotification: i.EnvironmentUrls.websiteUrl + "/login/securityNotification",
                    koreaIdVerification: i.EnvironmentUrls.websiteUrl + "/id-verification/korea/login",
                    forgotCredentialsUrl: i.EnvironmentUrls.websiteUrl + "/login/forgot-password-or-username"
                },
                On = "WebsiteLogin_",
                Rn = "react-2sv-container",
                Fn = "react-captcha-container",
                Dn = "react-security-questions-container",
                Nn = "react-account-selector-container",
                jn = "otp-login-container",
                Mn = "react-login-account-switcher-container",
                Bn = "react-login-account-limit-error-container",
                zn = "account-switcher-confirmation-modal-container",
                Wn = 1,
                Vn = 2,
                qn = 3,
                Hn = 4,
                Gn = 6,
                $n = 7,
                Kn = 9,
                Yn = 10,
                Qn = 11,
                Jn = 12,
                Zn = 13,
                Xn = 14,
                et = 16,
                nt = 18,
                tt = 20,
                rt = 22,
                ot = 23,
                it = 24,
                at = 25,
                ut = 26,
                ct = 28,
                lt = 3,
                st = "FirstAttempt",
                ft = "Attempt",
                dt = "SuccessWithSAI",
                ht = "SuccessWithGameIntent",
                pt = "Success",
                vt = "Captcha",
                gt = "PasswordResetRequired",
                mt = "UnverifiedAccount",
                yt = "InvalidCredentials",
                bt = "AccountNotFound",
                wt = "AccountIssue",
                St = "TooManyAttempts",
                _t = "DefaultLoginRequired",
                At = "CaptchaLoadFailed",
                Et = "CaptchaVerifyFailed",
                Lt = "CaptchaUnknownError",
                kt = "LuoBuUserDenied",
                Ct = "ScreenTimeRestricted",
                Tt = "UnknownError",
                xt = "SecurityQuestionRequired",
                It = "login",
                Ut = "Website.Login",
                Pt = Un("/CreateAccount"),
                Ot = {
                    common: ["Common.Captcha"],
                    feature: "Authentication.Login"
                },
                Rt = {
                    common: [],
                    feature: "Feature.IdVerification"
                },
                Ft = {
                    common: ["CommonUI.Controls"],
                    feature: "Authentication.AccountSwitch"
                };
            ! function(e) {
                e.Username = "Username", e.Email = "Email", e.PhoneNumber = "PhoneNumber", e.AuthToken = "AuthToken", e.EmailOtpSessionToken = "EmailOtpSessionToken", e.Passkey = "Passkey"
            }(Tn || (Tn = {})),
            function(e) {
                e.Email = "Email", e.Authenticator = "Authenticator", e.RecoveryCode = "RecoveryCode"
            }(xn || (xn = {}));
            var Dt, Nt = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                jt = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                Mt = function(e) {
                    return Nt(void 0, void 0, Promise, (function() {
                        var n, t, r, a;
                        return jt(this, (function(u) {
                            switch (u.label) {
                                case 0:
                                    return c = "/otp-service/v1/metadata", n = i.EnvironmentUrls.apiGatewayUrl + c, t = {
                                        Origin: e
                                    }, r = n + "?" + o.urlService.composeQueryString(t), a = {
                                        url: r,
                                        withCredentials: !0
                                    }, [4, o.httpService.get(a)];
                                case 1:
                                    return [2, u.sent().data]
                            }
                            var c
                        }))
                    }))
                },
                Bt = "?",
                zt = "&",
                Wt = "/v1/passkey/StartAuthentication",
                Vt = (i.EnvironmentUrls.universalAppConfigurationApi, function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                }),
                qt = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                Ht = function() {
                    return Vt(void 0, void 0, Promise, (function() {
                        var e, n;
                        return qt(this, (function(t) {
                            switch (t.label) {
                                case 0:
                                    return r = Wt, e = i.EnvironmentUrls.authApi + r, n = {
                                        url: e
                                    }, [4, o.httpService.post(n)];
                                case 1:
                                    return [2, t.sent().data]
                            }
                            var r
                        }))
                    }))
                },
                Gt = function() {
                    var e = document.querySelector('meta[name="passkey-data"]');
                    return "true" === ((null == e ? void 0 : e.dataset) || {}).isPasskeyLoginEnabled
                },
                $t = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                Kt = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                Yt = function(e) {
                    return i.EnvironmentUrls.authApi + e
                },
                Qt = function(e, n) {
                    return $t(void 0, void 0, Promise, (function() {
                        var t, r;
                        return Kt(this, (function(i) {
                            switch (i.label) {
                                case 0:
                                    return t = Yt("/v3/users/" + e + "/two-step-verification/login"), r = {
                                        url: t,
                                        withCredentials: !0
                                    }, [4, o.httpService.post(r, n)];
                                case 1:
                                    return [2, i.sent().data]
                            }
                        }))
                    }))
                },
                Jt = function(e) {
                    return $t(void 0, void 0, Promise, (function() {
                        var n, t;
                        return Kt(this, (function(r) {
                            switch (r.label) {
                                case 0:
                                    return n = Yt("/v2/login"), t = {
                                        url: n,
                                        withCredentials: !0
                                    }, [4, o.httpService.post(t, e)];
                                case 1:
                                    return [2, r.sent().data]
                            }
                        }))
                    }))
                },
                Zt = {
                    schematizedEventTypes: {
                        authFormInteraction: "authFormInteraction",
                        authButtonClick: "authButtonClick",
                        authMsgShown: "authMsgShown",
                        authPageLoad: "authPageload",
                        authModalShown: "authModalShown",
                        authClientError: "authClientError",
                        usernameSuggestionShown: "usernameSuggestionShown"
                    },
                    eventName: {
                        loginOtherDevice: "loginOtherDevice",
                        formValidation: "formValidation",
                        authPageLoad: "authPageload",
                        authFormInteraction: "authFormInteraction",
                        authButtonClick: "authButtonClick",
                        authModalShown: "authModalShown",
                        saiCreated: "saiCreated",
                        saiMissing: "saiMissing",
                        signupUsernameKeystrokes: "accountIntegrityKeystrokeEvents",
                        qualifiedSignup: "qualifiedSignup"
                    },
                    context: {
                        loginPage: "loginPage",
                        loginForm: "LoginForm",
                        schematizedLoginForm: "loginForm",
                        landingPage: "Multiverse",
                        ssoLtiInit: "ssoLtiInit",
                        ssoLtiLaunch: "ssoLtiLaunch",
                        ssoError: "ssoError",
                        signupForm: "MultiverseSignupForm",
                        schematizedSignupForm: "signupForm",
                        sendOTP: "sendOTP",
                        schematizedSendOTP: "sendOtp",
                        enterOTP: "enterOTP",
                        schematizedEnterOTP: "enterOtp",
                        validateOTP: "validateOTP",
                        disambiguationOTP: "disambiguationOTP",
                        disambiguationEmail: "disambiguationEmail",
                        disambiguationPhone: "disambiguationPhone",
                        disambigOTP: "disambigOtp",
                        revertAccount: "revertAccount",
                        accountSwitcherConfirmation: "accountSwitcherConfirmation",
                        accountSwitcherModal: "accountSwitcherModal",
                        accountSwitcherLimitError: "accountSwitcherLimitError",
                        accountSwitcherLogin: "accountSwitcherLogin",
                        accountSwitcherSignup: "accountSwitcherSignup",
                        accountSwitcherBackendRequestFailure: "accountSwitcherBackendRequestFailure",
                        accountSwitcherLocalStorageFailure: "accountSwitcherLocalStorageFailure",
                        accountSwitcherVpcLogin: "accountSwitcherVpcLogin",
                        accountSwitcherVpcSignup: "accountSwitcherVpcSignup",
                        platformAuthenticatorSupport: "platformAuthenticatorSupport",
                        passkeyLogin: "passkeyLogin",
                        hba: "hba",
                        resetPasswordPage: "resetPasswordPage"
                    },
                    verifiedParentalConsentContext: {
                        chargeback: {
                            finishParentalSignup: "finishParentalSignup",
                            homepage: "homepage"
                        },
                        savePaymentMethods: {
                            finishParentalSignup: "finishParentalSignupDevsubs",
                            homepage: "homepageDevsubs"
                        },
                        changeBirthdayContext: {
                            finishParentalSignup: "finishParentalSignupAgeChange",
                            homepage: "homepageAgeChange"
                        }
                    },
                    aType: {
                        buttonClick: "buttonClick",
                        click: "click",
                        offFocus: "offFocus",
                        focus: "focus",
                        shown: "shown",
                        dismissed: "dismissed"
                    },
                    field: {
                        loginOtherDevice: "loginOtherDevice",
                        loginOTP: "loginOTP",
                        OTP: "otp",
                        loginSubmitButtonName: "loginSubmit",
                        password: "password",
                        username: "username",
                        signupSubmitButtonName: "signupSubmit",
                        appButtonClickName: "AppLink",
                        showPassword: "showPassword",
                        hidePassword: "hidePassword",
                        birthdayDay: "birthdayDay",
                        birthdayMonth: "birthdayMonth",
                        birthdayYear: "birthdayYear",
                        signupUsername: "signupUsername",
                        signupPassword: "signupPassword",
                        signupEmail: "signupEmail",
                        parentEmail: "parentEmail",
                        genderMale: "genderMale",
                        genderFemale: "genderFemale",
                        email: "email",
                        code: "code",
                        otpCode: "OTPcode",
                        errorMessage: "errorMessage",
                        resendErrorMessage: "resendErrorMessage",
                        accountSelection: "accountSelection",
                        checked: "checked",
                        unchecked: "unchecked",
                        usernameValid: "usernameValid",
                        revertAccountSubmitButtonName: "revertAccountSubmit",
                        birthday: "birthday",
                        accountSwitcher: "accountSwitcher",
                        logoutPopup: "logoutPopup",
                        hasAuthIntent: "hasAuthIntent"
                    },
                    btn: {
                        cancel: "cancel",
                        sendCode: "sendCode",
                        resendCode: "resendCode",
                        resend: "resend",
                        login: "login",
                        logoutAll: "logoutAll",
                        signup: "signup",
                        continue: "continue",
                        changeEmail: "changeEmail",
                        select: "select",
                        parentalConsentCheckbox: "pc_checkbox",
                        termsOfServiceCheckbox: "tos_checkbox",
                        privacyPolicyCheckbox: "pp_checkbox",
                        submitRevertAccount: "submitRevertAccount",
                        dismiss: "dismiss",
                        switch: "switch",
                        addAccount: "addAccount",
                        primaryButton: "primaryButton",
                        secondaryButton: "secondaryButton",
                        usernameSuggestion: "usernameSuggestion",
                        launchSsoDeeplink: "launchSsoDeeplink",
                        koreaConsentAllCheckbox: "koreaConsentAll",
                        koreaTosAndPrivacyPolicyCheckbox: "koreaToS1",
                        koreaThirdPartyPersonalInfoCheckbox: "koreaToS2",
                        koreaTransferPersonalInfoCheckbox: "koreaToS3",
                        koreaPersonalInfoCheckbox: "koreaToS4",
                        koreaOptionalPersonalInfoCheckbox: "koreaToS5Optional",
                        koreaAgreeTermsOfService: "koreaAgreeToS",
                        logoutPopupLogout: "logoutPopupLogout",
                        addPasskeyInlineCTA: "addPasskeyInlineCTA",
                        addPasskeyModal: "addPasskeyModal",
                        skipPasskey: "skipPasskey"
                    },
                    input: {
                        redacted: "[Redacted]"
                    },
                    origin: {
                        webVerifiedSignup: "WebVerifiedSignup",
                        signup: "signup",
                        login: "login"
                    },
                    text: {
                        finishCreatingYourAccount: "Create Your Roblox Account",
                        signup: "Sign Up",
                        createAccount: "Create Account",
                        logout: "Log Out"
                    },
                    clientErrorTypes: {
                        pageLoadFailed: "pageLoadFailed",
                        userInfoFetchFailed: "userInfoFetchFailed",
                        localStorageSetFailure: "localStorageSetFailure",
                        localStorageGetFailure: "localStorageGetFailure",
                        localStorageRemoveFailure: "localStorageRemoveFailure",
                        logoutAllAccountSwitcherAccounts: "logoutAllAccountSwitcherAccounts"
                    },
                    state: {
                        passkeyUpselling: {
                            passkeyRegistrationSuccess: "passkeyRegistrationSuccess",
                            passkeyRegistrationFailure: "passkeyRegistrationFailure",
                            passkeyOsDialogue: "passkeyOsDialogue",
                            passkeyUpsellModal: "passkeyUpsellModal"
                        }
                    }
                },
                Xt = l.eventStreamService.eventTypes,
                er = function(e) {
                    l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.loginForm, {
                        field: e.field,
                        aType: e.aType
                    })
                },
                nr = function() {
                    er({
                        field: Zt.field.username,
                        aType: Zt.aType.focus
                    })
                },
                tr = function() {
                    er({
                        field: Zt.field.username,
                        aType: Zt.aType.offFocus
                    })
                },
                rr = function() {
                    er({
                        field: Zt.field.password,
                        aType: Zt.aType.focus
                    })
                },
                or = function() {
                    er({
                        field: Zt.field.password,
                        aType: Zt.aType.offFocus
                    })
                },
                ir = function() {
                    l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authButtonClick, Zt.context.loginPage, {
                        btn: Zt.btn.logoutAll,
                        origin: Zt.origin.login
                    })
                },
                ar = function(e) {
                    l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authPageLoad, Zt.context.passkeyLogin, {
                        state: String(e)
                    })
                },
                ur = function(e) {
                    l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authPageLoad, Zt.context.platformAuthenticatorSupport, {
                        state: String(e)
                    })
                },
                cr = function() {
                    return document.getElementById("react-login-container")
                },
                lr = function() {
                    return document.getElementById("react-login-web-app")
                },
                sr = function(e) {
                    window.location.href = e
                },
                fr = function() {
                    window.location.href = o.urlService.getAbsoluteUrl("/home")
                },
                dr = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                hr = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                pr = function(e) {
                    return i.EnvironmentUrls.apiGatewayUrl + e
                },
                vr = function(e) {
                    return dr(void 0, void 0, Promise, (function() {
                        var n, t;
                        return hr(this, (function(r) {
                            switch (r.label) {
                                case 0:
                                    return n = pr("/account-switcher/v1/logoutAllLoggedInUsers"), t = {
                                        url: n,
                                        withCredentials: !0
                                    }, [4, o.httpService.post(t, e)];
                                case 1:
                                    return r.sent(), [2]
                            }
                        }))
                    }))
                },
                gr = function(e, n) {
                    l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authClientError, e, {
                        state: n
                    })
                },
                mr = t(5250),
                yr = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                br = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                wr = function() {
                    var e = document.querySelector('meta[name="account-switching-data"]');
                    return "true" === ((null == e ? void 0 : e.dataset) || {}).isAccountSwitchingEnabled
                },
                Sr = function() {
                    if (!wr()) return "";
                    try {
                        return l.localStorageService.getLocalStorage(Cn)
                    } catch (e) {
                        return console.warn(e), gr(Zt.context.accountSwitcherLocalStorageFailure, Zt.clientErrorTypes.localStorageGetFailure), ""
                    }
                },
                _r = function() {
                    try {
                        l.localStorageService.removeLocalStorage(Cn)
                    } catch (e) {
                        console.warn(e), gr(Zt.context.accountSwitcherLocalStorageFailure, Zt.clientErrorTypes.localStorageRemoveFailure)
                    }
                },
                Ar = ((0, mr.memoize)((function() {
                    return yr(void 0, void 0, Promise, (function() {
                        var e, n;
                        return br(this, (function(t) {
                            switch (t.label) {
                                case 0:
                                    return t.trys.push([0, 2, , 3]), [4, null === i.ExperimentationService || void 0 === i.ExperimentationService ? void 0 : i.ExperimentationService.getAllValuesForLayer("Accounts.AccountSwitcher")];
                                case 1:
                                    return [2, !!(null == (e = t.sent()) ? void 0 : e.isAccountSwitcherEnabled)];
                                case 2:
                                    return n = t.sent(), console.info("Failed to get experiment parameter values for Account Switching", n), [2, !1];
                                case 3:
                                    return [2]
                            }
                        }))
                    }))
                })), window.EventTracker);
            ! function(e) {
                e.Production = "production", e.Sitetest1 = "sitetest1", e.Sitetest2 = "sitetest2", e.Sitetest3 = "sitetest3"
            }(Dt || (Dt = {}));
            var Er = function() {
                    var e = window.location.hostname;
                    return e.includes(Dt.Sitetest3) ? Dt.Sitetest3 : e.includes(Dt.Sitetest2) ? Dt.Sitetest2 : e.includes(Dt.Sitetest1) ? Dt.Sitetest1 : Dt.Production
                },
                Lr = ["{{", "/getauthticket", "/placelauncher.ashx"],
                kr = ["http:", "https:"],
                Cr = ["#", "?", "//", ".", "mailto:", "javascript:", "rbxmobile:"],
                Tr = ["survey.roblox.com"],
                xr = "/",
                Ir = function(e) {
                    return e.split(".").slice(-2).join(".")
                },
                Ur = function(e) {
                    if (!0 === i.Endpoints.isAbsolute(e)) {
                        var n = new URL(e),
                            t = n.hostname,
                            r = n.protocol;
                        if (Ir(window.location.hostname) !== Ir(t)) return xr;
                        if (! function() {
                                switch (Er()) {
                                    case Dt.Sitetest3:
                                    case Dt.Sitetest2:
                                    case Dt.Sitetest1:
                                        return ["robloxlabs.com"];
                                    case Dt.Production:
                                    default:
                                        return ["roblox.com"]
                                }
                            }().some((function(e) {
                                return e === Ir(t)
                            })) || Tr.some((function(e) {
                                return t.includes(e)
                            }))) return xr;
                        if (!kr.some((function(e) {
                                return r === e
                            }))) return xr
                    } else if (e !== decodeURIComponent(e)) return xr;
                    return e
                },
                Pr = function() {
                    var e, n = o.urlService.parseQueryString() || {},
                        t = Object.keys(n).find((function(e) {
                            return "returnurl" === e.toLowerCase()
                        })),
                        r = t ? String(null !== (e = n["" + t]) && void 0 !== e ? e : "") : "";
                    if (!r || "" === r.trim() || Cr.some((function(e) {
                            return r.startsWith(e)
                        })) || Lr.some((function(e) {
                            return r.includes(e)
                        }))) return xr;
                    if (function() {
                            var e = Er();
                            switch (e) {
                                case Dt.Sitetest3:
                                case Dt.Sitetest2:
                                case Dt.Sitetest1:
                                    return ["https://apis." + e + ".robloxlabs.com/application-authorization/v1/authorize", "https://authorize." + e + ".robloxlabs.com", "https://www." + e + ".robloxlabs.com"];
                                case Dt.Production:
                                default:
                                    return ["https://apis.roblox.com/application-authorization/v1/authorize", "https://authorize.roblox.com", "https://www.roblox.com"]
                            }
                        }().some((function(e) {
                            return r.startsWith(e)
                        }))) return r;
                    try {
                        return i.Endpoints.getAbsoluteUrl(Ur(r))
                    } catch (e) {
                        return xr
                    }
                },
                Or = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                Rr = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                Fr = o.urlService.composeQueryString,
                Dr = function(e) {
                    Ar && e && Ar.fireEvent(On + e)
                },
                Nr = function(e, n, t) {
                    void 0 === n && (n = "conditional");
                    var r = l.fido2Util.convertPublicKeyParametersToStandardBase64(e);
                    return navigator.credentials.get({
                        publicKey: l.fido2Util.formatCredentialRequestWeb(JSON.stringify(r)),
                        mediation: n,
                        signal: t
                    })
                },
                jr = function(e, n) {
                    switch (e) {
                        case Kn:
                        case Yn:
                        case Wn:
                            return function(e, n) {
                                switch (e) {
                                    case Wn:
                                        return n === Tn.Email ? In.ResponseIncorrectEmailOrPassword : n === Tn.PhoneNumber ? In.ResponseIncorrectPhoneOrPassword : n === Tn.EmailOtpSessionToken ? In.ResponseIncorrectCredentials : n === Tn.Passkey ? In.ResponseInvalidPasskeyCredential : In.ResponseIncorrectUsernamePassword;
                                    case Kn:
                                        return n === Tn.Email ? In.ResponseEmailLinkedToMultipleAccountsLoginWithUsername : n === Tn.PhoneNumber ? In.ResponseLoginWithUsername : "";
                                    case Yn:
                                        return n === Tn.Email ? In.ResponseUnverifiedEmailLoginWithUsername : n === Tn.PhoneNumber ? In.ResponseUnverifiedPhoneLoginWithUsername : "";
                                    default:
                                        return ""
                                }
                            }(e, n);
                        case qn:
                            return In.ResponseAccountNotFound;
                        case Gn:
                            return In.ResponseAccountIssueErrorContactSupport;
                        case $n:
                            return In.ResponseTooManyAttemptsPleaseWait;
                        case Qn:
                            return In.ResponseCaptchaErrorFailedToLoad;
                        case Jn:
                            return In.ResponseCaptchaErrorFailedToVerify;
                        case Xn:
                            return In.ResponseGlobalAppAccessError;
                        case Zn:
                            return In.MessageUnknownErrorTryAgain;
                        case et:
                            return In.DescriptionCurfewMessage;
                        case rt:
                            return In.ResponseOtpUnder13NotAllowed;
                        case ot:
                            return In.ResponseLoginBlocked;
                        case ct:
                            return In.ErrorPasskeyOnlyAccount;
                        default:
                            return In.MessageUnknownErrorTryAgain
                    }
                },
                Mr = function(e) {
                    return n = e, new RegExp("^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$").test(n) ? Tn.Email : (t = e) && !(t.length < 4) && /\d/.test(t) && /^[\d|\W|_]+$/.test(t) ? Tn.PhoneNumber : Tn.Username;
                    var n, t
                },
                Br = function() {
                    var e, n, t = cr(),
                        r = lr();
                    return "" + ("true" === (null === (e = null == t ? void 0 : t.getAttribute("data-enable-frontend-return-url")) || void 0 === e ? void 0 : e.toLowerCase()) || r ? Pr() : (null == t ? void 0 : t.getAttribute("data-return-url")) || "") + (null !== (n = window.location.hash) && void 0 !== n ? n : "")
                },
                zr = function() {
                    var e = function(e) {
                        if (!e) return "/";
                        var n = e;
                        return e.indexOf(Bt) > -1 ? n += zt : n += Bt, n + "nl=true"
                    }(Br());
                    return o.urlService.getAbsoluteUrl(e)
                },
                Wr = function(e, n) {
                    return e === Tn.EmailOtpSessionToken ? n(In.DescriptionAccountSelectorHelp) + " " + n(In.DescriptionAccountSelectorOtpTimeWarning, {
                        timeLimitSec: "60"
                    }) : n(In.DescriptionAccountSelectorHelp)
                },
                Vr = function(e) {
                    var n = [];
                    if (!e || "object" != typeof e) return [];
                    var t = e.errors;
                    return t instanceof Array ? (t.forEach((function(e) {
                        if (e && "object" == typeof e) {
                            var t = e.code;
                            "number" == typeof t && n.push(t)
                        }
                    })), n) : []
                },
                qr = function(e) {
                    var n = Vr(e);
                    return "object" == typeof e && Vr(e.data).forEach((function(e) {
                        return n.push(e)
                    })), n[0] || null
                },
                Hr = function(e) {
                    var n = [];
                    if (!e || "object" != typeof e) return [];
                    var t = e.errors;
                    return t instanceof Array ? (t.forEach((function(e) {
                        if (e && "object" == typeof e) {
                            var t = e.fieldData;
                            "string" == typeof t && n.push(t)
                        }
                    })), n) : []
                },
                Gr = (0, u.withTranslations)((function(t) {
                    var r = t.captchaId,
                        o = t.captchaToken,
                        i = t.credentialValue,
                        a = t.password,
                        u = t.isLoading,
                        l = t.errorMsg,
                        s = t.translate,
                        f = t.onFormSubmit,
                        d = t.onCredentialValueChange,
                        h = t.onPasswordChange,
                        p = t.isLoginFormDisabled;
                    return (0, e.useEffect)((function() {
                        r && o && f(!1)
                    }), [r + o]), n().createElement("div", {
                        id: "login-form"
                    }, n().createElement("div", null, n().createElement("div", {
                        className: "login-form-container"
                    }, n().createElement("form", {
                        className: "flex flex-col gap-xlarge",
                        name: "loginForm",
                        onSubmit: function(e) {
                            e.preventDefault(), e.stopPropagation()
                        }
                    }, n().createElement("div", {
                        className: "flex flex-col gap-medium",
                    }, n().createElement("div", {
                        className: "flex flex-col gap-small"
                    }, n().createElement("div", {
						'data-testid': 'text-input-wrapper',
                        className: "flex width-full flex-col gap-small undefined"
                    }, n().createElement("label", {
                        htmlFor: "login-username",
                        className: "text-title-medium content-emphasis"
                    }, "Username, email, or phone"), n().createElement("div", {
						'data-testid': 'text-input-container',
						className: "flex items-center width-full stroke-standard focus-within:outline-focus height-1000 radius-medium padding-x-medium gap-x-small stroke-contrast-alpha"
					}, n().createElement("input", {
                        id: "login-username",
                        name: "username",
                        type: "text",
                        className: "width-full padding-none bg-none stroke-none outline-none content-emphasis placeholder:content-muted text-body-medium placeholder:text-body-medium",
                        autoComplete: "username webauthn",
                        onFocus: nr,
                        onBlur: tr,
                        placeholder: "Username, email, or phone",
                        value: i,
                        onChange: function(e) {
                            return d(e.target.value)
                        }
                    }))), n().createElement("div", {
                        'data-testid': 'text-input-wrapper',
                        className: "flex width-full flex-col gap-small relative"
                    }, n().createElement("label", {
                        htmlFor: "login-password",
                        className: "text-title-medium content-emphasis"
                    }, "Password"), n().createElement("div", {
						'data-testid': 'text-input-container',
						className: "flex items-center width-full stroke-standard focus-within:outline-focus height-1000 radius-medium padding-x-medium gap-x-small stroke-contrast-alpha"
					}, n().createElement("input", {
                        id: "login-password",
                        name: "password",
                        type: "password",
                        className: "width-full padding-none bg-none stroke-none outline-none content-emphasis placeholder:content-muted text-body-medium placeholder:text-body-medium",
                        onFocus: rr,
                        onBlur: or,
                        placeholder: s(In.LabelPassword),
                        value: a,
                        onChange: function(e) {
                            return h(e.target.value)
                        },
                        onKeyPress: function(e) {
                            return function(e) {
                                "Enter" === e.key && f()
                            }(e)
                        }
                    }), n().createElement("div", {
                        className: "width-600 grow-0 shrink-0 basis-auto"
                    }), n().createElement("div", {
                        className: "absolute ltr:right-[0] rtl:left-[0]"
                    }, n().createElement("button", {
						'type': 'button',
                        className: "foundation-web-icon-button relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex items-center justify-center padding-none stroke-none select-none size-1000 radius-medium bg-action-link"
                    }, n().createElement("div", {
                        className: "absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none"
                    }), n().createElement("span", {
                        className: "icon icon-regular-eye size-500 content-emphasis"
                    })))), n().createElement("div", {
                        "aria-live": "polite"
                    }, l.length > 0 && n().createElement("p", {
                        className: "form-control-label xsmall text-error login-error",
                        id: "login-form-error"
                    }, l)), u ? n().createElement(c.Loading, null) : n().createElement("button", {
                        type: "button",
                        id: "login-button",
                        className: "foundation-web-button relative clip group/interactable focus-visible:outline-focus disabled:outline-none cursor-pointer relative flex items-center justify-center stroke-none padding-y-none select-none radius-medium text-label-medium height-1000 padding-x-medium bg-action-emphasis content-action-emphasis",
                        onClick: function(e) {
                            return f()
                        },
                        disabled: p
                    }, "Sign in"))))))))
                }), Ot),
                $r = i.AccountIntegrityChallengeService.Captcha,
                Kr = function(t) {
                    var r = t.containerId,
                        o = t.actionType,
                        i = t.dataExchange,
                        a = t.unifiedCaptchaId,
                        u = t.onCaptchaChallengeCompleted,
                        c = t.onCaptchaChallengeInvalidated,
                        l = t.onCaptchaChallengeAbandoned,
                        s = t.onUnknownError,
                        f = (0, e.useState)(null),
                        d = f[0],
                        h = f[1];
                    return (0, e.useEffect)((function() {
                        i && a && function(e) {
                            if (null === d) {
                                var n = {
                                    containerId: r,
                                    actionType: o,
                                    appType: null,
                                    dataExchangeBlob: e.dataExchange,
                                    unifiedCaptchaId: e.unifiedCaptchaId,
                                    onChallengeDisplayed: function(e) {
                                        return null
                                    },
                                    onChallengeCompleted: function(e) {
                                        h(null), u(e)
                                    },
                                    onChallengeInvalidated: function(e) {
                                        h(null), c(e)
                                    },
                                    renderInline: !1,
                                    onModalChallengeAbandoned: function(e) {
                                        return h((function() {
                                            return e
                                        })), l(), null
                                    }
                                };
                                $r ? $r.renderChallenge(n).then((function(e) {
                                    e || s()
                                })).catch((function() {
                                    s()
                                })) : console.error("no captcha service available")
                            } else d()
                        }({
                            dataExchange: i,
                            unifiedCaptchaId: a
                        })
                    }), [i + a]), n().createElement("div", {
                        id: r
                    })
                },
                Yr = i.AccountIntegrityChallengeService.TwoStepVerification,
                Qr = function(t) {
                    var r = t.userId,
                        o = t.challengeId,
                        i = t.on2svChallengeCompleted,
                        a = t.on2svChallengeInvalidated,
                        u = t.on2svChallengeAbandoned,
                        c = t.onUnknownError,
                        l = Rn;
                    return (0, e.useEffect)((function() {
                        r && o && function() {
                            try {
                                Yr.renderChallenge({
                                    containerId: l,
                                    userId: r,
                                    challengeId: o,
                                    actionType: Yr.ActionType.Login,
                                    renderInline: !1,
                                    shouldShowRememberDeviceCheckbox: !0,
                                    onChallengeCompleted: i,
                                    onChallengeInvalidated: a,
                                    onModalChallengeAbandoned: u
                                }) || c()
                            } catch (e) {
                                c()
                            }
                        }()
                    }), [r, o]), n().createElement("div", {
                        id: l
                    })
                },
                Jr = (0, u.withTranslations)((function(t) {
                    var r = t.onCrossDeviceLoginCodeValidated,
                        o = t.isOtpLoginEnabled,
                        a = t.openOtpLoginModal,
                        u = t.showPasskeyLoginButton,
                        c = t.openPasskeyLoginFlow,
                        s = t.isOneTimeCodeDesignUpdated,
                        f = t.translate;
                    return (0, e.useEffect)((function() {
                        var e = function(e) {
                            e.detail && r(e.detail)
                        };
                        return window.addEventListener("OnCrossDeviceCodeValidated", e),
                            function() {
                                window.removeEventListener("OnCrossDeviceCodeValidated", e)
                            }
                    }), []), n().createElement("div", null, n().createElement("div", {
                        className: "alternative-login-divider-container"
                    }, n().createElement("div", {
                        className: "rbx-divider alternative-login-divider"
                    }), !o && n().createElement("div", {
                        className: "divider-text-container"
                    }, n().createElement("span", {
                        className: "divider-text"
                    }, f(In.LabelLoginWithYour)))), o && n().createElement("button", {
                        type: "button",
                        id: "otp-login-button",
                        className: "btn-full-width btn-control-md otp-login-button",
                        onClick: a
                    }, f(In.ActionLogInEmailOneTimeCode)), u && n().createElement("button", {
                        type: "button",
                        id: "passkey-login-button",
                        className: "btn-full-width btn-control-md passkey-login-button",
                        onClick: function() {
                            c("required")
                        }
                    }, f(In.ActionLogInPasskey)), n().createElement("button", {
                        type: "button",
                        id: "cross-device-login-button",
                        className: "btn-full-width btn-control-md cross-device-login-button",
                        onClick: function() {
                            l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.loginPage, {
                                field: Zt.field.loginOtherDevice,
                                aType: Zt.aType.click
                            }), i.CrossDeviceLoginDisplayCodeService.openModal()
                        }
                    }, n().createElement("span", null, f(o ? s ? In.ActionUseAnotherDevice : In.ActionLogInAnotherDevice : In.ActionAnotherLoggedInDevice))))
                }), Ot),
                Zr = function(e) {
                    l.localStorageService.setLocalStorage("identityVerificationLoginTicket", e)
                },
                Xr = function() {
                    var e = Pn.koreaIdVerification;
                    window.location.href = e
                },
                eo = (0, u.withTranslations)((function(t) {
                    var r = t.identityVerificationLoginTicket,
                        o = t.translate,
                        i = (0, c.createModal)(),
                        a = i[0],
                        u = i[1];
                    return (0, e.useEffect)((function() {
                        Zr(r), r && u.open()
                    }), [r]), {
                        identityVerificationLoginTicket: r
                    } && n().createElement(a, {
                        title: o("Title.VerificationRequired"),
                        body: o("Description.VerificationRequired"),
                        neutralButtonText: o("Action.StartVerification"),
                        onNeutral: Xr,
                        closeable: !1
                    })
                }), Rt),
                no = i.AccountIntegrityChallengeService.SecurityQuestions,
                to = function(t) {
                    var r = t.userId,
                        o = t.sessionId,
                        i = t.onSecurityQuestionsChallengeCompleted,
                        a = t.onSecurityQuestionsChallengeInvalidated,
                        u = t.onSecurityQuestionsChallengeAbandoned,
                        c = t.onUnknownError,
                        l = Dn;
                    return (0, e.useEffect)((function() {
                        r && o && function() {
                            try {
                                no.renderChallenge({
                                    containerId: l,
                                    userId: r,
                                    sessionId: o,
                                    renderInline: !1,
                                    onChallengeCompleted: i,
                                    onChallengeInvalidated: a,
                                    onModalChallengeAbandoned: u
                                }) || c()
                            } catch (e) {
                                c()
                            }
                        }()
                    }), [r, o]), n().createElement("div", {
                        id: l
                    })
                },
                ro = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                oo = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                io = (0, u.withTranslations)((function(t) {
                    var r, u = t.translate,
                        c = (0, e.useState)(!1),
                        l = c[0],
                        s = c[1],
                        f = i.AccountSwitcherService && a.authenticatedUser.isAuthenticated,
                        d = f ? (r = zr(), Pt + "?" + Fr({
                            returnUrl: r
                        })) : function() {
                            var e = o.urlService.getQueryParam("returnUrl");
                            if (e) {
                                var n = {
                                    ReturnUrl: e
                                };
                                return o.urlService.getUrlWithQueries("/account/signupredir", n)
                            }
                            return o.urlService.getAbsoluteUrl("/")
                        }();
                    return (0, e.useEffect)((function() {
                        ro(void 0, void 0, void 0, (function() {
                            var e, n;
                            return oo(this, (function(t) {
                                switch (t.label) {
                                    case 0:
                                        return t.trys.push([0, 2, , 3]), [4, null === i.NavigationService || void 0 === i.NavigationService ? void 0 : i.NavigationService.getIsVNGLandingRedirectEnabled()];
                                    case 1:
                                        return e = t.sent(), s(f || !e), [3, 3];
                                    case 2:
                                        return n = t.sent(), console.error("Error fetching data:", n), s(!0), [3, 3];
                                    case 3:
                                        return [2]
                                }
                            }))
                        }))
                    }), [f]), n().createElement("div", {
                        className: "text-center"
                    }, l && n().createElement("div", {
                        className: "signup-option"
                    }, !f && n().createElement("span", {
                        className: "no-account-text"
                    }, u(In.LabelNoAccount)), n().createElement("a", {
                        id: "sign-up-link",
                        className: "text-link signup-link",
                        href: d,
                        target: "_self"
                    }, u(f ? In.ActionCreateANewAccount : In.ActionSignUpCapitalized))))
                }), Ot),
                ao = (0, u.withTranslations)((function(e) {
                    var t = e.credentialValue,
                        r = e.translate,
                        o = Pn.forgotCredentialsUrl,
                        i = t ? o + "?identifier=" + encodeURIComponent(t) : o,
                        a = In.ActionForgotPasswordOrUsernameQuestionCapitalized;
                    return n().createElement("div", {
                        className: "text-center forgot-credentials-link"
                    }, n().createElement("a", {
                        id: "forgot-credentials-link",
                        className: "text-link",
                        href: i,
                        target: "_self"
                    }, r(a)))
                }), Ot),
                uo = function(t) {
                    var r = t.containerId,
                        o = t.users,
                        a = t.invalidUsers,
                        u = t.onAccountSelection,
                        c = t.onAccountSelectorAbandoned,
                        l = t.titleText,
                        s = t.helpText,
                        f = t.translate,
                        d = {
                            containerId: r,
                            users: o,
                            invalidUsers: a,
                            onAccountSelection: u,
                            onAccountSelectorAbandoned: c,
                            titleText: l,
                            helpText: s,
                            translate: f
                        };
                    return (0, e.useEffect)((function() {
                        o.length > 0 && i.AccountSelectorService && i.AccountSelectorService.renderAccountSelectorModal(d)
                    }), [o, a]), n().createElement("div", {
                        id: r
                    })
                },
                co = function() {
                    return co = Object.assign || function(e) {
                        for (var n, t = 1, r = arguments.length; t < r; t++)
                            for (var o in n = arguments[t]) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
                        return e
                    }, co.apply(this, arguments)
                },
                lo = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                so = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                fo = function(n) {
                    var t = (0, e.useState)({}),
                        r = t[0],
                        o = t[1],
                        a = (0, e.useState)(!0),
                        u = a[0],
                        c = a[1];
                    return (0, e.useEffect)((function() {
                        c(!0),
                            function(e) {
                                return lo(void 0, void 0, Promise, (function() {
                                    return so(this, (function(n) {
                                        switch (n.label) {
                                            case 0:
                                                return (null === i.ExperimentationService || void 0 === i.ExperimentationService ? void 0 : i.ExperimentationService.getAllValuesForLayer) ? [4, i.ExperimentationService.getAllValuesForLayer(e)] : [3, 2];
                                            case 1:
                                                return [2, n.sent()];
                                            case 2:
                                                return [2, {}]
                                        }
                                    }))
                                }))
                            }(n).then((function(e) {
                                o(e), c(!1)
                            }), (function() {
                                o({}), c(!1)
                            }))
                    }), [n]), co(co({}, r), {
                        isLoading: u
                    })
                },
                ho = function(t) {
                    var r, o = t.containerId,
                        a = {
                            containerId: o,
                            titleText: t.titleText,
                            helpText: t.helpText,
                            onAccountSwitched: t.onAccountSwitched,
                            handleAddAccount: t.handleAddAccount,
                            removeInvalidActiveUser: t.removeInvalidActiveUser,
                            translate: t.translate,
                            loggedInUsers: t.loggedInUsers
                        },
                        u = (null !== (r = null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser()) && void 0 !== r ? r : [!1])[0];
                    return (0, e.useEffect)((function() {
                        u && (null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.renderAccountSwitcher(a))
                    }), [a, u]), n().createElement("div", {
                        id: o
                    })
                },
                po = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                vo = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                go = (0, u.withTranslations)((function(t) {
                    var r, o = t.origin,
                        a = t.containerId,
                        u = t.hasMaxLoggedInAccountsSignupError,
                        c = t.isAccountLimitReached,
                        l = t.handleRedirectHome,
                        s = t.translate,
                        f = t.isParentUser,
                        d = (null !== (r = null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser()) && void 0 !== r ? r : [!1])[0];
                    return (0, e.useEffect)((function() {
                        if (d) {
                            if (c || u) {
                                var e = function() {
                                    var e = this,
                                        n = {
                                            containerId: a,
                                            origin: o,
                                            localizedTitleText: s(wn.HeadingAccountLimitReached),
                                            localizedBodyText: s(wn.LabelAccountLimitReached),
                                            localizedPrimaryButtonText: s(wn.ActionOK),
                                            primaryButtonCallback: l,
                                            isModalDismissable: !1
                                        };
                                    return u && (n.localizedSecondaryButtonText = s(bn.ActionLogOutAllAccounts), n.secondaryButtonCallback = function() {
                                        return po(e, void 0, void 0, (function() {
                                            var e;
                                            return vo(this, (function(n) {
                                                switch (n.label) {
                                                    case 0:
                                                        if (!(e = Sr())) return [3, 4];
                                                        n.label = 1;
                                                    case 1:
                                                        return n.trys.push([1, 3, , 4]), [4, vr({
                                                            encrypted_users_data_blob: e
                                                        })];
                                                    case 2:
                                                        return n.sent(), [3, 4];
                                                    case 3:
                                                        return n.sent(), gr(Zt.context.accountSwitcherLimitError, Zt.clientErrorTypes.logoutAllAccountSwitcherAccounts), [3, 4];
                                                    case 4:
                                                        _r();
                                                        try {
                                                            null === i.NavigationService || void 0 === i.NavigationService || i.NavigationService.logoutAndRedirect()
                                                        } catch (e) {
                                                            window.location.reload()
                                                        }
                                                        return [2]
                                                }
                                            }))
                                        }))
                                    }), n
                                }();
                                null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.renderBaseConfirmationModal(e)
                            }
                            var n, t, r;
                            f && (n = o === Sn.LoginEmptyBlobRequiredError ? Zt.context.accountSwitcherVpcLogin : Zt.context.accountSwitcherVpcSignup, t = Zt.clientErrorTypes.logoutAllAccountSwitcherAccounts, r = {
                                containerId: a,
                                origin: o,
                                localizedTitleText: s("Header.LogoutAllAccounts"),
                                localizedBodyText: s("Description.ParentLogoutConfirmation"),
                                localizedPrimaryButtonText: s("Action.LogoutAllAccounts"),
                                primaryButtonCallback: function() {
                                    return po(void 0, void 0, void 0, (function() {
                                        var e;
                                        return vo(this, (function(r) {
                                            switch (r.label) {
                                                case 0:
                                                    if (ir(), !(e = Sr())) return [3, 4];
                                                    r.label = 1;
                                                case 1:
                                                    return r.trys.push([1, 3, , 4]), [4, vr({
                                                        encrypted_users_data_blob: e
                                                    })];
                                                case 2:
                                                    return r.sent(), [3, 4];
                                                case 3:
                                                    return r.sent(), gr(n, t), [3, 4];
                                                case 4:
                                                    return _r(), window.location.reload(), [2]
                                            }
                                        }))
                                    }))
                                },
                                isModalDismissable: !1
                            }, null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.renderBaseConfirmationModal(r))
                        }
                    }), [d, c, u]), n().createElement("div", {
                        id: a
                    })
                }), Ft),
                mo = (i.EnvironmentUrls.authApi, i.EnvironmentUrls.authApi, i.EnvironmentUrls.userAgreementsServiceApi, i.EnvironmentUrls.authApi, i.EnvironmentUrls.authApi, i.EnvironmentUrls.authApi, i.EnvironmentUrls.websiteUrl, i.EnvironmentUrls.websiteUrl, i.EnvironmentUrls.usersApi, new Map([
                    [1, "Response.UsernameAlreadyInUse"],
                    [2, "Response.BadUsername"],
                    [10, "Response.UsernamePrivateInfo"],
                    [12, "Response.UsernameNotAvailable"]
                ]), function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                }),
                yo = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                };
            var bo = function(n) {
                var t = this;
                void 0 === n && (n = !0);
                var r = (0, e.useState)({
                        usersAvailableForSwitching: [],
                        isAccountLimitReached: !1
                    }),
                    o = r[0],
                    u = r[1],
                    c = (0, e.useState)(!0),
                    l = c[0],
                    s = c[1];
                return (0, e.useEffect)((function() {
                    mo(t, void 0, Promise, (function() {
                        var e, t;
                        return yo(this, (function(r) {
                            switch (r.label) {
                                case 0:
                                    return r.trys.push([0, 2, 3, 4]), [4, null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.parseLoggedInUsers(!a.authenticatedUser.isAuthenticated, n)];
                                case 1:
                                    return e = r.sent(), u(e), [3, 4];
                                case 2:
                                    return t = r.sent(), console.warn("account switching has issues", t), [3, 4];
                                case 3:
                                    return s(!1), [7];
                                case 4:
                                    return [2]
                            }
                        }))
                    }))
                }), []), {
                    loggedInUsers: o,
                    isGettingLoggedInUsers: l
                }
            };
            var wo, So = function(n) {
                    (0, e.useEffect)((function() {
                        n && fr()
                    }), [n])
                },
                _o = function() {
                    var n = (0, e.useState)(!1),
                        t = n[0],
                        r = n[1];
                    return (0, e.useEffect)((function() {
                        var e = new URLSearchParams(window.location.search),
                            n = String(e.get("returnUrl")),
                            t = n.includes("parents/account-setup") || n.includes("parental-requests");
                        r(t)
                    }), []), t
                },
                Ao = {
                    qualifiedSignup: i.EnvironmentUrls.apiGatewayUrl + "/affiliate-links/v1/events/qualified-signup",
                    qualifiedLogin: i.EnvironmentUrls.apiGatewayUrl + "/affiliate-links/v1/events/authenticated-visit"
                },
                Eo = ["/share-links"],
                Lo = ["ExperienceAffiliate", "ExperienceInvite"],
                ko = function(e) {
                    var n;
                    return Eo.includes(e.pathname) && Lo.includes(null !== (n = e.searchParams.get("type")) && void 0 !== n ? n : "")
                };
            ! function(e) {
                e.ChargebackReenableAccount = "ChargebackReenableAccount", e.SavePaymentMethods = "SavePaymentMethods", e.UpdateUserSetting = "UpdateUserSetting", e.UpdateBirthdate = "UpdateBirthdate", e.LinkToChild = "LinkToChild", e.Unknown = "Unknown"
            }(wo || (wo = {}));
            l.eventStreamService.eventTypes;
            var Co, To = function(e) {
                    o.httpService.post({
                        withCredentials: !0,
                        url: Ao.qualifiedLogin
                    }, e).catch((function(e) {
                        console.error("Failed to send login event for affiliate links:", e)
                    }))
                },
                xo = (0, u.withTranslations)((function(e) {
                    var t = e.credentialValue,
                        r = e.translate;
                    return n().createElement(c.Modal, {
                        className: "security-notification-modal",
                        show: !0,
                        backdrop: "static",
                        keyboard: !1
                    }, n().createElement(c.Modal.Header, {
                        useBaseBootstrapComponent: !0
                    }, n().createElement("div", null), n().createElement("span", {
                        className: "text-heading-small text-align-x-center padding-large"
                    }, r(In.HeadingSecurityNotification))), n().createElement(c.Modal.Body, null, n().createElement("p", {
                        className: "text-center text-body-large modal-margin-bottom"
                    }, r(In.DescriptionRecoverYourAccount))), n().createElement(c.Modal.Footer, null, n().createElement("div", {
                        className: "security-notification-modal-footer-buttons"
                    }, n().createElement("button", {
                        type: "button",
                        className: "btn-growth-md security-notification-modal-footer-button update-email-button",
                        "aria-label": r(In.ActionRecoverYourAccount),
                        onClick: function() {
                            ! function(e) {
                                sr("" === e ? Pn.forgotCredentialsUrl : Pn.forgotCredentialsUrl + "?identifier=" + encodeURIComponent(e))
                            }(t)
                        }
                    }, r(In.ActionRecoverYourAccount)))))
                }), Ot),
                Io = function() {
                    return Io = Object.assign || function(e) {
                        for (var n, t = 1, r = arguments.length; t < r; t++)
                            for (var o in n = arguments[t]) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
                        return e
                    }, Io.apply(this, arguments)
                },
                Uo = function(e, n, t, r) {
                    return new(t || (t = Promise))((function(o, i) {
                        function a(e) {
                            try {
                                c(r.next(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function u(e) {
                            try {
                                c(r.throw(e))
                            } catch (e) {
                                i(e)
                            }
                        }

                        function c(e) {
                            var n;
                            e.done ? o(e.value) : (n = e.value, n instanceof t ? n : new t((function(e) {
                                e(n)
                            }))).then(a, u)
                        }
                        c((r = r.apply(e, n || [])).next())
                    }))
                },
                Po = function(e, n) {
                    var t, r, o, i, a = {
                        label: 0,
                        sent: function() {
                            if (1 & o[0]) throw o[1];
                            return o[1]
                        },
                        trys: [],
                        ops: []
                    };
                    return i = {
                        next: u(0),
                        throw: u(1),
                        return: u(2)
                    }, "function" == typeof Symbol && (i[Symbol.iterator] = function() {
                        return this
                    }), i;

                    function u(i) {
                        return function(u) {
                            return function(i) {
                                if (t) throw new TypeError("Generator is already executing.");
                                for (; a;) try {
                                    if (t = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, i[1])).done) return o;
                                    switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                                        case 0:
                                        case 1:
                                            o = i;
                                            break;
                                        case 4:
                                            return a.label++, {
                                                value: i[1],
                                                done: !1
                                            };
                                        case 5:
                                            a.label++, r = i[1], i = [0];
                                            continue;
                                        case 7:
                                            i = a.ops.pop(), a.trys.pop();
                                            continue;
                                        default:
                                            if (!(o = a.trys, (o = o.length > 0 && o[o.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                                a = 0;
                                                continue
                                            }
                                            if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                                                a.label = i[1];
                                                break
                                            }
                                            if (6 === i[0] && a.label < o[1]) {
                                                a.label = o[1], o = i;
                                                break
                                            }
                                            if (o && a.label < o[2]) {
                                                a.label = o[2], a.ops.push(i);
                                                break
                                            }
                                            o[2] && a.ops.pop(), a.trys.pop();
                                            continue
                                    }
                                    i = n.call(e, a)
                                } catch (e) {
                                    i = [6, e], r = 0
                                } finally {
                                    t = o = 0
                                }
                                if (5 & i[0]) throw i[1];
                                return {
                                    value: i[0] ? i[1] : void 0,
                                    done: !0
                                }
                            }([i, u])
                        }
                    }
                },
                Oo = new Q(new K({
                    credentials: "include",
                    genericChallengeMiddlewareType: "native",
                    robloxSiteDomain: i.EnvironmentUrls.domain,
                    basePath: (null !== (Co = i.EnvironmentUrls.apiGatewayUrl) && void 0 !== Co ? Co : "") + "/rotating-client-service"
                })),
                Ro = function() {
                    return Uo(void 0, void 0, Promise, (function() {
                        var e, n, t;
                        return Po(this, (function(r) {
                            switch (r.label) {
                                case 0:
                                    return e = l.cryptoUtil.generateSecureAuthIntent, n = l.cryptoUtil.generateSecureAuthIntentV2, [4, (0, Z.pipe)(an((function() {
                                        return Oo.metadataGetMetadata()
                                    }), (function(e) {
                                        return e
                                    })), ln((function(e) {
                                        return !!e.enableNewSAIOnLogin
                                    })), on((function() {
                                        return Ve(!1)
                                    })))()];
                                case 1:
                                    return t = r.sent(), [2, (0, Z.pipe)(!!t, J((function() {
                                        return e()
                                    }), (function() {
                                        return n()
                                    })))]
                            }
                        }))
                    }))
                },
                Fo = (0, u.withTranslations)((function(t) {
                    var r, o, u, s, f, d = t.translate,
                        h = (0, e.useState)(!1),
                        p = h[0],
                        v = h[1],
                        g = (0, e.useState)(""),
                        m = g[0],
                        y = g[1],
                        b = (0, e.useState)(""),
                        w = b[0],
                        S = b[1],
                        _ = (0, e.useState)(""),
                        A = _[0],
                        E = _[1],
                        L = (0, e.useState)(""),
                        k = L[0],
                        C = L[1],
                        T = (0, e.useState)(""),
                        x = T[0],
                        I = T[1],
                        U = (0, e.useState)(""),
                        P = U[0],
                        O = U[1],
                        R = (0, e.useState)(0),
                        F = R[0],
                        D = R[1],
                        N = (0, e.useState)(""),
                        j = N[0],
                        M = N[1],
                        B = (0, e.useState)(""),
                        z = B[0],
                        W = B[1],
                        V = (0, e.useState)({
                            users: [],
                            invalidUsers: []
                        }),
                        q = V[0],
                        H = V[1],
                        G = (0, e.useState)(0),
                        $ = G[0],
                        K = G[1],
                        Y = (0, e.useState)(""),
                        Q = Y[0],
                        J = Y[1],
                        Z = (0, e.useState)(Tn.Username),
                        X = Z[0],
                        ee = Z[1],
                        ne = (0, e.useState)(""),
                        te = ne[0],
                        re = ne[1],
                        oe = (0, e.useState)(!1),
                        ie = oe[0],
                        ae = oe[1],
                        ue = (0, e.useState)(""),
                        ce = ue[0],
                        le = ue[1],
                        se = (0, e.useState)(!1),
                        fe = se[0],
                        de = se[1],
                        he = (0, e.useState)(""),
                        pe = he[0],
                        ve = he[1],
                        ge = (0, e.useState)(""),
                        me = ge[0],
                        ye = ge[1],
                        be = (0, e.useState)(""),
                        we = be[0],
                        Se = be[1],
                        _e = (0, e.useState)(""),
                        Ae = _e[0],
                        Ee = _e[1],
                        Le = (0, e.useState)(!1),
                        ke = Le[0],
                        Ce = Le[1],
                        Te = (0, e.useState)(""),
                        xe = Te[0],
                        Ie = Te[1],
                        Ue = (0, e.useState)(""),
                        Pe = Ue[0],
                        Oe = Ue[1],
                        Re = (0, e.useState)(0),
                        Fe = Re[0],
                        De = Re[1],
                        Ne = (0, e.useState)(!1),
                        je = Ne[0],
                        Me = Ne[1],
                        Be = (0, e.useState)(!1),
                        ze = Be[0],
                        We = Be[1],
                        Ve = (0, e.useRef)(new AbortController),
                        qe = (0, e.useState)(!1),
                        He = qe[0],
                        Ge = qe[1],
                        $e = (0, e.useState)(100),
                        Ke = $e[0],
                        Ye = $e[1],
                        Qe = !0,
                        Je = (0, e.useState)(""),
                        Ze = Je[0],
                        Xe = Je[1],
                        en = fo(Ut).IsLoginUiUpdatesEnabled,
                        nn = fo(Ut).IsLoginBackgroundImageEnabled,
                        tn = fo(Ut).LoginBackgroundClass,
                        rn = (0, e.useState)(!0),
                        on = rn[0],
                        an = rn[1],
                        un = (0, e.useState)(!1),
                        cn = un[0],
                        ln = un[1],
                        sn = bo(!(null !== (r = null === a.authenticatedUser || void 0 === a.authenticatedUser ? void 0 : a.authenticatedUser.isAuthenticated) && void 0 !== r && r)),
                        fn = sn.loggedInUsers,
                        dn = sn.isGettingLoggedInUsers,
                        hn = null !== (o = null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser()) && void 0 !== o ? o : [!1, !1],
                        pn = hn[0],
                        vn = hn[1],
                        gn = _o(),
                        mn = function(e) {
                            return Boolean(null == e ? void 0 : e.identityVerificationLoginTicket)
                        },
                        yn = function(e) {
                            Xe(e.identityVerificationLoginTicket)
                        },
                        bn = function(e) {
                            ae(!0);
                            var n = zr(),
                                t = function(e) {
                                    try {
                                        var n = new URL(e).searchParams.get("referralUrl");
                                        if (!n) return null;
                                        var t = new URL(decodeURIComponent(n));
                                        return ko(t) ? t.href : null
                                    } catch (e) {
                                        return null
                                    }
                                }(n);
                            if (t) {
                                var r = function(e) {
                                        var n;
                                        try {
                                            var t = new URL(e);
                                            return Eo.includes(t.pathname) && null !== (n = t.searchParams.get("code")) && void 0 !== n ? n : ""
                                        } catch (e) {
                                            return ""
                                        }
                                    }(t),
                                    o = function(e) {
                                        var n;
                                        try {
                                            var t = new URL(e);
                                            return Eo.includes(t.pathname) && null !== (n = t.searchParams.get("type")) && void 0 !== n ? n : ""
                                        } catch (e) {
                                            return ""
                                        }
                                    }(t);
                                To({
                                    referralUrl: null != t ? t : "",
                                    linkId: r,
                                    linkType: o,
                                    userDidLogIn: !0
                                })
                            }
                            sr(n)
                        },
                        wn = function(e) {
                            I(e.userId), O(e.challengeId)
                        },
                        Cn = function(e) {
                            if (function(e) {
                                    var n;
                                    return Boolean(null === (n = null == e ? void 0 : e.twoStepVerificationData) || void 0 === n ? void 0 : n.ticket)
                                }(e)) ! function(e) {
                                var n = {
                                    userId: e.user.id.toString(),
                                    challengeId: e.twoStepVerificationData.ticket
                                };
                                ae(!1), wn(n), Ve.current.abort()
                            }(e);
                            else if (mn(e)) yn(e);
                            else {
                                try {
                                    null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.storeAccountSwitcherBlob(e.accountBlob ? e.accountBlob : "")
                                } catch (e) {
                                    console.warn("Failed to save blob.", e)
                                }
                                try {
                                    if (e.user.id)(0, l.dataStores.authIntentDataStore.applyUserAuthIntent)(e.user.id.toString())
                                } catch (e) {
                                    console.error("Error applying auth intent data:", e)
                                }
                                bn(e.user.id.toString())
                            }
                        },
                        xn = function() {
                            S(""), y("")
                        },
                        Un = function(e, n) {
                            if (i.AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(e)) return jt(), ae(!1), Nt(""), void K(0);
                            var t, r = qr(e);
                            switch (r) {
                                case Vn:
                                    return void Pn(e);
                                case Hn:
                                    return void Rn();
                                case nt:
                                    return void On(e);
                                case Kn:
                                    return void Dn();
                                case tt:
                                    return void Pt(e);
                                case it:
                                    return void Ot(n, !1);
                                case at:
                                    return void Rt();
                                case ut:
                                    return void Ot(n, !0);
                                default:
                                    xn(), ae(!1), Dr(function(e) {
                                        var n = Tt;
                                        switch (e) {
                                            case Wn:
                                                n = yt;
                                                break;
                                            case qn:
                                                n = bt;
                                                break;
                                            case Gn:
                                                n = wt;
                                                break;
                                            case $n:
                                                n = St;
                                                break;
                                            case Kn:
                                                n = _t;
                                                break;
                                            case Yn:
                                                n = mt;
                                                break;
                                            case Qn:
                                                n = At;
                                                break;
                                            case Jn:
                                                n = Et;
                                                break;
                                            case Xn:
                                                n = kt;
                                                break;
                                            case Zn:
                                                n = Lt;
                                                break;
                                            case et:
                                                n = Ct;
                                                break;
                                            default:
                                                n = Tt
                                        }
                                        return n
                                    }(r)), t = d(jr(r, n)), n === Tn.EmailOtpSessionToken ? (! function(e) {
                                        l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.enterOTP, {
                                            field: Zt.field.errorMessage,
                                            aType: Zt.aType.shown,
                                            btn: Zt.btn.login,
                                            errorCode: e
                                        })
                                    }(String(r)), Nt(t, r === rt)) : n === Tn.Passkey ? Bt(t, r === rt) : le(t), K(0)
                            }
                        },
                        Pn = function(e) {
                            var n, t = function(e) {
                                var n = Hr(e);
                                "object" == typeof e && Hr(e.data).forEach((function(e) {
                                    return n.push(e)
                                }));
                                var t = n[0] || ",";
                                try {
                                    var r = JSON.parse(t);
                                    return {
                                        dataExchange: r.dxBlob,
                                        unifiedCaptchaId: r.unifiedCaptchaId
                                    }
                                } catch (e) {
                                    var o = t.split(",");
                                    return {
                                        unifiedCaptchaId: o[0],
                                        dataExchange: o[1]
                                    }
                                }
                            }(e);
                            Dr(vt), y((n = t).unifiedCaptchaId), S(n.dataExchange)
                        },
                        On = function(e) {
                            var n, t = function(e) {
                                var n = Hr(e);
                                "object" == typeof e && Hr(e.data).forEach((function(e) {
                                    return n.push(e)
                                }));
                                var t = n[0] || "",
                                    r = JSON.parse(t);
                                return {
                                    userId: r.userId,
                                    sessionId: r.sessionId
                                }
                            }(e);
                            Dr(xt), I((n = t).userId), M(n.sessionId)
                        },
                        Rn = function() {
                            Dr(gt), Ge(!0)
                        },
                        Dn = function() {
                            xn(), de(!0), Dr(_t)
                        },
                        ot = function() {
                            le(d(In.MessageUnknownErrorTryAgain))
                        },
                        ct = function() {
                            H({
                                users: [],
                                invalidUsers: []
                            }), K(0), ae(!1), Nt("")
                        },
                        Pt = function(e) {
                            xn();
                            var n = function(e) {
                                var n = {
                                        users: [],
                                        invalidUsers: []
                                    },
                                    t = Hr(e);
                                if ("object" == typeof e) {
                                    Hr(e.data).forEach((function(e) {
                                        return t.push(e)
                                    }));
                                    var r = t[0] || "",
                                        o = JSON.parse(r),
                                        i = o.users,
                                        a = o.invalidUsers;
                                    n.users = null != i ? i : [], n.invalidUsers = null != a ? a : []
                                }
                                return n
                            }(e);
                            H(n);
                            var t = n.users.map((function(e) {
                                return e.id
                            })).join(",");
                            ! function(e, n, t) {
                                t === Tn.EmailOtpSessionToken && (l.eventStreamService.sendEventWithTarget(Xt.pageLoad, Zt.context.disambiguationOTP, {
                                    numUsers: String(e)
                                }), l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authPageLoad, Zt.context.disambigOTP, {
                                    state: n
                                }))
                            }(n.users.length, t, X)
                        },
                        Ot = function(e, n) {
                            ! function(e, n, t, r) {
                                var o = r ? Sn.LoginVpcEmptyBlobRequiredError : Sn.LoginEmptyBlobRequiredError,
                                    a = r ? kn : Ln,
                                    u = r ? Zt.context.accountSwitcherVpcLogin : Zt.context.accountSwitcherLogin,
                                    c = Zt.clientErrorTypes.logoutAllAccountSwitcherAccounts,
                                    l = {
                                        containerId: zn,
                                        origin: o,
                                        localizedTitleText: e(_n),
                                        localizedBodyText: e(a),
                                        localizedPrimaryButtonText: e(An),
                                        localizedSecondaryButtonText: e(En),
                                        primaryButtonCallback: function() {
                                            return Or(void 0, void 0, void 0, (function() {
                                                var e;
                                                return Rr(this, (function(t) {
                                                    switch (t.label) {
                                                        case 0:
                                                            if (ir(), !(e = Sr())) return [3, 4];
                                                            t.label = 1;
                                                        case 1:
                                                            return t.trys.push([1, 3, , 4]), [4, vr({
                                                                encrypted_users_data_blob: e
                                                            })];
                                                        case 2:
                                                            return t.sent(), [3, 4];
                                                        case 3:
                                                            return t.sent(), gr(u, c), [3, 4];
                                                        case 4:
                                                            return _r(), n(!1), [2]
                                                    }
                                                }))
                                            }))
                                        },
                                        secondaryButtonCallback: function() {
                                            t()
                                        }
                                    };
                                null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.renderBaseConfirmationModal(l)
                            }(d, Wt, (function() {
                                e === Tn.EmailOtpSessionToken && (ct(), window.dispatchEvent(new CustomEvent("onEnterEmailVerifyCodeError", {
                                    detail: {
                                        errorMessage: "",
                                        shouldCloseModal: !0
                                    }
                                })))
                            }), n), ae(!1)
                        },
                        Rt = function() {
                            ln(!0), ae(!1)
                        },
                        Ft = function(e, n) {
                            ee(Tn.EmailOtpSessionToken), Se(e), Ee(n)
                        },
                        Dt = function() {
                            ee(Tn.Username), Se(""), Ee("")
                        },
                        Nt = function(e, n) {
                            void 0 === n && (n = !1);
                            var t = !1,
                                r = e;
                            ($ > 0 || n) && (t = !0, r = "", le(e)), window.dispatchEvent(new CustomEvent("onEnterEmailVerifyCodeError", {
                                detail: {
                                    errorMessage: r,
                                    shouldCloseModal: t
                                }
                            })), Ee("")
                        },
                        jt = function() {
                            De(Fe + 1), Oe(""), Ie("")
                        },
                        Bt = function(e, n) {
                            void 0 === n && (n = !1), le(e), jt()
                        },
                        zt = function(e) {
                            void 0 === e && (e = ""), xn(), K(0), Nt(e), ae(!1)
                        },
                        Wt = function(e) {
                            void 0 === e && (e = !0);
                            var n = function() {
                                var e;
                                if (e = X === Tn.AuthToken ? {
                                        ctype: X,
                                        cvalue: pe,
                                        password: me
                                    } : X === Tn.EmailOtpSessionToken ? {
                                        ctype: X,
                                        cvalue: we,
                                        password: Ae
                                    } : X === Tn.Passkey ? {
                                        ctype: X,
                                        cvalue: Pe,
                                        password: xe
                                    } : {
                                        ctype: fe ? Tn.Username : X,
                                        cvalue: Q,
                                        password: te
                                    }, A && k && (e.captchaId = A, e.captchaToken = k), j && z && (e.securityQuestionSessionId = j, e.securityQuestionRedemptionToken = z, M(""), W("")), pn) {
                                    var n = null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.getStoredAccountSwitcherBlob();
                                    n && (e.accountBlob = n)
                                }
                                return e
                            }();
                            if ($ && (n.userId = $), e) {
                                if (!Q || !te) return void le(d(In.MessageUsernameAndPasswordRequired));
                                l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.loginPage, {
                                    field: Zt.field.loginSubmitButtonName,
                                    aType: Zt.aType.click
                                }), Dr(ft), Qe && (Dr(st), Qe = !1)
                            }
                            ae(!0),
                                function(e) {
                                    Uo(void 0, void 0, void 0, (function() {
                                        var n, t, r, o, i;
                                        return Po(this, (function(a) {
                                            switch (a.label) {
                                                case 0:
                                                    return a.trys.push([0, 3, , 4]), [4, Ro()];
                                                case 1:
                                                    return n = a.sent(), t = Io(Io({}, e), {
                                                        secureAuthenticationIntent: n
                                                    }), [4, Jt(t)];
                                                case 2:
                                                    return r = a.sent(), localStorage.setItem("UserId", r.user.id), t.secureAuthenticationIntent && Dr(dt), (null === (i = null === l.dataStores || void 0 === l.dataStores ? void 0 : l.dataStores.authIntentDataStore) || void 0 === i ? void 0 : i.hasUnclaimedAuthIntent()) && Dr(ht), Dr(pt), Cn(r), [3, 4];
                                                case 3:
                                                    return o = a.sent(), Un(o, e.ctype), [3, 4];
                                                case 4:
                                                    return [2]
                                            }
                                        }))
                                    }))
                                }(n)
                        },
                        Vt = function(e) {
                            return void 0 === e && (e = "conditional"), Uo(void 0, void 0, void 0, (function() {
                                var n, t, r, o, i;
                                return Po(this, (function(a) {
                                    switch (a.label) {
                                        case 0:
                                            n = null, a.label = 1;
                                        case 1:
                                            return a.trys.push([1, 3, , 4]), [4, Ht()];
                                        case 2:
                                            return n = a.sent(), [3, 4];
                                        case 3:
                                            return a.sent(), [2];
                                        case 4:
                                            return a.trys.push([4, 6, , 7]), [4, Nr(n.authenticationOptions, e, Ve.current.signal)];
                                        case 5:
                                            return t = a.sent(), r = l.fido2Util.formatCredentialAuthenticationResponseWeb(t),
                                                function(e, n) {
                                                    ee(Tn.Passkey), Ie(e), Oe(n)
                                                }(n.sessionId, r), [3, 7];
                                        case 6:
                                            return o = a.sent(), "AbortError" === (null === (i = o) || void 0 === i ? void 0 : i.name) ? Ve.current = new AbortController : console.error(o), [3, 7];
                                        case 7:
                                            return [2]
                                    }
                                }))
                            }))
                        };
                    (0, e.useEffect)((function() {
                        Uo(void 0, void 0, Promise, (function() {
                            var e, n, t;
                            return Po(this, (function(r) {
                                switch (r.label) {
                                    case 0:
                                        return [4, Mt(It)];
                                    case 1:
                                        return (e = r.sent()) && (Ce(null !== (n = e.IsOtpEnabled) && void 0 !== n && n), Ye(null !== (t = e.OtpCodeLength) && void 0 !== t ? t : 0)), [2]
                                }
                            }))
                        }))
                    }), []), (0, e.useEffect)((function() {
                        try {
                            (0, l.dataStores.authIntentDataStore.saveGameIntentFromReturnUrl)()
                        } catch (e) {
                            console.error("intent saving error: ", e)
                        }
                    }), []), (0, e.useEffect)((function() {
                        Uo(void 0, void 0, void 0, (function() {
                            var e, n, t, r, o, i, a, u, c, l, s, f, d;
                            return Po(this, (function(h) {
                                switch (h.label) {
                                    case 0:
                                        return window.PublicKeyCredential ? [4, Promise.all([null === (c = (u = window.PublicKeyCredential).isConditionalMediationAvailable) || void 0 === c ? void 0 : c.call(u), null === (s = (l = window.PublicKeyCredential).isUserVerifyingPlatformAuthenticatorAvailable) || void 0 === s ? void 0 : s.call(l), null === (d = (f = window.PublicKeyCredential).getClientCapabilities) || void 0 === d ? void 0 : d.call(f)])] : [3, 2];
                                    case 1:
                                        return e = h.sent(), n = e[0], t = e[1], r = e[2], o = Boolean((null == r ? void 0 : r.passkeyPlatformAuthenticator) || (null == r ? void 0 : r.userVerifyingPlatformAuthenticator)), i = Boolean(n || t || o), a = Boolean(n), Me(i), We(a), ur(i), ar(a), [3, 3];
                                    case 2:
                                        Me(!1), We(!1), ur(!1), ar(!1), h.label = 3;
                                    case 3:
                                        return [2]
                                }
                            }))
                        }))
                    }), []), (0, e.useEffect)((function() {
                        Gt() && ze && Vt("conditional")
                    }), [Fe, ze]), (0, e.useEffect)((function() {
                        xe && Pe && Wt(!1)
                    }), [Pe, xe]), (0, e.useEffect)((function() {
                        j && z && Wt(!1)
                    }), [j && z]), (0, e.useEffect)((function() {
                        me && pe && Wt(!1)
                    }), [me, pe]), (0, e.useEffect)((function() {
                        we && Ae && Wt(!1)
                    }), [we, Ae]), (0, e.useEffect)((function() {
                        fe && Wt(!1)
                    }), [fe]), (0, e.useEffect)((function() {
                        $ && Wt(!1)
                    }), [$]), (0, e.useEffect)((function() {
                        var e, n;
                        if (!dn && vn && pn) {
                            var t = null === (e = null == fn ? void 0 : fn.usersAvailableForSwitching) || void 0 === e ? void 0 : e.map((function(e) {
                                return e.id
                            })).join(",");
                            n = t, l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authPageLoad, Zt.context.accountSwitcherLogin, {
                                state: n,
                                field: Zt.field.accountSwitcher
                            })
                        }
                    }), [fn, dn, pn, vn]), So(a.authenticatedUser.isAuthenticated && vn && !pn);
                    var qt = !a.authenticatedUser.isAuthenticated && !!(null === (u = null == fn ? void 0 : fn.usersAvailableForSwitching) || void 0 === u ? void 0 : u.length) && on && !gn,
                        $t = Gt() && je && !ze;
                    if (dn || p) return n().createElement(c.Loading, null);
                    var Kt = "login-base-container full-height",
                        Yt = n().createElement("div", {
                            className: "flex bg-surface-0 justify-center",
                            style: {
                                width: "100%",
                                minHeight: "100vh"
                            }
                        }, qt && n().createElement(ho, {
                            containerId: Mn,
                            titleText: d(In.HeadingYouHaveLoggedOut),
                            helpText: d(In.LabelChooseAccountToUse),
                            onAccountSwitched: function() {
                                v(!0), fr()
                            },
                            handleAddAccount: function() {
                                an(!1)
                            },
                            removeInvalidActiveUser: !0,
                            translate: d,
                            loggedInUsers: fn
                        }), !qt && n().createElement("div", {
                            className: "grow basis-0 large:min-width-[calc(var(--breakpoint-medium)/2)] max-width-[calc(var(--breakpoint-medium)/2)] xlarge:max-width-[calc(var(--breakpoint-xlarge)/3)]"
                        }, n().createElement("div", {
                            className: "flex flex-col gap-xlarge size-full padding-top-[var(--size-2200)] padding-x-xlarge medium:padding-x-[var(--size-1200)] large:padding-x-[var(--size-1600)]"
                        }, n().createElement("div", {
                            className: "flex flex-col gap-xsmall"
                        }, n().createElement("h2", {
                            className: "content-emphasis text-heading-large padding-none"
                        }, "Sign in"), n().createElement("span", {
                            className: "content-default text-body-large"
                        }, "Jump back into your experiences")), 
							n().createElement(Gr, {
                            captchaId: A,
                            captchaToken: k,
                            credentialValue: Q,
                            password: te,
                            isLoading: ie,
                            errorMsg: ce,
                            translate: d,
                            onFormSubmit: Wt,
                            onCredentialValueChange: function(e) {
                                le(""), J(e), ee(Mr(e))
                            },
                            onPasswordChange: function(e) {
                                le(""), re(e)
                            },
                            isLoginFormDisabled: null !== (f = null == fn ? void 0 : fn.isAccountLimitReached) && void 0 !== f && f
                        }), n().createElement(ao, {
                            credentialValue: Q,
                            translate: d
                        }), n().createElement(Jr, {
                            onCrossDeviceLoginCodeValidated: function(e) {
                                ae(!0), ee(Tn.AuthToken), ve(e.code), ye(e.privateKey)
                            },
                            isOtpLoginEnabled: ke,
                            openOtpLoginModal: function() {
                                if (l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.loginPage, {
                                        field: Zt.field.loginOTP,
                                        aType: Zt.aType.click
                                    }), l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authButtonClick, Zt.context.schematizedLoginForm, {
                                        btn: Zt.field.OTP
                                    }), i.EmailVerifyCodeModalService) {
                                    var e = {
                                        containerId: jn,
                                        codeLength: Ke,
                                        onEmailCodeEntered: Ft,
                                        onModalAbandoned: Dt,
                                        enterEmailTitle: d(In.LabelGetOneTimeCode),
                                        enterEmailDescription: d(In.DescriptionGetOneTimeCodeHelp),
                                        enterCodeTitle: d(In.LabelEnterOneTimeCode),
                                        enterCodeDescription: d(In.DescriptionEnterOneTimeCodeHelp),
                                        origin: It,
                                        translate: d,
                                        isChangeEmailEnabled: en
                                    };
                                    i.EmailVerifyCodeModalService.renderEmailVerifyCodeModal(e)
                                }
                            },
                            showPasskeyLoginButton: $t,
                            openPasskeyLoginFlow: Vt,
                            isOneTimeCodeDesignUpdated: en,
                            translate: d
                        }), He && n().createElement(xo, {
                            credentialValue: Q,
                            translate: d
                        }), n().createElement(io, null)), m && w && n().createElement(Kr, {
                            containerId: Fn,
                            actionType: i.AccountIntegrityChallengeService.Captcha.ActionType.Login,
                            unifiedCaptchaId: m,
                            dataExchange: w,
                            onCaptchaChallengeCompleted: function(e) {
                                E(e.captchaId), C(e.captchaToken)
                            },
                            onCaptchaChallengeInvalidated: function(e) {
                                var n = function(e) {
                                        var n = i.CaptchaConstants.errorCodes,
                                            t = n.failedToLoadProviderScript,
                                            r = n.failedToVerify,
                                            o = Qn,
                                            a = Jn,
                                            u = Zn;
                                        switch (e) {
                                            case t:
                                                return o;
                                            case r:
                                                return a;
                                            default:
                                                return u
                                        }
                                    }(e.errorCode),
                                    t = Mr(Q),
                                    r = d(jr(n, t));
                                le(r), zt(r)
                            },
                            onCaptchaChallengeAbandoned: function() {
                                zt()
                            },
                            onUnknownError: ot
                        }), x && j && n().createElement(to, {
                            userId: x,
                            sessionId: j,
                            onSecurityQuestionsChallengeCompleted: function(e) {
                                W(e.redemptionToken)
                            },
                            onSecurityQuestionsChallengeInvalidated: function(e) {
                                M(""), W(""), Wt(!1)
                            },
                            onSecurityQuestionsChallengeAbandoned: function(e) {
                                I(""), M(""), zt()
                            },
                            onUnknownError: ot
                        }), x && P && n().createElement(Qr, {
                            userId: x,
                            challengeId: P,
                            on2svChallengeCompleted: function(e) {
                                return Uo(void 0, void 0, void 0, (function() {
                                    var n, t, r, o;
                                    return Po(this, (function(a) {
                                        switch (a.label) {
                                            case 0:
                                                return a.trys.push([0, 3, , 4]), n = {
                                                    challengeId: P,
                                                    verificationToken: e.verificationToken,
                                                    rememberDevice: true,
                                                    userId: localStorage.getItem("UserId"),
                                                    username: document.querySelector("#login-username").value,
                                                    password: document.querySelector("#login-password").value,
                                                    accountBlob: null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService ? void 0 : i.AccountSwitcherService.getStoredAccountSwitcherBlob()
                                                }, [4, Ro()];
                                            case 1:
                                                return t = a.sent(), r = Io(Io({}, n), {
                                                    secureAuthenticationIntent: t
                                                }), [4, Qt(x, r)];
                                            case 2:
                                                return o = a.sent(), r.secureAuthenticationIntent && Dr(dt), mn(o) ? yn(o) : (null === i.AccountSwitcherService || void 0 === i.AccountSwitcherService || i.AccountSwitcherService.storeAccountSwitcherBlob(o.accountBlob ? o.accountBlob : ""), bn()), [3, 4];
                                            case 3:
                                                return a.sent(), ot(), [3, 4];
                                            case 4:
                                                return [2]
                                        }
                                    }))
                                }))
                            },
                            on2svChallengeInvalidated: function(e) {
                                D(F + 1);
                                var n = d(In.ResponseVerificationError);
                                le(n), F < lt ? Wt(!1) : zt(n)
                            },
                            on2svChallengeAbandoned: function(e) {
                                jt(), I(""), O(""), zt()
                            },
                            onUnknownError: ot
                        }), n().createElement(eo, {
                            identityVerificationLoginTicket: Ze,
                            translate: d
                        }), q.users.length > 0 && n().createElement(uo, {
                            containerId: Nn,
                            users: q.users,
                            invalidUsers: [],
                            onAccountSelection: function(e) {
                                H({
                                        users: [],
                                        invalidUsers: []
                                    }), K(e),
                                    function(e, n) {
                                        e === Tn.EmailOtpSessionToken ? (l.eventStreamService.sendEventWithTarget(Xt.formInteraction, Zt.context.disambiguationOTP, {
                                            field: Zt.field.accountSelection
                                        }), l.eventStreamService.sendEventWithTarget(Zt.schematizedEventTypes.authButtonClick, Zt.context.disambigOTP, {
                                            btn: Zt.btn.select,
                                            state: String(n)
                                        })) : l.eventStreamService.sendEventWithTarget(Xt.formInteraction, "", {
                                            field: Zt.field.accountSelection
                                        })
                                    }(X, e)
                            },
                            onAccountSelectorAbandoned: ct,
                            titleText: d(In.LabelAccountSelector),
                            helpText: Wr(X, d),
                            translate: d
                        }), n().createElement(go, {
                            origin: Sn.LoginAccountLimit,
                            containerId: Bn,
                            handleRedirectHome: function() {
                                v(!0), sr(zr())
                            },
                            hasMaxLoggedInAccountsSignupError: cn,
                            isAccountLimitReached: fn.isAccountLimitReached,
                            translate: d,
                            isParentUser: gn
                        })), n().createElement("div", {
							className: "hidden large:block grow-2 shrink-0 basis-0"
						}, n().createElement("div", {
                            className: "relative size-full clip"
                        }, n().createElement("img", {
							className: "absolute size-full select-none",
							src: "https://images.rbxcdn.com/659c7cbd7c9751056ba457f5dfc98aef-game_grid.webp",
							alt: "",
							style: {
								objectFit: "cover",
								opacity: "0.7"
							}
						}))));
                    return n().createElement("div", {
                        className: "login-revamp-container"
                    }, Yt)
                }), Ot);

            function Do() {
                var e = lr() || cr();
                e ? ("react-login-web-app" === e.id && e.classList.add("login-container"), (0, r.render)(n().createElement(Fo, null), e)) : window.requestAnimationFrame(Do)
            }(0, o.ready)((function() {
                if (a.authenticatedUser && a.authenticatedUser.isAuthenticated && a.authenticatedUser.isUnder13) {
                    var e = Br();
                    window.location.href = e || i.EnvironmentUrls.websiteUrl + "/home"
                } else Do()
            }))
        }()
}();
//# sourceMappingURL=https://sourcemaps.rbxcdn.com/1fbe689cd4f6cbab31c8ad1466c1bbdc-reactLogin.bundle.min.js.map

/* Bundle detector */
window.Roblox && window.Roblox.BundleDetector && window.Roblox.BundleDetector.bundleDetected("ReactLogin");
