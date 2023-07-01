import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Bars } from "./js/Bars";
import { BackgroundCubeMap } from "./js/BackgroundCubeMap";
import { RoomSpace } from "./js/RoomSpace";
import { BigBox } from "./js/BigBox";

let bgcm = new BackgroundCubeMap();
let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  const overlay = document.getElementById("overlay");
  overlay.remove();
  const text = document.getElementById("writing");
  text.style.display = "";

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(1.5, 4, 8);
  let renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.minAzimuthAngle = Math.PI / -6;
  controls.maxAzimuthAngle = Math.PI * 0.5;
  controls.minPolarAngle = Math.PI * 0.25;
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 5;
  controls.maxDistance = 10;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.update();

  //scene.add(new THREE.GridHelper());

  let light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(1, 1, 0.25);
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

  scene.background = bgcm;
  scene.environment = bgcm;

  let moveables = [];

  let roomSpace = new RoomSpace();
  let bars = new Bars();
  let bigBox = new BigBox(renderer);
  let canPlay = false;
  bigBox.mediaElement.addEventListener("canplay", (event) => {
    canPlay = true;
  });
  bigBox.position.set(-2, 2.5, -1);
  scene.add(roomSpace, bars, bigBox);
  moveables.push(bars, bigBox);

  let clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    let t = canPlay ? clock.getDelta() : 0;
    moveables.forEach((m) => {
      m.update(t);
    });
    controls.update();
    renderer.render(scene, camera);
  });
}
