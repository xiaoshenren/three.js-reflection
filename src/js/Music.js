import * as THREE from "three";

class Music extends THREE.AudioAnalyser {
  constructor() {
    const fftSize = 128;
    const listener = new THREE.AudioListener();

    const audio = new THREE.Audio(listener);
    const file = "./media/WhiteGold.mp3";

    let mediaElement;

    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      const loader = new THREE.AudioLoader();
      loader.load(file, function (buffer) {
        audio.setBuffer(buffer);
        audio.play();
      });
    } else {
      mediaElement = new Audio();
      mediaElement.crossOrigin = "anonymous";
      mediaElement.src = file;
      mediaElement.volume = 0.5; // !!!
      console.log(mediaElement);
      mediaElement.play();

      audio.setMediaElementSource(mediaElement);
    }
    super(audio, fftSize);
    this.fftSize = fftSize;
    this.mediaElement = mediaElement;
  }
}
export { Music };
