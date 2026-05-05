const STARS: Array<{ top: string; left: string; size: number; delay: string; duration: string }> = [
  { top: "8%", left: "12%", size: 2, delay: "0s", duration: "4.2s" },
  { top: "14%", left: "78%", size: 3, delay: "1.1s", duration: "5s" },
  { top: "22%", left: "34%", size: 1.5, delay: "2.3s", duration: "3.6s" },
  { top: "29%", left: "62%", size: 2, delay: "0.6s", duration: "4.8s" },
  { top: "36%", left: "8%", size: 2.5, delay: "1.8s", duration: "4s" },
  { top: "44%", left: "88%", size: 1.5, delay: "0.3s", duration: "5.2s" },
  { top: "52%", left: "22%", size: 2, delay: "2.7s", duration: "3.8s" },
  { top: "58%", left: "70%", size: 3, delay: "0.9s", duration: "4.6s" },
  { top: "65%", left: "44%", size: 1.5, delay: "1.5s", duration: "4.2s" },
  { top: "72%", left: "82%", size: 2, delay: "2.1s", duration: "5s" },
  { top: "78%", left: "16%", size: 2.5, delay: "0.4s", duration: "3.4s" },
  { top: "84%", left: "56%", size: 2, delay: "1.7s", duration: "4.4s" },
  { top: "90%", left: "30%", size: 1.5, delay: "2.5s", duration: "3.8s" },
  { top: "6%", left: "48%", size: 1.5, delay: "1.2s", duration: "5s" },
  { top: "18%", left: "92%", size: 2, delay: "2.0s", duration: "4s" },
  { top: "40%", left: "50%", size: 1, delay: "0.7s", duration: "3.6s" },
  { top: "60%", left: "6%", size: 2, delay: "1.4s", duration: "4.6s" },
  { top: "76%", left: "92%", size: 1.5, delay: "2.6s", duration: "4.2s" },
  { top: "12%", left: "26%", size: 1, delay: "0.2s", duration: "5.4s" },
  { top: "48%", left: "38%", size: 1.5, delay: "1.9s", duration: "3.8s" },
  { top: "68%", left: "26%", size: 1, delay: "2.4s", duration: "4.4s" },
  { top: "26%", left: "16%", size: 1, delay: "0.8s", duration: "5s" },
  { top: "32%", left: "82%", size: 1, delay: "1.6s", duration: "4s" },
  { top: "82%", left: "70%", size: 1, delay: "2.2s", duration: "4.8s" },
];

export function Stars() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}
