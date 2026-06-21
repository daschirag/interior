/* ============================================================
   AURUM ATELIER — Forgot Password (concierge)
   ============================================================ */
function Forgot({ go }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("A valid address, please"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1600);
  };

  if (sent) {
    return (
      React.createElement("div", { className: "form-block confirm" },
        React.createElement("div", { className: "confirm-seal" }, React.createElement(Monogram, { size: 56 })),
        React.createElement(Reveal, { delay: 120 },
          React.createElement("div", { className: "eyebrow" }, "Attended To")
        ),
        React.createElement(Reveal, { delay: 220 },
          React.createElement("h1", { className: "display", dangerouslySetInnerHTML: { __html: "Consider it<br><em>taken care of</em>" } })
        ),
        React.createElement(Reveal, { delay: 340 },
          React.createElement("p", { className: "lede" },
            "A private link to restore your key is on its way to ",
            React.createElement("span", { style: { color: "var(--brass)" } }, email),
            ". It may take a quiet moment to arrive.")
        ),
        React.createElement("div", { className: "concierge-note" },
          "Should it not appear, our concierge is reachable at care@aurumatelier.in — we will see you returned to your studio personally."),
        React.createElement("div", { className: "cta-row" },
          React.createElement("button", { className: "linkbtn", onClick: () => go("login") }, "\u2190 Return to entrance")
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "form-block" },
      React.createElement(Reveal, { delay: 60 },
        React.createElement("div", { className: "eyebrow" }, "Concierge")
      ),
      React.createElement(Reveal, { delay: 160 },
        React.createElement("h1", { className: "display", dangerouslySetInnerHTML: { __html: "Misplaced<br>your <em>key</em>?" } })
      ),
      React.createElement(Reveal, { delay: 280 },
        React.createElement("p", { className: "lede" }, "It happens to the best of us. Leave your address below and we will quietly send a way back in — no fuss, no alarm.")
      ),

      React.createElement("div", { className: "fields" },
        React.createElement(Field, {
          label: "Email", type: "email", value: email,
          onChange: (v) => { setEmail(v); setErr(""); },
          placeholder: "you@residence.com", error: err, onEnter: submit, autoFocus: true,
        })
      ),

      React.createElement("div", { className: "cta-row" },
        React.createElement(Button, { label: loading ? "Sending" : "Send a private link", onClick: submit, loading }),
        React.createElement("button", { className: "linkbtn", onClick: () => go("login") }, "\u2190 Back to entrance")
      )
    )
  );
}

Object.assign(window, { Forgot });
