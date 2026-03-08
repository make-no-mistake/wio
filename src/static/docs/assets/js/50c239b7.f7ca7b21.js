"use strict";
(globalThis.webpackChunkdocs = globalThis.webpackChunkdocs || []).push([
  [642],
  {
    3014(e, t, n) {
      (n.r(t),
        n.d(t, {
          assets: () => i,
          contentTitle: () => d,
          default: () => l,
          frontMatter: () => a,
          metadata: () => r,
          toc: () => c,
        }));
      const r = JSON.parse(
        '{"id":"features/sound-player","title":"Sound Player","description":"","source":"@site/docs/features/sound-player.md","sourceDirName":"features","slug":"/features/sound-player","permalink":"/docs/features/sound-player","draft":false,"unlisted":false,"editUrl":"https://github.com/csc301-2026-s/project-21-make-no-mistake/tree/main/docs/docs/features/sound-player.md","tags":[],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"title":"Sound Player"},"sidebar":"docsSidebar","previous":{"title":"Markdown Renderer","permalink":"/docs/features/markdown-renderer"},"next":{"title":"LLM API","permalink":"/docs/features/llm-api"}}',
      );
      var o = n(4848),
        s = n(8453);
      const a = { sidebar_position: 4, title: "Sound Player" },
        d = "Sound Player",
        i = {},
        c = [];
      function u(e) {
        const t = {
          h1: "h1",
          header: "header",
          ...(0, s.R)(),
          ...e.components,
        };
        return (0, o.jsx)(t.header, {
          children: (0, o.jsx)(t.h1, {
            id: "sound-player",
            children: "Sound Player",
          }),
        });
      }
      function l(e = {}) {
        const { wrapper: t } = { ...(0, s.R)(), ...e.components };
        return t
          ? (0, o.jsx)(t, { ...e, children: (0, o.jsx)(u, { ...e }) })
          : u(e);
      }
    },
    8453(e, t, n) {
      n.d(t, { R: () => a, x: () => d });
      var r = n(6540);
      const o = {},
        s = r.createContext(o);
      function a(e) {
        const t = r.useContext(s);
        return r.useMemo(
          function () {
            return "function" == typeof e ? e(t) : { ...t, ...e };
          },
          [t, e],
        );
      }
      function d(e) {
        let t;
        return (
          (t = e.disableParentContext
            ? "function" == typeof e.components
              ? e.components(o)
              : e.components || o
            : a(e.components)),
          r.createElement(s.Provider, { value: t }, e.children)
        );
      }
    },
  },
]);
