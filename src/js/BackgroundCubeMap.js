const { CubeTexture, CubeTextureLoader } = require("three");

class BackgroundCubeMap extends CubeTexture {
  constructor() {
    super();
    let images = [];

    let c = document.createElement("canvas");
    c.width = 8;
    c.height = c.width;
    let ctx = c.getContext("2d");
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);

      for (let j = 0; j < (c.width * c.height) / 2; j++) {
        ctx.fillStyle = Math.random() < 0.5 ? "#a8a9ad" : "#646464";
        ctx.fillRect(
          Math.floor(Math.random() * c.width),
          Math.floor(Math.random() * c.height),
          2,
          1
        );
      }

      images.push(c.toDataURL());
    }
    new CubeTextureLoader().load(images, (tex) => {
      this.copy(tex);
      this.needsUpdate = true;
    });
  }
}
export { BackgroundCubeMap };
