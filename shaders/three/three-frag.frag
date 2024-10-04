precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uRepeatX;
uniform float uRepeatY;
uniform float uSmoothStepX;
uniform float uSmoothStepY;
uniform bool uType;
uniform sampler2D uTexture;

float plot(vec2 st,float pct){
    return smoothstep( pct - 6.0, pct, st.x) - smoothstep( pct, pct + uSmoothStepY, st.y);
}
  
void main() {
  float time = uTime * 0.1;

  vec2 uv = vUv;

  float x = 0.;
  float y = 0.;
  
  if (uType) {
      x = fract(uv.x * time) * uRepeatX;
      y = fract(uv.y * time) * uRepeatY;
  } else {
      x = fract(uv.x + time) * uRepeatX;
      y = fract(uv.y + time) * uRepeatY;
  }

  uv.x = plot(uv, x);
  uv.y = plot(uv, y);

  vec4 color = texture2D(uTexture, uv);
  gl_FragColor = color;
}