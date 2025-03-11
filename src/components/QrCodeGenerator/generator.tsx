import { useQRCode } from "next-qrcode";

interface QRCodeProps {
  data: string;
  width?: number;
}

export default function QRCode({ data, width }: QRCodeProps) {
  const { Canvas } = useQRCode();

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <div id="canvas">
      <Canvas
        text={data}
        options={{
          type: "Canvas",
          quality: 1,
          errorCorrectionLevel: "M",
          margin: 3,
          scale: 4,
          width: !!width ? width : 200,
          color: {
            dark: "#000",
            light: "#FFFFFF",
          },
        }}
      />
    </div>
  );
}
