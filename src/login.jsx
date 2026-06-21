/* ============================================================
   AURUM ATELIER — Login screen
   ============================================================ */
function Login({ go }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  const submit = () => {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "A valid address, please";
    if (pw.length < 6) e.pw = "Your private key — 6 characters or more";
    setErr(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setEntered(true); }, 1700);
  };

  if (entered) {
    return React.createElement(WelcomePanel, { name: email.split("@")[0], onReset: () => { setEntered(false); setEmail(""); setPw(""); } });
  }

  return (
    React.createElement("div", { className: "form-block" },
      React.createElement(Reveal, { delay: 60 },
        React.createElement("div", { className: "eyebrow" }, "Private Access")
      ),
      React.createElement(Reveal, { delay: 160 },
        React.createElement("h1", { className: "display", dangerouslySetInnerHTML: { __html: "Enter the <em>Atelier</em>" } })
      ),
      React.createElement(Reveal, { delay: 280 },
        React.createElement("p", { className: "lede" }, "Welcome back. The studio is as you left it — your projects, your rooms, your considered details await within.")
      ),

      React.createElement("div", { className: "fields" },
        React.createElement(Field, {
          label: "Email", type: "email", value: email, onChange: (v) => { setEmail(v); setErr({...err, email: null}); },
          placeholder: "you@residence.com", error: err.email, onEnter: submit, autoFocus: true,
        }),
        React.createElement(Field, {
          label: "Password", value: pw, onChange: (v) => { setPw(v); setErr({...err, pw: null}); },
          placeholder: "Your private key", error: err.pw, onEnter: submit, allowToggle: true,
        })
      ),

      React.createElement("div", { className: "cta-row" },
        React.createElement(Button, { label: loading ? "Unlocking" : "Enter Studio", onClick: submit, loading }),
        React.createElement("button", { className: "linkbtn", onClick: () => go("forgot") }, "Forgot your key?")
      ),

      React.createElement("div", { className: "alt-line" },
        React.createElement("span", null, "Not yet a member?"),
        React.createElement("button", { className: "linkbtn", onClick: () => go("signup") }, "Begin your design journey")
      )
    )
  );
}

/* ---------- Welcome (success) panel ---------- */
function WelcomePanel({ name, onReset }) {
  return (
    React.createElement("div", { className: "form-block confirm" },
      React.createElement("div", { className: "confirm-seal" }, React.createElement(Monogram, { size: 56 })),
      React.createElement(Reveal, { delay: 120 },
        React.createElement("div", { className: "eyebrow" }, "Access Granted")
      ),
      React.createElement(Reveal, { delay: 220 },
        React.createElement("h1", { className: "display", dangerouslySetInnerHTML: { __html: "Welcome,<br><em>" + (name || "Patron") + "</em>" } })
      ),
      React.createElement(Reveal, { delay: 340 },
        React.createElement("p", { className: "lede" }, "The doors are open. Step inside — your atelier has been prepared.")
      ),
      React.createElement("div", { className: "cta-row" },
        React.createElement(Button, { label: "Enter the Atelier", onClick: () => { window.location.href = "index.html"; } }),
        React.createElement("button", { className: "linkbtn", onClick: onReset }, "\u2190 Sign out")
      )
    )
  );
}

Object.assign(window, { Login, WelcomePanel });
