"use strict";
(globalThis.webpackChunkdocs = globalThis.webpackChunkdocs || []).push([
  [616],
  {
    3888(e, t, s) {
      (s.r(t),
        s.d(t, {
          assets: () => d,
          contentTitle: () => c,
          default: () => u,
          frontMatter: () => i,
          metadata: () => n,
          toc: () => a,
        }));
      const n = JSON.parse(
        '{"id":"sdk","title":"SDK","description":"","source":"@site/docs/sdk.md","sourceDirName":".","slug":"/sdk","permalink":"/docs/sdk","draft":false,"unlisted":false,"editUrl":"https://github.com/csc301-2026-s/project-21-make-no-mistake/tree/main/docs/docs/sdk.md","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"title":"SDK"},"sidebar":"docsSidebar","previous":{"title":"LLM API","permalink":"/docs/features/llm-api"},"next":{"title":"Developers","permalink":"/docs/developers"}}',
      );
      var o = s(4848),
        r = s(8453);
      const i = { sidebar_position: 4, title: "SDK" },
        c = "SDK",
        d = {},
        a = [];
      function l(e) {
        const t = {
          h1: "h1",
          header: "header",
          ...(0, r.R)(),
          ...e.components,
        };
        return (0, o.jsx)(t.header, {
          children: (0, o.jsx)(t.h1, { id: "sdk", children: "SDK" }),
        });
      }
      function u(e = {}) {
        const { wrapper: t } = { ...(0, r.R)(), ...e.components };
        return t
          ? (0, o.jsx)(t, { ...e, children: (0, o.jsx)(l, { ...e }) })
          : l(e);
      }
    },
    8453(e, t, s) {
      s.d(t, { R: () => i, x: () => c });
      var n = s(6540);
      const o = {},
        r = n.createContext(o);
      function i(e) {
        const t = n.useContext(r);
        return n.useMemo(
          function () {
            return "function" == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e],
        );
      }
      function c(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? "function" == typeof e.components
              ? e.components(o)
              : e.components || o
            : i(e.components)),
          n.createElement(r.Provider, { value: t }, e.children)
        );
      }
    },
  },
]);
