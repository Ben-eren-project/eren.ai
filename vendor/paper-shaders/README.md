# Paper Shaders (vendored)

- Source: https://github.com/paper-design/shaders, package `@paper-design/shaders` 0.0.81, commit `43cd68d`.
- Licence: Apache-2.0. `LICENSE` and `NOTICE` must stay next to these files.
- Built 14 Oct 2026 by compiling `packages/shaders/src` with `tsc` (target ES2020, ES modules). The code is unchanged. Test files were left out, and so was the `index.js` barrel: import single files only, never the whole set.
- No network requests at runtime.

## Rules for using it on Eren pages
- Wrap `new ShaderMount(...)` in try/catch: it throws when WebGL2 is missing. Keep a CSS background underneath as the fallback.
- Pass speed 0 when `prefers-reduced-motion: reduce` is set. Prefer the static shaders (static-mesh-gradient, static-radial-gradient, dot-grid, waves), which render once and cost nothing after that.
- Use `minPixelRatio` 1 and cap `maxPixelCount`. The default renders at 2× even on 1× screens.
- Shaders are backgrounds only. Never put text meaning in them; they're hidden from screen readers.
