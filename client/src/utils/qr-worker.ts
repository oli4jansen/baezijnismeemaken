import jsQR from "jsqr";

onmessage = (e: MessageEvent<{ data: Uint8ClampedArray; width: number; height: number; }>) => {
  const qrData = jsQR(e.data.data, e.data.width, e.data.height);
  postMessage(qrData);
}

export type {};
