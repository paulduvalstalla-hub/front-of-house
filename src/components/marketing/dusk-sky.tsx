import styles from "./marketing.module.css";

/**
 * Craft-style sky, at night: deep blue overhead, a few cloud banks, and only a
 * faint warmth at the horizon. No glow blobs.
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
      <div
        className={styles.cloud}
        style={{ left: "-8%", top: "46%", width: "46%", height: "26%", background: "rgb(120 132 190 / 0.22)" }}
      />
      <div
        className={styles.cloud}
        style={{ right: "-6%", top: "40%", width: "42%", height: "30%", background: "rgb(108 118 176 / 0.2)" }}
      />
      <div
        className={styles.cloud}
        style={{ left: "8%", top: "12%", width: "30%", height: "14%", background: "rgb(96 108 168 / 0.18)" }}
      />
      <div
        className={styles.cloud}
        style={{ right: "12%", top: "8%", width: "24%", height: "12%", background: "rgb(96 108 168 / 0.16)" }}
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
      <div className={styles.grainOverlay} />
    </div>
  );
}
