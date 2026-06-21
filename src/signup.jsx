/* ============================================================
   AURUM ATELIER — "Begin Your Design Journey" (multi-step)
   ============================================================ */
const STYLES = [
  { name: "Modern", desc: "Clean lines · open volume" },
  { name: "Minimal", desc: "Quiet · essential · calm" },
  { name: "Luxury", desc: "Rich material · bespoke" },
  { name: "Scandinavian", desc: "Warm wood · soft light" },
  { name: "Contemporary", desc: "Current · curated · bold" },
];

function Signup({ go }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", email: "", phone: "", style: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const total = 4;

  const set = (k, v) => { setData(d => ({ ...d, [k]: v })); setErr(""); };

  const validate = () => {
    if (step === 0 && data.name.trim().length < 2) return "Kindly share your name";
    if (step === 1 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return "A valid address, please";
    if (step === 2 && data.phone.replace(/\D/g, "").length < 7) return "A number we may reach you on";
    if (step === 3 && !data.style) return "Choose the language of your space";
    return "";
  };

  const next = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    if (step < total - 1) setStep(s => s + 1);
    else setDone(true);
  };
  const back = () => { if (step > 0) { setStep(s => s - 1); setErr(""); } else go("login"); };

  if (done) return React.createElement(JourneyDone, { data, go });

  return (
    React.createElement("div", { className: "form-block" },
      React.createElement(Reveal, { delay: 60 },
        React.createElement("div", { className: "eyebrow" }, "Begin Your Design Journey")
      ),

      React.createElement("div", { className: "steps-head" },
        React.createElement("button", { className: "btn-back", onClick: back },
          "\u2190 ", step === 0 ? "Entrance" : "Back"),
        React.createElement("div", { className: "steps-track" },
          React.createElement("div", { className: "steps-fill", style: { width: ((step + 1) / total * 100) + "%" } })
        ),
        React.createElement("div", { className: "steps-index" },
          React.createElement("b", null, "0" + (step + 1)), " — 0" + total)
      ),

      React.createElement("div", { className: "step-stack" },
        // Step 0 — Name
        React.createElement("div", { className: "step" + (step === 0 ? " active" : step > 0 ? " past" : "") },
          React.createElement("h2", { className: "step-q", dangerouslySetInnerHTML: { __html: "First, how shall we <em>address</em> you?" } }),
          step === 0 && React.createElement(Field, { label: "Full Name", value: data.name, onChange: (v) => set("name", v), placeholder: "e.g. Ananya Rao", error: err, onEnter: next, autoFocus: true })
        ),
        // Step 1 — Email
        React.createElement("div", { className: "step" + (step === 1 ? " active" : step > 1 ? " past" : "") },
          React.createElement("h2", { className: "step-q", dangerouslySetInnerHTML: { __html: "Where may we send your <em>invitation</em>?" } }),
          step === 1 && React.createElement(Field, { label: "Email", type: "email", value: data.email, onChange: (v) => set("email", v), placeholder: "you@residence.com", error: err, onEnter: next, autoFocus: true })
        ),
        // Step 2 — Phone
        React.createElement("div", { className: "step" + (step === 2 ? " active" : step > 2 ? " past" : "") },
          React.createElement("h2", { className: "step-q", dangerouslySetInnerHTML: { __html: "And a line for our <em>concierge</em>?" } }),
          step === 2 && React.createElement(Field, { label: "Phone", type: "tel", value: data.phone, onChange: (v) => set("phone", v), placeholder: "+91 ·····", error: err, onEnter: next, autoFocus: true })
        ),
        // Step 3 — Style
        React.createElement("div", { className: "step" + (step === 3 ? " active" : "") },
          React.createElement("h2", { className: "step-q", dangerouslySetInnerHTML: { __html: "Which language does your <em>space</em> speak?" } }),
          React.createElement("div", { className: "style-grid" },
            STYLES.map((s) => React.createElement("button", {
                key: s.name,
                className: "style-opt" + (data.style === s.name ? " sel" : ""),
                onClick: () => set("style", s.name),
                type: "button",
              },
              React.createElement("span", { className: "so-name" }, s.name),
              React.createElement("span", { className: "so-desc" }, s.desc)
            )),
            err && step === 3 && React.createElement("div", { className: "field-error show", style: { gridColumn: "1 / -1" } }, err)
          )
        )
      ),

      React.createElement("div", { className: "cta-row" },
        React.createElement(Button, { label: step === total - 1 ? "Begin" : "Continue", onClick: next })
      )
    )
  );
}

/* ---------- Journey complete ---------- */
function JourneyDone({ data, go }) {
  return (
    React.createElement("div", { className: "form-block confirm" },
      React.createElement("div", { className: "confirm-seal" }, React.createElement(Monogram, { size: 56 })),
      React.createElement(Reveal, { delay: 120 },
        React.createElement("div", { className: "eyebrow" }, "Your Journey Begins")
      ),
      React.createElement(Reveal, { delay: 220 },
        React.createElement("h1", { className: "display", dangerouslySetInnerHTML: { __html: "A place is now<br><em>reserved</em> for you" } })
      ),
      React.createElement(Reveal, { delay: 340 },
        React.createElement("p", { className: "lede" },
          (data.name ? data.name.split(" ")[0] + ", a" : "A"), " member of our studio will reach out to compose your first ",
          React.createElement("em", { style: { color: "var(--brass)", fontStyle: "italic" } }, data.style || "bespoke"),
          " consultation.")
      ),
      React.createElement("div", { className: "cta-row" },
        React.createElement(Button, { label: "Enter the Atelier", onClick: () => { window.location.href = "index.html"; } })
      )
    )
  );
}

Object.assign(window, { Signup, JourneyDone, STYLES });
