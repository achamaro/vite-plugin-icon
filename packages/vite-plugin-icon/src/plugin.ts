import { createFilter, FilterPattern, PluginOption } from "vite";

import { generateTransform } from "./transform";
import { load } from "./util";

export interface Options {
  downloadDir?: string;
  iconAttribute?: string;
  tagName?: string;
  customElementTagName?: string;
  define?: boolean;
  includes?: FilterPattern;
  excludes?: FilterPattern;
  resolve?: string | false | null;
}

const defaultOptions = {
  downloadDir: "src/assets/icons",
  iconAttribute: "icon",
  tagName: "i",
  customElementTagName: "i-con",
  define: true,
  includes: "**/*.{vue,html,jsx,tsx,svelte}",
};

export default function IconPlugin(options?: Options): PluginOption {
  const {
    downloadDir,
    iconAttribute,
    tagName,
    customElementTagName,
    define,
    includes,
    excludes,
    resolve,
  } = {
    ...defaultOptions,
    ...options,
  };

  const filter = createFilter(includes, excludes, { resolve });

  const virtualModuleId = `virtual:${PACKAGE_NAME}`;

  const transform = generateTransform(
    tagName,
    customElementTagName,
    iconAttribute,
    virtualModuleId
  );

  return {
    name: "vite:icon",
    enforce: "pre",
    resolveId(id: string) {
      if (id.startsWith(virtualModuleId)) {
        return id;
      }
    },
    async load(id) {
      if (id.startsWith(virtualModuleId)) {
        const name = id.substring(virtualModuleId.length + 1);
        const icon = await load(downloadDir, name);
        if (icon) {
          return (
            `import { addIconifyIcon, defineIcon } from "${PACKAGE_NAME}/icon";` +
            (define
              ? `defineIcon("${customElementTagName}", "${iconAttribute}");`
              : "") +
            `addIconifyIcon("${name}", ${JSON.stringify(icon)});`
          );
        }
      }
    },
    transform(code, id) {
      if (!filter(id)) {
        return;
      }

      return {
        code: transform(code, id),
        map: null,
      };
    },
    transformIndexHtml: {
      enforce: "pre",
      order: "pre",
      transform: (html, ctx) => transform(html, ctx.filename),
    },
  };
}
