import { iconNameTokenizer, load } from "./util";
import { createFilter, FilterPattern, PluginOption } from "vite";

interface Options {
  tagName?: string;
  define?: boolean;
  includes?: FilterPattern;
  excludes?: FilterPattern;
  resolve?: string | false;
}

const defaultOptions: Partial<Options> = {
  tagName: "i-",
  define: true,
  includes: "**/*.{vue,jsx,tsx,svelte,astro}",
};

export default function IconPlugin(options?: Options): PluginOption {
  const { tagName, define, includes, excludes, resolve } = {
    ...defaultOptions,
    ...options,
  };

  const filter = createFilter(includes, excludes, { resolve });

  const virtualModuleId = "virtual:vite-plugin-icon";

  const tokenizeIconName = iconNameTokenizer(tagName!);

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
        const name = id.split("/")[1];
        return (
          `import { addIconifyIcon, define } from "vite-plugin-icon/icon";` +
          (define ? `define("${tagName}");` : "") +
          `addIconifyIcon("${name}", ${JSON.stringify(await load(name))});`
        );
      }
    },
    transform(code, id) {
      if (!filter(id)) {
        return;
      }

      const names = tokenizeIconName(code);
      if (!names.length) {
        return;
      }

      const imports = names
        .map((name) => `import "${virtualModuleId}/${name}";`)
        .join("\n");

      const regScriptTag = /<script[^<>]*>/;
      if (regScriptTag.test(code)) {
        code = code.replace(regScriptTag, (match) => {
          return `${match}\n${imports}`;
        });
      } else {
        code = `<script>${imports}</script>\n${code}`;
      }

      return {
        code,
        map: null,
      };
    },
    transformIndexHtml: {
      enforce: "pre",
      order: "pre",
      transform(html) {
        const names = tokenizeIconName(html);
        if (names.length) {
          const imports = names
            .map((name) => `import "${virtualModuleId}/${name}";`)
            .join("\n");

          return html.replace(/<\/head>/, (match) => {
            return `<script type="module">${imports}</script>\n${match}`;
          });
        }
      },
    },
  };
}
