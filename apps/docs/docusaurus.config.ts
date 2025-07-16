import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import {
  URL,
  ALGOLIA_API_KEY,
  ALGOLIA_APP_ID,
  ALGOLIA_INDEX,
  GOOGLE_ANALYTICS_KEY,
} from "./src/config";

const config: Config = {
  title: "Kariba Network",
  tagline: "Fund public goods.",
  favicon: "img/kariba-emblem-black.svg",

  url: URL,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "opensource-observer", // Usually your GitHub org/user name.
  projectName: "kariba", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  onDuplicateRoutes: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          editUrl:
            "https://github.com/opensource-observer/kariba/tree/main/apps/docs/",
        },
        blog: {
          showReadingTime: true,
          editUrl:
            "https://github.com/opensource-observer/kariba/tree/main/apps/docs/",
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          blogTagsPostsComponent: "@site/src/components/BlogTagsPostsPage.tsx",
        },
        gtag: {
          trackingID: GOOGLE_ANALYTICS_KEY,
          //anonymizeIP: true, // Should we anonymize the IP?
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/kariba-primary-black.png",
    navbar: {
      title: "Kariba Network",
      logo: {
        alt: "Kariba Logo",
        src: "img/kariba-emblem-black.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Docs",
        },
        {
          type: "dropdown",
          label: "Blog",
          position: "left",
          items: [
            {
              label: "Featured",
              href: "/blog/tags/featured",
            },
            {
              label: "Perspective",
              href: "/blog/tags/perspective",
            },
            {
              label: "Development",
              href: "/blog/tags/development",
            },
          ],
        },
        {
          href: "https://www.kariba.network",
          label: "App",
          position: "right",
        },
        {
          href: "https://github.com/opensource-observer/kariba",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "Website",
              href: "https://www.kariba.network",
            },
            {
              label: "GitHub",
              href: "https://github.com/opensource-observer/kariba",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kariba Labs, Inc.`,
    },
    algolia: {
      appId: ALGOLIA_APP_ID,
      apiKey: ALGOLIA_API_KEY,
      indexName: ALGOLIA_INDEX,
      contextualSearch: false,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
