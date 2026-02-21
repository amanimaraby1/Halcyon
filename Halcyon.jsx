import { useState, useEffect, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const GENTLE_NUDGES = [
  "What small thing made you smile today?",
  "Describe a moment of quiet you found today.",
  "Who brought warmth into your world today?",
  "What did you notice today that you usually overlook?",
  "What is something your body did today that you're grateful for?",
  "Name a sound that felt like peace today.",
  "What surprised you gently today?",
  "What moment today would you want to revisit?",
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const hashPassword = async (pw) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

// ─── Community Moments (mock data with gradient placeholder images) ──────────

const COMMUNITY_MOMENTS = [
  { id:1, quote:"Finding peace in the quiet moments of nature", author:"Sarah M.", location:"Vancouver, BC", likes:342, gradient:"linear-gradient(160deg,#2d4a3e 0%,#1a2f28 40%,#0d1f1a 100%)", emoji:"🪨" },
  { id:2, quote:"Grateful for the simple ritual of morning journaling", author:"Michael T.", location:"Portland, OR", likes:287, gradient:"linear-gradient(160deg,#3d2a35 0%,#2a1a25 40%,#1a0f18 100%)", emoji:"📔" },
  { id:3, quote:"Every sunrise is a new beginning, a fresh start", author:"Elena K.", location:"Boulder, CO", likes:419, gradient:"linear-gradient(160deg,#2a3545 0%,#1a2535 40%,#0f1825 100%)", emoji:"🌄" },
  { id:4, quote:"The ocean teaches me to let go and flow with life", author:"James L.", location:"San Diego, CA", likes:412, gradient:"linear-gradient(160deg,#1a3040 0%,#0f2030 40%,#081520 100%)", emoji:"🌊" },
  { id:5, quote:"Mindfulness is not about being somewhere else, but being here", author:"Yuki S.", location:"Kyoto, Japan", likes:356, gradient:"linear-gradient(160deg,#2a3520 0%,#1a2515 40%,#0f180d 100%)", emoji:"🌿" },
  { id:6, quote:"Morning light and coffee — my daily meditation", author:"Anna P.", location:"Copenhagen, Denmark", likes:395, gradient:"linear-gradient(160deg,#3a2a1a 0%,#2a1a0f 40%,#1a0f08 100%)", emoji:"☕" },
];

// ─── Global styles ────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
    :root {
      --ocean:#0a1628; --deep:#0e1e38; --tide:#1a3050;
      --mist:#6b8caa; --fog:#8fafc8; --seafoam:#4ecdc4;
      --seafoam-dark:#3ab8af;
      --seafoam-20:rgba(78,205,196,0.2); --seafoam-10:rgba(78,205,196,0.07);
      --dawn:#f0ede8; --ink:#c8dce8; --ink-light:#a8c4d8;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#0d1117;overflow-x:hidden;}
    textarea{resize:none;outline:none;}
    textarea::placeholder{color:var(--mist);}
    input{outline:none;}
    input::placeholder{color:#4a6070 !important;}
    input:focus{border-color:rgba(78,205,196,0.5) !important;}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(78,205,196,0.4)}50%{box-shadow:0 0 0 14px rgba(78,205,196,0)}}
    @keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.4)}100%{transform:scale(1)}}
    .fade-up{animation:fadeUp 0.7s ease both;}
    .fade-in{animation:fadeIn 0.5s ease both;}
    .delay-1{animation-delay:0.08s;}
    .delay-2{animation-delay:0.18s;}
    .delay-3{animation-delay:0.3s;}
    .delay-4{animation-delay:0.42s;}
    .heart-pop{animation:heartPop 0.35s ease;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:rgba(78,205,196,0.2);border-radius:4px;}
  `}</style>
);

// ─── Kingfisher Logo SVG ──────────────────────────────────────────────────────

function KingfisherLogo({ size = 60 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(145deg, #1a3a4a 0%, #0d2535 100%)",
      border: "2px solid rgba(78,205,196,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 20px rgba(78,205,196,0.15), 0 0 0 6px rgba(78,205,196,0.05)",
      flexShrink: 0,
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none">
        {/* Body */}
        <ellipse cx="20" cy="22" rx="8" ry="11" fill="#2d8a9a"/>
        {/* Wing highlight */}
        <ellipse cx="17" cy="20" rx="4" ry="7" fill="#1a6a7a" opacity="0.6"/>
        {/* Breast */}
        <ellipse cx="22" cy="25" rx="4" ry="6" fill="#e8954a"/>
        {/* Head */}
        <circle cx="20" cy="13" r="6" fill="#2d8a9a"/>
        {/* Crown stripe */}
        <rect x="14" y="9" width="12" height="3" rx="1.5" fill="#1a5a6a"/>
        {/* Eye */}
        <circle cx="22" cy="12" r="1.5" fill="white"/>
        <circle cx="22.5" cy="12" r="0.7" fill="#111"/>
        {/* Beak */}
        <path d="M26 13 L32 11 L26 15 Z" fill="#c0612a"/>
        {/* Tail */}
        <path d="M18 32 L14 38 L20 33 L26 38 L22 32 Z" fill="#1a5a6a"/>
        {/* Feet */}
        <path d="M18 33 L16 36 M18 33 L18 36 M22 33 L22 36 M22 33 L24 36" stroke="#c0612a" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// ─── Community Moment Card ────────────────────────────────────────────────────

function MomentCard({ moment, delay = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(moment.likes);
  const [animating, setAnimating] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
  };

  return (
    <div className="fade-up" style={{ animationDelay: `${delay}s`, width: "100%" }}>
      <div style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        background: "#111820",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 12,
        position: "relative",
      }}>
        {/* Image area */}
        <div style={{
          height: 220,
          background: moment.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Atmospheric overlay */}
          <div style={{ position:"absolute",inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)" }}/>
          {/* Large emoji as photo stand-in */}
          <div style={{ fontSize: 72, filter: "saturate(0.6) brightness(0.7)", position:"relative", zIndex:1 }}>
            {moment.emoji}
          </div>
          {/* Like button overlay */}
          <button
            onClick={handleLike}
            className={animating ? "heart-pop" : ""}
            style={{
              position:"absolute", top:12, right:12,
              background: liked ? "rgba(255,80,100,0.85)" : "rgba(0,0,0,0.45)",
              border: "none", borderRadius: 20,
              padding:"6px 12px",
              display:"flex", alignItems:"center", gap:5,
              cursor:"pointer",
              backdropFilter:"blur(8px)",
              transition:"background 0.2s",
              zIndex:2,
            }}
          >
            <span style={{ fontSize:13 }}>{liked ? "❤️" : "🤍"}</span>
            <span style={{ color:"white", fontSize:12, fontFamily:"'Jost',sans-serif", fontWeight:500 }}>{likeCount}</span>
          </button>
        </div>

        {/* Quote + meta */}
        <div style={{ padding:"16px 18px 18px" }}>
          <p style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:16, fontStyle:"italic", fontWeight:300,
            color:"#d8e8f0", lineHeight:1.65, marginBottom:14,
          }}>
            "{moment.quote}"
          </p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Avatar */}
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:`linear-gradient(135deg, #2d8a9a, #1a5a7a)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, color:"white", fontWeight:600,
                fontFamily:"'Jost',sans-serif",
                flexShrink:0,
              }}>
                {moment.author.charAt(0)}
              </div>
              <span style={{ color:"#8fafc8", fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:400 }}>
                {moment.author}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:10 }}>📍</span>
              <span style={{ color:"#5a7a8a", fontSize:11, fontFamily:"'Jost',sans-serif", letterSpacing:0.5 }}>
                {moment.location}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onSignUp, onSignIn }) {
  return (
    <div style={{
      minHeight:"100vh",
      background:"#0d1117",
      fontFamily:"'Jost',sans-serif",
      maxWidth:480,
      margin:"0 auto",
      position:"relative",
    }}>
      <GlobalStyles />

      {/* Subtle top gradient */}
      <div style={{ position:"fixed",top:0,left:0,right:0,height:300, background:"radial-gradient(ellipse at 50% 0%,rgba(78,205,196,0.08) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      {/* Header section */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"48px 24px 32px",
        position:"relative", zIndex:1,
        textAlign:"center",
      }}>
        {/* Logo */}
        <div className="fade-up" style={{ marginBottom:16, animation:"floatY 5s ease-in-out infinite, fadeUp 0.6s ease both" }}>
          <KingfisherLogo size={72} />
        </div>

        {/* Wordmark */}
        <h1 className="fade-up delay-1" style={{
          fontFamily:"'Jost',sans-serif",
          fontSize:22, fontWeight:600,
          color:"#e8f0f4", letterSpacing:6,
          textTransform:"uppercase", marginBottom:8,
        }}>
          HALCYON
        </h1>

        {/* Tagline */}
        <p className="fade-up delay-1" style={{
          fontSize:13, color:"#5a7a8a",
          letterSpacing:0.3, marginBottom:24, lineHeight:1.5,
        }}>
          Join thousands finding serenity through daily gratitude
        </p>

        {/* Divider with sparkle */}
        <div className="fade-up delay-2" style={{
          display:"flex", alignItems:"center", gap:12, marginBottom:20, width:"100%", maxWidth:280,
        }}>
          <div style={{ flex:1, height:1, background:"rgba(78,205,196,0.15)" }}/>
          <span style={{ color:"#4ecdc4", fontSize:14 }}>✦</span>
          <div style={{ flex:1, height:1, background:"rgba(78,205,196,0.15)" }}/>
        </div>

        {/* Main CTA headline */}
        <h2 className="fade-up delay-2" style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:24, fontWeight:400,
          color:"#e8f0f4", lineHeight:1.4,
          marginBottom:28, letterSpacing:0.3,
        }}>
          Ready to share your own<br/>halcyon moments?
        </h2>

        {/* Primary CTA button */}
        <button
          className="fade-up delay-3"
          onClick={onSignUp}
          style={{
            width:"100%", maxWidth:320,
            background:"linear-gradient(135deg,#4ecdc4,#3ab8af)",
            border:"none", borderRadius:40,
            padding:"17px 32px",
            color:"#0a1f1e",
            fontFamily:"'Jost',sans-serif",
            fontSize:13, fontWeight:700,
            letterSpacing:2, textTransform:"uppercase",
            cursor:"pointer",
            boxShadow:"0 8px 32px rgba(78,205,196,0.35)",
            transition:"all 0.25s",
            marginBottom:16,
          }}
          onMouseEnter={e=>e.target.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.target.style.transform="translateY(0)"}
        >
          Begin Journaling
        </button>

        {/* Sign in link */}
        <button
          className="fade-up delay-3"
          onClick={onSignIn}
          style={{
            background:"none", border:"none", cursor:"pointer",
            color:"#5a7a8a", fontSize:13,
            fontFamily:"'Jost',sans-serif", letterSpacing:0.5,
            padding:"8px 16px",
          }}
        >
          Already have an account? <span style={{ color:"#4ecdc4" }}>Sign in</span>
        </button>
      </div>

      {/* Community Moments section */}
      <div style={{ position:"relative", zIndex:1, padding:"8px 16px 48px" }}>
        {/* Section header */}
        <div style={{
          display:"flex", alignItems:"center", gap:12,
          marginBottom:20, padding:"0 4px",
        }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
          <p style={{
            fontSize:10, color:"#4a6070",
            letterSpacing:3, textTransform:"uppercase",
            fontFamily:"'Jost',sans-serif", fontWeight:500,
          }}>
            Community Moments
          </p>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
        </div>

        {/* Cards */}
        {COMMUNITY_MOMENTS.map((moment, i) => (
          <MomentCard key={moment.id} moment={moment} delay={0.1 + i * 0.08} />
        ))}
      </div>
    </div>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────

function AuthForm({ mode: initialMode, onAuth, onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearError = () => setError("");

  const validate = () => {
    if (mode === "signup" && !name.trim()) return "Please share your name.";
    if (!email.trim() || !email.includes("@")) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const hash = await hashPassword(password);
      if (mode === "signup") {
        let users = {};
        try { const r = await window.storage.get("halcyon_users", true); if (r) users = JSON.parse(r.value); } catch (_) {}
        if (users[email.toLowerCase()]) { setError("An account with this email already exists."); setLoading(false); return; }
        const userId = `u_${Date.now()}`;
        users[email.toLowerCase()] = { userId, name: name.trim(), email: email.toLowerCase(), hash };
        await window.storage.set("halcyon_users", JSON.stringify(users), true);
        onAuth({ userId, name: name.trim(), email: email.toLowerCase(), isNew: true });
      } else {
        let users = {};
        try { const r = await window.storage.get("halcyon_users", true); if (r) users = JSON.parse(r.value); } catch (_) {}
        const user = users[email.toLowerCase()];
        if (!user) { setError("No account found with this email."); setLoading(false); return; }
        if (user.hash !== hash) { setError("Incorrect password. Please try again."); setLoading(false); return; }
        onAuth({ userId: user.userId, name: user.name, email: user.email, isNew: false });
      }
    } catch (_) { setError("Something went quietly wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#0d1117",
      fontFamily:"'Jost',sans-serif",
      display:"flex", flexDirection:"column", alignItems:"center",
      padding:"0 0 40px",
      maxWidth:480, margin:"0 auto", position:"relative",
    }}>
      <GlobalStyles />
      <div style={{ position:"fixed",top:0,left:0,right:0,height:300, background:"radial-gradient(ellipse at 50% 0%,rgba(78,205,196,0.08) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

      {/* Top bar */}
      <div style={{
        width:"100%", display:"flex", alignItems:"center",
        padding:"20px 20px", position:"relative", zIndex:2,
      }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",color:"#5a7a8a",fontSize:13,fontFamily:"'Jost',sans-serif",letterSpacing:1,display:"flex",alignItems:"center",gap:6 }}>
          ← Back
        </button>
        <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
          <KingfisherLogo size={40} />
        </div>
        <div style={{ width:60 }}/>
      </div>

      {/* Form card */}
      <div className="fade-up" style={{
        width:"calc(100% - 40px)", maxWidth:400,
        background:"rgba(16,24,36,0.9)",
        border:"1px solid rgba(78,205,196,0.12)",
        borderRadius:24, padding:"36px 28px",
        backdropFilter:"blur(20px)",
        boxShadow:"0 24px 60px rgba(0,0,0,0.5)",
        position:"relative", zIndex:2,
        marginTop:8,
      }}>
        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:28, fontWeight:300, color:"#e8f0f4",
          letterSpacing:0.5, marginBottom:6, textAlign:"center",
        }}>
          {mode === "signup" ? "Create your sanctuary" : "Return to stillness"}
        </h2>
        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:14, fontStyle:"italic", fontWeight:300,
          color:"#5a7a8a", lineHeight:1.6, textAlign:"center", marginBottom:28,
        }}>
          {mode === "signup" ? "Your moments are yours alone — private and protected." : "Welcome back. Your moments have been waiting."}
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
          {mode === "signup" && (
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              <label style={{ fontSize:10,letterSpacing:2.5,color:"#4a6a7a",textTransform:"uppercase",fontWeight:600 }}>Your name</label>
              <input style={formInput} type="text" placeholder="What shall we call you?" value={name} onChange={e=>{setName(e.target.value);clearError();}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} autoFocus />
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            <label style={{ fontSize:10,letterSpacing:2.5,color:"#4a6a7a",textTransform:"uppercase",fontWeight:600 }}>Email</label>
            <input style={formInput} type="email" placeholder="your@email.com" value={email} onChange={e=>{setEmail(e.target.value);clearError();}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} autoFocus={mode==="signin"} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            <label style={{ fontSize:10,letterSpacing:2.5,color:"#4a6a7a",textTransform:"uppercase",fontWeight:600 }}>Password</label>
            <input style={formInput} type="password" placeholder={mode==="signup"?"Minimum 6 characters":"Your password"} value={password} onChange={e=>{setPassword(e.target.value);clearError();}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          </div>
        </div>

        {error && (
          <div style={{ background:"rgba(200,70,70,0.12)",border:"1px solid rgba(200,70,70,0.25)",borderRadius:10,padding:"10px 16px",fontSize:12,color:"#e8a0a0",marginBottom:16,lineHeight:1.5 }}>
            {error}
          </div>
        )}

        <button
          style={{
            width:"100%",
            background: loading ? "rgba(78,205,196,0.4)" : "linear-gradient(135deg,#4ecdc4,#3ab8af)",
            border:"none", borderRadius:40, padding:"16px",
            color:"#0a1f1e", fontFamily:"'Jost',sans-serif",
            fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 6px 24px rgba(78,205,196,0.3)",
            transition:"all 0.2s", marginBottom:20,
          }}
          onClick={handleSubmit} disabled={loading}
        >
          {loading ? "A moment…" : mode === "signup" ? "Create My Sanctuary" : "Enter"}
        </button>

        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
          <span style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }}/>
          <span style={{ fontSize:10,color:"#3a5060",letterSpacing:2,textTransform:"uppercase" }}>or</span>
          <span style={{ flex:1,height:1,background:"rgba(255,255,255,0.06)" }}/>
        </div>

        <button
          style={{ width:"100%",background:"none",border:"1px solid rgba(78,205,196,0.15)",borderRadius:40,padding:"14px",color:"#5a7a8a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:12,letterSpacing:1.5,textTransform:"uppercase",transition:"all 0.2s" }}
          onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
        >
          {mode === "signup" ? "Sign in instead" : "Create new account"}
        </button>
      </div>
    </div>
  );
}

const formInput = {
  background:"rgba(10,18,28,0.7)",
  border:"1px solid rgba(78,205,196,0.15)",
  borderRadius:12, padding:"13px 16px",
  color:"#c8dce8", fontFamily:"'Jost',sans-serif",
  fontSize:14, width:"100%",
  transition:"border-color 0.3s",
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ name, onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🌊", title:`Welcome, ${name}`, body:"Named after the mythical bird that calmed the seas — this is your quiet corner. A place to notice the small, beautiful moments that make up a life." },
    { icon:"🕊", title:"What is a Halcyon Moment?", body:"It's that instant when everything feels briefly, perfectly still. A warm cup of tea. A kind word. The way light fell through a window. You already have them." },
    { icon:"✦", title:"One moment a day", body:"No pressure, no performance. Just one small reflection each day. That's all Halcyon asks of you." },
  ];
  const s = steps[step];
  return (
    <div style={{ minHeight:"100vh",background:"#0d1117",fontFamily:"'Jost',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative" }}>
      <GlobalStyles />
      <div style={{ position:"fixed",top:"-20%",left:"-10%",width:"70vw",height:"70vw",background:"radial-gradient(ellipse,rgba(30,70,120,0.4) 0%,transparent 70%)",pointerEvents:"none" }}/>
      <div style={{ position:"fixed",bottom:"-20%",right:"-10%",width:"60vw",height:"60vw",background:"radial-gradient(ellipse,rgba(78,205,196,0.06) 0%,transparent 70%)",pointerEvents:"none" }}/>
      <div className="fade-up" style={{ maxWidth:420,width:"100%",textAlign:"center",position:"relative",zIndex:2 }}>
        <div style={{ fontSize:52,marginBottom:20,animation:"floatY 3s ease-in-out infinite" }}>{s.icon}</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:300,color:"#e8f0f4",letterSpacing:1,marginBottom:16 }}>{s.title}</h2>
        <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",fontWeight:300,color:"#6b8caa",lineHeight:1.9,marginBottom:32 }}>{s.body}</p>
        <div style={{ display:"flex",gap:8,justifyContent:"center",marginBottom:32 }}>
          {steps.map((_,i)=><div key={i} style={{ width:i===step?20:6,height:6,borderRadius:3,background:i===step?"#4ecdc4":"rgba(78,205,196,0.2)",transition:"all 0.4s" }}/>)}
        </div>
        {step < steps.length - 1
          ? <button style={{ background:"linear-gradient(135deg,#4ecdc4,#3ab8af)",border:"none",borderRadius:40,padding:"14px 40px",color:"#0a1f1e",fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",boxShadow:"0 6px 24px rgba(78,205,196,0.3)" }} onClick={()=>setStep(s=>s+1)}>Continue</button>
          : <button style={{ background:"linear-gradient(135deg,#4ecdc4,#3ab8af)",border:"none",borderRadius:40,padding:"14px 40px",color:"#0a1f1e",fontFamily:"'Jost',sans-serif",fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",boxShadow:"0 6px 24px rgba(78,205,196,0.3)" }} onClick={onComplete}>Begin my journey</button>}
      </div>
    </div>
  );
}

// ─── Ripple Timeline ──────────────────────────────────────────────────────────

function RippleTimeline({ entries }) {
  const sorted = [...entries].sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(-60);
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:"#e8f0f4",letterSpacing:2,textAlign:"center",marginBottom:24 }}>Your Halcyon Journey</p>
      {sorted.length === 0 ? (
        <p style={{ color:"#5a7a8a",fontSize:14,marginTop:24,textAlign:"center",fontStyle:"italic" }}>Your journey begins with your first entry.</p>
      ) : (
        <div style={{ position:"relative",width:"100%",maxWidth:480,paddingTop:16 }}>
          <svg width="100%" height={sorted.length*52+40} style={{ position:"absolute",top:0,left:0,pointerEvents:"none" }}>
            <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.5"/><stop offset="100%" stopColor="#1a3050" stopOpacity="0.1"/></linearGradient></defs>
            {sorted.map((_,i)=>i===0?null:<line key={i} x1="50%" y1={i*52-4} x2="50%" y2={i*52+20} stroke="url(#lg)" strokeWidth="2"/>)}
          </svg>
          {sorted.map(entry=>(
            <div key={entry.id} style={{ display:"flex",alignItems:"center",gap:16,marginBottom:4,position:"relative",zIndex:1 }}>
              <div style={{ flex:"0 0 48px",display:"flex",justifyContent:"flex-end",paddingRight:8 }}>
                <div style={{ width:16,height:16,borderRadius:"50%",background:"#4ecdc4",boxShadow:"0 0 0 4px rgba(78,205,196,0.2), 0 0 0 8px rgba(78,205,196,0.07)",flexShrink:0 }}/>
              </div>
              <div style={{ flex:1,paddingBottom:36 }}>
                <p style={{ fontSize:11,color:"#4ecdc4",letterSpacing:1,textTransform:"uppercase",marginBottom:3 }}>{formatDate(entry.date)}</p>
                <p style={{ fontSize:14,color:"#a8c4d8",lineHeight:1.6 }}>{entry.text.length>80?entry.text.slice(0,80)+"…":entry.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Treasury Modal ───────────────────────────────────────────────────────────

function TranquilTreasury({ entries, onClose }) {
  const [idx, setIdx] = useState(0);
  const sorted = [...entries].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(5,10,18,0.9)",backdropFilter:"blur(12px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
      <div style={{ background:"rgba(13,20,32,0.97)",border:"1px solid rgba(78,205,196,0.15)",borderRadius:24,padding:"36px 28px",width:"100%",maxWidth:420,boxShadow:"0 40px 80px rgba(0,0,0,0.6)",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:"#e8f0f4",letterSpacing:2,textAlign:"center",marginBottom:24 }}>Tranquil Treasury</p>
        {sorted.length === 0 ? (
          <p style={{ color:"#5a7a8a",textAlign:"center",padding:"16px 0 28px",fontSize:14,fontStyle:"italic" }}>No moments collected yet.</p>
        ) : (
          <div style={{ textAlign:"center",padding:"8px 0 24px" }}>
            <p style={{ fontSize:12,color:"#4ecdc4",letterSpacing:2,textTransform:"uppercase",marginBottom:20 }}>{formatDate(sorted[idx].date)}</p>
            <div style={{ background:"rgba(8,14,24,0.7)",border:"1px solid rgba(78,205,196,0.1)",borderRadius:16,padding:"28px 24px" }}>
              <div style={{ fontSize:28,marginBottom:16,animation:"floatY 4s ease-in-out infinite" }}>🕊</div>
              <p style={{ fontSize:16,color:"#c8dce8",lineHeight:1.9,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",fontWeight:300 }}>"{sorted[idx].text}"</p>
            </div>
            <p style={{ fontSize:12,color:"#4a6a7a",marginTop:16 }}>{idx+1} of {sorted.length}</p>
          </div>
        )}
        <div style={{ display:"flex",gap:12,justifyContent:"center",marginBottom:12 }}>
          <button style={{ background:"transparent",border:"1px solid rgba(78,205,196,0.15)",borderRadius:30,padding:"9px 22px",color:"#5a7a8a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:idx===0?0.3:1 }} onClick={()=>setIdx(i=>Math.max(0,i-1))} disabled={idx===0}>← Earlier</button>
          <button style={{ background:"transparent",border:"1px solid rgba(78,205,196,0.15)",borderRadius:30,padding:"9px 22px",color:"#5a7a8a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:idx===sorted.length-1?0.3:1 }} onClick={()=>setIdx(i=>Math.min(sorted.length-1,i+1))} disabled={idx===sorted.length-1}>Later →</button>
        </div>
        <button style={{ background:"transparent",border:"1px solid rgba(78,205,196,0.1)",borderRadius:30,padding:"11px",width:"100%",textAlign:"center",color:"#4a6a7a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase" }} onClick={onClose}>Return to calm</button>
      </div>
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────

export default function Halcyon() {
  const [authUser, setAuthUser] = useState(null);
  const [appState, setAppState] = useState("loading"); // loading | landing | auth | onboarding | app
  const [authMode, setAuthMode] = useState("signup");
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("daily");
  const [showTreasury, setShowTreasury] = useState(false);
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nudge] = useState(() => GENTLE_NUDGES[Math.floor(Math.random() * GENTLE_NUDGES.length)]);

  const today = todayStr();
  const todayEntry = entries.find(e => e.date === today);

  useEffect(() => {
    const restore = async () => {
      try {
        const sess = await window.storage.get("halcyon_session");
        if (sess) {
          const user = JSON.parse(sess.value);
          setAuthUser(user);
          const en = await window.storage.get(`halcyon_entries_${user.userId}`);
          if (en) setEntries(JSON.parse(en.value));
          setAppState("app");
          return;
        }
      } catch (_) {}
      setAppState("landing");
    };
    restore();
  }, []);

  const handleAuth = async ({ userId, name, email, isNew }) => {
    const user = { userId, name, email };
    setAuthUser(user);
    await window.storage.set("halcyon_session", JSON.stringify(user));
    if (isNew) {
      setAppState("onboarding");
    } else {
      try {
        const en = await window.storage.get(`halcyon_entries_${userId}`);
        if (en) setEntries(JSON.parse(en.value));
      } catch (_) {}
      setAppState("app");
    }
  };

  const handleSignOut = async () => {
    try { await window.storage.delete("halcyon_session"); } catch (_) {}
    setAuthUser(null); setEntries([]); setSaved(false); setText(""); setView("daily");
    setAppState("landing");
  };

  const saveEntry = async () => {
    if (!text.trim() || !authUser) return;
    setSaving(true);
    const newEntry = { id: Date.now(), date: today, text: text.trim() };
    const updated = [...entries.filter(e => e.date !== today), newEntry];
    setEntries(updated);
    try { await window.storage.set(`halcyon_entries_${authUser.userId}`, JSON.stringify(updated)); } catch (_) {}
    await new Promise(r => setTimeout(r, 700));
    setSaving(false); setSaved(true);
  };

  const streak = (() => {
    let count = 0; const d = new Date();
    while (true) {
      const ds = d.toISOString().slice(0,10);
      if (entries.find(e=>e.date===ds)) { count++; d.setDate(d.getDate()-1); } else break;
    }
    return count;
  })();

  if (appState === "loading") return (
    <div style={{ minHeight:"100vh",background:"#0d1117",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <GlobalStyles />
      <KingfisherLogo size={48} />
    </div>
  );

  if (appState === "landing") return (
    <LandingPage
      onSignUp={() => { setAuthMode("signup"); setAppState("auth"); }}
      onSignIn={() => { setAuthMode("signin"); setAppState("auth"); }}
    />
  );

  if (appState === "auth") return (
    <AuthForm
      mode={authMode}
      onAuth={handleAuth}
      onBack={() => setAppState("landing")}
    />
  );

  if (appState === "onboarding") return (
    <Onboarding name={authUser?.name || ""} onComplete={() => setAppState("app")} />
  );

  // ── Main journaling app ──
  return (
    <div style={{ minHeight:"100vh",background:"#0d1117",fontFamily:"'Jost',sans-serif",color:"#c8dce8",position:"relative",overflowX:"hidden",display:"flex",flexDirection:"column",alignItems:"center" }}>
      <GlobalStyles />
      <div style={{ position:"fixed",top:0,left:0,right:0,height:300,background:"radial-gradient(ellipse at 50% 0%,rgba(78,205,196,0.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>

      {/* Header */}
      <header style={{ position:"relative",zIndex:10,width:"100%",maxWidth:680,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 16px",flexWrap:"wrap",gap:12,borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <KingfisherLogo size={40} />
          <div>
            <h1 style={{ fontFamily:"'Jost',sans-serif",fontSize:16,fontWeight:600,color:"#e8f0f4",letterSpacing:4,textTransform:"uppercase" }}>HALCYON</h1>
            <p style={{ fontSize:9,letterSpacing:3,color:"#3a5a6a",textTransform:"uppercase",marginTop:2 }}>daily quiet</p>
          </div>
        </div>
        <nav style={{ display:"flex",gap:4,alignItems:"center" }}>
          {["daily","timeline"].map(v=>(
            <button key={v} style={{ background:view===v?"rgba(78,205,196,0.1)":"none",border:view===v?"1px solid rgba(78,205,196,0.25)":"1px solid transparent",borderRadius:20,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",fontWeight:500,transition:"all 0.2s",padding:"7px 16px",color:view===v?"#4ecdc4":"#5a7a8a" }} onClick={()=>setView(v)}>
              {v==="daily"?"Today":"Journey"}
            </button>
          ))}
          <button style={{ background:"none",border:"1px solid transparent",borderRadius:20,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",color:"#5a7a8a",padding:"7px 16px" }} onClick={()=>setShowTreasury(true)}>Treasury</button>
          <div style={{ width:1,height:16,background:"rgba(255,255,255,0.08)",margin:"0 4px" }}/>
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 14px",background:"rgba(10,18,28,0.6)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#4ecdc4",boxShadow:"0 0 6px #4ecdc4" }}/>
            <span style={{ color:"#8fafc8",fontSize:11,letterSpacing:0.5 }}>{authUser.name.split(" ")[0]}</span>
            <button style={{ background:"none",border:"none",cursor:"pointer",color:"#3a5a6a",fontSize:10,letterSpacing:1,textTransform:"uppercase",padding:0,marginLeft:4 }} onClick={handleSignOut}>out</button>
          </div>
        </nav>
      </header>

      {/* Streak */}
      {streak > 0 && (
        <div className="fade-up" style={{ position:"relative",zIndex:10,display:"flex",alignItems:"center",gap:8,fontSize:11,letterSpacing:2,color:"#4ecdc4",textTransform:"uppercase",border:"1px solid rgba(78,205,196,0.2)",borderRadius:20,padding:"6px 16px",background:"rgba(78,205,196,0.06)",margin:"16px 0 0" }}>
          <span>✦</span><span>{streak} day{streak!==1?"s":""} of stillness</span>
        </div>
      )}

      {/* Main content */}
      <main style={{ position:"relative",zIndex:5,flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px 60px",width:"100%" }}>

        {view === "daily" && (
          <div className="fade-up" style={{ width:"100%",maxWidth:520 }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontWeight:300,fontStyle:"italic",color:"#6b8caa",letterSpacing:1,marginBottom:20,textAlign:"center" }}>{formatDate(today)}</p>

            {todayEntry && saved ? (
              <div className="fade-up" style={{ background:"rgba(13,20,32,0.7)",border:"1px solid rgba(78,205,196,0.12)",borderRadius:20,padding:"40px 28px",backdropFilter:"blur(20px)",boxShadow:"0 24px 60px rgba(0,0,0,0.4)",textAlign:"center" }}>
                <div style={{ fontSize:36,marginBottom:16,animation:"floatY 4s ease-in-out infinite" }}>🕊</div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"#e8f0f4",marginBottom:20,letterSpacing:1 }}>Moment captured.</h3>
                <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",fontWeight:300,color:"#a8c4d8",lineHeight:1.8,borderLeft:"2px solid rgba(78,205,196,0.2)",paddingLeft:20,textAlign:"left",marginBottom:16 }}>"{todayEntry.text}"</p>
                <p style={{ fontSize:12,color:"#4a6a7a",letterSpacing:1,marginBottom:20 }}>Your Halcyon moment rests safely in the treasury.</p>
                <button style={{ background:"transparent",border:"1px solid rgba(78,205,196,0.15)",borderRadius:30,padding:"9px 22px",color:"#5a7a8a",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase" }} onClick={()=>{ setSaved(false); setText(todayEntry.text); }}>Edit this moment</button>
              </div>
            ) : (
              <div className="fade-up" style={{ background:"rgba(13,20,32,0.7)",border:"1px solid rgba(78,205,196,0.12)",borderRadius:20,padding:"32px 28px",backdropFilter:"blur(20px)",boxShadow:"0 24px 60px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:300,fontStyle:"italic",color:"#e8f0f4",lineHeight:1.6,textAlign:"center",letterSpacing:0.5 }}>✦ {nudge}</p>
                <div style={{ height:1,background:"linear-gradient(to right,transparent,rgba(78,205,196,0.2),transparent)",margin:"20px 0" }}/>
                <textarea
                  style={{ width:"100%",background:"transparent",border:"none",color:"#c8dce8",fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:300,lineHeight:1.9,letterSpacing:0.3 }}
                  value={text||(todayEntry?todayEntry.text:"")}
                  onChange={e=>setText(e.target.value)}
                  placeholder="Let your words settle gently here…"
                  rows={5} autoFocus
                />
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16 }}>
                  <p style={{ fontSize:12,color:"#4a6a7a",fontStyle:"italic" }}>{text.length>0?`${text.length} characters`:"No pressure. Take your time."}</p>
                  <button
                    style={{ background:text.trim()?"linear-gradient(135deg,#4ecdc4,#3ab8af)":"rgba(78,205,196,0.15)",border:"none",borderRadius:30,padding:"10px 24px",color:text.trim()?"#0a1f1e":"#3a5a6a",cursor:text.trim()?"pointer":"default",fontFamily:"'Jost',sans-serif",fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all 0.3s",boxShadow:text.trim()?"0 4px 16px rgba(78,205,196,0.3)":"none",animation:text.trim()?"pulse 3s ease-in-out infinite":"none" }}
                    onClick={saveEntry} disabled={!text.trim()||saving}
                  >{saving?"Settling…":"Save this moment"}</button>
                </div>
              </div>
            )}

            <p style={{ fontSize:11,color:"#3a5060",letterSpacing:2,textTransform:"uppercase",textAlign:"center",marginTop:24,fontWeight:300 }}>
              {entries.length===0?"Your first step into stillness.":`${entries.length} moment${entries.length!==1?"s":""} held in your treasury.`}
            </p>
          </div>
        )}

        {view === "timeline" && (
          <div className="fade-up" style={{ width:"100%",maxWidth:520 }}>
            <RippleTimeline entries={entries}/>
          </div>
        )}
      </main>

      {showTreasury && <TranquilTreasury entries={entries} onClose={()=>setShowTreasury(false)}/>}
    </div>
  );
}
