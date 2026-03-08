import Webcam from 'react-webcam';
import { useRef, useState } from 'react';

const VirtualTryOn = ({ garmentImage }) => {
  const webcamRef = useRef(null);
  const [overlay, setOverlay] = useState(null);

  const applyOutfit = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcamRef.current.video, 0, 0);
    ctx.drawImage(garmentImage, 50, 100); // Position overlay
    setOverlay(canvas.toDataURL());
  };

  return (
    <div>
      <Webcam ref={webcamRef} />
      <button onClick={applyOutfit}>Try It On</button>
      {overlay && <img src={overlay} alt="Virtual Try-On" />}
    </div>
  );
};