varying vec2 vUv;
uniform float uTime;
uniform bool uDistort;
uniform float uDistortionValue;

void main() {
    vUv = uv;
    vec3 transformed = position;
    if (uDistort) {
        transformed.y += sin(position.x + uTime) / uDistortionValue;
        transformed.z += sin(position.z + uTime) / uDistortionValue;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}