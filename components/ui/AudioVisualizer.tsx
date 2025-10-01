import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    stream: MediaStream;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!stream || !canvasRef.current) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        source.connect(analyser);
        analyser.fftSize = 32;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            if (!canvasCtx) return;

            canvasCtx.fillStyle = '#f5f3ff'; // purple-50
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
            const barWidth = (average / 255) * canvas.width;

            canvasCtx.fillStyle = '#a855f7'; // purple-500
            canvasCtx.fillRect(0, 0, barWidth, canvas.height);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            // Disconnect nodes to allow for garbage collection
            source.disconnect();
            analyser.disconnect();
            // Important: close the audio context to release system resources
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [stream]);

    return (
        <div className="w-full bg-purple-100 rounded-full h-4 overflow-hidden">
             <canvas ref={canvasRef} width="300" height="16" className="w-full h-full" />
        </div>
    );
};

export default AudioVisualizer;
