import {
  BufferGeometry,
  Float32BufferAttribute,
  Path,
  PlaneGeometry,
  Vector2,
  Vector3
} from "three";

class BarGeometry extends BufferGeometry {
  constructor(width, height, depth, radiusBottom) {
    let rTop = depth * 0.5;
    let rBottom = radiusBottom == null ? rTop : radiusBottom;
    rBottom = rBottom + rTop > height ? height - rTop : rBottom;

    let segWidth = 200;
    let segHeight = 20;

    let contour = makeContour();
    let profile = makeProfile();

    //console.log(contour.length, profile.length);

    let geometry = makeGeometry(contour, profile);

    super();
    this.copy(geometry);

    function makeGeometry(contour, profile) {
      let rotAxis = new Vector3(0, 1, 0);
      let n = new Vector3();

      let points = [];
      let normals = [];

      profile.forEach((pProfile) => {
        let pProfileNormal = pProfile.nor;
        //console.log(pProfileNormal);
        contour.forEach((pContour) => {
          let pCountourNormal = pContour.nor;

          let p = pCountourNormal
            .clone()
            .setLength(pProfile.x)
            .setY(pProfile.y)
            .add(pContour);
          points.push(p);

          n.copy(pProfileNormal)
            .setZ(0)
            .applyAxisAngle(rotAxis, pContour.ang + Math.PI);
          //console.log(pContour.ang);
          normals.push(n.x, n.y, n.z);
        }); //contour
      }); //profile
      //console.log(normals);
      let g = new PlaneGeometry(1, 1, segWidth, profile.length - 1);

      g.setFromPoints(points);
      g.setAttribute("normal", new Float32BufferAttribute(normals, 3));
      //console.log(g);
      return g;
    } // makeGeometry

    function makeProfile() {
      let path = new Path();
      path.absarc(-rTop, height - rTop, rTop, Math.PI * 0.5, 0, true);
      path.absarc(rBottom, rBottom, rBottom, Math.PI, Math.PI * 1.5);
      let pts = path.getPoints(segHeight);
      //console.log(pts.length);
      computeNormals(pts, true);
      return pts;
    } // makeProfile

    function makeContour() {
      let center = width * 0.5 - rTop;
      let path = new Path();
      path.absarc(-center, 0, rTop, Math.PI * 0.5, Math.PI * 1.5);
      path.absarc(center, 0, rTop, Math.PI * 1.5, Math.PI * 0.5);
      path.closePath();

      let contourPts = path.getSpacedPoints(segWidth);
      computeNormals(contourPts);
      contourPts = contourPts.map((p) => {
        let v = new Vector3();
        v.set(p.x, 0, -p.y);
        v[`nor`] = new Vector3(-p.nor.x, 0, p.nor.y);
        v[`ang`] = p[`ang`];
        return v;
      });
      return contourPts;
    } // makeContour

    function computeNormals(pts, edgesUp) {
      //console.log("call computeNormals");
      let pCount = pts.length;
      let v1 = new Vector2();
      let v2 = new Vector2();
      let n1 = new Vector2();
      let n2 = new Vector2();
      let n0 = new Vector2();
      for (let i = 0; i < pCount; i++) {
        let currPt = pts[i];
        let prevPt = pts[i === 0 ? pCount - 2 : i - 1];
        let nextPt = pts[i === pCount - 1 ? 1 : i + 1];

        v1.subVectors(prevPt, currPt);
        v2.subVectors(currPt, nextPt);
        n1.set(v1.y, -v1.x);
        n2.set(v2.y, -v2.x);
        n0.addVectors(n1, n2).normalize();

        let angle = Math.atan2(n0.y, n0.x);

        currPt[`nor`] =
          edgesUp === true && (i === 0 || i === pCount - 1)
            ? new Vector2(0, 1)
            : n0.clone();
        currPt[`ang`] = angle;
      }
    } // computeNormals
  } // constructor
} // class
export { BarGeometry };
