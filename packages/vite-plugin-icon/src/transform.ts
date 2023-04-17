export function generateTransform(
  tagName: string,
  customElementTagName: string,
  nameAttribute: string,
  virtualModuleId: string
) {
  const replace = generateReplace(tagName, customElementTagName, nameAttribute);
  const parse = generateParse(customElementTagName, nameAttribute);

  return (code: string, id: string): string => {
    // カスタムエレメントのタグ名に置換する
    code = replace(code, id);

    // アイコン名を取得する
    const icons = parse(code);
    if (!icons.size) {
      return code;
    }

    // アイコン名が取得できた場合に `import` 文を追加する
    return injectImport(code, id, icons, virtualModuleId);
  };
}

// タグにマッチする正規表現を生成する
const generateTagReg = (tagName: string) =>
  new RegExp(`<${tagName}\\s[^<>]*>(?:\\s*<\\/${tagName}>)?`, "gs");

// アイコン名を取得する
export function generateParse(tagName: string, iconAttribute: string) {
  const tagReg = generateTagReg(tagName);

  const matchIcon = generateMatchIcon(tagName, iconAttribute);

  return (code: string) =>
    new Set(
      [...code.matchAll(tagReg)]
        .map(([v]) => matchIcon(v))
        .filter((v): v is string => Boolean(v))
    );
}

// アイコンタグをカスタムエレメントタグに置換する
export function generateReplace(
  tagName: string,
  customElementTagName: string,
  nameAttribute: string
) {
  const tagReg = generateTagReg(tagName);
  const tagNameReg = new RegExp(`^(<)${tagName}|${tagName}(>)$`, "g");

  const matchIcon = generateMatchIcon(tagName, nameAttribute);

  return (code: string, id: string) =>
    code.replaceAll(tagReg, (substring) => {
      if (matchIcon(substring)) {
        // tagNameをcustomElementTagNameに置換する
        substring = substring.replaceAll(
          tagNameReg,
          (_, start, end) => `${start ?? ""}${customElementTagName}${end ?? ""}`
        );

        // カスタムエレメントに変換するのでJSXの `className` を `class` に置換する
        substring = substring.replace(/className/, "class");
      }

      return substring;
    });
}

// アイコンタグ文字列からアイコン名を取得する
export function generateMatchIcon(tagName: string, iconAttribute: string) {
  const iconAttributeReg = new RegExp(
    `${iconAttribute}=['"]([^'"]+?)['"]`,
    "s"
  );

  return (substring: string) => {
    // 閉じタグまで取れていない場合はスキップ
    if (!substring.endsWith(`</${tagName}>`) && !substring.endsWith(`/>`)) {
      return substring;
    }

    return substring.match(iconAttributeReg)?.[1];
  };
}

// アイコンファイルのインポート文を追加する
export function injectImport(
  code: string,
  id: string,
  icons: Set<string>,
  virtualModuleId: string
) {
  const imports = [...icons]
    .map((icon) => `import "${virtualModuleId}/${icon}";`)
    .join("\n");

  // .html
  if (id.endsWith(".html")) {
    const scripts = `<script type="module">${imports}</script>`;
    if (/<\/head>/.test(code)) {
      code = code.replace(/<\/head>/, (match) => {
        return `${scripts}\n${match}`;
      });
    } else {
      code = `${scripts}\n${code}`;
    }
  }
  // .jsx .tsx
  else if (/\.[tj]sx$/.test(id)) {
    code = `${imports}\n${code}`;
  }
  // .vue .svelte
  else if (/<script[^<>]*>/.test(code)) {
    code = code.replace(/<script[^<>]*>/, (match) => {
      return `${match}\n${imports}`;
    });
  }
  // .vue .svelte
  else {
    code = `<script>${imports}</script>\n${code}`;
  }

  return code;
}
