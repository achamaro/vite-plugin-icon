import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  externals: ["vite", "iconify-icon"],
  hooks: {
    "rollup:options"(_, options) {
      if (Array.isArray(options.output)) {
        // Entry module "src/index.ts" is using named and default exports together. Consumers of your bundle will have to use `chunk.default` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.

        // `rollup.output` オプションはunbuild内で設定されるためフックを使って設定する
        options.output?.forEach((output) => {
          if (output.format === "cjs") {
            output.exports = "named";
          }
        });
      }
    },
  },
});
