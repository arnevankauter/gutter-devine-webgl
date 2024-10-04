precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform bool uGrain;

uniform float uResX;
uniform float uResY;

uniform vec3 uBaseColor;
uniform vec3 uBaseColor2;

float random (vec2 st) {
    return fract(cos(dot(st.xy,vec2(120.9898,78.233)))*43758.5453123);
}

float plot(vec2 st, float pct){
    return  smoothstep( pct* uResolution.y, pct, st.y) -
            smoothstep( pct,uResolution.x, st.y);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec2 skew (vec2 st) {
    vec2 r = vec2(0.0);
    r.x = 1.1547*st.x;
    r.y = st.y+0.5*r.x;
    return r;
}

void main() {
    float t = (uTime * uSpeed);
    float yResolution = uResX;
    float xResolution = uResY;

    vec2 uv = (gl_FragCoord.xy + uResolution * xResolution) / (uResolution * yResolution);
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    if (uGrain) {
        st = gl_FragCoord.xy / uResolution.xy + random(uv);
    }

    float d = length(sin(st));
    uv.x += cos(t + uv.x + cos(st.x));
    uv.y += sin(t + uv.y + cos(st.y));

    vec2 pos = vec2(st - d);
    float n = noise(pos);

    float noiseR = n + random(uv);
    float noiseG = n;
    float noiseB = n;

    uv /= fract(mod(vec2(n * (n + noiseR), uv.y), mod(n, uv.y)));

    vec3 color = mix(uBaseColor, uBaseColor2, uv.y);
    color /= vec3(mod(uv.x, uBaseColor.r), mod(uv.x, uBaseColor.g), mod(uv.x, uBaseColor.b));
    
    gl_FragColor = vec4(vec3(color.r, color.g, color.b), 1.0);
}