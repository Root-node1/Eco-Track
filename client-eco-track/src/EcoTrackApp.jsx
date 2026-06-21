import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEcoTrackStore, api } from "./ecoTrackStore";

/* ---------------------------------------------------------
   EcoTrack — community carbon footprint tracker

   Data layer (auth, stats, log/feed, climate) now lives in
   ./ecoTrackStore.js, owned by Lenny. This file only handles
   form-local UI state and rendering. Visual styling below
   (design tokens, gauge, bars) is unchanged from the original —
   swap it freely once a final visual direction is locked,
   without touching ecoTrackStore.js.

   Design tokens (see design plan):
   bg        #0E1410   panel    #1B2620
   accent    #5FCE8F   warn     #E8896B
   sage      #A8B8AE   hi-text  #F2F5F1
   display font: Space Grotesk | body: Inter | mono: JetBrains Mono
--------------------------------------------------------- */

const FONT_LINK_ID = "ecotrack-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------------- shared bits / icons (unchanged) ---------------- */

function IconLeaf(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M5 20c8 0 14-6 14-14a1 1 0 0 0-1-1C10 5 4 11 4 19a1 1 0 0 0 1 1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 19c3-4 6-7 11-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M4 16V12.5a1 1 0 0 1 .2-.6l2-2.7a1 1 0 0 1 .8-.4h10a1 1 0 0 1 .8.4l2 2.7a1 1 0 0 1 .2.6V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="3" y="16" width="18" height="3.2" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="19.2" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="19.2" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconBus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <rect x="4" y="4" width="16" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 14h1M15.5 14h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="19.4" r="1.3" fill="currentColor" />
      <circle cx="16" cy="19.4" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconBike(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="6" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 17l4-8h4l3 5M10 9h3M14 9l4 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWalk(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="13" cy="4.5" r="1.6" fill="currentColor" />
      <path
        d="M11 8l3 1 2 3-1.5 5M14 9l-4 2-1 4M10 11l-3 2v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMeat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M8 14c-2.5-2.5-2.5-7 1-9.5 3-2 6.5-1 8 1.5 2 3 .5 6-2 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 13.5 5 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function IconBowl(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M4 11h16a8 8 0 0 1-16 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7 11c0-2 1-5 5-5M12 6c2.5 0 4 1.6 4.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSprout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M12 21V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M12 11c0-3.5-2.5-5.5-6-5.5C6 9 8.5 11 12 11ZM12 13c0-3.5 2.5-5.5 6-5.5C18 11 15.5 13 12 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCloud(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M7 18a4 4 0 0 1-.3-8 5 5 0 0 1 9.6-1.8A4.2 4.2 0 0 1 17.5 18H7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDroplet(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M12 3c3.2 4 6 7.4 6 10.6A6 6 0 0 1 6 13.6C6 10.4 8.8 7 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWind(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M3 8h11a2.5 2.5 0 1 0-2.3-3.5M3 13h14a2.5 2.5 0 1 1-2.3 3.5M3 18h9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="15" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconMail(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path
        d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M4 12 20 4l-6 16-3-7-7-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h6A1.5 1.5 0 0 1 18 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 9 18.5V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 12h11M10 8.5 13.5 12 10 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlertCircle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" />
    </svg>
  );
}

/* ---------------- segmented option control (unchanged) ---------------- */

function OptionRow({ options, value, onChange, name }) {
  return (
    <div className="opt-row" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`opt-btn ${active ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="opt-icon">{opt.icon}</span>
            <span className="opt-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- animated number (unchanged) ---------------- */

function useAnimatedNumber(target, duration = 900) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    const from = fromRef.current;
    const delta = target - from;

    function tick(ts) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(+(from + delta * eased).toFixed(1));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

/* ---------------- radial gauge — dumb component, takes plain data ---------------- */

function RadialGauge({ userScore, communityAverage }) {
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = size / 2;

  const maxScale = Math.max(userScore, communityAverage) * 1.4 || 100;
  const avgFrac = Math.min(1, communityAverage / maxScale);

  const animatedUser = useAnimatedNumber(userScore, 1100);
  const animatedFrac = Math.min(1, animatedUser / maxScale);

  const arcStart = -130;
  const arcSpan = 260;

  function angleToPoint(fracOfArc) {
    const angle = arcStart + arcSpan * fracOfArc;
    const rad = (angle * Math.PI) / 180;
    return {
      x: c + r * Math.cos(rad),
      y: c + r * Math.sin(rad),
    };
  }

  function describeArc(fracStart, fracEnd) {
    const start = angleToPoint(fracStart);
    const end = angleToPoint(fracEnd);
    const largeArc = fracEnd - fracStart > 0.5 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const avgPoint = angleToPoint(avgFrac);
  const better = userScore <= communityAverage;

  return (
    <div className="gauge-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <path
          d={describeArc(0, 1)}
          fill="none"
          stroke="rgba(168,184,174,0.18)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={describeArc(0, animatedFrac)}
          fill="none"
          stroke={better ? "var(--ec-accent)" : "var(--ec-warn)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: "stroke 0.4s" }}
        />
        <circle cx={avgPoint.x} cy={avgPoint.y} r="4.5" fill="var(--ec-hi)" stroke="#0E1410" strokeWidth="2" />
        <text x={c} y={c - 6} textAnchor="middle" className="gauge-score">
          {animatedUser.toFixed(1)}
        </text>
        <text x={c} y={c + 18} textAnchor="middle" className="gauge-unit">
          kg CO₂e / day
        </text>
      </svg>
      <div className="gauge-legend">
        <span className="legend-dot you" /> you
        <span className="legend-dot avg" /> community avg {communityAverage}
      </div>
    </div>
  );
}

/* ---------------- breakdown bars — dumb component, takes plain data ---------------- */

function BreakdownBars({ breakdown, animateKey }) {
  const entries = [
    { key: "transport", label: "transport", icon: <IconCar />, value: breakdown.transport },
    { key: "electricity", label: "electricity", icon: <IconBolt />, value: breakdown.electricity },
    { key: "food", label: "food", icon: <IconMeat />, value: breakdown.food },
  ];
  const max = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div className="breakdown" key={animateKey}>
      {entries.map((e, i) => (
        <div className="bd-row" key={e.key} style={{ animationDelay: `${i * 90}ms` }}>
          <span className="bd-icon">{e.icon}</span>
          <span className="bd-label">{e.label}</span>
          <div className="bd-track">
            <div
              className="bd-fill"
              style={{
                "--target-w": `${Math.min(100, (e.value / max) * 100)}%`,
              }}
            />
          </div>
          <span className="bd-value">{e.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- log feed entry (unchanged) ---------------- */

function LogFeedItem({ entry }) {
  return (
    <div className="feed-item">
      <div className="feed-dot" />
      <div className="feed-body">
        <div className="feed-top">
          <span className="feed-id">{entry.id}</span>
          <span className="feed-score">{entry.score.toFixed(1)} kg</span>
        </div>
        <div className="feed-time">{entry.createdAt}</div>
      </div>
    </div>
  );
}

/* ---------------- climate strip (unchanged) ---------------- */

function ClimateStrip({ climate }) {
  if (!climate) return null;
  return (
    <div className="climate-strip">
      <div className="climate-loc">
        <span className="climate-dot" />
        {climate.location.city}, {climate.location.country}
      </div>
      <div className="climate-readings">
        <span className="climate-read">
          <IconSun /> {climate.weather.temperature}°c
        </span>
        <span className="climate-read">
          <IconCloud /> {climate.weather.condition}
        </span>
        <span className="climate-read">
          <IconDroplet /> {climate.weather.humidity}%
        </span>
        <span className="climate-read">
          <IconWind /> {climate.weather.windSpeed} km/h
        </span>
      </div>
      <div className="climate-context">{climate.carbonContext.message}</div>
    </div>
  );
}

/* ---------------- auth gate — now calls store actions instead of api directly ---------------- */

function AuthGate() {
  const login = useEcoTrackStore((s) => s.login);
  const register = useEcoTrackStore((s) => s.register);

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("Nairobi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [in_, setIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIn(true), 40);
    return () => clearTimeout(t);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ name, email, password, location });
      }
      // session.token now set in the store — EcoTrackApp re-renders into Dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`auth-screen ${in_ ? "in" : ""}`}>
      <div className="auth-card">
        <div className="auth-brand">
          <span className="ec-brand-icon"><IconLeaf /></span>
          EcoTrack
        </div>
        <h1 className="auth-h1">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Sign in to log today's footprint and see your standing."
            : "Track your footprint and compare with the community."}
        </p>

        <div className="auth-tabs">
          <button type="button" className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
            sign in
          </button>
          <button type="button" className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>
            register
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div className="auth-field">
              <span className="auth-input-icon"><IconUser /></span>
              <input
                type="text"
                placeholder="full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="auth-field">
            <span className="auth-input-icon"><IconMail /></span>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <span className="auth-input-icon"><IconLock /></span>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {mode === "register" && (
            <div className="auth-field">
              <span className="auth-input-icon"><IconMapPin /></span>
              <input
                type="text"
                placeholder="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              <IconAlertCircle /> {error}
            </div>
          )}

          <button type="submit" className="ec-submit" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? (
              <>
                <span className="spin" /> {mode === "login" ? "signing in" : "creating account"}
              </>
            ) : (
              <>
                {mode === "login" ? "sign in" : "create account"} <IconChevronRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- recommendations panel — reads token/userId from store ---------------- */

function RecommendationsPanel() {
  const token = useEcoTrackStore((s) => s.token);
  const userId = useEcoTrackStore((s) => s.user?.id);
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  const load = useCallback(() => {
    if (!userId) return;
    setState({ status: "loading", data: null, error: null });
    api
      .recommendations(userId, token)
      .then((data) => setState({ status: "ready", data, error: null }))
      .catch((err) => setState({ status: "error", data: null, error: err.message }));
  }, [userId, token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="ec-panel">
      <div className="ec-panel-title">
        <span>recommendations</span>
        <span className="mono">GET /recommendations</span>
      </div>

      {state.status === "loading" && (
        <div className="panel-loading">
          <span className="spin spin-light" /> fetching personalized tips
        </div>
      )}

      {state.status === "error" && (
        <div className="panel-error">
          <IconAlertCircle />
          <span>{state.error}</span>
          <button className="retry-btn" onClick={load}>retry</button>
        </div>
      )}

      {state.status === "ready" && state.data && (
        <>
          <ul className="rec-list">
            {state.data.recommendations.map((r, i) => (
              <li key={i} className="rec-item" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="rec-icon"><IconSparkle /></span>
                {r}
              </li>
            ))}
          </ul>
          <div className="rec-summary">
            <div className="rec-summary-cell">
              <IconCar />
              <span>{state.data.summary.avgTransport}</span>
              <small>avg transport</small>
            </div>
            <div className="rec-summary-cell">
              <IconBolt />
              <span>{state.data.summary.avgElectricity}</span>
              <small>avg power</small>
            </div>
            <div className="rec-summary-cell">
              <IconMeat />
              <span>{state.data.summary.avgFood}</span>
              <small>avg food</small>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- chatbot widget — reads userId from store ---------------- */

function ChatbotWidget() {
  const userId = useEcoTrackStore((s) => s.user?.id);
  const [messages, setMessages] = useState([
    { who: "bot", text: "Hi! Ask me how to lower your footprint, or anything about transport, electricity, or food.", ts: "now" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { who: "user", text, ts: "now" }]);
    setSending(true);
    try {
      const data = await api.chatbotMessage(text, userId);
      setMessages((m) => [...m, { who: "bot", text: data.botResponse, ts: "now" }]);
    } catch (err) {
      setMessages((m) => [...m, { who: "bot", text: `Couldn't reach the assistant — ${err.message}`, ts: "now", isError: true }]);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="ec-panel">
      <div className="ec-panel-title">
        <span>assistant</span>
        <span className="mono">POST /chatbot/message</span>
      </div>
      <div className="chat-window" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.who} ${m.isError ? "err" : ""}`}>
            {m.text}
          </div>
        ))}
        {sending && (
          <div className="chat-bubble bot typing">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="ask about reducing your footprint..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="chat-send" onClick={send} disabled={sending || !input.trim()} aria-label="send">
          <IconSend />
        </button>
      </div>
    </div>
  );
}

const TRANSPORT_OPTIONS = [
  { value: "car", label: "car", icon: <IconCar /> },
  { value: "bus", label: "bus", icon: <IconBus /> },
  { value: "bike", label: "bike", icon: <IconBike /> },
  { value: "walk", label: "walk", icon: <IconWalk /> },
];

const FOOD_OPTIONS = [
  { value: "meat", label: "meat", icon: <IconMeat /> },
  { value: "mixed", label: "mixed", icon: <IconBowl /> },
  { value: "vegetarian", label: "veg", icon: <IconSprout /> },
];

/* ---------------- dashboard — pulls shared data from the store ---------------- */

function Dashboard() {
  // ---- shared data layer (Lenny's store) ----
  const user = useEcoTrackStore((s) => s.user);
  const logout = useEcoTrackStore((s) => s.logout);

  const stats = useEcoTrackStore((s) => s.stats);
  const statsLoading = useEcoTrackStore((s) => s.statsLoading);
  const statsError = useEcoTrackStore((s) => s.statsError);
  const loadStats = useEcoTrackStore((s) => s.loadStats);

  const lastLog = useEcoTrackStore((s) => s.lastLog);
  const feed = useEcoTrackStore((s) => s.feed);
  const animateKey = useEcoTrackStore((s) => s.animateKey);
  const submitting = useEcoTrackStore((s) => s.submitting);
  const logError = useEcoTrackStore((s) => s.logError);
  const submitLog = useEcoTrackStore((s) => s.submitLog);

  const climate = useEcoTrackStore((s) => s.climate);
  const climateError = useEcoTrackStore((s) => s.climateError);
  const loadClimate = useEcoTrackStore((s) => s.loadClimate);

  // ---- form-local UI state (not shared, stays here) ----
  const [transportType, setTransportType] = useState("car");
  const [distanceKm, setDistanceKm] = useState(10);
  const [electricityKwh, setElectricityKwh] = useState(5);
  const [foodType, setFoodType] = useState("mixed");
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => setHeroIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    loadClimate();
  }, [loadClimate]);

  const handleLog = useCallback(() => {
    submitLog({ transportType, distanceKm, electricityKwh, foodType });
  }, [transportType, distanceKm, electricityKwh, foodType, submitLog]);

  const better = stats ? stats.userScore <= stats.communityAverage : true;

  return (
    <div className="ecotrack-root">
      <style>{`
        .ecotrack-root {
          --ec-bg: #0E1410;
          --ec-panel: #1B2620;
          --ec-panel-2: #212F27;
          --ec-accent: #5FCE8F;
          --ec-warn: #E8896B;
          --ec-sage: #A8B8AE;
          --ec-hi: #F2F5F1;
          --ec-border: rgba(168,184,174,0.14);
          font-family: 'Inter', sans-serif;
          background: var(--ec-bg);
          color: var(--ec-hi);
          border-radius: 20px;
          padding: 0;
          overflow: hidden;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }
        .ecotrack-root * { box-sizing: border-box; }
        .ecotrack-root .mono { font-family: 'JetBrains Mono', monospace; }

        .ec-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, transparent 1px);
          background-size: 18px 18px;
        }

        .ec-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 32px 18px;
          border-bottom: 1px solid var(--ec-border);
        }
        .ec-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 18px;
          letter-spacing: 0.2px;
        }
        .ec-brand-icon {
          width: 30px; height: 30px;
          border-radius: 9px;
          background: rgba(95,206,143,0.14);
          color: var(--ec-accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }

        .ec-hero {
          padding: 40px 32px 8px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .ec-hero.in { opacity: 1; transform: translateY(0); }
        .ec-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: var(--ec-accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .ec-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--ec-accent);
          box-shadow: 0 0 0 0 rgba(95,206,143,0.6);
          animation: ecpulse 2s infinite;
        }
        @keyframes ecpulse {
          0% { box-shadow: 0 0 0 0 rgba(95,206,143,0.5); }
          70% { box-shadow: 0 0 0 7px rgba(95,206,143,0); }
          100% { box-shadow: 0 0 0 0 rgba(95,206,143,0); }
        }
        .ec-h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 30px;
          line-height: 1.15;
          margin: 0 0 8px;
          max-width: 460px;
        }
        .ec-sub {
          color: var(--ec-sage);
          font-size: 14.5px;
          max-width: 440px;
          margin: 0 0 28px;
          line-height: 1.55;
        }

        .ec-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
          padding: 4px 32px 32px;
        }
        @media (max-width: 720px) {
          .ec-grid { grid-template-columns: 1fr; }
        }

        .ec-panel {
          background: var(--ec-panel);
          border: 1px solid var(--ec-border);
          border-radius: 16px;
          padding: 22px 22px 24px;
        }
        .ec-panel-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--ec-sage);
          margin: 0 0 18px;
          display: flex;
          justify-content: space-between;
        }

        .field-block { margin-bottom: 20px; }
        .field-label {
          font-size: 12.5px;
          color: var(--ec-sage);
          margin-bottom: 9px;
          display: block;
        }

        .opt-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .opt-btn {
          flex: 1;
          min-width: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 6px 10px;
          border-radius: 12px;
          border: 1px solid var(--ec-border);
          background: rgba(255,255,255,0.02);
          color: var(--ec-sage);
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'Inter', sans-serif;
        }
        .opt-btn:hover { border-color: rgba(168,184,174,0.3); color: var(--ec-hi); }
        .opt-btn.active {
          background: rgba(95,206,143,0.12);
          border-color: var(--ec-accent);
          color: var(--ec-accent);
        }
        .opt-icon { font-size: 19px; }
        .opt-label { font-size: 11.5px; }

        .slider-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ec-range {
          flex: 1;
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(to right, var(--ec-accent) 0%, var(--ec-accent) var(--fill,50%), rgba(168,184,174,0.18) var(--fill,50%));
          outline: none;
        }
        .ec-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--ec-hi);
          border: 3px solid var(--ec-accent);
          cursor: pointer;
        }
        .ec-range::-moz-range-thumb {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--ec-hi);
          border: 3px solid var(--ec-accent);
          cursor: pointer;
        }
        .slider-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          min-width: 56px;
          text-align: right;
          color: var(--ec-hi);
        }

        .ec-submit {
          width: 100%;
          margin-top: 6px;
          padding: 13px 0;
          border-radius: 12px;
          border: none;
          background: var(--ec-accent);
          color: #0E1410;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.12s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 24px -10px rgba(95,206,143,0.5);
        }
        .ec-submit:hover { transform: translateY(-1px); }
        .ec-submit:active { transform: translateY(0) scale(0.99); }
        .ec-submit:disabled { opacity: 0.7; cursor: default; }

        .spin {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(14,20,16,0.25);
          border-top-color: #0E1410;
          animation: ecspin 0.7s linear infinite;
        }
        @keyframes ecspin { to { transform: rotate(360deg); } }

        .gauge-wrap { display: flex; flex-direction: column; align-items: center; }
        .gauge-score {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 30px;
          font-weight: 600;
          fill: var(--ec-hi);
        }
        .gauge-unit {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          fill: var(--ec-sage);
          letter-spacing: 0.04em;
        }
        .gauge-legend {
          margin-top: 6px;
          font-size: 12px;
          color: var(--ec-sage);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block;
          margin-left: 10px;
        }
        .legend-dot:first-child { margin-left: 0; }
        .legend-dot.you { background: var(--ec-accent); }
        .legend-dot.avg { background: var(--ec-hi); }

        .verdict {
          margin-top: 14px;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 12.5px;
          text-align: center;
          width: 100%;
        }
        .verdict.good { background: rgba(95,206,143,0.12); color: var(--ec-accent); }
        .verdict.bad { background: rgba(232,137,107,0.12); color: var(--ec-warn); }

        .breakdown { display: flex; flex-direction: column; gap: 13px; margin-top: 18px; }
        .bd-row {
          display: grid;
          grid-template-columns: 22px 76px 1fr 40px;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: ecfadein 0.5s ease forwards;
        }
        @keyframes ecfadein { from { opacity: 0; transform: translateX(-4px);} to { opacity: 1; transform: translateX(0);} }
        .bd-icon { color: var(--ec-sage); font-size: 14px; display: flex; }
        .bd-label { font-size: 12.5px; color: var(--ec-sage); }
        .bd-track {
          height: 6px;
          border-radius: 3px;
          background: rgba(168,184,174,0.14);
          overflow: hidden;
        }
        .bd-fill {
          height: 100%;
          width: 0%;
          border-radius: 3px;
          background: var(--ec-accent);
          animation: ecgrow 0.8s cubic-bezier(0.2,0.7,0.2,1) forwards;
          animation-delay: 0.1s;
        }
        @keyframes ecgrow { to { width: var(--target-w); } }
        .bd-value { font-family: 'JetBrains Mono', monospace; font-size: 12px; text-align: right; color: var(--ec-hi); }

        .feed { display: flex; flex-direction: column; gap: 2px; max-height: 168px; overflow-y: auto; }
        .feed-item { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--ec-border); }
        .feed-item:last-child { border-bottom: none; }
        .feed-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ec-accent); margin-top: 6px; flex-shrink: 0; }
        .feed-body { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .feed-top { display: flex; justify-content: space-between; font-size: 12.5px; }
        .feed-id { font-family: 'JetBrains Mono', monospace; color: var(--ec-sage); font-size: 11.5px; }
        .feed-score { color: var(--ec-hi); font-weight: 500; }
        .feed-time { font-size: 11px; color: var(--ec-sage); }

        .climate-strip {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          background: var(--ec-panel-2);
          border: 1px solid var(--ec-border);
          border-radius: 14px;
          padding: 14px 20px;
          margin: 0 32px 32px;
          font-size: 12.5px;
        }
        .climate-loc { display: flex; align-items: center; gap: 7px; color: var(--ec-hi); font-weight: 500; }
        .climate-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ec-warn); }
        .climate-readings { display: flex; gap: 16px; color: var(--ec-sage); }
        .climate-read { display: flex; align-items: center; gap: 5px; }
        .climate-context {
          margin-left: auto;
          color: var(--ec-sage);
          font-style: italic;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
        }
        @media (max-width: 720px) {
          .climate-context { margin-left: 0; width: 100%; }
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          margin-top: 4px;
          border-top: 1px solid var(--ec-border);
        }
        .stat-cell { text-align: center; flex: 1; }
        .stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 600; color: var(--ec-hi); }
        .stat-cap { font-size: 10.5px; color: var(--ec-sage); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }

        .ec-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ec-user-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(95,206,143,0.16);
          color: var(--ec-accent);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 12px;
        }
        .ec-user-name { font-size: 13px; color: var(--ec-hi); }
        .ec-user-loc { font-size: 11px; color: var(--ec-sage); display: flex; align-items: center; gap: 4px; }
        .logout-btn {
          width: 30px; height: 30px;
          border-radius: 9px;
          border: 1px solid var(--ec-border);
          background: transparent;
          color: var(--ec-sage);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 14px;
        }
        .logout-btn:hover { color: var(--ec-warn); border-color: var(--ec-warn); }

        .panel-loading {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--ec-sage);
          padding: 14px 0;
        }
        .spin-light { border: 2px solid rgba(168,184,174,0.25); border-top-color: var(--ec-accent); }
        .panel-error {
          display: flex; align-items: center; gap: 8px;
          font-size: 12.5px; color: var(--ec-warn);
          background: rgba(232,137,107,0.1);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .retry-btn {
          margin-left: auto;
          background: transparent;
          border: 1px solid var(--ec-warn);
          color: var(--ec-warn);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11.5px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .retry-btn:hover { background: rgba(232,137,107,0.14); }

        .rec-list { list-style: none; margin: 0 0 18px; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .rec-item {
          display: flex; align-items: flex-start; gap: 9px;
          font-size: 13px; color: var(--ec-hi);
          line-height: 1.5;
          opacity: 0;
          animation: ecfadein 0.45s ease forwards;
        }
        .rec-icon { color: var(--ec-accent); font-size: 14px; margin-top: 2px; flex-shrink: 0; }
        .rec-summary {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--ec-border);
          padding-top: 14px;
        }
        .rec-summary-cell {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          font-size: 13px; color: var(--ec-sage); flex: 1;
        }
        .rec-summary-cell span { font-family: 'JetBrains Mono', monospace; color: var(--ec-hi); font-size: 13px; }
        .rec-summary-cell small { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; }

        .chat-window {
          display: flex; flex-direction: column; gap: 8px;
          max-height: 220px; min-height: 90px;
          overflow-y: auto;
          margin-bottom: 12px;
          padding-right: 2px;
        }
        .chat-bubble {
          max-width: 84%;
          padding: 9px 12px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.45;
        }
        .chat-bubble.bot { background: var(--ec-panel-2); color: var(--ec-hi); align-self: flex-start; border-bottom-left-radius: 3px; }
        .chat-bubble.bot.err { color: var(--ec-warn); }
        .chat-bubble.user { background: rgba(95,206,143,0.16); color: var(--ec-accent); align-self: flex-end; border-bottom-right-radius: 3px; }
        .chat-bubble.typing { display: flex; gap: 4px; padding: 12px 14px; }
        .chat-bubble.typing .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ec-sage); animation: ecdot 1s infinite ease-in-out; }
        .chat-bubble.typing .dot:nth-child(2) { animation-delay: 0.15s; }
        .chat-bubble.typing .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes ecdot { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
        .chat-input-row { display: flex; gap: 8px; }
        .chat-input-row input {
          flex: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--ec-border);
          border-radius: 10px;
          padding: 10px 12px;
          color: var(--ec-hi);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          outline: none;
        }
        .chat-input-row input:focus { border-color: var(--ec-accent); }
        .chat-input-row input::placeholder { color: var(--ec-sage); }
        .chat-send {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: none;
          background: var(--ec-accent);
          color: #0E1410;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          font-size: 15px;
        }
        .chat-send:disabled { opacity: 0.4; cursor: default; }

        .log-error-banner {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--ec-warn);
          background: rgba(232,137,107,0.1);
          border-radius: 10px;
          padding: 9px 12px;
          margin-top: 14px;
        }

        .auth-screen {
          background: var(--ec-bg, #0E1410);
          font-family: 'Inter', sans-serif;
          border-radius: 20px;
          padding: 56px 24px;
          display: flex;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .auth-screen.in { opacity: 1; transform: translateY(0); }
        .auth-screen * { box-sizing: border-box; }
        .auth-card { width: 100%; max-width: 360px; }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600; font-size: 17px; color: #F2F5F1;
          margin-bottom: 28px;
        }
        .auth-h1 { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 24px; color: #F2F5F1; margin: 0 0 6px; }
        .auth-sub { color: #A8B8AE; font-size: 13.5px; margin: 0 0 24px; line-height: 1.5; }
        .auth-tabs { display: flex; gap: 4px; background: #1B2620; border-radius: 11px; padding: 4px; margin-bottom: 22px; }
        .auth-tab {
          flex: 1; padding: 9px 0; border: none; background: transparent;
          color: #A8B8AE; border-radius: 8px; cursor: pointer;
          font-family: 'Inter', sans-serif; font-size: 13px;
          transition: all 0.15s ease;
        }
        .auth-tab.active { background: #5FCE8F; color: #0E1410; font-weight: 500; }
        .auth-field {
          display: flex; align-items: center; gap: 10px;
          background: #1B2620;
          border: 1px solid rgba(168,184,174,0.14);
          border-radius: 11px;
          padding: 11px 13px;
          margin-bottom: 12px;
        }
        .auth-field:focus-within { border-color: #5FCE8F; }
        .auth-input-icon { color: #A8B8AE; font-size: 15px; display: flex; flex-shrink: 0; }
        .auth-field input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #F2F5F1; font-family: 'Inter', sans-serif; font-size: 13.5px;
        }
        .auth-field input::placeholder { color: #6B7A71; }
        .auth-error {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #E8896B;
          background: rgba(232,137,107,0.1);
          border-radius: 10px; padding: 10px 12px; margin-bottom: 4px;
        }
      `}</style>

      <div className="ec-grain" />

      <nav className="ec-nav">
        <div className="ec-brand">
          <span className="ec-brand-icon"><IconLeaf /></span>
          EcoTrack
        </div>
        <div className="ec-user">
          <div className="ec-user-avatar">{(user?.name || "?").slice(0, 1).toUpperCase()}</div>
          <div>
            <div className="ec-user-name">{user?.name || "Member"}</div>
            <div className="ec-user-loc"><IconMapPin />{user?.location || "—"}</div>
          </div>
          <button className="logout-btn" onClick={logout} aria-label="log out">
            <IconLogout />
          </button>
        </div>
      </nav>

      <div className={`ec-hero ${heroIn ? "in" : ""}`}>
        <div className="ec-eyebrow"><span className="ec-pulse" />live community comparison</div>
        <h1 className="ec-h1">Log today's footprint, see it land instantly.</h1>
        <p className="ec-sub">
          Transport, power, food — three numbers in, one score out. Watch how today
          stacks up against everyone else tracking this week.
        </p>
      </div>

      <div className="ec-grid">
        <div className="ec-panel">
          <div className="ec-panel-title">
            <span>log activity</span>
            <span className="mono">POST /log</span>
          </div>

          <div className="field-block">
            <span className="field-label">transport</span>
            <OptionRow name="transport" options={TRANSPORT_OPTIONS} value={transportType} onChange={setTransportType} />
          </div>

          <div className="field-block">
            <span className="field-label">distance · km</span>
            <div className="slider-row">
              <input
                className="ec-range"
                type="range"
                min="0"
                max="80"
                step="1"
                value={distanceKm}
                style={{ "--fill": `${(distanceKm / 80) * 100}%` }}
                onChange={(e) => setDistanceKm(+e.target.value)}
              />
              <span className="slider-value mono">{distanceKm} km</span>
            </div>
          </div>

          <div className="field-block">
            <span className="field-label">electricity · kwh</span>
            <div className="slider-row">
              <input
                className="ec-range"
                type="range"
                min="0"
                max="30"
                step="1"
                value={electricityKwh}
                style={{ "--fill": `${(electricityKwh / 30) * 100}%` }}
                onChange={(e) => setElectricityKwh(+e.target.value)}
              />
              <span className="slider-value mono">{electricityKwh} kwh</span>
            </div>
          </div>

          <div className="field-block" style={{ marginBottom: 24 }}>
            <span className="field-label">food</span>
            <OptionRow name="food" options={FOOD_OPTIONS} value={foodType} onChange={setFoodType} />
          </div>

          <button className="ec-submit" onClick={handleLog} disabled={submitting}>
            {submitting ? (
              <>
                <span className="spin" /> calculating
              </>
            ) : (
              <>log activity</>
            )}
          </button>

          {logError && (
            <div className="log-error-banner">
              <IconAlertCircle /> {logError} — showing a local estimate below.
            </div>
          )}

          {lastLog && (
            <div style={{ marginTop: 22 }}>
              <div className="ec-panel-title" style={{ marginBottom: 10 }}>
                <span>last entry breakdown</span>
                <span className="mono">{lastLog.score.toFixed(1)} kg</span>
              </div>
              <BreakdownBars breakdown={lastLog.breakdown} animateKey={animateKey} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="ec-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="ec-panel-title" style={{ width: "100%" }}>
              <span>your standing</span>
              <span className="mono">GET /stats</span>
            </div>

            {statsLoading && (
              <div className="panel-loading"><span className="spin spin-light" /> loading your stats</div>
            )}

            {statsError && !statsLoading && (
              <div className="panel-error" style={{ width: "100%" }}>
                <IconAlertCircle />
                <span>{statsError}</span>
                <button className="retry-btn" onClick={loadStats}>retry</button>
              </div>
            )}

            {stats && !statsLoading && !statsError && (
              <>
                <RadialGauge userScore={stats.userScore} communityAverage={stats.communityAverage} />
                <div className={`verdict ${better ? "good" : "bad"}`}>
                  {better
                    ? `${(stats.communityAverage - stats.userScore).toFixed(1)} kg below community average`
                    : `${(stats.userScore - stats.communityAverage).toFixed(1)} kg above community average`}
                </div>
                <div className="stats-row">
                  <div className="stat-cell">
                    <div className="stat-num">{stats.breakdown.transport}</div>
                    <div className="stat-cap">transport</div>
                  </div>
                  <div className="stat-cell">
                    <div className="stat-num">{stats.breakdown.electricity}</div>
                    <div className="stat-cap">power</div>
                  </div>
                  <div className="stat-cell">
                    <div className="stat-num">{stats.breakdown.food}</div>
                    <div className="stat-cap">food</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ec-panel">
            <div className="ec-panel-title">
              <span>recent activity</span>
              <span className="mono">feed</span>
            </div>
            <div className="feed">
              {feed.length === 0 ? (
                <div className="panel-loading">no activity logged yet this session</div>
              ) : (
                feed.map((entry) => <LogFeedItem key={entry.id} entry={entry} />)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ec-grid" style={{ paddingTop: 0 }}>
        <RecommendationsPanel />
        <ChatbotWidget />
      </div>

      {climateError && !climate && (
        <div className="climate-strip" style={{ color: "var(--ec-warn)" }}>
          <IconAlertCircle /> climate data unavailable — {climateError}
        </div>
      )}
      {climate && <ClimateStrip climate={climate} />}
    </div>
  );
}

/* ---------------- root — just decides which screen, no data ownership ---------------- */

export default function EcoTrackApp() {
  useFonts();
  const token = useEcoTrackStore((s) => s.token);

  if (!token) {
    return <AuthGate />;
  }

  return <Dashboard />;
}