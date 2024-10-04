const canvasSketch = require('canvas-sketch');
const createShader = require('canvas-sketch-util/shader');

import { convertColor } from './utils/color';
import { Pane } from 'tweakpane';

const frag = require('./shaders/gl/gl-frag.frag');

const gui = {
  width: 1080,
  height: 1920,
  fps: 60,
  baseColor: '#8f8e86',
  baseColor2: '#d8d2bf',
  grain: false,
  resolutionX: 6,
  resolutionY: -12,
  speed: 1,
};

const settings = {
  context: 'webgl',
  animate: true,
  encoding: 'image/jpeg',
  fps: gui.fps,
  dimensions: [gui.width, gui.height],
};

const sketch = async ({ gl, update, settings }) => {
  document.body.style.background = '#000';
  const shader = createShader({
    gl,
    frag,
    uniforms: {
      uResolution: () => [300, 300],
      uResX: () => gui.resolutionX,
      uResY: () => gui.resolutionY,
      uGrain: () => gui.grain,
      uSpeed: () => gui.speed,
      uTime: ({ time }) => time,
      uBaseColor: () => convertColor(gui.baseColor),
      uBaseColor2: () => convertColor(gui.baseColor2),
    },
  });

  debug(update, settings);

  return {
    render(props) {
      shader.render(props);
    },
    unload() {
      shader.unload();
      window.removeEventListener('mousemove', move);
    },
  };
};

const debug = (update, currentSettings) => {
  const pane = new Pane();
  const folderSettings = pane.addFolder({ title: 'Settings' });
  const format = folderSettings.addBlade({
    view: 'list',
    label: 'Format',
    options: [
      { text: 'Portrait', value: 'reel' },
      { text: 'Square', value: 'post' },
      { text: 'Custom', value: 'custom' },
    ],
    value: 'reel',
  });
  const width = folderSettings
    .addInput(gui, 'width', {
      label: 'Width',
      min: 0,
      max: 5000,
      step: 1,
      disabled: true,
    })
    .on('change', (e) => {
      const newSettings = {
        ...currentSettings,
        dimensions: [e.value, gui.height],
      };
      delete newSettings.animate;
      update(newSettings);
    });
  const height = folderSettings
    .addInput(gui, 'height', {
      label: 'Height',
      min: 0,
      max: 5000,
      step: 1,
      disabled: true,
    })
    .on('change', (e) => {
      const newSettings = {
        ...currentSettings,
        dimensions: [gui.width, e.value],
      };
      delete newSettings.animate;
      update(newSettings);
    });
  format.on('change', (e) => {
    if (e.value === 'custom') {
      const newSettings = {
        ...currentSettings,
        dimensions: [gui.width, gui.height],
      };
      delete newSettings.animate;
      update(newSettings);

      width.disabled = false;
      height.disabled = false;
    } else {
      gui.width = e.value === 'reel' ? 1080 : 1080;
      gui.height = e.value === 'reel' ? 1920 : 1080;
      const newSettings = {
        ...currentSettings,
        dimensions: [gui.width, gui.height],
      };
      delete newSettings.animate;
      update(newSettings);

      width.disabled = true;
      height.disabled = true;
    }
  });
  folderSettings
    .addBlade({
      view: 'list',
      label: 'Extension',
      options: [
        { text: 'JPG', value: 'image/jpeg' },
        { text: 'PNG', value: 'image/png' },
        { text: 'WEBP', value: 'image/webp' },
      ],
      value: 'image/jpeg',
    })
    .on('change', (e) => {
      const newSettings = {
        ...currentSettings,
        encoding: e.value,
      };
      delete newSettings.animate;
      update(newSettings);
    });

  const folderColors = pane.addFolder({ title: 'Colors' });
  folderColors.addInput(gui, 'baseColor', { label: 'Color 1' });
  folderColors.addInput(gui, 'baseColor2', { label: 'Color 2' });

  const folderSizing = pane.addFolder({ title: 'Sizing' });
  folderSizing.addInput(gui, 'resolutionX', {
    label: 'Res X',
    min: -5,
    max: 15,
  });
  folderSizing.addInput(gui, 'resolutionY', {
    label: 'Res Y',
    min: -20,
    max: 5,
  });

  const folderEffect = pane.addFolder({ title: 'Effect' });
  folderEffect.addInput(gui, 'grain', { label: 'Grain' });

  const folderTiming = pane.addFolder({ title: 'Timing' });
  folderTiming.addInput(gui, 'speed', { label: 'Speed', min: 0, max: 5 });
};

canvasSketch(sketch, settings);
