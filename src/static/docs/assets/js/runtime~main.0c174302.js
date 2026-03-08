(() => {
  "use strict";
  var e,
    r,
    t,
    a,
    o,
    c = {},
    n = {};
  function d(e) {
    var r = n[e];
    if (void 0 !== r) return r.exports;
    var t = (n[e] = { id: e, loaded: !1, exports: {} });
    return (c[e].call(t.exports, t, t.exports, d), (t.loaded = !0), t.exports);
  }
  ((d.m = c),
    (d.c = n),
    (e = []),
    (d.O = (r, t, a, o) => {
      if (!t) {
        var c = 1 / 0;
        for (f = 0; f < e.length; f++) {
          for (var [t, a, o] = e[f], n = !0, i = 0; i < t.length; i++)
            (!1 & o || c >= o) && Object.keys(d.O).every((e) => d.O[e](t[i]))
              ? t.splice(i--, 1)
              : ((n = !1), o < c && (c = o));
          if (n) {
            e.splice(f--, 1);
            var b = a();
            void 0 !== b && (r = b);
          }
        }
        return r;
      }
      o = o || 0;
      for (var f = e.length; f > 0 && e[f - 1][2] > o; f--) e[f] = e[f - 1];
      e[f] = [t, a, o];
    }),
    (d.n = (e) => {
      var r = e && e.__esModule ? () => e.default : () => e;
      return (d.d(r, { a: r }), r);
    }),
    (t = Object.getPrototypeOf
      ? (e) => Object.getPrototypeOf(e)
      : (e) => e.__proto__),
    (d.t = function (e, a) {
      if ((1 & a && (e = this(e)), 8 & a)) return e;
      if ("object" == typeof e && e) {
        if (4 & a && e.__esModule) return e;
        if (16 & a && "function" == typeof e.then) return e;
      }
      var o = Object.create(null);
      d.r(o);
      var c = {};
      r = r || [null, t({}), t([]), t(t)];
      for (
        var n = 2 & a && e;
        ("object" == typeof n || "function" == typeof n) && !~r.indexOf(n);
        n = t(n)
      )
        Object.getOwnPropertyNames(n).forEach((r) => (c[r] = () => e[r]));
      return ((c.default = () => e), d.d(o, c), o);
    }),
    (d.d = (e, r) => {
      for (var t in r)
        d.o(r, t) &&
          !d.o(e, t) &&
          Object.defineProperty(e, t, { enumerable: !0, get: r[t] });
    }),
    (d.f = {}),
    (d.e = (e) =>
      Promise.all(Object.keys(d.f).reduce((r, t) => (d.f[t](e, r), r), []))),
    (d.u = (e) =>
      "assets/js/" +
      ({
        48: "a94703ab",
        98: "a7bd4aaa",
        219: "cc4c3888",
        247: "7d5ac53b",
        256: "11b43341",
        271: "7a96ca3d",
        401: "17896441",
        471: "66de2771",
        616: "f9c2c370",
        635: "c260b502",
        642: "50c239b7",
        647: "5e95c892",
        710: "bc089483",
        742: "aba21aa0",
        915: "eea5ba4c",
        949: "21334a15",
        969: "14eb3368",
        976: "0e384e19",
      }[e] || e) +
      "." +
      {
        48: "29706000",
        98: "e1d46990",
        219: "6693f3f9",
        237: "aa0501bb",
        247: "dd53dcfb",
        256: "cfd9adca",
        271: "fb55b8eb",
        401: "f60ad4e4",
        471: "857c55fe",
        616: "0f700761",
        635: "cd5b98be",
        642: "f7ca7b21",
        647: "c695680e",
        710: "2580b420",
        742: "db338441",
        915: "f48e95f9",
        949: "9655ecf5",
        969: "d720ab5b",
        976: "b630c85d",
      }[e] +
      ".js"),
    (d.miniCssF = (e) => {}),
    (d.o = (e, r) => Object.prototype.hasOwnProperty.call(e, r)),
    (a = {}),
    (o = "docs:"),
    (d.l = (e, r, t, c) => {
      if (a[e]) a[e].push(r);
      else {
        var n, i;
        if (void 0 !== t)
          for (
            var b = document.getElementsByTagName("script"), f = 0;
            f < b.length;
            f++
          ) {
            var l = b[f];
            if (
              l.getAttribute("src") == e ||
              l.getAttribute("data-webpack") == o + t
            ) {
              n = l;
              break;
            }
          }
        (n ||
          ((i = !0),
          ((n = document.createElement("script")).charset = "utf-8"),
          d.nc && n.setAttribute("nonce", d.nc),
          n.setAttribute("data-webpack", o + t),
          (n.src = e)),
          (a[e] = [r]));
        var u = (r, t) => {
            ((n.onerror = n.onload = null), clearTimeout(s));
            var o = a[e];
            if (
              (delete a[e],
              n.parentNode && n.parentNode.removeChild(n),
              o && o.forEach((e) => e(t)),
              r)
            )
              return r(t);
          },
          s = setTimeout(
            u.bind(null, void 0, { type: "timeout", target: n }),
            12e4,
          );
        ((n.onerror = u.bind(null, n.onerror)),
          (n.onload = u.bind(null, n.onload)),
          i && document.head.appendChild(n));
      }
    }),
    (d.r = (e) => {
      ("undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 }));
    }),
    (d.p = "/docs/"),
    (d.gca = function (e) {
      return (
        (e =
          {
            17896441: "401",
            a94703ab: "48",
            a7bd4aaa: "98",
            cc4c3888: "219",
            "7d5ac53b": "247",
            "11b43341": "256",
            "7a96ca3d": "271",
            "66de2771": "471",
            f9c2c370: "616",
            c260b502: "635",
            "50c239b7": "642",
            "5e95c892": "647",
            bc089483: "710",
            aba21aa0: "742",
            eea5ba4c: "915",
            "21334a15": "949",
            "14eb3368": "969",
            "0e384e19": "976",
          }[e] || e),
        d.p + d.u(e)
      );
    }),
    (() => {
      var e = { 354: 0, 869: 0 };
      ((d.f.j = (r, t) => {
        var a = d.o(e, r) ? e[r] : void 0;
        if (0 !== a)
          if (a) t.push(a[2]);
          else if (/^(354|869)$/.test(r)) e[r] = 0;
          else {
            var o = new Promise((t, o) => (a = e[r] = [t, o]));
            t.push((a[2] = o));
            var c = d.p + d.u(r),
              n = new Error();
            d.l(
              c,
              (t) => {
                if (d.o(e, r) && (0 !== (a = e[r]) && (e[r] = void 0), a)) {
                  var o = t && ("load" === t.type ? "missing" : t.type),
                    c = t && t.target && t.target.src;
                  ((n.message =
                    "Loading chunk " + r + " failed.\n(" + o + ": " + c + ")"),
                    (n.name = "ChunkLoadError"),
                    (n.type = o),
                    (n.request = c),
                    a[1](n));
                }
              },
              "chunk-" + r,
              r,
            );
          }
      }),
        (d.O.j = (r) => 0 === e[r]));
      var r = (r, t) => {
          var a,
            o,
            [c, n, i] = t,
            b = 0;
          if (c.some((r) => 0 !== e[r])) {
            for (a in n) d.o(n, a) && (d.m[a] = n[a]);
            if (i) var f = i(d);
          }
          for (r && r(t); b < c.length; b++)
            ((o = c[b]), d.o(e, o) && e[o] && e[o][0](), (e[o] = 0));
          return d.O(f);
        },
        t = (globalThis.webpackChunkdocs = globalThis.webpackChunkdocs || []);
      (t.forEach(r.bind(null, 0)), (t.push = r.bind(null, t.push.bind(t))));
    })());
})();
