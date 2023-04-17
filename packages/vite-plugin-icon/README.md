# @achamaro/vite-plugin-icon

![npm (scoped)](https://img.shields.io/npm/v/@achamaro/vite-plugin-icon)

[Iconify]: https://iconify.design/

This plugin registers a simple custom element for displaying [Iconify] icons and handles automatic downloading of the icons.

## Installation

```sh
npm i -D @achamaro/vite-plugin-icon
```

## Usage

### Vite Config

```typescript
import IconPlugin from "@achamaro/vite-plugin-icon";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // When using Svelte, it needs to be added before the Svelte plugin
    IconPlugin(),
    // When using Vue, you need to set the compilerOption. `i-con` is the default value for `options.customElementTagName`.
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "i-con",
        },
      },
    }),
  ],
});
```

### Template

```html
<i icon="simple-icons:iconify"></i>
<i-con icon="simple-icons:iconify"></i-con>
```

`i` (options.tagName) will be transformed into `i-con` (options.customElementTagName).

```html
<i-con icon="simple-icons:iconify"></i-con>
<i-con icon="simple-icons:iconify"></i-con>
```

### For React

Please add a reference to the type definition file for the `icon` attribute for the `i` tag and `i-con` tag (default) to the `vite-env.d.ts`.

```ts
/// <reference types="@achamaro/vite-plugin-icon/types/jsx" />
```

## Options

### downloadDir

- **Type**: `string`
- **Default**: `"src/assets/icons"`

The directory to download icons.

### nameAttribute

- **Type**: `string`
- **Default**: `"icon"`

The attribute to specify the icon name.

### tagName

- **Type**: `string`
- **Default**: `"i"`

The tag name will be replaced with the customElementTagName value.

### customElementTagName

- **Type**: `string`
- **Default**: `"i-con"`

The tag name of the custom element to register.

### includes

- **Type**: `ReadonlyArray<string | RegExp> | string | RegExp | null`
- **Default**: `"**/*.{vue,html,jsx,tsx,svelte}"`

### excludes

- **Type**: `ReadonlyArray<string | RegExp> | string | RegExp | null`
- **Default**: `undefined`
