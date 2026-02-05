// src/types/mediapipe.d.ts
// 声明@mediapipe/hands模块的基础类型
declare module "@mediapipe/hands" {
  export interface HandLandmarkerResult {
    multiHandLandmarks: Array<Array<{ x: number; y: number; z: number }>> | null;
    multiHandedness: Array<{ label: "Left" | "Right" }> | null;
  }

  export class Hands {
    constructor(options: { locateFile: (file: string) => string });
    setOptions(options: {
      maxNumHands: number;
      modelComplexity: 0 | 1;
      minDetectionConfidence: number;
      minTrackingConfidence: number;
    }): void;
    onResults(callback: (results: HandLandmarkerResult) => void): void;
    send(options: { image: HTMLVideoElement }): Promise<void>;
    close(): void;
  }
}

// 声明@mediapipe/camera_utils模块的基础类型
declare module "@mediapipe/camera_utils" {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: {
      width: number;
      height: number;
      onFrame: () => Promise<void>;
    });
    start(): Promise<void>;
    stop(): void;
  }
}