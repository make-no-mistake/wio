"use strict";
(globalThis.webpackChunkdocs = globalThis.webpackChunkdocs || []).push([
  [247],
  {
    48(e, t, s) {
      (s.r(t),
        s.d(t, {
          assets: () => c,
          contentTitle: () => a,
          default: () => u,
          frontMatter: () => i,
          metadata: () => n,
          toc: () => l,
        }));
      const n = JSON.parse(
        '{"id":"features/llm-api","title":"LLM API","description":"","source":"@site/docs/features/llm-api.md","sourceDirName":"features","slug":"/features/llm-api","permalink":"/docs/features/llm-api","draft":false,"unlisted":false,"editUrl":"https://github.com/csc301-2026-s/project-21-make-no-mistake/tree/main/docs/docs/features/llm-api.md","tags":[],"version":"current","sidebarPosition":5,"frontMatter":{"sidebar_position":5,"title":"LLM API"},"sidebar":"docsSidebar","previous":{"title":"Sound Player","permalink":"/docs/features/sound-player"},"next":{"title":"SDK","permalink":"/docs/sdk"}}',
      );
      var o = s(4848),
        r = s(8453);
      const i = { sidebar_position: 5, title: "LLM API" },
        a = "LLM API",
        c = {},
        l = [];
      function d(e) {
        const t = {
          h1: "h1",
          header: "header",
          ...(0, r.R)(),
          ...e.components,
        };
        return (0, o.jsx)(t.header, {
          children: (0, o.jsx)(t.h1, { id: "llm-api", children: "LLM API" }),
        });
      }
      function u(e = {}) {
        const { wrapper: t } = { ...(0, r.R)(), ...e.components };
        return t
          ? (0, o.jsx)(t, { ...e, children: (0, o.jsx)(d, { ...e }) })
          : d(e);
      }
    },
    8453(e, t, s) {
      s.d(t, { R: () => i, x: () => a });
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
      function a(e) {
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
