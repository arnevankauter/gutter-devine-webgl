const canvasSketch = require('canvas-sketch');

global.THREE = require('three');
require('three/examples/js/controls/OrbitControls');

import { Pane } from 'tweakpane';
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin';

import { Color } from 'three';

const pane = new Pane({ title: 'Options' });
pane.registerPlugin(TweakpaneImagePlugin);

import vertexShader from './shaders/three/three-vert.glsl';
import fragmentShader from './shaders/three/three-frag.frag';

let geometry = null;
let mesh = null;
let scene = null;
let texture = null;
let customMaterial = null;

const gui = {
  globalBg: '#FFF',
  canvasBg: '#FFF',
  shape: 'torus',
  speed: 0.02,
  repeatX: 10.0,
  repeatY: 10.0,
  smoothStepX: -6.0,
  smoothStepY: 2.0,
  rotateSpeedX: 0,
  rotateSpeedY: 0,
  rotateSpeedZ: 0,
  distort: false,
  distortionValue: 2.0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  orbit: true,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  type: false,
  url: 'https://images.unsplash.com/photo-1727458880307-fd23422c2528?q=80&w=4287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
};

const settings = {
  dimensions: [1920, 1080],
  animate: true,
  context: 'webgl',
  attributes: { antialias: true },
};

const sketch = ({ context }) => {
  document.body.style.backgroundColor = gui.globalBg;
  const renderer = new THREE.WebGLRenderer({
    context,
  });

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000,
  );
  camera.position.z = -100;

  const controls = new THREE.OrbitControls(camera, context.canvas);
  controls.enableDamping = true;

  scene = new THREE.Scene();
  geometry = new THREE.TorusGeometry(19, 19, 500, 500);

  const img = gui.url;

  texture = new THREE.TextureLoader().load(img, (texture) => {
    console.log(texture);
    texture.minFilter = THREE.NearestFilter;
  });

  createMesh();
  debug(renderer);

  return {
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    render({ deltaTime }) {
      renderer.render(scene, camera);

      mesh.rotation.x += deltaTime * ((gui.rotateSpeedX * Math.PI) / 180);
      mesh.rotation.y += deltaTime * ((gui.rotateSpeedY * Math.PI) / 180);
      mesh.rotation.z += deltaTime * ((gui.rotateSpeedZ * Math.PI) / 180);

      if (gui.orbit) {
        controls.update();
      } else {
        camera.position.x = gui.cameraX;
        camera.position.y = gui.cameraY;
        camera.position.z = gui.cameraZ;
      }

      customMaterial.uniforms.uDistortionValue.value = gui.distortionValue;
      customMaterial.uniforms.uDistort.value = gui.distort;
      customMaterial.uniforms.uTime.value += gui.speed;
      customMaterial.uniforms.uRepeatX.value = gui.repeatX;
      customMaterial.uniforms.uRepeatY.value = gui.repeatY;
      customMaterial.uniforms.uType.value = gui.type;
    },
    unload() {
      renderer.dispose();
    },
  };
};

const createMesh = () => {
  if (mesh) {
    scene.remove(mesh);
  }
  customMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uTexture: { value: texture },
      uDistort: { value: gui.distort },
      uDistortionValue: { value: gui.distortionValue },
      uRepeatX: { value: gui.repeatX },
      uRepeatY: { value: gui.repeatY },
      uSmoothStepX: { value: gui.smoothStepX },
      uSmoothStepY: { value: gui.smoothStepY },
      uType: { value: gui.type },
    },
    side: THREE.DoubleSide,
    transparent: false,
    wireframe: false,
  });

  mesh = new THREE.Mesh(geometry, customMaterial);
  scene.add(mesh);
};

const debug = (renderer) => {
  const folderBackground = pane.addFolder({ title: 'Global' });
  folderBackground
    .addInput(gui, 'globalBg', { label: 'Background' })
    .on('change', (e) => {
      document.body.style.backgroundColor = e.value;
    });

  const folderScene = pane.addFolder({ title: 'Canvas' });
  folderScene
    .addInput(gui, 'canvasBg', { label: 'Background' })
    .on('change', (e) => {
      renderer.setClearColor(new Color(e.value));
    });

  const folderMesh = pane.addFolder({ title: 'Mesh' });
  folderMesh
    .addInput(gui, 'shape', {
      label: 'Shape',
      options: {
        torus: 'Torus',
        plane: 'Plane',
        bullet: 'Bullet',
        sphere: 'Sphere',
        box: 'Box',
        cylinder: 'Cylinder',
        dodecahedron: 'Dodecahedron',
        octahedron: 'Octahedron',
        ring: 'Ring',
        tetrahedron: 'Tetrahedron',
      },
    })
    .on('change', (e) => {
      switch (e.value) {
        case 'Torus':
          geometry = new THREE.TorusGeometry(19, 19, 500, 500);
          break;

        case 'Bullet':
          geometry = new THREE.CapsuleGeometry(15, 15, 10, 20);
          break;

        case 'Plane':
          geometry = new THREE.PlaneGeometry(50, 50);
          break;

        case 'Box':
          geometry = new THREE.BoxGeometry(50, 50, 250);
          break;

        case 'Sphere':
          geometry = new THREE.SphereGeometry(30, 32, 32);
          break;

        case 'Cylinder':
          geometry = new THREE.CylinderGeometry(30, 30, 100, 32);
          break;

        case 'Dodecahedron':
          geometry = new THREE.DodecahedronGeometry(50, 1);
          break;

        case 'Octahedron':
          geometry = new THREE.OctahedronGeometry(50, 1);
          break;

        case 'Tetrahedron':
          geometry = new THREE.TetrahedronGeometry(50, 1, 32);
          break;

        case 'Ring':
          geometry = new THREE.RingGeometry(50, 40, 100);
          break;

        default:
          break;
      }
      createMesh();
    });
  folderMesh
    .addInput(gui, 'distort', { label: 'Distortion' })
    .on('change', (e) => {
      gui.distort = e.value;
    });
  folderMesh
    .addInput(gui, 'distortionValue', {
      label: 'Distortion value',
      min: 0.01,
      max: 5.0,
    })
    .on('change', (e) => {
      gui.distortionValue = e.value;
    });
  folderMesh.addInput(gui, 'rotateSpeedX', {
    label: 'Rotate X',
    min: 0,
    max: 100,
  });

  folderMesh.addInput(gui, 'rotateSpeedY', {
    label: 'Rotate Y',
    min: 0,
    max: 100,
  });

  folderMesh.addInput(gui, 'rotateSpeedZ', {
    label: 'Rotate Z',
    min: 0,
    max: 100,
  });

  folderMesh
    .addInput(gui, 'scaleX', { label: 'Scale X', min: 0.1, max: 2 })
    .on('change', (e) => {
      mesh.scale.x = e.value;
      gui.scaleX = e.value;
    });
  folderMesh
    .addInput(gui, 'scaleY', { label: 'Scale Y', min: 0.1, max: 2 })
    .on('change', (e) => {
      mesh.scale.y = e.value;
      gui.scaleY = e.value;
    });
  folderMesh
    .addInput(gui, 'scaleZ', { label: 'Scale Z', min: 0.1, max: 2 })
    .on('change', (e) => {
      mesh.scale.z = e.value;
      gui.scaleZ = e.value;
    });

  const folderTexture = pane.addFolder({ title: 'Texture' });
  folderTexture
    .addInput(gui, 'url', {
      label: 'Image',
      view: 'input-image',
      imageFit: 'contain',
    })
    .on('change', (e) => {
      const newTexture = new THREE.TextureLoader().load(
        e.value.src,
        (texture) => {
          texture.minFilter = THREE.NearestFilter;
        },
      );

      if (newTexture) {
        texture = newTexture;
        createMesh();
      }
    });

  folderTexture
    .addInput(gui, 'type', {
      label: 'Type',
      options: {
        multiply: true,
        add: false,
      },
    })
    .on('change', (e) => {
      gui.type = e.value;
    });

  folderTexture.addInput(gui, 'repeatX', {
    label: 'Repeat X',
    min: 0.01,
    max: 50,
  });

  folderTexture.addInput(gui, 'repeatY', {
    label: 'Repeat Y',
    min: 0.01,
    max: 50,
  });

  folderTexture.addInput(gui, 'smoothStepX', {
    label: 'Smooth X',
    min: -12,
    max: 12,
  });
  folderTexture.addInput(gui, 'smoothStepY', {
    label: 'Smooth Y',
    min: -12,
    max: 12,
  });
  folderTexture.addInput(gui, 'speed', { label: 'Speed', min: 0.001, max: 1 });
};

canvasSketch(sketch, settings);
