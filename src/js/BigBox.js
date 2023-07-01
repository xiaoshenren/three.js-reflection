import {
  Color,
  DataTexture,
  LuminanceFormat,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RedFormat
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import { Music } from "./Music";

class BigBox extends Mesh {
  constructor(renderer) {
    let g = new RoundedBoxGeometry(5, 5, 1, 10, 0.5);
    let m = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.375,
      metalness: 1
    });
    super(g, m);
    this.totalTime = { value: 0 };

    let music = new Music();
    const format = renderer.capabilities.isWebGL2 ? RedFormat : LuminanceFormat;
    this.mediaElement = music.mediaElement;
    let tAudioData = {
      value: new DataTexture(music.data, music.fftSize / 2, 1, format)
    };

    this.update = (t) => {
      this.totalTime.value += t;
      this.rotation.y =
        Math.PI / 5 +
        Math.sin(this.totalTime.value * Math.PI * 0.1) * Math.PI * 0.05;

      music.getFrequencyData();
      tAudioData.value.needsUpdate = true;
    };

    let gMirror = new PlaneGeometry(4, 4);
    let mirror = new Reflector(gMirror, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x7f7f7f
    });
    //console.log(mirror);
    mirror.position.z = 0.51;
    this.add(mirror);

    mirror.material.transparent = true;
    mirror.material.onBeforeCompile = (shader) => {
      shader.uniforms.tAudioData = tAudioData;
      shader.uniforms.spectrumColor = { value: new Color(0x3cdfff) };
      shader.vertexShader = /*glsl*/ `
      uniform mat4 textureMatrix;
      varying vec4 vUv;
      varying vec2 cUv;
      void main() {
        vUv = textureMatrix * vec4( position, 1.0 );
        cUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `;
      //console.log(shader.fragmentShader);
      shader.fragmentShader = /*glsl*/ `
        uniform sampler2D tAudioData;
        uniform vec3 spectrumColor;
        varying vec2 cUv;
        ${shader.fragmentShader}
      `.replace(
        /*glsl*/ `gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );`,
        /*glsl*/ `gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

          // https://www.shadertoy.com/view/7sdXz2
          vec2 p = cUv * 2. - 1.;
          vec2 s = vec2(0.5);
          float r = 0.0625;
          vec2 q = abs(p)-s+r;
          float d = min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
          gl_FragColor.a = smoothstep(0.5, -0.1, d);
          ////////////////////////////////////////

          // sound spectrum https://www.shadertoy.com/view/Mlj3WV
          // quantize coordinates
          vec2 spUv = clamp(cUv * 1.5 - 0.25, 0., 1.);
          const float bands = 15.0;
          const float segs = 20.0;
          p.x = floor(spUv.x*bands)/bands;
          p.y = floor(spUv.y*segs)/segs;

          // read frequency data from first row of texture
          float fft  = texture( tAudioData, vec2(p.x,0.0) ).x;

          // led color
          vec3 color = mix(vec3(0.0, 2.0, 0.0), vec3(2.0, 0.0, 0.0), sqrt(spUv.y));

          // mask for bar graph
          float mask = (p.y < fft) ? 1.0 : 0.0;

          // led shape
          vec2 d1 = fract((spUv - p) *vec2(bands, segs)) - 0.5;
          float led = smoothstep(0.5, 0.35, abs(d1.x)) *
                      smoothstep(0.5, 0.35, abs(d1.y));
          
          gl_FragColor.a = max(gl_FragColor.a, led * mask);

          gl_FragColor.rgb = mix(gl_FragColor.rgb, spectrumColor * 1.1, led * mask);
        `
      );
    };
  }
}

export { BigBox };
