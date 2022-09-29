// // @deno-types="./qrcode.d.ts"
import { decodeAesGcm, encodeAesGcm } from "./crypto.ts";
import QRCode from "../lib/qrcode.js";

export const encodeForQR = async (id: string) => {
  const [signature, iv] = await encodeAesGcm(id);
  return `bae:${signature}:${iv}`;
}

export const decodeFromQR = async (data: string): Promise<string> => {
  if (!data.startsWith('bae:')) {
    throw new Error('Encrypted data should start with bae: protocol');
  }
  if (data.split(':').length !== 3) {
    throw new Error('Encrypted data should have three components'); // protocol, contents and IV
  }
  const decoded = await decodeAesGcm(data.split(':')[1], data.split(':')[2]);
  return decoded;
}

export function qrcodeSvgPath(
  text: string
): string {

  const qr = new QRCode(text);

  const options = {
    padding: 4,
    width: 185,
    height: 185,
    color: "#000000",
    background: "#ffffff",
    ecl: "Q"
  };

  const width = options.width;
  const height = options.height;
  const length = qr.qrcode.modules.length;
  const xsize = width / (length + 2 * options.padding);
  const ysize = height / (length + 2 * options.padding);

  //Rectangles representing modules
  let pathdata = '';

  for (let y = 0; y < length; y++) {
    for (let x = 0; x < length; x++) {
      const module = qr.qrcode.modules[x][y];
      if (module) {

        let px: string | number = (x * xsize + options.padding * xsize);
        let py: string | number = (y * ysize + options.padding * ysize);

        //Module as a part of svg path data, thanks to @danioso
        let w: string | number = xsize + px
        let h: string | number = ysize + py

        px = (Number.isInteger(px)) ? Number(px) : px.toFixed(2);
        py = (Number.isInteger(py)) ? Number(py) : py.toFixed(2);
        w = (Number.isInteger(w)) ? Number(w) : w.toFixed(2);
        h = (Number.isInteger(h)) ? Number(h) : h.toFixed(2);

        pathdata += (`M${px},${py} V${h} H${w} V${py} H${px} Z `);
      }
    }
  }

  return pathdata;
}
