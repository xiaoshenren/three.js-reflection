import {
  InstancedBufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D
} from "three";
import { BarGeometry } from "./BarGeometry";
import noise from "../shaders/noise.glsl";

class Bars extends InstancedMesh {
  constructor() {
    let instCount = 3;
    let instInitVal = -(instCount - 1) * 0.5;
    let geometry = new BarGeometry(1.5, 3, 0.375, 0.75);
    let material = new MeshStandardMaterial({
      color: 0xffffff,
      wireframe: false,
      roughness: 0.375,
      metalness: 1
    });
    geometry.setAttribute(
      "instHeight",
      new InstancedBufferAttribute(new Float32Array([0, 1, 0.5]), 1)
    );
    super(geometry, material, 3);
    this.position.x = 2;

    let dummy = new Object3D();

    for (let i = 0; i < instCount; i++) {
      dummy.position.x = instInitVal + i;
      dummy.position.z = (-instInitVal - i) * 1.75;
      dummy.updateMatrix();
      this.setMatrixAt(i, dummy.matrix);
    }

    let barVals = new Array(3).fill().map((v, i) => {
      return {
        phase: (Math.PI / 3) * i
      };
    });

    this.totalTime = { value: 0 };
    this.update = (t) => {
      this.totalTime.value += t;
      let time = this.totalTime.value;
      barVals.forEach((bv, i) => {
        let v = Math.abs(Math.sin(bv.phase + (time - 0.25) * Math.PI * 0.475));
        geometry.attributes.instHeight.setX(i, v);
      });
      geometry.attributes.instHeight.needsUpdate = true;
    };

    material.onBeforeCompile = (shader) => {
      shader.uniforms.time = this.totalTime;
      shader.vertexShader =
        `
        attribute float instHeight;
        varying vec3 vPos;
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        #include <begin_vertex>
        transformed.y += transformed.y > 1.5 ? instHeight : 0.;
        vPos = vec3(instanceMatrix * vec4(transformed, 1.));
        `
      );
      //console.log(shader.vertexShader);
      shader.fragmentShader =
        `
        ${noise}
        uniform float time;
        varying vec3 vPos;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <roughnessmap_fragment>`,
        `
          float roughnessFactor = roughness;
    
          vec3 tPos = vPos * vec3(0.65, 0.125, 0.65);
          tPos += vec3(0, time * 0.0312 * 1.5, 0);
          float n1 = snoise(vec3(tPos));
          n1 = (n1 + 1.0) * 0.5;
          
          float n2 = snoise(vec3(n1 * 10., 1, 1));
          n2 = sin(((n2 + 1.0) * 0.5) * 3.1415926 * 2.);
          
          float effect = smoothstep(0.1, 0.125, n1) * (1. - smoothstep(0.375, 0.4, n2));
          float coef = sin(n2 * 3.141526 * 0.5) * 0.125;
          float e = effect - abs(coef);
          e = n1 > 0.25 && n1 < 0.75? e * e : pow(e, 4.);
          e = clamp(e, 0., 1.);
    
          float fadeFactor = smoothstep(1., 0.25, vPos.y);
    
          roughnessFactor *= mix( e, 1., fadeFactor);
        `
      );
    };
  }
}
export { Bars };
