import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useColorMode } from '../../../contexts/ColorMode';

const VerticalWaveform = ({ audioUrl, totalDuration, viewRange }) => {
  const canvasRef = useRef(null);
  const parentRef = useRef(null);
  const { colorMode } = useColorMode();

  const graphColor = colorMode === 'light' ? 'blue' : '#3b82f6';

  const bgColor = colorMode === 'light' ? 'bg-cyber-white' : 'bg-gray-400';

  useEffect(() => {
    const fetchAndDrawAudio = async () => {
      const { data } = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(data, (buffer) => {
        drawWaveform(buffer);
      });
    };

    const drawWaveform = (audioBuffer) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const parentHeight = parentRef.current.clientHeight;
      canvas.width = parentRef.current.clientWidth;
      canvas.height = parentHeight;

      const { width, height } = canvas;

      const sampleRate = audioBuffer.sampleRate;
      const [viewStart, viewEnd] = viewRange.map(v => v / 30); // Convert frame range to time range
      const startSample = Math.floor(viewStart * sampleRate);
      const endSample = Math.min(audioBuffer.length, Math.ceil(viewEnd * sampleRate));
      const channelData = audioBuffer.getChannelData(0).slice(startSample, endSample); // Get trimmed mono channel data

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = graphColor;

      ctx.beginPath();
      const step = channelData.length / height; // Calculate step to cover all data

      for (let i = 0; i < height; i++) {
        const amplitude = channelData[Math.floor(i * step)]; // Get amplitude for this step
        const x = amplitude * width / 2 + width / 2;
        const y = height - i; // Invert y to draw from bottom to top
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    fetchAndDrawAudio();
  }, [audioUrl, totalDuration, viewRange]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const parent = parentRef.current;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div ref={parentRef} className='h-[80vh] w-full relative'>
      <canvas ref={canvasRef} width="80" />
    </div>
  );
};

export default VerticalWaveform;
