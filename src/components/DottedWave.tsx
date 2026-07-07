import React from 'react';

export default function DottedWave() {
  // Generates a beautiful dot matrix that fades away from the top-right corner
  const cols = 28;
  const rows = 28;
  const dots = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Calculate normalized distance from the top-right corner (c = cols-1, r = 0)
      const dx = (cols - 1 - c) / cols; // 0 at right, 1 at left
      const dy = r / rows;             // 0 at top, 1 at bottom
      const dist = Math.sqrt(dx * dx + dy * dy); 
      
      // Opacity fades out as distance from top-right increases
      const opacity = Math.max(0, 0.65 - dist * 0.6); 
      // Size shrinks as distance from top-right increases
      const radius = Math.max(0.6, 3.2 - dist * 2.4);

      if (opacity > 0.01) {
        dots.push(
          <circle
            key={`${r}-${c}`}
            cx={`${(c / (cols - 1)) * 100}%`}
            cy={`${(r / (rows - 1)) * 100}%`}
            r={radius}
            fill="url(#dotGradient)"
            opacity={opacity}
          />
        );
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Flowing background halo glow near the corner */}
      <div className="absolute -top-44 -right-44 w-[450px] h-[450px] bg-gradient-to-br from-[#D946C4]/15 to-[#7C6FE0]/5 rounded-full blur-[120px] opacity-75" />
      
      {/* SVG Dot Matrix */}
      <svg 
        className="absolute top-0 right-0 w-[55%] h-[65%] min-w-[320px] max-w-[600px] select-none" 
        style={{ 
          maskImage: 'radial-gradient(circle at 85% 15%, black, transparent 75%)', 
          WebkitMaskImage: 'radial-gradient(circle at 85% 15%, black, transparent 75%)' 
        }}
      >
        <defs>
          <linearGradient id="dotGradient" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D946C4" />
            <stop offset="100%" stopColor="#7C6FE0" />
          </linearGradient>
        </defs>
        {dots}
      </svg>
    </div>
  );
}
