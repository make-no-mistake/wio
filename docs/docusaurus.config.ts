import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Wio",
  tagline: "Wio Documentation",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://wio.onl",
  baseUrl: "/docs",

  organizationName: "MakeNoMistake",
  projectName: "Wio",
  deploymentBranch: "gh-pages",
  trailingSlash: false,

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          editUrl:
            "https://github.com/csc301-2026-s/project-21-make-no-mistake/tree/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Wio",
      logo: {
        alt: "Wio Logo",
        src: "img/logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/csc301-2026-s/project-21-make-no-mistake",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/getting-started/overview",
            },
            {
              label: "Features",
              to: "/category/features",
            },
            {
              label: "SDK",
              to: "/sdk",
            },
            {
              label: "Developers",
              to: "/developers/overview",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/csc301-2026-s/project-21-make-no-mistake",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Make No Mistake. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
