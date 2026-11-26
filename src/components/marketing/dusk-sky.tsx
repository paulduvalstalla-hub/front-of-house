import styles from "./marketing.module.css";

/**
 * Craft-style sky, at night: deep blue overhead, cloud banks, and a warm lamp glow
 * along the horizon, as if the dining room's light spills into the street.
 */
export function DuskSky({ className = "", glow = 0.55 }: { className?: string; glow?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0b0e18 0%, #121831 34%, #1d2440 58%, #2a2a3d 76%, #3a2e30 100%)",
        }}
      />
      <div
        className="absolute inset-x-[-10%] bottom-[-18%] h-[62%]"
        style={{
          background: `radial-gradient(60% 70% at 50% 100%, rgb(242 182 109 / ${glow}) 0%, rgb(201 138 63 / ${glow * 0.45}) 38%, transparent 72%)`,
        }}
      />
      <div
        className={styles.cloud}
        style={{ left: "-8%", top: "46%", width: "46%", height: "26%", background: "rgb(120 132 190 / 0.32)" }}
      />
      <div
        className={styles.cloud}
        style={{ right: "-6%", top: "40%", width: "42%", height: "30%", background: "rgb(108 118 176 / 0.3)" }}
      />
      <div
        className={styles.cloud}
        style={{ left: "22%", top: "62%", width: "56%", height: "22%", background: "rgb(214 160 128 / 0.22)" }}
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
