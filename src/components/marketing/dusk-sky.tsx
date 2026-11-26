import "./marketing.css";

/**
 * Night sky: deep blue overhead, faint stars, film grain, and only a slight
 * warmth at the horizon. No clouds or glow shapes.
 */
export function DuskSky({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0b0e18 0%, #121831 38%, #1a2038 66%, #232434 86%, #2a2629 100%)",
        }}
      />
      {/* a few stars, very faint */}
      {[
        [12, 9],
        [27, 18],
        [44, 6],
        [63, 14],
        [78, 7],
        [90, 21],
        [6, 27],
        [55, 25],
      ].map(([x, y], i) => (
        <span
          key={i}
          className="absolute size-[2px] rounded-full bg-linen"
          style={{ left: `${x}%`, top: `${y}%`, opacity: 0.35 + (i % 3) * 0.15 }}
        />
      ))}
      <div className="foh-grain" />
    </div>
  );
}
