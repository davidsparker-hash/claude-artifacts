/* global React, Stage, Sprite, useTime, useTimeline, Easing, interpolate, animate, clamp */
// Tenet — First Experience Animation
// Long-form dialogue piece. Opens with a calm "call started" sequence,
// streams the conversation in the right column while the script outline
// organizes itself in the left workspace, and resolves into a boat on rough sea.

const DIALOGUE = window.DIALOGUE;

// ── Tokens ─────────────────────────────────────────────────────────────────
const INK         = '#1A1A1A';
const INK_MUTED   = '#6B6B6B';
const INK_FAINT   = '#9A9A9A';
const PAPER       = '#FFFFFF';
const PAPER_SOFT  = '#FAF8F4';
const AMBER       = '#BA7517';
const BORDER      = 'rgba(0,0,0,0.10)';

const SERIF = '"Source Serif 4", "Source Serif Pro", Georgia, serif';
const SANS  = '"Brown", "Avenir Next", "Helvetica Neue", system-ui, sans-serif';
// Script document font — deliberately generic, like a real screenplay file.
const SCRIPT_FONT = '"Times New Roman", Times, serif';

// ── Layout constants ───────────────────────────────────────────────────────
const W = 1920;
const H = 1080;
const TOOLBAR_X = 80;
const TOOLBAR_ICON_SIZE = 34;
const TOOLBAR_Y = {
  mic:    104,
  phone:  154,
  upload: 204,
  script: 254,
};

// Timing
const T_WORDMARK_IN     = 0.4;
const T_ICONS_IN        = 1.2;
const T_CURSOR_IN       = 2.4;
const T_CLICK           = 3.6;
const T_TOOLBAR_SETTLE  = 4.4;   // phone/upload reach their toolbar slots
const T_LISTENING       = 4.4;
const T_WAVE_IN         = 4.5;
const T_DIALOGUE_START  = 5.2;
const T_SCRIPT_ICON     = 'computed-from-half-dialogue';
// Color zone holds back until after the conversation has had time to breathe,
// so the bottom of the frame reads solid white through the opening minute.
const SEASCAPE_START    = 15.0;
const SIGNATURE_LEAD    = 2.5;   // seconds of hold before signature

// ── Helpers ────────────────────────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

// Build a dialogue timeline. Each line is assigned a start time based on word count.
// `pace` is a global multiplier (1 = normal, lower = faster).
function buildDialogueTimeline(dialogue, startAt, pace = 1) {
  let cursor = startAt;
  return dialogue.map((line) => {
    const words = line.t.split(/\s+/).length;
    // baseline: ~5 words/sec read rate, with min and small punctuation pause
    const dur = Math.max(0.42, words * 0.16 * pace);
    const gap = (/[.!?…]$/.test(line.t) ? 0.18 : 0.10) * pace;
    const entry = { ...line, time: cursor, dur };
    cursor += dur + gap;
    return entry;
  });
}

// ── Wordmark ───────────────────────────────────────────────────────────────
function Wordmark() {
  const t = useTime();
  const op = clamp((t - T_WORDMARK_IN) / 0.8, 0, 1);
  return (
    <div style={{
      position: 'absolute',
      top: 56, left: TOOLBAR_X,
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 400,
      fontSize: 21,
      letterSpacing: '0.02em',
      color: INK_FAINT,
      opacity: op,
    }}>
      tenet
    </div>
  );
}

// ── Icons (line-drawn, single weight) ──────────────────────────────────────
function MicIcon({ size = 26, stroke = INK, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="12" y="4"  width="8"  height="16" rx="4" stroke={stroke} strokeWidth={sw}/>
      <path d="M7 14a9 9 0 0 0 18 0"   stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M16 23v5"               stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M12 28h8"               stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}
function PhoneIcon({ size = 26, stroke = INK, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M7 6.5C7 5.7 7.7 5 8.5 5h3.2c.7 0 1.3.5 1.4 1.2l.7 4c.1.6-.2 1.2-.7 1.5l-2 1.2a14 14 0 0 0 7 7l1.2-2c.3-.5.9-.8 1.5-.7l4 .7c.7.1 1.2.7 1.2 1.4v3.2c0 .8-.7 1.5-1.5 1.5A18.5 18.5 0 0 1 7 6.5z"
            stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
    </svg>
  );
}
function UploadIcon({ size = 26, stroke = INK, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4v16M10 10l6-6 6 6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 22v4a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ScriptIcon({ size = 26, stroke = INK, sw = 1.5 }) {
  // line-drawn document with text rules
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 4h12l5 5v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
            stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
      <path d="M20 4v5h5" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/>
      <path d="M11 15h10M11 19h10M11 23h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}

// ── Action-bar icons for the script window ────────────────────
function PencilIcon({ size = 18, stroke = INK_MUTED, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4l6 6L8 22H2v-6L14 4z" stroke={stroke} strokeWidth={sw}/>
      <path d="M13 5l6 6" stroke={stroke} strokeWidth={sw}/>
    </svg>
  );
}
function ExpandIcon({ size = 18, stroke = INK_MUTED, sw = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9V4h5"     stroke={stroke} strokeWidth={sw}/>
      <path d="M20 9V4h-5"   stroke={stroke} strokeWidth={sw}/>
      <path d="M4 15v5h5"    stroke={stroke} strokeWidth={sw}/>
      <path d="M20 15v5h-5"  stroke={stroke} strokeWidth={sw}/>
    </svg>
  );
}
function DriveIcon({ size = 18, stroke = INK_MUTED, sw = 1.5 }) {
  // Simplified outline of the Google Drive prism — three folded faces.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         strokeLinejoin="round" strokeLinecap="round">
      <path d="M 8 3 L 16 3 L 19 9 L 5 9 Z"                              stroke={stroke} strokeWidth={sw}/>
      <path d="M 5 9 L 12 9 L 8 20 L 2 16 Z"                             stroke={stroke} strokeWidth={sw}/>
      <path d="M 12 9 L 19 9 L 22 16 L 14 20 L 8 20 Z"                   stroke={stroke} strokeWidth={sw}/>
    </svg>
  );
}
function DownloadGlyph({ size = 14, stroke = PAPER, sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12M6 12l6 6 6-6" stroke={stroke} strokeWidth={sw}/>
      <path d="M4 20h16"              stroke={stroke} strokeWidth={sw}/>
    </svg>
  );
}

// ── Avatar bubble ──────────────────────────────────────────────────────────
function Avatar({ letter, opacity = 1 }) {
  return (
    <div style={{
      width: 33, height: 33,
      borderRadius: '50%',
      border: `1px solid ${BORDER}`,
      background: PAPER_SOFT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: 12, fontWeight: 400,
      color: INK_MUTED,
      letterSpacing: '0.04em',
      opacity,
    }}>
      {letter}
    </div>
  );
}

// ── Opening icon flight + caller strip ─────────────────────────────────────
// Three icons (mic, phone, upload) start centered. On "click" at T_CLICK,
// they each fly to their toolbar slot on the upper-left.
// After settle, caller strip (bubbles + LISTENING) appears next to mic.
function CallInitiation({ initialA, initialB }) {
  const t = useTime();

  // Original centered positions (before flight)
  const CENTER_X = W / 2;
  const CENTER_Y = H / 2 - 60;
  const ICON_GAP = 80 + 26; // 80px gap edge-to-edge for 26px icons
  const baseMic    = { x: CENTER_X - ICON_GAP - 13, y: CENTER_Y };
  const basePhone  = { x: CENTER_X             - 13, y: CENTER_Y };
  const baseUpload = { x: CENTER_X + ICON_GAP - 13, y: CENTER_Y };

  // Target toolbar slots (upper-left)
  const tgt = {
    mic:    { x: TOOLBAR_X, y: TOOLBAR_Y.mic },
    phone:  { x: TOOLBAR_X, y: TOOLBAR_Y.phone },
    upload: { x: TOOLBAR_X, y: TOOLBAR_Y.upload },
  };

  // Icons fade in from t=T_ICONS_IN
  const iconsIn = clamp((t - T_ICONS_IN) / 0.7, 0, 1);

  // Flight phase: T_CLICK → T_TOOLBAR_SETTLE
  const fly = clamp((t - T_CLICK) / (T_TOOLBAR_SETTLE - T_CLICK), 0, 1);
  const flyE = easeInOutCubic(fly);

  function pos(base, target) {
    return {
      x: base.x + (target.x - base.x) * flyE,
      y: base.y + (target.y - base.y) * flyE,
    };
  }
  const micP    = pos(baseMic,    tgt.mic);
  const phoneP  = pos(basePhone,  tgt.phone);
  const uploadP = pos(baseUpload, tgt.upload);

  // Scale: 1 at center → smaller toolbar size at slot
  const finalScale = TOOLBAR_ICON_SIZE / 32;
  const scale = 1 + (finalScale - 1) * flyE;

  // Cursor appearance + amber hover glow
  const cursorIn   = t >= T_CURSOR_IN - 0.1 && t <= T_CLICK + 0.7;
  const hoverGlow  = clamp((t - (T_CLICK - 0.6)) / 0.4, 0, 1) * (t < T_CLICK ? 1 : Math.max(0, 1 - (t - T_CLICK) * 2.5));
  // Cursor travel from off-screen lower-right to the mic
  const travel = clamp((t - T_CURSOR_IN) / (T_CLICK - T_CURSOR_IN), 0, 1);
  const cE = easeInOutCubic(travel);
  const cursorX = 1300 + (baseMic.x - 1300) * cE;
  const cursorY = 800 + (baseMic.y + 4 - 800) * cE;
  const cursorOp = t < T_CURSOR_IN ? 0 : t > T_CLICK + 0.4 ? Math.max(0, 1 - (t - T_CLICK - 0.4) / 0.4) : 1;
  const clickDip = (t > T_CLICK - 0.05 && t < T_CLICK + 0.15) ? Math.sin((t - T_CLICK + 0.05) / 0.2 * Math.PI) * 2 : 0;

  // Ripple from click
  const rippleT = clamp((t - T_CLICK) / 0.7, 0, 1);
  const rippleVisible = rippleT > 0 && rippleT < 1;
  const rippleR = 14 + rippleT * 80;
  const rippleOp = (1 - rippleT) * 0.85;

  // BEGIN label fades out after click
  const beginOp = iconsIn * (1 - clamp((t - (T_CLICK - 0.4)) / 0.5, 0, 1));

  // Caller strip (bubbles + LISTENING) fades in after settle
  const listenOp = clamp((t - T_LISTENING) / 0.6, 0, 1);
  const breathing = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((t - T_LISTENING) * Math.PI * 0.7));

  return (
    <>
      {/* BEGIN label under centered icons (pre-click only) */}
      {t < T_CLICK + 0.6 && (
        <div style={{
          position: 'absolute',
          left: CENTER_X, top: CENTER_Y + 52,
          transform: 'translateX(-50%)',
          opacity: beginOp,
          fontFamily: SANS, fontSize: 11, fontWeight: 400,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: INK_FAINT,
        }}>
          Begin
        </div>
      )}

      {/* Hover glow under mic (only around click moment) */}
      {hoverGlow > 0.01 && (
        <div style={{
          position: 'absolute',
          left: baseMic.x + 13 - 36,
          top:  baseMic.y + 13 - 36,
          width: 72, height: 72, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(186,117,23,0.22) 0%, rgba(186,117,23,0) 60%)`,
          opacity: hoverGlow, pointerEvents: 'none',
        }}/>
      )}

      {/* Click ripple */}
      {rippleVisible && (
        <div style={{
          position: 'absolute',
          left: baseMic.x + 13 - rippleR,
          top:  baseMic.y + 13 - rippleR,
          width: rippleR * 2, height: rippleR * 2, borderRadius: '50%',
          border: `1.5px solid ${AMBER}`,
          opacity: rippleOp, pointerEvents: 'none',
        }}/>
      )}

      {/* Mic (flies to toolbar) */}
      <div style={{
        position: 'absolute', left: micP.x, top: micP.y,
        opacity: iconsIn, transform: `scale(${scale})`, transformOrigin: 'top left',
      }}>
        <MicIcon />
      </div>
      {/* Phone (flies to toolbar) */}
      <div style={{
        position: 'absolute', left: phoneP.x, top: phoneP.y,
        opacity: iconsIn, transform: `scale(${scale})`, transformOrigin: 'top left',
      }}>
        <PhoneIcon stroke={INK_MUTED} />
      </div>
      {/* Upload (flies to toolbar) */}
      <div style={{
        position: 'absolute', left: uploadP.x, top: uploadP.y,
        opacity: iconsIn, transform: `scale(${scale})`, transformOrigin: 'top left',
      }}>
        <UploadIcon stroke={INK_MUTED} />
      </div>

      {/* Cursor */}
      {cursorIn && (
        <div style={{
          position: 'absolute', left: cursorX, top: cursorY + clickDip,
          opacity: cursorOp, pointerEvents: 'none',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))',
        }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
            <path d="M1 1 L1 18 L5.5 14 L8.5 20 L11 19 L8 13 L14 13 Z"
                  fill={INK} stroke={PAPER} strokeWidth="0.8" strokeLinejoin="round"/>
            <circle cx="1" cy="1" r="1.4" fill={AMBER} opacity="0.85"/>
          </svg>
        </div>
      )}

      {/* Caller strip: bubbles + LISTENING. Anchored to right of toolbar mic slot. */}
      {listenOp > 0.01 && (
        <div style={{
          position: 'absolute',
          left: TOOLBAR_X + TOOLBAR_ICON_SIZE + 14,
          top:  TOOLBAR_Y.mic - 1,
          display: 'flex', alignItems: 'center', gap: 14,
          opacity: listenOp,
        }}>
          <div style={{ display: 'flex', gap: -8, flexDirection: 'row' }}>
            <Avatar letter={initialA} />
            <div style={{ marginLeft: -8 }}>
              <Avatar letter={initialB} />
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: SANS, fontSize: 13, fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: AMBER,
          }}>
            <div style={{
              width: 6, height: 6, background: AMBER,
              borderRadius: '50%', opacity: breathing,
            }}/>
            Listening
          </div>
        </div>
      )}
    </>
  );
}

// ── Voice waveform: bars, sits inline beside the LISTENING strip ───────────
function VoiceWaveform() {
  const t = useTime();
  if (t < T_WAVE_IN - 0.1) return null;

  const fadeIn = clamp((t - T_WAVE_IN) / 1.2, 0, 1);
  const eased = easeOutCubic(fadeIn);

  // Half the previous size; bars are tighter and shorter.
  const N_BARS = 26;
  const BAR_W  = 2;
  const GAP    = 2;
  const TOTAL_W = N_BARS * BAR_W + (N_BARS - 1) * GAP;
  const HEIGHT = 18;

  // Anchored to the right of the LISTENING strip (upper-left workspace).
  // Strip lives at top=TOOLBAR_Y.mic; this sits centered on the same baseline.
  const LEFT = 322;
  const TOP  = TOOLBAR_Y.mic + (TOOLBAR_ICON_SIZE - HEIGHT) / 2;

  const bars = [];
  for (let i = 0; i < N_BARS; i++) {
    const x = i / (N_BARS - 1);
    const env = 0.55 + 0.45 * Math.sin(x * Math.PI);
    const a =
        Math.abs(Math.sin(x * 9.0  + t * 5.2)) * 0.55
      + Math.abs(Math.sin(x * 17.0 + t * 8.7)) * 0.28
      + Math.abs(Math.sin(x * 3.7  + t * 2.8)) * 0.17;
    const h = Math.max(1.5, a * env * HEIGHT * (0.6 + 0.4 * eased));
    bars.push(h);
  }

  return (
    <div style={{
      position: 'absolute',
      left: LEFT, top: TOP,
      width: TOTAL_W, height: HEIGHT,
      display: 'flex', alignItems: 'center', gap: GAP,
      opacity: fadeIn * 0.25,                // 25% (50% of previous 50%)
      pointerEvents: 'none',
    }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: BAR_W, height: h,
          background: INK,
          borderRadius: 1,
        }}/>
      ))}
    </div>
  );
}

// ── Dialogue feed ──────────────────────────────────────────────────────────
// Auto-scrolling chat-style transcript on the right side of the frame.
// Speakers alternate L/R within a narrow column. Each new line lands at
// the same vertical "active" position; older lines scroll upward and fade.
function DialogueFeed({ timeline, fontSize = 17 }) {
  const t = useTime();

  // active line index
  let active = -1;
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].time <= t) active = i;
    else break;
  }
  if (active < 0) return null;

  const COL_LEFT  = 900;
  const COL_WIDTH = 940;     // right-side column
  // Top baseline aligns with the LISTENING strip / waveform row on the left.
  const VIEW_TOP    = 104;
  const VIEW_BOTTOM = 920;
  const VIEW_H = VIEW_BOTTOM - VIEW_TOP;

  return (
    <div style={{
      position: 'absolute',
      left: COL_LEFT, top: VIEW_TOP,
      width: COL_WIDTH, height: VIEW_H,
      pointerEvents: 'none',
      overflow: 'hidden',
      // Hard cut at the top — no fade. Bottom still fades to clear the seascape.
    }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        gap: 12,
        padding: '12px 24px 12px',
        boxSizing: 'border-box',
      }}>
        {timeline.slice(0, active + 1).map((line, i) => {
          const since = t - line.time;
          const op = clamp(since / 0.18, 0, 1);
          const ty = (1 - op) * 6;
          const isA = line.s === 'A';
          return (
            <div key={i} style={{
              alignSelf: isA ? 'flex-start' : 'flex-end',
              maxWidth: '78%',
              opacity: op,
              transform: `translateY(${ty}px)`,
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize,
              lineHeight: 1.45,
              color: isA ? INK : INK_MUTED,
              textAlign: isA ? 'left' : 'right',
              willChange: 'transform, opacity',
            }}>
              {line.t}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Script outline items (what the system "extracts" from the conversation) ─
// triggerLine = 0-based index into DIALOGUE. The item appears when t reaches
// that line's start time, OR when the script window first opens (whichever later).
const SCRIPT_ITEMS = [
  // Title block (anchored by mention of "The Mourning Tide")
  { kind: 'title',     text: 'The Mourning Tide',                                            triggerLine: 14 },
  { kind: 'subtitle',  text: 'A feature',                                                    triggerLine: 14 },
  // Premise
  { kind: 'section',   label: 'Premise',                                                     triggerLine: 10 },
  { kind: 'p',         text: '2067. The seas have risen. Trade routes belong to private fleets.', triggerLine: 12 },
  { kind: 'p',         text: 'Piracy returns — for data, oxygen, AI server banks.',         triggerLine: 12 },
  // Characters
  { kind: 'section',   label: 'Characters',                                                  triggerLine: 20 },
  { kind: 'char',      name: 'Vale',        desc: 'Captain. Former corp security. Hard, feared.', triggerLine: 20 },
  { kind: 'char',      name: 'Milo',        desc: 'Engineer. First voyage. Idealist.',      triggerLine: 22 },
  { kind: 'char',      name: 'The Ship AI', desc: 'Built for prison transport. Now: lonely.', triggerLine: 66 },
  // Structure
  { kind: 'section',   label: 'Structure',                                                   triggerLine: 26 },
  { kind: 'beat',      num: 'I',   text: 'Storm crossing into the dead zones.',             triggerLine: 26 },
  { kind: 'beat',      num: 'II',  text: 'The navigator. Locked room.',                     triggerLine: 36 },
  { kind: 'beat',      num: 'III', text: 'The cook. Frozen. “THE SHIP REMEMBERS.”',         triggerLine: 88 },
  { kind: 'beat',      num: 'IV',  text: 'The ship is the memory.',                         triggerLine: 104 },
  // Theme
  { kind: 'section',   label: 'Theme',                                                       triggerLine: 116 },
  { kind: 'p',         text: 'Every escape carries its history aboard.',                    triggerLine: 116 },
];

// ── Script icon + window ───────────────────────────────────────────────────
function ScriptWorkspace({ scriptOpenAt, expandAt, dialogueTimeline }) {
  const t = useTime();
  if (t < scriptOpenAt - 1.4) return null;

  // Icon fade-in
  const iconOp = clamp((t - scriptOpenAt) / 0.6, 0, 1);

  // Window expand: starts after icon visible (small lag)
  const winStart = scriptOpenAt + 0.4;
  const winP = clamp((t - winStart) / 0.9, 0, 1);
  const winE = easeOutQuart(winP);

  const WIN_X = TOOLBAR_X + TOOLBAR_ICON_SIZE + 14;
  // Window has two states:
  //   • small  — opens to the right of the toolbar, anchored just below the
  //              script icon.
  //   • large  — top rises to sit beside the phone icon, bottom drops down
  //              to share the baseline with the dialogue feed (y=920).
  const WIN_Y_SMALL = 252;
  const WIN_Y_LARGE = 152;

  // Two-stage sizing: opens "small", then the cursor returns later to drag
  // the bottom-right corner outward into the full workspace size.
  const W_SMALL = 530;
  const H_SMALL = 468;
  const W_LARGE = 760;
  const H_LARGE = 768;  // bottom = WIN_Y_LARGE + H_LARGE = 920 (text baseline)
  const expandP = clamp((t - expandAt) / 1.0, 0, 1);
  const expandE = easeInOutCubic(expandP);
  const WIN_W = W_SMALL + (W_LARGE - W_SMALL) * expandE;
  const WIN_H = H_SMALL + (H_LARGE - H_SMALL) * expandE;
  const WIN_Y = WIN_Y_SMALL + (WIN_Y_LARGE - WIN_Y_SMALL) * expandE;

  // Item appear times
  const itemAppearTime = (item) => {
    const triggerT = dialogueTimeline[item.triggerLine]?.time ?? scriptOpenAt;
    return Math.max(triggerT, winStart);
  };

  const sorted = [...SCRIPT_ITEMS].map((item, i) => ({ ...item, _i: i }));

  // Drafting indicator: pulse while there are still pending items.
  const anyPending = sorted.some((item) => itemAppearTime(item) > t - 0.2);
  const dotPulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.4));

  return (
    <>
      {/* Script toolbar icon */}
      <div style={{
        position: 'absolute',
        left: TOOLBAR_X, top: TOOLBAR_Y.script,
        opacity: iconOp,
        transform: `scale(${TOOLBAR_ICON_SIZE / 32})`,
        transformOrigin: 'top left',
      }}>
        <ScriptIcon stroke={INK} />
      </div>

      {/* Cursor choreography — click-to-open + later corner-drag to expand */}
      <ScriptCursor
        scriptOpenAt={scriptOpenAt}
        expandAt={expandAt}
        winX={WIN_X}
        winYSmall={WIN_Y_SMALL} winYLarge={WIN_Y_LARGE}
        smallW={W_SMALL} smallH={H_SMALL}
        largeW={W_LARGE} largeH={H_LARGE}
      />

      {/* Window — expands from icon, then grows again on cursor-drag */}
      <div style={{
        position: 'absolute',
        left: WIN_X, top: WIN_Y,
        width: WIN_W * winE, height: WIN_H * winE,
        background: PAPER_SOFT,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        transformOrigin: 'top left',
      }}>
        {/* Inner stack: content area (scrollable visually clipped) + action bar */}
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: WIN_W, height: WIN_H,
          display: 'flex', flexDirection: 'column',
          opacity: clamp((winP - 0.55) / 0.45, 0, 1),
        }}>
          {/* CONTENT */}
          <div style={{
            flex: 1, minHeight: 0,
            padding: '22px 28px 12px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}>
            {/* Kicker + drafting indicator row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 400,
                letterSpacing: '0.20em', textTransform: 'uppercase',
                color: AMBER,
              }}>Script</div>
              {anyPending && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontFamily: SANS, fontSize: 11, fontWeight: 400,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: AMBER, opacity: 0.95,
                }}>
                  <div style={{
                    width: 5, height: 5, background: AMBER,
                    borderRadius: '50%', opacity: dotPulse,
                  }}/>
                  Drafting
                </div>
              )}
            </div>

            {sorted.map((item, idx) => {
              const appear = itemAppearTime(item);
              const op = clamp((t - appear) / 0.5, 0, 1);
              if (op <= 0) return <ScriptItemSkeleton key={idx} kind={item.kind} />;
              const ty = (1 - op) * 4;
              return (
                <div key={idx} style={{
                  opacity: op,
                  transform: `translateY(${ty}px)`,
                  willChange: 'opacity, transform',
                }}>
                  <ScriptItemRender item={item} />
                </div>
              );
            })}
          </div>

          {/* ACTION BAR */}
          <div style={{
            padding: '12px 18px',
            borderTop: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: PAPER_SOFT,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <PencilIcon />
              <ExpandIcon />
              <DriveIcon />
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: AMBER,
              color: PAPER,
              borderRadius: 2,
              fontFamily: SANS, fontSize: 11, fontWeight: 400,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <DownloadGlyph />
              Download
            </div>
          </div>
        </div>
      </div>

      {/* References strip — absolutely positioned over the canvas, anchored
          to the script window's lower-left. The strip and the carrying
          cursor share the same layout so drops land exactly on each card. */}
      {(() => {
        const layout = computeReferenceLayout({
          dialogueTimeline,
          scriptOpenAt,
          winX: WIN_X,
          winY: WIN_Y,
          winW: WIN_W * winE,
          winH: WIN_H * winE,
          expandedE: expandE,
        });
        return (
          <>
            <InlineReferences layout={layout} />
            <ReferenceDropCursor layout={layout} />
          </>
        );
      })()}
    </>
  );
}

function ScriptItemRender({ item }) {
  switch (item.kind) {
    case 'title':
      return (
        <div style={{
          fontFamily: SCRIPT_FONT, fontStyle: 'italic', fontWeight: 400,
          fontSize: 28, lineHeight: 1.15,
          color: INK,
          marginTop: 0,
        }}>{item.text}</div>
      );
    case 'subtitle':
      return (
        <div style={{
          fontFamily: SCRIPT_FONT, fontSize: 15, fontWeight: 400,
          color: INK_FAINT,
          marginTop: 4, marginBottom: 14,
        }}>{item.text}</div>
      );
    case 'section':
      return (
        <div style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 400,
          letterSpacing: '0.20em', textTransform: 'uppercase',
          color: AMBER,
          marginTop: 14, marginBottom: 6,
        }}>{item.label}</div>
      );
    case 'p':
      return (
        <div style={{
          fontFamily: SCRIPT_FONT, fontSize: 16, fontWeight: 400,
          lineHeight: 1.45, color: INK,
          marginTop: 2, marginBottom: 4,
        }}>{item.text}</div>
      );
    case 'char':
      return (
        <div style={{
          display: 'flex', gap: 14,
          fontSize: 16, lineHeight: 1.45,
          color: INK,
          marginTop: 2, marginBottom: 3,
          fontFamily: SCRIPT_FONT,
        }}>
          <div style={{ fontWeight: 400, minWidth: 98, color: INK }}>{item.name}</div>
          <div style={{ fontWeight: 400, color: INK_MUTED, flex: 1 }}>{item.desc}</div>
        </div>
      );
    case 'beat':
      return (
        <div style={{
          display: 'flex', gap: 12,
          fontSize: 16, lineHeight: 1.45, marginTop: 2, marginBottom: 3,
          fontFamily: SCRIPT_FONT,
        }}>
          <div style={{ fontStyle: 'italic', color: AMBER, minWidth: 34 }}>{item.num}.</div>
          <div style={{ color: INK, flex: 1 }}>{item.text}</div>
        </div>
      );
    default:
      return null;
  }
}
// Placeholder for unfilled item — keeps vertical rhythm consistent
function ScriptItemSkeleton({ kind }) {
  const h =
    kind === 'title' ? 33 :
    kind === 'subtitle' ? 22 :
    kind === 'section' ? 28 :
    kind === 'p' ? 23 :
    kind === 'char' ? 23 :
    kind === 'beat' ? 23 : 18;
  return <div style={{ height: h, opacity: 0 }}/>;
}

// ── Reference moodboard ───────────────────────────────────────────────────
// Small thumbnail cards that surface as the conversation references things —
// some are images, some are YouTube clips. Pinned to the lower-left workspace
// area, below the script window.
const REFERENCE_CARDS = [
  {
    title: 'Galleon · silhouette',
    source: 'reference · hull shape',
    kind: 'image',
    triggerLine: 9,           // "Imagine a pirate ship."
    src: 'tenet-deck/media/ref-ship-sun.jpg',
  },
  {
    title: 'The Mourning Tide',
    source: 'reference · storm mood',
    kind: 'image',
    triggerLine: 15,          // "ship called The Mourning Tide"
    src: 'tenet-deck/media/ref-ship-storm.jpg',
  },
  {
    title: 'Crew · period dress',
    source: 'reference · costume',
    kind: 'image',
    triggerLine: 20,          // "captain Vale" / crew intro
    src: 'tenet-deck/media/ref-pirates-shore.jpg',
  },
  {
    title: 'Locked-room interior',
    source: 'reference · scene mood',
    kind: 'image',
    triggerLine: 36,          // navigator / locked room
    src: 'tenet-deck/media/ref-ship-cave.jpg',
  },
  {
    title: 'Prison transport',
    source: 'reference · ship AI lineage',
    kind: 'image',
    triggerLine: 66,          // ship AI built for prison transport
    src: 'tenet-deck/media/ref-ship-navy.jpg',
  },
  {
    title: 'Hull classifications',
    source: 'reference · taxonomy',
    kind: 'image',
    triggerLine: 88,          // "THE SHIP REMEMBERS"
    src: 'tenet-deck/media/ref-ship-types.jpg',
  },
];

function PlayBadge() {
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 28, height: 28,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 1 L8.5 5 L2.5 9 Z" fill="#fff"/>
      </svg>
    </div>
  );
}

function YTBadge() {
  return (
    <div style={{
      position: 'absolute',
      top: 6, left: 6,
      fontFamily: SANS, fontSize: 8, fontWeight: 400,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: '#fff',
      background: 'rgba(192, 28, 28, 0.95)',
      padding: '2px 6px',
      borderRadius: 1,
    }}>
      YT
    </div>
  );
}

function ReferenceMoodboard_DEPRECATED({ dialogueTimeline }) {
  const t = useTime();

  const sorted = [...REFERENCE_CARDS].sort((a, b) => a.triggerLine - b.triggerLine);
  const cards = sorted.map((c, i) => {
    const trig = dialogueTimeline[c.triggerLine]?.time ?? 1e9;
    const appear = trig + 0.5;
    const op = clamp((t - appear) / 0.6, 0, 1);
    return { ...c, _i: i, appear, op };
  }).filter(c => c.op > 0);

  if (cards.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 120, top: 782,                  // just below the script window
      display: 'flex', gap: 16,
      pointerEvents: 'none',
    }}>
      {cards.map((c) => (
        <div key={c._i} style={{
          width: 140, height: 112,
          background: PAPER_SOFT,
          border: `1px solid ${BORDER}`,
          borderRadius: 2,
          opacity: c.op,
          overflow: 'hidden',
          transform: `translateY(${(1 - c.op) * 8}px)`,
          willChange: 'transform, opacity',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            position: 'relative',
            width: '100%', height: 70,
            ...c.thumb,
          }}>
            {c.kind === 'video' && <PlayBadge />}
            {c.kind === 'video' && <YTBadge />}
          </div>
          <div style={{ padding: '6px 10px' }}>
            <div style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 400,
              color: INK, lineHeight: 1.2,
              marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{c.title}</div>
            <div style={{
              fontFamily: SANS, fontSize: 8, fontWeight: 400,
              color: INK_FAINT,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{c.source}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Story beats where the seascape briefly comes into focus.
// Indices into DIALOGUE — the focus pulse fires shortly after the line lands.
const FOCUS_BEAT_LINES = [14, 26, 36, 88, 94, 104, 116];

// ── Cursor pointer (shared SVG) ────────────────────────────────────────────
function CursorPointer({ x, y, opacity = 1, resize = false }) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      opacity,
      pointerEvents: 'none',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.16))',
      zIndex: 100,
    }}>
      {resize ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 3 L17 17 M3 3 L7 3 M3 3 L3 7 M17 17 L13 17 M17 17 L17 13"
                stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                style={{ paintOrder: 'stroke' }}/>
          <path d="M3 3 L17 17 M3 3 L7 3 M3 3 L3 7 M17 17 L13 17 M17 17 L17 13"
                stroke={PAPER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ mixBlendMode: 'normal', opacity: 0.85 }}/>
          <path d="M3 3 L17 17 M3 3 L7 3 M3 3 L3 7 M17 17 L13 17 M17 17 L17 13"
                stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1 L1 18 L5.5 14 L8.5 20 L11 19 L8 13 L14 13 Z"
                fill={INK} stroke={PAPER} strokeWidth="0.8" strokeLinejoin="round"/>
          <circle cx="1" cy="1" r="1.4" fill={AMBER} opacity="0.85"/>
        </svg>
      )}
    </div>
  );
}

// ── Cursor choreography for the script window ──────────────────────────────
// Two visits:
//  1) just before `scriptOpenAt`, cursor flies to the script toolbar icon
//     and clicks — the window opens at its small size.
//  2) just before `expandAt`, cursor returns and grabs the bottom-right
//     corner of the small window, dragging it outward to the full size.
function ScriptCursor({ scriptOpenAt, expandAt, winX, winYSmall, winYLarge, smallW, smallH, largeW, largeH }) {
  const t = useTime();

  // ── Arrival 1 ────────────────────────────────────────────────────────────
  if (t >= scriptOpenAt - 1.2 && t <= scriptOpenAt + 0.6) {
    const startX = 1180, startY = 460;
    const endX = TOOLBAR_X + 8;
    const endY = TOOLBAR_Y.script + 4;
    const travel = clamp((t - (scriptOpenAt - 1.2)) / 1.05, 0, 1);
    const eT = easeInOutCubic(travel);
    const x = startX + (endX - startX) * eT;
    const y = startY + (endY - startY) * eT;
    const op = t < scriptOpenAt + 0.05 ? 1 : Math.max(0, 1 - (t - scriptOpenAt - 0.05) / 0.5);
    const dip = (t > scriptOpenAt - 0.05 && t < scriptOpenAt + 0.18) ?
      Math.sin((t - scriptOpenAt + 0.05) / 0.23 * Math.PI) * 2 : 0;
    return <CursorPointer x={x} y={y + dip} opacity={op} />;
  }

  // ── Arrival 2 ────────────────────────────────────────────────────────────
  if (t >= expandAt - 1.0 && t <= expandAt + 1.5) {
    const startX = 1020, startY = 540;
    const cornerX_small = winX + smallW - 6;
    const cornerY_small = winYSmall + smallH - 6;
    const cornerX_large = winX + largeW - 6;
    const cornerY_large = winYLarge + largeH - 6;

    let x, y, op = 1, dragging = false;

    if (t < expandAt) {
      const travel = clamp((t - (expandAt - 1.0)) / 1.0, 0, 1);
      const eT = easeInOutCubic(travel);
      x = startX + (cornerX_small - startX) * eT;
      y = startY + (cornerY_small - startY) * eT;
    } else if (t < expandAt + 1.0) {
      const drag = clamp((t - expandAt) / 1.0, 0, 1);
      const eD = easeInOutCubic(drag);
      x = cornerX_small + (cornerX_large - cornerX_small) * eD;
      y = cornerY_small + (cornerY_large - cornerY_small) * eD;
      dragging = true;
    } else {
      x = cornerX_large;
      y = cornerY_large;
      op = Math.max(0, 1 - (t - expandAt - 1.0) / 0.45);
    }

    return (
      <>
        <CursorPointer x={x} y={y} opacity={op} resize />
        {dragging && (
          <div style={{
            position: 'absolute',
            left: x - 5, top: y - 5,
            width: 10, height: 10,
            borderRadius: '50%',
            background: AMBER,
            opacity: 0.55 * op,
            pointerEvents: 'none',
            zIndex: 99,
          }}/>
        )}
      </>
    );
  }

  return null;
}

// ── Reference layout / timing ─────────────────────────────────────────────
// Both InlineReferences and ReferenceDropCursor read from this so the
// cursor's drop target lines up with where the card actually lands.
//
// Wall-clock cadence (independent of dialogue pace):
//   60s   — script window opens, references header appears
//   65s   — first frame drops
//   70s   — second frame drops
//   71s   — third frame drops (concurrent with #2)
//  120s   — window expands to its larger size (top rises near phone icon,
//           bottom aligns with dialogue baseline)
//  125s   — fourth frame drops (row 2 begins)
//  130s   — fifth frame drops
//  135s   — sixth frame drops
//
// Cards are always 3-per-row, contained inside the script window. Row 1
// (cards 0-2) sits above row 2 (cards 3-5); row 1 visually slides upward
// as the window expands to make room for row 2.
const REFERENCE_DROP_TIMES = [65, 70, 71, 125, 130, 135];
const PER_ROW = 3;
const T_BOX_OPEN  = 60;
const T_BOX_EXPAND = 120;

function computeReferenceLayout({ scriptOpenAt, winX, winY, winW, winH, expandedE }) {
  // Stable order — REFERENCE_CARDS is already in the order the user wants.
  const ordered = REFERENCE_CARDS.slice(0, 6);

  // Cards grow slightly when the script window expands.
  const cardW  = 106 + 8  * expandedE;
  const cardH  = 88  + 6  * expandedE;
  const thumbH = 52  + 4  * expandedE;
  const gap    = 8;
  const rowGap = 6;

  // Strip is anchored to the script window's bottom-inside, padded.
  const padX = 22;
  const ACTION_BAR_H = 44;
  const HEADER_GAP = 22; // space for the "References" eyebrow above cards
  const stripLeft = winX + padX;
  const stripWidth = winW - padX * 2;

  // Row Y positions: row1 (cards 3-5) anchored to the bottom; row0 (cards 0-2)
  // sits above row1 *only* once the window has expanded. While the window is
  // still small, row0 occupies the row1 slot so the cards live at the bottom.
  const row1Top = winY + winH - ACTION_BAR_H - cardH - 12;
  const row0Top = row1Top - (cardH + rowGap) * expandedE;

  const headerTop = row0Top - HEADER_GAP;

  const cards = ordered.map((c, i) => {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const dropAt = REFERENCE_DROP_TIMES[i] ?? (95 + (i - 5) * 5);
    const x = stripLeft + col * (cardW + gap);
    const y = row === 0 ? row0Top : row1Top;
    return { ...c, _i: i, row, col, dropAt, x, y };
  });

  return {
    cards, cardW, cardH, thumbH, stripLeft, stripWidth,
    headerTop, boxAppearAt: scriptOpenAt, // header shows when script window opens
  };
}

// ── InlineReferences: the box itself — header appears with the script
// window at boxAppearAt, then cards land in as the cursor delivers them.
function InlineReferences({ layout }) {
  const t = useTime();
  const { cards, cardW, cardH, thumbH, stripLeft, headerTop, boxAppearAt } = layout;

  // Header fades in the moment the script window opens (T_BOX_OPEN).
  if (t < boxAppearAt - 0.05) return null;
  const headerOp = clamp((t - boxAppearAt) / 0.5, 0, 1);

  return (
    <>
      {/* Header — fades in the moment the first card lands */}
      <div style={{
        position: 'absolute',
        left: stripLeft, top: headerTop,
        fontFamily: SANS, fontSize: 12, fontWeight: 400,
        letterSpacing: '0.20em', textTransform: 'uppercase',
        color: AMBER,
        opacity: headerOp,
        pointerEvents: 'none',
        zIndex: 5,
      }}>References</div>

      {cards.map((c) => {
        // "Settle" animation: 0 = just dropped (slightly above + light), 1 = landed flat.
        const settle = clamp((t - c.dropAt) / 0.45, 0, 1);
        const eS = easeOutCubic(settle);
        if (settle <= 0) return null;

        return (
          <div key={c._i} style={{
            position: 'absolute',
            left: c.x, top: c.y,
            width: cardW, height: cardH,
            background: PAPER,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            overflow: 'hidden',
            opacity: eS,
            transform: `translateY(${(1 - eS) * -10}px) scale(${0.96 + 0.04 * eS}) rotate(${(1 - eS) * -1.5}deg)`,
            transformOrigin: 'top left',
            boxShadow: `0 ${(1 - eS) * 12 + 1}px ${(1 - eS) * 22 + 2}px rgba(0,0,0,${0.05 + (1 - eS) * 0.12})`,
            willChange: 'transform, opacity',
            pointerEvents: 'none',
            zIndex: 5,
          }}>
            <div style={{
              position: 'relative',
              width: '100%', height: thumbH,
              backgroundImage: `url('${c.src}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#1a1a1a',
            }}>
              {c.kind === 'video' && <PlayBadge />}
              {c.kind === 'video' && <YTBadge />}
            </div>
            <div style={{ padding: '5px 8px' }}>
              <div style={{
                fontFamily: SCRIPT_FONT, fontSize: 13, fontWeight: 400,
                color: INK, lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{c.title}</div>
              <div style={{
                fontFamily: SANS, fontSize: 8, fontWeight: 400,
                color: INK_FAINT,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                lineHeight: 1.2, marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{c.source}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── ReferenceDropCursor ───────────────────────────────────────────────────
// For each card: a cursor flies in from off-frame carrying a tilted thumbnail
// of the photo, drops it onto the references strip, then flicks away. Multiple
// cursors can be on screen simultaneously (drops 2 + 3 land within a second).
function ReferenceDropCursor({ layout }) {
  const t = useTime();
  const { cards, cardW, cardH, thumbH } = layout;

  // Each card has its own start-edge so the cursor doesn't feel mechanical.
  const startSides = [
    { x: W + 90,  y: H * 0.18 },   // right-top
    { x: -90,     y: H * 0.34 },   // left-mid
    { x: W + 90,  y: H * 0.62 },   // right-low
    { x: W * 0.66, y: H + 90 },    // bottom
    { x: -90,     y: H * 0.74 },   // left-low
    { x: W + 90,  y: H * 0.42 },   // right-mid
  ];

  // Walk every card and collect each one currently mid-drop.
  const active = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    const TRAVEL = 1.25;
    const RELEASE = 0.22;
    const FLICK = 0.55;
    const cursorStart = c.dropAt - TRAVEL - RELEASE;
    const cursorEnd   = c.dropAt + FLICK;
    if (t < cursorStart || t > cursorEnd) continue;

    const start = startSides[i % startSides.length];
    const targetCx = c.x + cardW * 0.5;
    const targetCy = c.y + cardH * 0.5;

    let cx, cy, op = 1, carrying = true, rot = -3;

    if (t < c.dropAt - RELEASE) {
      // Travel phase: cursor flies from off-frame edge to the drop target.
      const p = clamp((t - cursorStart) / TRAVEL, 0, 1);
      const e = easeInOutCubic(p);
      cx = start.x + (targetCx - start.x) * e;
      cy = start.y + (targetCy - start.y) * e;
      // Slight arc — lift up at the peak of travel.
      cy -= Math.sin(p * Math.PI) * 22;
      // Card rotates from -8° at pickup to -3° just before drop.
      rot = -8 + 5 * e;
    } else if (t < c.dropAt) {
      // Release phase: small downward press, rotation straightens, image settles.
      const p = clamp((t - (c.dropAt - RELEASE)) / RELEASE, 0, 1);
      const e = easeOutCubic(p);
      cx = targetCx;
      cy = targetCy + 4 * e;
      rot = -3 + 3 * e; // straightens to 0
    } else {
      // Flick phase: cursor lifts and slides off; the InlineReferences card
      // is now visible underneath because its `settle` animation has started.
      const p = clamp((t - c.dropAt) / FLICK, 0, 1);
      const e = easeOutCubic(p);
      cx = targetCx + 70 * e;
      cy = targetCy - 38 * e;
      op = 1 - p;
      carrying = false;
    }

    const carryOp = carrying ? (t < c.dropAt
      ? 1
      : clamp(1 - (t - c.dropAt) / 0.18, 0, 1)) : 0;

    active.push({ c, i, cx, cy, op, carrying, rot, carryOp });
  }

  if (active.length === 0) return null;

  const imgW = cardW * 0.85;
  const imgH = cardH * 0.85;

  return (
    <>
      {active.map(({ c, i, cx, cy, op, rot, carryOp }) => (
        <React.Fragment key={`drop-${i}`}>
          {carryOp > 0 && (
            <div style={{
              position: 'absolute',
              left: cx - imgW * 0.5 + 14,
              top:  cy - imgH * 0.5 + 18,
              width: imgW, height: imgH,
              background: PAPER,
              border: `1px solid ${BORDER}`,
              borderRadius: 2,
              overflow: 'hidden',
              opacity: 0.96 * carryOp,
              transform: `rotate(${rot}deg)`,
              transformOrigin: 'top left',
              boxShadow: '0 18px 36px rgba(0,0,0,0.28), 0 4px 10px rgba(0,0,0,0.18)',
              pointerEvents: 'none',
              zIndex: 102,
            }}>
              <div style={{
                width: '100%', height: imgH * (thumbH / cardH),
                backgroundImage: `url('${c.src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1a1a1a',
              }}/>
              <div style={{
                padding: '4px 8px',
                fontFamily: SCRIPT_FONT, fontSize: 10,
                color: INK, lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{c.title}</div>
            </div>
          )}
          <CursorPointer x={cx} y={cy} opacity={op} />
        </React.Fragment>
      ))}
    </>
  );
}

// ── Timeline expander: horizontal line + pill button at the end ────────────
function TimelineExpander({ appearAt }) {
  const t = useTime();
  if (t < appearAt - 0.1) return null;

  const lineP = clamp((t - appearAt) / 0.9, 0, 1);
  const lineE = easeOutCubic(lineP);
  // line draws from center outward
  const maxW = W - 240;
  const lineW = maxW * lineE;

  const labelP = clamp((t - appearAt - 0.5) / 0.6, 0, 1);
  const labelOp = labelP;
  const labelTy = (1 - labelP) * 6;

  return (
    <>
      {/* The line itself \u2014 hairline at y=900, drawing outward */}
      <div style={{
        position: 'absolute',
        left: (W - lineW) / 2, top: 920,
        width: lineW, height: 1,
        background: 'rgba(255,255,255,0.65)',
        boxShadow: '0 0 8px rgba(0,0,0,0.18)',
        pointerEvents: 'none',
        zIndex: 8,
      }}/>

      {/* Pill button breaking the line at center */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 920,
        transform: `translate(-50%, calc(-50% + ${labelTy}px))`,
        opacity: labelOp,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px',
        background: PAPER_SOFT,
        border: `1px solid ${BORDER}`,
        borderRadius: 999,
        fontFamily: SANS, fontSize: 11, fontWeight: 400,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: INK,
        boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
        pointerEvents: 'none',
        zIndex: 9,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6"
                stroke={INK} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Expand to show timeline
      </div>
    </>
  );
}

// ── Seascape: builds slowly throughout, resolves into ocean + boat at end ──
function Seascape({ start, defStart, defEnd, intensity = 1, dialogueTimeline }) {
  const t = useTime();
  if (t < start) return null;

  // Overall growth — height climbs slowly so the field stays below the
  // workspace line (~bottom 28% of canvas), never invading the script area.
  const buildP = clamp((t - start) / (defStart - start), 0, 1);
  const buildE = easeOutCubic(buildP);
  let heightPct = 4 + 18 * buildE;       // max ~22% during build

  // Definition phase — abstract → seascape; height tops out at 28%.
  const defP = clamp((t - defStart) / (defEnd - defStart), 0, 1);
  const defE = easeInOutCubic(defP);
  heightPct = heightPct + (28 - heightPct) * defE;

  const fieldH = (heightPct / 100) * H;
  const fieldY = H - fieldH;
  // Lighter overall — dawn sea, not midnight sea
  const fieldOpacity = (0.06 + 0.40 * buildE + 0.22 * defE) * intensity;

  // ── Focus / defocus ───────────────────────────────
  // Base blur is heavy so the sea stays out of focus during the brainstorm.
  // A slow LFO breathes it in and out; story-beat lines pull a sharper pulse.
  const baseBlur = 14;
  const lfo = Math.sin(t * 0.22 + 0.6) * 4;
  let beatPull = 0;
  if (dialogueTimeline) {
    for (const idx of FOCUS_BEAT_LINES) {
      const beat = dialogueTimeline[idx];
      if (!beat) continue;
      const center = beat.time + 0.6;
      const dt = t - center;
      // Bell-shaped pulse, ~1.6s wide, depth 8
      beatPull += 8 * Math.exp(-(dt * dt) / (1.6 * 1.6 * 0.5));
    }
  }
  // Definition phase tightens focus dramatically so the boat reads clean.
  const blurAmt = Math.max(
    0.4,
    (baseBlur + lfo - beatPull) * (1 - defE * 0.95)
  );

  return (
    <div style={{
      position: 'absolute',
      left: 0, top: fieldY, width: W, height: fieldH,
      opacity: fieldOpacity,
      pointerEvents: 'none',
      overflow: 'hidden',
      WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 8%, rgba(0,0,0,1) 22%, rgba(0,0,0,1) 100%)',
      maskImage:      'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 8%, rgba(0,0,0,1) 22%, rgba(0,0,0,1) 100%)',
      filter: `blur(${blurAmt.toFixed(2)}px)`,
    }}>
      {/* Abstract Rothko-ish color field — dominant before definition */}
      <BlobField t={t} W={W} H={fieldH} fade={1 - defE * 0.55} />

      {/* Defined ocean — fades in during definition */}
      {defP > 0 && <Ocean t={t} W={W} H={fieldH} alpha={defE} />}

      {/* Boat silhouette — appears last */}
      {defP > 0.45 && (
        <Boat
          t={t}
          W={W} fieldH={fieldH}
          alpha={clamp((defP - 0.45) / 0.45, 0, 1)}
        />
      )}
    </div>
  );
}

function BlobField({ t, W, H, fade }) {
  // Dawn-sea palette — lighter slates and warm peaches, no near-black.
  const blobs = [
    { color: 'rgba(95, 120, 138, 1)',  bx: 0.20, by: 0.55, r: 620, px: 0.7, py: 0.4, sx: 1.0, sy: 0.6 },
    { color: 'rgba(220, 165, 110, 1)', bx: 0.78, by: 0.55, r: 580, px: 1.2, py: 0.7, sx: 0.9, sy: 0.8 },
    { color: 'rgba(115, 140, 138, 1)', bx: 0.50, by: 0.30, r: 700, px: 2.0, py: 1.1, sx: 1.1, sy: 0.5 },
    { color: 'rgba(200, 165, 130, 1)', bx: 0.62, by: 0.70, r: 480, px: 3.0, py: 1.8, sx: 1.4, sy: 0.9 },
    { color: 'rgba(80, 100, 118, 1)',  bx: 0.10, by: 0.85, r: 540, px: 0.4, py: 2.3, sx: 0.7, sy: 1.1 },
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0,
      filter: 'blur(80px)',
      opacity: fade,
    }}>
      {blobs.map((b, i) => {
        const driftX = Math.sin(t * 0.12 * b.sx + b.px) * 0.10;
        const driftY = Math.cos(t * 0.10 * b.sy + b.py) * 0.06;
        const cx = (b.bx + driftX) * W;
        const cy = (b.by + driftY) * H;
        const r  = b.r * (0.95 + 0.08 * Math.sin(t * 0.18 + b.px));
        return (
          <div key={i} style={{
            position: 'absolute',
            left: cx - r, top: cy - r,
            width: r * 2, height: r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, ${b.color.replace(/, 1\)$/, ', 0.0)')} 65%)`,
          }}/>
        );
      })}
    </div>
  );
}

// Sky + multiple wave layers
function Ocean({ t, W, H, alpha }) {
  const horizonY = H * 0.34;

  // Build wave path: bottom-filled polygon with sine top
  const wave = (yBase, amp, freq, phase, fillColor, key) => {
    const pts = [];
    const N = 160;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * W;
      const y = yBase
        + Math.sin(x * freq + phase + t * 0.6) * amp
        + Math.sin(x * freq * 2.3 + phase * 1.5 + t * 0.9) * amp * 0.4
        + Math.sin(x * freq * 5.0 + phase * 2.0 + t * 1.3) * amp * 0.18;
      pts.push([x, y]);
    }
    let d = `M0 ${H} L0 ${pts[0][1]} `;
    pts.forEach(p => { d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)} `; });
    d += `L${W} ${H} Z`;
    return <path key={key} d={d} fill={fillColor}/>;
  };

  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: alpha }}>
      <defs>
        <linearGradient id="tn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(110, 130, 150, 0.55)"/>
          <stop offset="55%"  stopColor="rgba(170, 165, 160, 0.55)"/>
          <stop offset="100%" stopColor="rgba(220, 175, 125, 0.65)"/>
        </linearGradient>
        <linearGradient id="tn-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(100, 120, 135, 0.55)"/>
          <stop offset="100%" stopColor="rgba(55, 75, 90, 0.85)"/>
        </linearGradient>
        {/* Subtle horizon glow band */}
        <linearGradient id="tn-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(235, 190, 130, 0)"/>
          <stop offset="50%"  stopColor="rgba(235, 190, 130, 0.65)"/>
          <stop offset="100%" stopColor="rgba(235, 190, 130, 0)"/>
        </linearGradient>
      </defs>

      {/* Sky band (above horizon) */}
      <rect x="0" y="0" width={W} height={horizonY + 2} fill="url(#tn-sky)"/>
      {/* Horizon glow */}
      <rect x="0" y={horizonY - 14} width={W} height={28} fill="url(#tn-glow)"/>
      {/* Ocean base (below horizon) */}
      <rect x="0" y={horizonY} width={W} height={H - horizonY} fill="url(#tn-ocean)"/>

      {/* Layered waves: distant to foreground — mid-tone slates, not near-black */}
      {wave(horizonY + 4,   3,  0.040, 0.0, 'rgba(115, 135, 150, 0.50)', 'w1')}
      {wave(horizonY + 32,  7,  0.026, 1.2, 'rgba(85, 105, 120, 0.65)',  'w2')}
      {wave(horizonY + 78,  12, 0.018, 2.4, 'rgba(65, 85, 100, 0.78)',   'w3')}
      {wave(horizonY + 170, 20, 0.013, 3.6, 'rgba(48, 65, 80, 0.88)',    'w4')}
      {wave(horizonY + 300, 32, 0.009, 4.8, 'rgba(35, 50, 65, 0.95)',    'w5')}

      {/* Far mist band — slight white veil at horizon */}
      <rect x="0" y={horizonY - 6} width={W} height={40} fill="rgba(255,255,255,0.04)"/>
    </svg>
  );
}

// Tall sailing ship silhouette — three masts, square-rigged sails.
// Sits at the bottom of the frame (canvas y ≈ 990), no higher than the
// initial seascape band, regardless of how much the color field has grown.
function Boat({ t, W, fieldH, alpha }) {
  // Subtle pitch (degrees), driven by long-period sine to suggest swell
  const tilt = Math.sin(t * 0.5) * 1.6;
  const bob  = Math.sin(t * 0.4 + 1.1) * 3;

  const boatW = 300;
  const boatH = 170;            // hull + masts + sails
  const cx = W * 0.46;
  // Anchor to BOTTOM of field so the ship stays low in frame as field grows.
  // The field bottom == canvas bottom (1080), so this is canvas y ≈ 990.
  const cy = fieldH - 60;

  const HULL_C = 'rgba(22, 30, 38, 0.95)';
  const RIG_C  = 'rgba(22, 30, 38, 0.90)';
  const SAIL_C = 'rgba(38, 50, 62, 0.88)';

  const mid = boatW / 2;
  const HY = boatH;             // hull top reference

  return (
    <div style={{
      position: 'absolute',
      left: cx - boatW / 2,
      top:  cy - boatH + bob,
      width: boatW, height: boatH + 30,
      opacity: alpha,
      transform: `rotate(${tilt}deg)`,
      transformOrigin: '50% 92%',
      pointerEvents: 'none',
    }}>
      <svg viewBox={`0 0 ${boatW} ${boatH + 30}`} width={boatW} height={boatH + 30}>
        {/* HULL — long, gently curved silhouette with raised bow + stern castle */}
        <path d={`
          M 22 ${HY - 6}
          Q 32 ${HY + 18}, 70 ${HY + 22}
          L ${boatW - 70} ${HY + 22}
          Q ${boatW - 30} ${HY + 18}, ${boatW - 18} ${HY - 6}
          L ${boatW - 26} ${HY - 14}
          L ${boatW - 46} ${HY - 14}
          L ${boatW - 50} ${HY - 6}
          L 50 ${HY - 6}
          L 46 ${HY - 14}
          L 26 ${HY - 14}
          Z
        `} fill={HULL_C}/>

        {/* Bowsprit (forward pole from bow) */}
        <line x1="14" y1={HY - 12} x2="58" y2={HY - 22}
              stroke={RIG_C} strokeWidth="2" strokeLinecap="round"/>

        {/* ── FOREMAST ─────────────────────────────── */}
        <line x1="74" y1={HY - 6} x2="74" y2="24" stroke={RIG_C} strokeWidth="2.2" strokeLinecap="round"/>
        {/* yards */}
        <line x1="44" y1="38"  x2="104" y2="38"  stroke={RIG_C} strokeWidth="1.6"/>
        <line x1="50" y1="72"  x2="98"  y2="72"  stroke={RIG_C} strokeWidth="1.6"/>
        <line x1="54" y1="104" x2="94"  y2="104" stroke={RIG_C} strokeWidth="1.6"/>
        {/* sails (top, mid, course) */}
        <path d="M 50 38 L 98 38 L 94 72 L 54 72 Z"     fill={SAIL_C}/>
        <path d="M 56 72 L 92 72 L 88 104 L 60 104 Z"   fill={SAIL_C}/>
        <path d={`M 62 104 L 86 104 L 82 ${HY - 8} L 66 ${HY - 8} Z`} fill={SAIL_C}/>

        {/* ── MAINMAST (taller, mid) ────────────────── */}
        <line x1={mid} y1={HY - 6} x2={mid} y2="8" stroke={RIG_C} strokeWidth="2.6" strokeLinecap="round"/>
        {/* yards */}
        <line x1={mid - 42} y1="26"  x2={mid + 42} y2="26"  stroke={RIG_C} strokeWidth="1.8"/>
        <line x1={mid - 50} y1="62"  x2={mid + 50} y2="62"  stroke={RIG_C} strokeWidth="1.8"/>
        <line x1={mid - 44} y1="98"  x2={mid + 44} y2="98"  stroke={RIG_C} strokeWidth="1.8"/>
        {/* sails */}
        <path d={`M ${mid - 38} 26 L ${mid + 38} 26 L ${mid + 46} 62 L ${mid - 46} 62 Z`} fill={SAIL_C}/>
        <path d={`M ${mid - 42} 62 L ${mid + 42} 62 L ${mid + 40} 98 L ${mid - 40} 98 Z`} fill={SAIL_C}/>
        <path d={`M ${mid - 36} 98 L ${mid + 36} 98 L ${mid + 30} ${HY - 8} L ${mid - 30} ${HY - 8} Z`} fill={SAIL_C}/>

        {/* ── MIZZENMAST (rear) ─────────────────────── */}
        <line x1={boatW - 74} y1={HY - 6} x2={boatW - 74} y2="28" stroke={RIG_C} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1={boatW - 104} y1="44" x2={boatW - 44} y2="44" stroke={RIG_C} strokeWidth="1.6"/>
        <line x1={boatW - 98}  y1="78" x2={boatW - 50} y2="78" stroke={RIG_C} strokeWidth="1.6"/>
        <path d={`M ${boatW - 100} 44 L ${boatW - 48} 44 L ${boatW - 52} 78 L ${boatW - 96} 78 Z`} fill={SAIL_C}/>
        <path d={`M ${boatW - 94}  78 L ${boatW - 54} 78 L ${boatW - 58} ${HY - 8} L ${boatW - 90} ${HY - 8} Z`} fill={SAIL_C}/>

        {/* Tiny pennant flag at top of mainmast */}
        <path d={`M ${mid} 8 L ${mid + 12} 12 L ${mid} 16 Z`} fill={RIG_C}/>

        {/* Waterline highlight — tiny */}
        <line x1="34" y1={HY + 26} x2={boatW - 30} y2={HY + 26}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      </svg>
    </div>
  );
}

// ── Signature line ─────────────────────────────────────────────────────────
function SignatureLine({ appearAt }) {
  const t = useTime();
  if (t < appearAt - 0.3) return null;
  const op = clamp((t - appearAt) / 1.4, 0, 1) * 0.78;
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0,
      // Sits in the wide bottom margin under everything
      bottom: 56,
      textAlign: 'center',
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontWeight: 300,
      fontSize: 22,
      letterSpacing: '0.02em',
      color: PAPER,
      opacity: op,
      transform: `translateY(${(1 - clamp((t - appearAt)/1.4, 0, 1)) * 6}px)`,
      zIndex: 10,
      textShadow: '0 0 24px rgba(0,0,0,0.5)',
    }}>
      Before the script. Before the shot. Tenet.
    </div>
  );
}

// ── Composition ────────────────────────────────────────────────────────────
function TenetFirstExperience({
  pace = 1.0,
  intensity = 1.0,
  showSignature = true,
  initialA = 'A',
  initialB = 'B',
  fontSize = 17,
}) {
  // Build dialogue timeline
  const timeline = React.useMemo(
    () => buildDialogueTimeline(DIALOGUE, T_DIALOGUE_START, pace),
    [pace]
  );

  // Total dialogue end
  const last = timeline[timeline.length - 1];
  const dialogueEnd = last.time + last.dur;

  // Script icon: opens at a fixed wall-clock time so the user can plan around
  // the box appearing at exactly the 1-minute mark.
  const scriptOpenAt = T_BOX_OPEN;
  // Cursor returns later and drags the window's bottom-right corner to expand.
  const expandAt     = T_BOX_EXPAND;

  // Seascape phases
  const defStart = dialogueEnd - 16;
  const defEnd   = dialogueEnd + 1;

  // Signature appears after definition completes
  const signatureAt = defEnd + SIGNATURE_LEAD;

  return (
    <>
      <Wordmark />
      <Seascape
        start={SEASCAPE_START}
        defStart={defStart}
        defEnd={defEnd}
        intensity={intensity}
        dialogueTimeline={timeline}
      />
      <CallInitiation initialA={initialA} initialB={initialB} />
      <VoiceWaveform />
      <DialogueFeed timeline={timeline} fontSize={fontSize} />
      <ScriptWorkspace
        scriptOpenAt={scriptOpenAt}
        expandAt={expandAt}
        dialogueTimeline={timeline}
      />
      <TimelineExpander appearAt={defEnd + 1.0} />
      {showSignature && <SignatureLine appearAt={signatureAt} />}
    </>
  );
}

// expose composition + total duration helper for host
window.TenetFirstExperience = TenetFirstExperience;
window.computeTenetDuration = function(pace = 1.0) {
  const timeline = buildDialogueTimeline(DIALOGUE, T_DIALOGUE_START, pace);
  const last = timeline[timeline.length - 1];
  const dialogueEnd = last.time + last.dur;
  return dialogueEnd + 1 + SIGNATURE_LEAD + 3; // + hold for signature
};
