import P5 from "p5";

interface IShape {
  distance(x: number, y: number): number;
}

class Circle implements IShape {
  private cx: number;
  private cy: number;
  private r: number;
  constructor(cx: number, cy: number, r: number) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
  }
  distance(x: number, y: number): number {
    return (
      Math.sqrt((this.cx - x) * (this.cx - x) + (this.cy - y) * (this.cy - y)) -
      this.r
    );
  }
}

class SDFGrid {
  private sdf: Float32Array;
  private gridsize: number;
  constructor(gridsize: number) {
    this.gridsize = gridsize;
    this.sdf = new Float32Array(gridsize * gridsize);
    // initialize with "everything far away"
    this.sdf.fill(100000000);
  }

  get(x: number, y: number) {
    return this.sdf[x + this.gridsize * y];
  }

  size() {
    return this.gridsize;
  }

  // use coordinates relative to grid size
  addShape(shape: IShape) {
    // TODO intersection test against sdf!
    // maybe traverse a subgrid that only encompasses the
    // bounds of the circle and check for overlap with already
    // negative values.

    // fill sdf with circle:
    for (let i = 0; i < this.gridsize; ++i) {
      for (let j = 0; j < this.gridsize; ++j) {
        // i,j are grid pts now.
        const signeddist = shape.distance(i, j);
        const oldsigneddist = this.sdf[j + this.gridsize * i];
        // only write to grid where values are positive
        // because neg values mean intersection which
        // is not allowed.
        if (oldsigneddist > 0) {
          if (signeddist <= 0) {
            // negative means interior of circle so just write it
            this.sdf[j + this.gridsize * i] = signeddist;
          } else {
            // exterior means compare with prev value to have a min dist
            // to nearest surface
            this.sdf[j + this.gridsize * i] = Math.min(
              oldsigneddist,
              signeddist
            );
          }
        }
      }
    }
  }
}

// Creating the sketch itself
const sketch = (p5: P5) => {
  const sdf = new SDFGrid(40);

  // space between grid points on canvas
  const gridscale = 20;
  const margin = 20;

  let slider: P5.Element;

  // The sketch setup method
  p5.setup = () => {
    slider = p5.createSlider(0, 4, 1, 0.2);
    slider.position(10, 10);
    slider.style("width", "80px");
    p5.createCanvas(800, 800);
    // hint: shift the center points away from integer values!
    // and see how well the spheres reconstruct the shape!
    sdf.addShape(new Circle(6, 6, 3));
    sdf.addShape(new Circle(14, 14, 4));
  };

  p5.draw = () => {
    p5.background(220);
    let d: number;
    const gridpoint = [0, 0];

    p5.noFill();

    for (let i = 0; i < sdf.size(); ++i) {
      for (let j = 0; j < sdf.size(); ++j) {
        d = sdf.get(j, i);
        gridpoint[0] = margin + j * gridscale;
        gridpoint[1] = margin + i * gridscale;

        // black dot at grid point
        p5.stroke(0, 0, 0);
        p5.point(gridpoint[0], gridpoint[1]);

        // red or blue circle
        if (d > 0) {
          p5.stroke(255, 0, 0);
        } else {
          p5.stroke(0, 0, 255);
        }
        p5.circle(
          gridpoint[0],
          gridpoint[1],
          Math.abs(d * gridscale * (slider.value() as number))
        );
      }
    }
  };
};

export default sketch;
