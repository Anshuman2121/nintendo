'use client';

import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const colors = ['#00ff41', '#00d4ff', '#8b5cf6', '#ff006e', '#ffffff'];

        // Create twinkling stars
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            star.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: twinkle ${Math.random() * 2 + 2}s infinite ease-in-out;
        animation-delay: ${Math.random() * 3}s;
      `;
            container.appendChild(star);
        }

        // Create floating particles
        const particleInterval = setInterval(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        opacity: ${Math.random()};
        animation: float ${Math.random() * 3 + 3}s infinite linear;
      `;
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 6000);
        }, 300);

        // Create shooting stars
        const shootingStarInterval = setInterval(() => {
            const shootingStar = document.createElement('div');
            shootingStar.className = 'shooting-star';
            shootingStar.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: linear-gradient(45deg, white, #00d4ff);
        border-radius: 50%;
        left: ${Math.random() * 50}vw;
        top: ${Math.random() * 50}vh;
        animation: shoot ${Math.random() * 2 + 3}s linear;
        box-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff;
      `;
            container.appendChild(shootingStar);
            setTimeout(() => shootingStar.remove(), 5000);
        }, 8000);

        return () => {
            clearInterval(particleInterval);
            clearInterval(shootingStarInterval);
        };
    }, []);

    return (
        <>
            <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes float {
          0% { transform: translateY(100vh) scale(0); }
          10% { transform: translateY(90vh) scale(1); }
          90% { transform: translateY(10vh) scale(1); }
          100% { transform: translateY(0vh) scale(0); }
        }
        @keyframes shoot {
          0% { transform: translateX(-100px) translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)); opacity: 0; }
        }
      `}</style>
            <div
                ref={containerRef}
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                aria-hidden="true"
            />
        </>
    );
}
