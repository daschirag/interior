/* ============================================================
   AURUM ATELIER — Shared components
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- Brand mark: an interlocked "A" monogram (simple geometry) ---------- */
function Monogram({ size = 34, stroke = "var(--brass)" }) {
  return (
    React.createElement("svg", { width: size, height: size, viewBox: "0 0 40 40", fill: "none" },
      React.createElement("circle", { cx: 20, cy: 20, r: 18.5, stroke: "var(--line-strong)", strokeWidth: 1 }),
      React.createElement("path", { d: "M20 9 L28 31 M20 9 L12 31 M14.7 24 H25.3", stroke: stroke, strokeWidth: 1.1, strokeLinecap: "round" })
    )
  );
}

/* ---------- Custom cursor (dot + lagging ring) ---------- */
function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const ring = ringRef.current, dot = dotRef.current;
    let rx = innerWidth / 2, ry = innerHeight / 2, mx = rx, my = ry;
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      const t = e.target.closest("a, button, input, .style-opt, .field-input, [data-hover]");
      ring.classList.toggle("hover", !!t);
    };
    const raf = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    };
    window.addEventListener("mousemove", move);
    const id = requestAnimationFrame(raf);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(id); };
  }, []);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { ref: ringRef, className: "cursor-ring" }),
    React.createElement("div", { ref: dotRef, className: "cursor-dot" })
  );
}

/* ---------- Atmosphere (grain + light) ---------- */
function Atmosphere() {
  return React.createElement("div", { className: "atmosphere" });
}

/* ---------- Cinematic plate: striped placeholder + editorial captions ---------- */
function Plate({ caption = "INTERIOR — LUXURY LIVING ROOM", place = "BANGALORE", frame = "PLATE 01", headline, activeLoc = "BANGALORE" }) {
  const locs = ["BANGALORE", "HUBLI", "DHARWAD", "HOSPET"];
  return (
    React.createElement("div", { className: "plate" },
      React.createElement("div", { className: "plate-img" }, React.createElement(Placeholder, { caption, place })),
      React.createElement("div", { className: "plate-overlay" }),
      React.createElement("div", { className: "plate-meta tl" }, frame, React.createElement("br"), "ƒ/1.8 · NATURAL LIGHT"),
      React.createElement("div", { className: "plate-meta tr" }, "AURUM ATELIER", React.createElement("br"), "EST. MMXXVI"),
      React.createElement("div", { className: "spine" }, "PRIVATE ACCESS · BY INVITATION"),
      React.createElement("div", { className: "plate-edge" },
        React.createElement("div", { className: "plate-headline", dangerouslySetInnerHTML: { __html: headline } }),
        React.createElement("div", { className: "plate-locations" },
          locs.map((l) => React.createElement("div", { key: l, className: l === activeLoc ? "active" : "" }, l))
        )
      )
    )
  );
}

/* ---------- Striped image placeholder ---------- */
function Placeholder({ caption, place }) {
  return (
    React.createElement("div", { style: {
        position: "absolute", inset: 0, overflow: "hidden",
        background: "#171310",
        backgroundImage: "repeating-linear-gradient(135deg, rgba(194,162,105,0.05) 0 2px, transparent 2px 26px)",
      } },
      React.createElement("div", { style: {
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        } },
        React.createElement("div", { style: { textAlign: "center", opacity: 0.5 } },
          React.createElement("div", { style: {
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.2em",
            color: "var(--ink-dim)", textTransform: "uppercase" } }, "◐ IMAGE PLACEHOLDER"),
          React.createElement("div", { style: {
            fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em",
            color: "var(--ink-faint)", marginTop: 8, textTransform: "uppercase" } }, caption + " · " + place)
        )
      )
    )
  );
}

/* ---------- Underline field ---------- */
function Field({ label, type = "text", value, onChange, placeholder, error, onEnter, autoFocus, allowToggle }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (autoFocus && ref.current) { const t = setTimeout(() => ref.current.focus(), 60); return () => clearTimeout(t); } }, [autoFocus]);
  const t = allowToggle ? (show ? "text" : "password") : type;
  return (
    React.createElement("div", { className: "field" + (focused ? " focused" : "") },
      React.createElement("label", { className: "field-label" }, label),
      React.createElement("input", {
        ref, className: "field-input", type: t, value, placeholder,
        onChange: (e) => onChange(e.target.value),
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onKeyDown: (e) => { if (e.key === "Enter" && onEnter) onEnter(); },
      }),
      allowToggle && React.createElement("button", { className: "field-toggle", onClick: () => setShow(s => !s), type: "button" }, show ? "Hide" : "Show"),
      React.createElement("span", { className: "field-underline" }),
      React.createElement("div", { className: "field-error" + (error ? " show" : "") }, error || "\u00A0")
    )
  );
}

/* ---------- Primary button ---------- */
function Button({ label = "Enter Studio", onClick, loading, disabled }) {
  return (
    React.createElement("button", {
        className: "btn" + (loading ? " loading" : ""),
        onClick, disabled,
      },
      React.createElement("span", { className: "btn-label" }, label),
      React.createElement("span", { className: "btn-arrow btn-label" }, "\u2192"),
      React.createElement("span", { className: "btn-progress" })
    )
  );
}

/* ---------- Animated line-reveal (for staggered headline entrances) ---------- */
function Reveal({ children, delay = 0, as = "div" }) {
  return React.createElement("span", { className: "reveal" },
    React.createElement(as, { style: { "--rd": delay + "ms" } }, children)
  );
}

Object.assign(window, { Monogram, Cursor, Atmosphere, Plate, Placeholder, Field, Button, Reveal });
