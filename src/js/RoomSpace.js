import { BackSide, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
class RoomSpace extends Mesh {
  constructor() {
    let g = new RoundedBoxGeometry(20, 20, 20, 10, 2);
    g.translate(0, 10, 0);
    let m = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.375,
      metalness: 1,
      side: BackSide
    });
    super(g, m);
  }
}
export { RoomSpace };
