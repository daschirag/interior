/* ============================================================
   AURUM ATELIER — App root
   ============================================================ */
function App() {
  const [view, setView] = useState("login");      // login | signup | forgot
  const [phase, setPhase] = useState("enter");      // enter | exit
  const [introOpen, setIntroOpen] = useState(false);
  const [introDone, setIntroDone] = useState(() => {
    try { return sessionStorage.getItem("aurum_intro") === "1"; } catch (e) { return false; }
  });

  // Cinematic intro — first visit of the session only
  useEffect(() => {
    if (introDone) return;
    const open = setTimeout(() => setIntroOpen(true), 100);
    const finish = setTimeout(() => {
      setIntroDone(true);
      try { sessionStorage.setItem("aurum_intro", "1"); } catch (e) {}
    }, 2900);
    return () => { clearTimeout(open); clearTimeout(finish); };
  }, []);

  const skip = () => {
    setIntroOpen(true); setIntroDone(true);
    try { sessionStorage.setItem("aurum_intro", "1"); } catch (e) {}
  };

  const go = (next) => {
    if (next === view) return;
    setPhase("exit");
    setTimeout(() => { setView(next); setPhase("enter"); }, 460);
  };

  // Per-view plate dressing
  const plates = {
    login:  { caption: "INTERIOR — LUXURY LIVING ROOM", place: "BANGALORE", frame: "PLATE 01", headline: "Where rooms become <em>resonance</em>.", activeLoc: "BANGALORE" },
    signup: { caption: "INTERIOR — MODULAR KITCHEN",    place: "DHARWAD",   frame: "PLATE 02", headline: "Every great home <em>begins</em> with a conversation.", activeLoc: "DHARWAD" },
    forgot: { caption: "INTERIOR — READING ALCOVE",     place: "HUBLI",     frame: "PLATE 03", headline: "Pause. We will <em>see you back</em> inside.", activeLoc: "HUBLI" },
  };
  const p = plates[view];

  const Screen = view === "login" ? Login : view === "signup" ? Signup : Forgot;

  return (
    React.createElement(React.Fragment, null,
      React.createElement(Cursor),
      React.createElement("div", { className: "stage" },
        React.createElement("div", { className: "scene " + phase, key: view, style: { "--reveal-offset": introDone ? "0ms" : "1500ms" } },
          React.createElement(Plate, p),
          React.createElement("div", { className: "chamber" },
            React.createElement("a", { className: "brand", href: "#", onClick: (e) => { e.preventDefault(); go("login"); } },
              React.createElement("span", { className: "brand-mark" }, React.createElement(Monogram, { size: 34 })),
              React.createElement("span", { className: "brand-word", dangerouslySetInnerHTML: { __html: "AURUM <b>ATELIER</b>" } })
            ),
            React.createElement(Screen, { go }),
            React.createElement("div", { className: "chamber-foot" },
              React.createElement("a", { className: "linkbtn", href: "index.html", style: { letterSpacing: "0.14em" } }, "\u2190 Back to site"),
              React.createElement("a", { className: "linkbtn", href: "Creative Direction.html", style: { letterSpacing: "0.14em" } }, "Creative Direction \u2197")
            )
          )
        )
      ),
      React.createElement(Atmosphere),
      !introDone && React.createElement("div", { className: "intro" + (introOpen ? " open" : "") },
        React.createElement("div", { className: "curtain top" }),
        React.createElement("div", { className: "curtain bot" }),
        React.createElement("div", { className: "intro-center" },
          React.createElement("div", { className: "intro-mark" }, React.createElement(Monogram, { size: 64 })),
          React.createElement("div", { className: "intro-rule" }),
          React.createElement("div", { className: "intro-word" }, "AURUM ATELIER")
        )
      ),
      !introDone && React.createElement("button", { className: "skip", onClick: skip, "data-hover": true }, "Skip \u2192")
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
