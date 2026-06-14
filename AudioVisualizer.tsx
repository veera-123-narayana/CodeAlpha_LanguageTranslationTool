/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface AudioVisualizerProps {
  active: boolean;
  color?: string;
  barCount?: number;
}

export default function AudioVisualizer({ active, color = "bg-indigo-500", barCount = 12 }: AudioVisualizerProps) {
  // Return simulated audio wave bars that animate with varying heights when active
  return (
    <div className="flex items-center gap-1 h-8 px-2 justify-center">
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary base delays and durations to make the wave look authentic and natural
        const delay = (i * 0.12).toFixed(2);
        const duration = (0.6 + Math.random() * 0.8).toFixed(2);
        
        return (
          <div
            key={i}
            className={`w-1 rounded-full ${color} transition-all duration-300`}
            style={{
              height: active ? '100%' : '15%',
              animation: active ? `pulseWave ${duration}s ease-in-out infinite alternate` : 'none',
              animationDelay: active ? `${delay}s` : '0s',
              transformOrigin: 'bottom'
            }}
          />
        );
      })}

      <style>{`
        @keyframes pulseWave {
          0% {
            transform: scaleY(0.2);
          }
          100% {
            transform: scaleY(1.1);
          }
        }
      `}</style>
    </div>
  );
}
