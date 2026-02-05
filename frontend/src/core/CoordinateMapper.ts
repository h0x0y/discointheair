// src/core/CoordinateMapper.ts
export class CoordinateMapper {
  private width: number;
  private height: number;
  private isMirrored: boolean = true;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  map(landmark: { x: number; y: number }) {
    const x = this.isMirrored 
      ? (1 - landmark.x) * this.width 
      : landmark.x * this.width;
    const y = landmark.y * this.height;
    return { x, y };
  }

  distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}