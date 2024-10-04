precision highp float;

attribute vec3 position;
varying vec2 vUv;

void main () {
  gl_Position = vec4(position.xyz, 1.0);
  vUv = gl_Position.xy * 0.5 + 0.5;
}