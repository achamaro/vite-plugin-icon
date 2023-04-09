import { createFilter, FilterPattern, PluginOption } from "vite";

import { load } from "./util";

interface Options {
  downloadDir?: string;
  tagName?: string;
  customElementTagName?: string;
  define?: boolean;
  includes?: FilterPattern;
  excludes?: FilterPattern;
  resolve?: string | false | null;
}

const defaultOptions = {
  downloadDir: "src/assets/icons",
  tagName: "i",
  customElementTagName: "i-con",
  define: true,
  includes: "**/*.{vue,html}",
};

export default function IconPlugin(options?: Options): PluginOption {
  const {
    downloadDir,
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

  const tagReg = {
    [tagName]: new RegExp(
      `<${tagName}\\s[^<>]*>(?:\\s*<\\/${tagName}>)?`,
      "gs"
    ),
    [customElementTagName]: new RegExp(
      `<${customElementTagName}\\s[^<>]*>(?:\\s*<\\/${customElementTagName}>)?`,
      "gs"
    ),
  };
  const tagNameReg = new RegExp(`^(<)${tagName}|${tagName}(>)$`, "g");

  // カスタム要素へのタグ名置換とアイコン名の取得
  const replace = (value: string, iconNames: string[], tagName: string) => {
    return value.replaceAll(tagReg[tagName], (substring) => {
      // 閉じタグまで取れていない場合はスキップ
      if (!substring.endsWith(`</${tagName}>`) && !substring.endsWith(`/>`)) {
        return substring;
      }

      // `name` 属性の値が取得できる場合はアイコン名に追加し、
      // カスタム要素のタグ名に置換する。
      const name = substring.match(/name=['"]([^'"]+?)['"]/s)?.[1];
      if (name) {
        iconNames.push(name);

        if (tagName !== customElementTagName) {
          substring = substring.replaceAll(
            tagNameReg,
            (_, start, end) =>
              `${start ?? ""}${customElementTagName}${end ?? ""}`
          );
        }
      }

      return substring;
    });
  };

  // アイコン名が取得できた場合に `import` 文を追加する
  const transform = (code: string): string => {
    const iconNames: string[] = [];
    code = replace(code, iconNames, tagName);
    code = replace(code, iconNames, customElementTagName);

    if (!iconNames.length) {
      return code;
    }

    const imports = iconNames
      .map((name) => `import "${virtualModuleId}/${name}";`)
      .join("\n");

    // TODO: ちゃんと判定する🥹
    // .html
    if (/<\/head>/.test(code)) {
      code = code.replace(/<\/head>/, (match) => {
        return `<script type="module">${imports}</script>\n${match}`;
      });
    }
    // .vue
    else if (/<script[^<>]*>/.test(code)) {
      code = code.replace(/<script[^<>]*>/, (match) => {
        return `${match}\n${imports}`;
      });
    }
    // .vue
    else {
      code = `<script>${imports}</script>\n${code}`;
    }

    return code;
  };

  return {
    name: "vite:icon",
    enforce: "pre",
    configResolved(config) {
      const vuePlugin = config.plugins.find((p) => p.name === "vite:vue");
      console.log(vuePlugin);
    },
    resolveId(id: string) {
      if (id.startsWith(virtualModuleId)) {
        return id;
      }
    },
    async load(id) {
      if (id.startsWith(virtualModuleId)) {
        const name = id.substring(virtualModuleId.length + 1);
        return (
          `import { addIconifyIcon, defineIcon } from "${PACKAGE_NAME}/icon";` +
          (define ? `defineIcon("${customElementTagName}");` : "") +
          `addIconifyIcon("${name}", ${JSON.stringify(
            await load(downloadDir, name)
          )});`
        );
      }
    },
    transform(code, id) {
      if (!filter(id)) {
        return;
      }

      return {
        code: transform(code),
        map: null,
      };
    },
    transformIndexHtml: {
      enforce: "pre",
      order: "pre",
      transform,
    },
  };
}
