'use client';
import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
    color?: string;
    speed?: number;
    bgContextColor?: string;
    isScratchable?: boolean;
}

const MatrixRain: React.FC<MatrixRainProps> = ({
    color = '#FF0000',
    speed = 30,
    bgContextColor = 'rgba(0, 0, 0, 0.05)',
    isScratchable = false
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Scratch Layer (Offscreen)
        if (isScratchable && !scratchCanvasRef.current) {
            const sc = document.createElement('canvas');
            sc.width = canvas.offsetWidth;
            sc.height = canvas.offsetHeight;
            scratchCanvasRef.current = sc;
        }

        // Resize handler
        const resize = () => {
            canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;

            if (scratchCanvasRef.current) {
                scratchCanvasRef.current.width = canvas.width;
                scratchCanvasRef.current.height = canvas.height;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // Matrix Config
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const characters = katakana.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        let animationFrameId: number;

        const draw = () => {
            // 1. Trail effect (The "Fade")
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = bgContextColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Text
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            // 3. Apply Scratch Mask (If enabled)
            if (isScratchable && scratchCanvasRef.current) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.drawImage(scratchCanvasRef.current, 0, 0);

                // Reset for next frame
                ctx.globalCompositeOperation = 'source-over';
            }

            setTimeout(() => {
                animationFrameId = requestAnimationFrame(draw);
            }, 1000 / speed);
        };

        draw();

        // SCRATCH INTERACTION HANDLERS
        const handleMouseMove = (e: MouseEvent) => {
            if (!isScratchable || !scratchCanvasRef.current) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const sCtx = scratchCanvasRef.current.getContext('2d');
            if (!sCtx) return;

            sCtx.globalCompositeOperation = 'source-over';
            sCtx.beginPath();
            sCtx.arc(x, y, 60, 0, Math.PI * 2); // Brush Size
            sCtx.fillStyle = '#000'; // Color doesn't matter, just opacity
            sCtx.fill();
        };

        if (isScratchable) {
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (isScratchable) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed, bgContextColor, isScratchable]);

    return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
};

export default MatrixRain;
