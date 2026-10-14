// Kit shader mounts. Paper Shaders (paper-design/shaders, Apache-2.0); vendor its dist next to the
// page as vendor/paper-shaders/ with LICENSE and NOTICE. Static only (speed 0): one frame, then free.
// Markup: <section data-shader="mesh|dots|radial|grain|paper" data-colors="#hex,#hex,…">.
// Keep a CSS background on the same element: it shows when WebGL2 is missing or the mount throws.
// Load with <script type="module" src="…/shaders.js">. Adjust VENDOR if the folder sits elsewhere.
//
// Tested notes (14 Oct 2026):
// - static-radial-gradient paints the LAST colour at the centre. List colours edge → centre.
// - dot-grid is a pattern: use fit 0 (none). Object shaders (mesh, radial) use fit 2 (cover).
// - grain-gradient and paper-texture sample a noise texture that must be decoded first.
// - paper-texture without a photo still needs an image: pass the decoded empty pixel, u_isImage false.
const VENDOR = new URL('../vendor/paper-shaders/', import.meta.url).href;
const { ShaderMount } = await import(VENDOR + 'shader-mount.js');
const { getShaderColorFromString: rgba } = await import(VENDOR + 'get-shader-color-from-string.js');

const sizing = (fit, extra = {}) => ({ u_fit: fit, u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0, ...extra });
const ctx = { alpha: true, antialias: false, powerPreference: 'low-power' };
const mount = (el, frag, uniforms) => { try { new ShaderMount(el, frag, uniforms, ctx, 0, 0, 1, 1600 * 1000); } catch (e) { /* CSS fallback stays */ } };
const colorsOf = (el, fallback) => (el.dataset.colors ? el.dataset.colors.split(',').map((s) => s.trim()) : fallback);
const decoded = async (src) => { const img = new Image(); img.src = src; await img.decode(); return img; };
async function noise() { const { getShaderNoiseTexture } = await import(VENDOR + 'get-shader-noise-texture.js'); const t = getShaderNoiseTexture(); await t.decode(); return t; }

const jobs = {
  async mesh(el) {
    const { staticMeshGradientFragmentShader } = await import(VENDOR + 'shaders/static-mesh-gradient.js');
    const c = colorsOf(el, ['#0b111b', '#0f1d30', '#1b3a5c', '#0b111b', '#12263d']);
    mount(el, staticMeshGradientFragmentShader, { u_colors: c.map(rgba), u_colorsCount: c.length, u_positions: 18, u_waveX: 0.6, u_waveXShift: 0.2, u_waveY: 0.8, u_waveYShift: 0.5, u_mixing: 0.85, u_grainMixer: 0, u_grainOverlay: 0.05, ...sizing(2, { u_rotation: 200 }) });
  },
  async dots(el) {
    const { dotGridFragmentShader } = await import(VENDOR + 'shaders/dot-grid.js');
    const [back, fill] = colorsOf(el, ['#0b111b', 'rgba(168,209,241,0.16)']);
    mount(el, dotGridFragmentShader, { u_colorBack: rgba(back), u_colorFill: rgba(fill), u_colorStroke: rgba(back), u_dotSize: Number(el.dataset.size || 1.2), u_gapX: Number(el.dataset.gap || 28), u_gapY: Number(el.dataset.gap || 28), u_strokeWidth: 0, u_sizeRange: Number(el.dataset.sizeRange || 0), u_opacityRange: 0.4, u_shape: 0, ...sizing(0) });
  },
  async radial(el) {
    const { staticRadialGradientFragmentShader } = await import(VENDOR + 'shaders/static-radial-gradient.js');
    const c = colorsOf(el, ['#0b111b', '#12263d', '#1b3a5c']); // edge → centre
    mount(el, staticRadialGradientFragmentShader, { u_colorBack: rgba(c[0]), u_colors: c.map(rgba), u_colorsCount: c.length, u_radius: 1.25, u_focalDistance: 0, u_focalAngle: 0, u_falloff: 0.6, u_mixing: 0.85, u_distortion: 0, u_distortionShift: 0, u_distortionFreq: 12, u_grainMixer: 0, u_grainOverlay: 0.04, ...sizing(2) });
  },
  async grain(el) {
    const { grainGradientFragmentShader } = await import(VENDOR + 'shaders/grain-gradient.js');
    const [back, ...rest] = colorsOf(el, ['#f4edde', '#ebe2cf', '#f4edde']);
    mount(el, grainGradientFragmentShader, { u_colorBack: rgba(back), u_colors: rest.map(rgba), u_colorsCount: rest.length, u_softness: 0.7, u_intensity: 0.15, u_noise: 0.35, u_shape: 1, u_noiseTexture: await noise(), ...sizing(2) });
  },
  async paper(el) {
    const { paperTextureFragmentShader } = await import(VENDOR + 'shaders/paper-texture.js');
    const { emptyPixel } = await import(VENDOR + 'empty-pixel.js');
    const [back, paper, shadow] = colorsOf(el, ['#ebe2cf', '#f4edde', '#d9cdb4']);
    mount(el, paperTextureFragmentShader, {
      u_image: await decoded(emptyPixel), u_isImage: false, u_imageAspectRatio: 1, u_noiseTexture: await noise(),
      u_colorBack: rgba(back), u_colorPaper: rgba(paper), u_colorShadow: rgba(shadow), u_blending: 1, u_distortion: 0.75, u_clip: false,
      u_angle: 300, u_seed: Number(el.dataset.seed || 4), u_roughness: 0.4, u_roughnessSize: 0.5, u_roughnessRows: 0, u_fiber: 0.35, u_fiberSize: 0.5,
      u_folds: 0.25, u_foldSizeX: 1, u_foldSizeY: 1, u_foldOffsetX: 0, u_foldOffsetY: 0, u_wrinkles: 0.6, u_wrinkleSize: 0.65, u_crumples: 0, u_crumpleCount: 6, u_drops: 0.15,
      ...sizing(2),
    });
  },
};

document.querySelectorAll('[data-shader]').forEach((el) => { const job = jobs[el.dataset.shader]; if (job) job(el).catch(() => {}); });
