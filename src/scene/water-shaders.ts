// Shaders of the water ripple background.

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Wave step: red holds the current height, green the previous one.
export const simulationFragment = /* glsl */ `
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uDamping;
  uniform vec4 uTrail;
  uniform float uTrailStrength;
  uniform vec3 uDrop;
  varying vec2 vUv;

  const float TRAIL_RADIUS = 0.012;
  const float DROP_RADIUS = 0.03;

  vec2 toScreen(vec2 point) {
    return vec2(point.x * uAspect, point.y);
  }

  float distanceToSegment(vec2 point, vec2 start, vec2 end) {
    vec2 toPoint = point - start;
    vec2 segment = end - start;
    float t = clamp(dot(toPoint, segment) / max(dot(segment, segment), 1e-6), 0.0, 1.0);
    return length(toPoint - segment * t);
  }

  void main() {
    vec4 state = texture2D(uState, vUv);
    float sum = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r
      + texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r
      + texture2D(uState, vUv + vec2(0.0, uTexel.y)).r
      + texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
    float height = (sum * 0.5 - state.g) * uDamping;
    float trail = distanceToSegment(toScreen(vUv), toScreen(uTrail.xy), toScreen(uTrail.zw));
    height += uTrailStrength * (1.0 - smoothstep(0.0, TRAIL_RADIUS, trail));
    float drop = length(toScreen(vUv - uDrop.xy));
    height += uDrop.z * (1.0 - smoothstep(0.0, DROP_RADIUS, drop));
    gl_FragColor = vec4(height, state.r, 0.0, 1.0);
  }
`;

// Shades the height field: slopes facing the light glow teal, the others darken slightly.
export const displayFragment = /* glsl */ `
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform vec3 uColor;
  varying vec2 vUv;

  const float SHADE = 4.0;
  const vec2 LIGHT = vec2(-0.7071, 0.7071);

  void main() {
    float left = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r;
    float right = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r;
    float down = texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
    float up = texture2D(uState, vUv + vec2(0.0, uTexel.y)).r;
    float light = dot(vec2(right - left, up - down), LIGHT) * SHADE;
    float highlight = clamp(light, 0.0, 1.0) * 0.25;
    float shadow = clamp(-light, 0.0, 1.0) * 0.15;
    gl_FragColor = vec4(uColor * highlight, highlight + shadow);
  }
`;
