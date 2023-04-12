import dedent from "ts-dedent";
import { describe, expect, it } from "vitest";

import { generateParse, generateReplace, injectImport } from "./transform";

describe("transform", () => {
  it("replace", () => {
    const before = dedent`
            <i icon="foo"></i>
            <i icon="bar"></i>
            <i-con icon="baz"></i-con>
            <i-con icon="foo"></i-con>
            <i
                attr="attr"
                icon="foo"
                attr2="attr2"
            >
            </i>`;
    const after = dedent`
            <i-con icon="foo"></i-con>
            <i-con icon="bar"></i-con>
            <i-con icon="baz"></i-con>
            <i-con icon="foo"></i-con>
            <i-con
                attr="attr"
                icon="foo"
                attr2="attr2"
            >
            </i-con>`;
    const replace = generateReplace("i", "i-con", "icon");
    expect(replace(before)).toBe(after);
  });

  it("parse", () => {
    const after = dedent`
            <i-con icon="foo"></i-con>
            <i-con icon="bar"></i-con>
            <i-con icon="baz"></i-con>
            <i-con icon="foo"></i-con>
            <i-con
                attr="attr"
                icon="foo"
                attr2="attr2"
            >
            </i-con>`;
    const parse = generateParse("i-con", "icon");
    expect(parse(after)).toEqual(new Set(["foo", "bar", "baz"]));
  });

  it("inject", () => {
    // html
    expect(
      injectImport(
        `<i-con icon="foo"></i-con>`,
        "index.html",
        new Set(["foo"]),
        "virtual:id"
      )
    ).toBe(
      dedent`
        <script type="module">import "virtual:id/foo";</script>
        <i-con icon="foo"></i-con>`
    );

    // html
    expect(
      injectImport(
        dedent`
          <!DOCTYPE html>
          <html>
          <head>
            <title>foo</title>
          </head>
          <body>
            <i-con icon="foo"></i-con>
            <i-con icon="bar"></i-con>
          </body>
          </html>`,
        "index.html",
        new Set(["foo", "bar"]),
        "virtual:id"
      )
    ).toBe(
      dedent`
      <!DOCTYPE html>
      <html>
      <head>
        <title>foo</title>
      <script type="module">import "virtual:id/foo";
      import "virtual:id/bar";</script>
      </head>
      <body>
        <i-con icon="foo"></i-con>
        <i-con icon="bar"></i-con>
      </body>
      </html>`
    );

    // .jsx .tsx
    expect(
      injectImport(
        `export const Icon = () => <i-con icon="foo"></i-con>;`,
        "index.jsx",
        new Set(["foo"]),
        "virtual:id"
      )
    ).toBe(
      dedent`
        import "virtual:id/foo";
        export const Icon = () => <i-con icon="foo"></i-con>;`
    );

    // .vue .svelte
    expect(
      injectImport(
        dedent`
          <script lang="ts">
          //
          </script>

          <template>
            <i-con icon="foo"></i-con>
          </template>
          `,
        "index.vue",
        new Set(["foo"]),
        "virtual:id"
      )
    ).toBe(
      dedent`
      <script lang="ts">
      import "virtual:id/foo";
      //
      </script>

      <template>
        <i-con icon="foo"></i-con>
      </template>
      `
    );
  });
});
