"use client";

import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIDataTypes, type UIMessage } from "ai";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEMO_REVIEWS, PLATFORMS, reviewPrompt, type DemoReview, type Platform } from "@/lib/demo-reviews";
import { LIVE_REVIEWS } from "@/lib/live-reviews";
import type { Account } from "@/lib/session";
import type { ReplyDraft } from "@/lib/reply-tool";
import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";
import { SAMPLE_WORKSPACE, type Answers, type Workspace } from "@/lib/workspace";

export type DeskTools = { fileReply: { input: ReplyDraft; output: { status: string } } };
export type DeskMessage = UIMessage<never, UIDataTypes, DeskTools>;

export type ReviewStatus = "new" | "drafted" | "with-owner" | "replied";
export type ReviewRecord = {
  status: ReviewStatus;
  draft?: ReplyDraft;
  /** A plain-text answer from the agent (e.g. a refusal or a question). */
  note?: string;
  posted?: string;
  postedAt?: number;
  error?: string;
  /** When the agent finished the first draft, and how long it took. */
  draftedAt?: number;
  draftMs?: number;
  /** Autopilot will post the draft at this time unless someone steps in. */
  autoPostAt?: number;
  /** Someone stopped Autopilot on this review; it now waits for a person. */
  autoPostHeld?: boolean;
  postedBy?: "autopilot" | "manager";
};

/** Something the agent did or saw, shown as a notification. */
export type DeskEvent = {
  key: number;
  kind: "arrived" | "posted" | "held";
  reviewId: string;
  at: number;
};

type Persisted = {
  v: 2;
  /** null until the restaurant is chosen: onboarding or the sample. */
  workspace: Workspace | null;
  answers?: Answers;
  connections: Record<Platform, boolean>;
  records: Record<string, ReviewRecord>;
  customReviews: DemoReview[];
  profile: string;
  drafts: number;
  trialStartedAt: number;
  /** Set by onboarding when it hands over reviews to draft on arrival in the inbox. */
  autoTriage?: boolean;
  /** The agent drafts every new review as it lands. */
  agentOn?: boolean;
  /** Autopilot posts Ready replies to 4- and 5-star reviews after a short countdown. */
  autoPost?: boolean;
  /** Next review in the sample restaurant's live feed, and the ones that have arrived. */
  liveIndex?: number;
  arrivals?: { id: string; at: number }[];
};

/** Each demo visit keeps its own copy of the sample restaurant in the browser under this prefix. */
const DEMO_KEY_PREFIX = "foh-demo-";
/** How long the desk waits after a change before saving it to the account. */
const SAVE_DELAY_MS = 1_200;
const TRIAL_DAYS = 14;
const CONCURRENCY = 3;
/** Seconds a Ready reply waits before Autopilot posts it, so a person can stop it. */
export const AUTO_POST_SECONDS = 12;
/** Autopilot only posts on its own for reviews with at least this many stars. */
export const AUTO_POST_MIN_STARS = 4;
/**
 * …and only when the agent itself read the guest's mood as positive. Added on 27 Nov 2026 after
 * the hidden-risk test: a sarcastic "5-star" complaint was marked Ready 4 of 5 times, though the
 * agent rated its sentiment negative every time (test-runs/v3-autopilot-risk-x5.txt). The system
 * prompt is unchanged; this is a check in code on the agent's own answer.
 */
export const AUTO_POST_SENTIMENT = "positive";

/** Whether a first draft is safe for Autopilot to post on its own (the person-in-charge checks come on top). */
export function autopilotMayPost(draft: Pick<ReplyDraft, "risk" | "sentiment">, stars: number | undefined) {
  return draft.risk === "ready" && draft.sentiment === AUTO_POST_SENTIMENT && (stars ?? 0) >= AUTO_POST_MIN_STARS;
}
const FIRST_ARRIVAL_MS = 8_000;
const LIVE_BY_ID = new Map(LIVE_REVIEWS.map((r) => [r.id, r]));

function sampleRecords(now: number) {
  const records: Record<string, ReviewRecord> = {};
  for (const r of DEMO_REVIEWS) {
    records[r.id] = r.pastReply
      ? { status: "replied", posted: r.pastReply, postedAt: now - (r.hoursAgo - 3) * 3_600_000 }
      : { status: "new" };
  }
  return records;
}

const defaultConnections = () =>
  Object.fromEntries(PLATFORMS.map((p) => [p.id, p.initiallyConnected])) as Record<Platform, boolean>;

/** `now` is 0 on the server's first render; the browser passes the real clock. */
function initialState(now = 0): Persisted {
  return {
    v: 2,
    workspace: null,
    connections: defaultConnections(),
    records: sampleRecords(now),
    customReviews: [],
    profile: RESTAURANT_PROFILE,
    drafts: 0,
    trialStartedAt: now - 2 * 86_400_000,
    agentOn: true,
    autoPost: true,
    liveIndex: 0,
    arrivals: [],
  };
}

/** A fresh copy of the sample restaurant, as the demo opens it. */
function sampleState(now: number): Persisted {
  return { ...initialState(now), workspace: SAMPLE_WORKSPACE };
}

/** Merges saved state over the defaults, so fields added later get a value. */
function revive(parsed: (Omit<Partial<Persisted>, "v"> & { v: number }) | null, base: Persisted): Persisted {
  if (!parsed || parsed.v !== 2) return base;
  return {
    ...base,
    ...parsed,
    records: { ...base.records, ...parsed.records },
    connections: { ...base.connections, ...parsed.connections },
  } as Persisted;
}

function loadDemo(key: string, now: number): Persisted {
  try {
    // Older demo visits (and the pre-accounts "foh-demo-v1") are left over: clear them.
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(DEMO_KEY_PREFIX) && k !== key) window.localStorage.removeItem(k);
    }
    const raw = window.localStorage.getItem(key);
    return raw ? revive(JSON.parse(raw), sampleState(now)) : sampleState(now);
  } catch {
    return sampleState(now);
  }
}

/** A live-feed review that has arrived, with its arrival time. */
function liveReview(id: string, s: Persisted): DemoReview | undefined {
  const r = LIVE_BY_ID.get(id);
  const arrival = s.arrivals?.find((a) => a.id === id);
  return r && arrival ? { ...r, receivedAt: arrival.at } : undefined;
}

/** The latest fileReply draft or plain-text answer in an assistant message. */
export function readAssistant(message: DeskMessage): { draft?: ReplyDraft; text?: string } {
  let draft: ReplyDraft | undefined;
  let text = "";
  for (const part of message.parts) {
    if (part.type === "tool-fileReply" && (part.state === "output-available" || part.state === "input-available")) {
      draft = part.input;
    }
    if (part.type === "text") text += part.text;
  }
  return { draft, text: text.trim() || undefined };
}

type DeskContextValue = {
  ready: boolean;
  /** Who is signed in: a real account, or a demo visit of the sample restaurant. */
  account: Account;
  /** Set when a real account's restaurant couldn't be loaded. */
  loadError: string | null;
  retryLoad: () => void;
  /** Saving to the account: idle until something changes. Always "idle" in the demo. */
  saveStatus: "idle" | "saving" | "saved" | "error";
  /** Saves any change still waiting on the timer (before signing out). */
  flushSave: () => Promise<void>;
  /** The restaurant being worked for (the sample until one is chosen). */
  workspace: Workspace;
  hasWorkspace: boolean;
  answers?: Answers;
  reviews: DemoReview[];
  records: Record<string, ReviewRecord>;
  connections: Record<Platform, boolean>;
  profile: string;
  drafts: number;
  trialDaysLeft: number;
  triage: { running: boolean; done: number; total: number };
  agentOn: boolean;
  autoPost: boolean;
  setAgentOn: (on: boolean) => void;
  setAutoPost: (on: boolean) => void;
  /** Stop Autopilot posting this review; it waits for a person instead. */
  holdAutoPost: (id: string) => void;
  /** Reviews still to come in the live feed (sample restaurant only). */
  liveRemaining: number;
  events: DeskEvent[];
  dismissEvent: (key: number) => void;
  /** A review a notification asked the inbox to open. */
  focusId: string | null;
  focusReview: (id: string | null) => void;
  drafting: Record<string, boolean>;
  getChat: (id: string) => Chat<DeskMessage>;
  draftReview: (id: string) => Promise<void>;
  triageAll: () => Promise<void>;
  approve: (id: string, reply: string) => void;
  findReview: (id: string) => DemoReview | undefined;
  sendToOwner: (id: string) => void;
  reopen: (id: string) => void;
  connect: (p: Platform) => void;
  disconnect: (p: Platform) => void;
  setProfile: (profile: string) => void;
  addReview: (r: Omit<DemoReview, "id" | "hoursAgo">) => string;
  finishOnboarding: (ws: Workspace, answers: Answers, profile: string, autoTriage: boolean) => void;
  autoTriage: boolean;
  clearAutoTriage: () => void;
  resetDemo: () => void;
};

const DeskContext = createContext<DeskContextValue | null>(null);

export function useDesk() {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside <DeskProvider>");
  return ctx;
}

export function DeskProvider({ children, account }: { children: ReactNode; account: Account }) {
  const [state, setState] = useState<Persisted>(() => initialState(0));
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveStatus, setSaveStatus] = useState<DeskContextValue["saveStatus"]>("idle");
  const lastSaved = useRef<string | null>(null);
  const demoKey = account.kind === "demo" ? `${DEMO_KEY_PREFIX}${account.id}` : null;
  const [triage, setTriage] = useState({ running: false, done: 0, total: 0 });
  const [drafting, setDrafting] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(0);
  const [events, setEvents] = useState<DeskEvent[]>([]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [arrivalTick, setArrivalTick] = useState(0);
  const eventKey = useRef(0);
  const startedAt = useRef(new Map<string, number>());
  const chats = useRef(new Map<string, Chat<DeskMessage>>());
  // Reviews with a draft request in flight, so one review is never sent twice at once.
  const inFlight = useRef(new Set<string>());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load after mount, so server and client render the same first frame. The demo reads this
  // browser's copy of the sample restaurant; a real account fetches its restaurant from the server.
  useEffect(() => {
    const clock = Date.now();
    if (demoKey) {
      const loaded = loadDemo(demoKey, clock);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setState(loaded);
      setNow(clock);
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/workspace", { cache: "no-store" });
        if (res.status === 401) {
          // The session ended or the account is gone: a full page load drops everything held in memory.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign("/sign-in");
          return;
        }
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { state: unknown; createdAt: number };
        if (cancelled) return;
        // A new account's trial starts the day it was created.
        const base = { ...initialState(clock), trialStartedAt: data.createdAt || clock };
        const loaded = revive(data.state as Parameters<typeof revive>[0], base);
        lastSaved.current = JSON.stringify(loaded);
        setState(loaded);
        setNow(clock);
        setLoadError(null);
        setReady(true);
      } catch {
        if (!cancelled) setLoadError("Front of House couldn't load your restaurant. Check your connection and try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoKey, loadAttempt]);

  const pendingSave = useRef<string | null>(null);
  const saveToAccount = useCallback(async (json: string) => {
    if (json === lastSaved.current) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: json,
        keepalive: json.length < 60_000,
      });
      if (!res.ok) throw new Error();
      lastSaved.current = json;
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus((st) => (st === "saved" ? "idle" : st)), 2_500);
    } catch {
      setSaveStatus("error");
    }
  }, []);

  // Save: the demo to this browser at once; a real account to the server, a moment after the last change.
  useEffect(() => {
    if (!ready) return;
    const json = JSON.stringify(state);
    if (demoKey) {
      try {
        window.localStorage.setItem(demoKey, json);
      } catch {
        /* private mode or storage full: the demo still works for this visit */
      }
      return;
    }
    if (json === lastSaved.current) return;
    pendingSave.current = json;
    // If the page is closed before the timer fires, send the change anyway.
    const flush = () => {
      if (json === lastSaved.current || json.length >= 60_000) return;
      void fetch("/api/workspace", { method: "PUT", headers: { "content-type": "application/json" }, body: json, keepalive: true });
      lastSaved.current = json;
    };
    window.addEventListener("pagehide", flush);
    const timer = window.setTimeout(() => void saveToAccount(json), SAVE_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
    };
  }, [state, ready, demoKey, saveToAccount]);

  const patchRecord = useCallback((id: string, patch: Partial<ReviewRecord>) => {
    setState((s) => ({ ...s, records: { ...s.records, [id]: { ...s.records[id], ...patch } } }));
  }, []);

  const pushEvent = useCallback((kind: DeskEvent["kind"], reviewId: string) => {
    eventKey.current += 1;
    const event = { key: eventKey.current, kind, reviewId, at: Date.now() };
    setEvents((e) => [...e.slice(-5), event]);
  }, []);

  // Reviews added this render cycle, so they can be drafted before state commits.
  const justAdded = useRef(new Map<string, DemoReview>());
  const findReview = useCallback(
    (id: string) =>
      justAdded.current.get(id) ??
      stateRef.current.customReviews.find((r) => r.id === id) ??
      liveReview(id, stateRef.current) ??
      DEMO_REVIEWS.find((r) => r.id === id),
    [],
  );

  const getChat = useCallback(
    (id: string) => {
      const existing = chats.current.get(id);
      if (existing) return existing;
      const review = findReview(id);
      const record = stateRef.current.records[id];
      // Rebuild the conversation from a saved draft so revisions keep their context after a reload.
      const seed: DeskMessage[] =
        review && record?.draft
          ? [
              { id: `${id}-u0`, role: "user", parts: [{ type: "text", text: reviewPrompt(review) }] },
              {
                id: `${id}-a0`,
                role: "assistant",
                parts: [
                  {
                    type: "tool-fileReply",
                    toolCallId: `${id}-call0`,
                    state: "output-available",
                    input: record.draft,
                    output: { status: "Shown to the manager for review." },
                  },
                ],
              },
            ]
          : [];
      const chat = new Chat<DeskMessage>({
        id,
        messages: seed,
        transport: new DefaultChatTransport({
          api: "/api/chat",
          body: () => {
            const s = stateRef.current;
            const ws = s.workspace;
            return ws?.mode === "custom"
              ? { profile: s.profile, workspace: { manager: ws.manager, role: ws.role, restaurant: ws.restaurant } }
              : { profile: s.profile };
          },
        }),
        onFinish: ({ message }) => {
          const { draft, text } = readAssistant(message);
          const at = Date.now();
          const started = startedAt.current.get(id);
          const s0 = stateRef.current;
          const prev0 = s0.records[id];
          // Looked up now, not when the chat was created: a review that just arrived may not have been known then.
          const reviewNow = findReview(id);
          const firstDraft = !!draft && !prev0?.draft;
          // Autopilot posts only a first draft the agent marked Ready, for a 4- or 5-star review
          // whose mood it read as positive, and only while nobody has stepped in on this review.
          const autoPost =
            firstDraft &&
            autopilotMayPost(draft, reviewNow?.stars) &&
            (s0.agentOn ?? true) &&
            (s0.autoPost ?? true) &&
            prev0?.status !== "replied" &&
            prev0?.status !== "with-owner" &&
            !prev0?.autoPostHeld;
          setState((s) => {
            const prev = s.records[id] ?? { status: "new" as const };
            const status: ReviewStatus =
              prev.status === "replied" || prev.status === "with-owner" ? prev.status : draft ? "drafted" : prev.status;
            return {
              ...s,
              drafts: s.drafts + (draft ? 1 : 0),
              records: {
                ...s.records,
                [id]: {
                  ...prev,
                  status,
                  draft: draft ?? prev.draft,
                  note: draft ? undefined : text,
                  error: undefined,
                  draftedAt: firstDraft ? at : prev.draftedAt,
                  draftMs: firstDraft && started ? at - started : prev.draftMs,
                  autoPostAt: autoPost ? at + AUTO_POST_SECONDS * 1000 : draft ? undefined : prev.autoPostAt,
                },
              },
            };
          });
          if (firstDraft && draft.risk === "escalate") pushEvent("held", id);
        },
        onError: () => patchRecord(id, { error: "Front of House couldn't reach the model. Try again." }),
      });
      chats.current.set(id, chat);
      return chat;
    },
    [patchRecord, findReview, pushEvent],
  );

  const draftReview = useCallback(
    async (id: string) => {
      const review = findReview(id);
      if (!review) return;
      const chat = getChat(id);
      if (inFlight.current.has(id) || chat.status === "submitted" || chat.status === "streaming") return;
      inFlight.current.add(id);
      if (!startedAt.current.has(id)) startedAt.current.set(id, Date.now());
      patchRecord(id, { error: undefined });
      setDrafting((d) => ({ ...d, [id]: true }));
      try {
        if (chat.messages.length === 0) await chat.sendMessage({ text: reviewPrompt(review) });
        else await chat.regenerate();
      } finally {
        inFlight.current.delete(id);
        setDrafting((d) => ({ ...d, [id]: false }));
      }
    },
    [getChat, patchRecord, findReview],
  );

  const workspace = state.workspace ?? SAMPLE_WORKSPACE;
  const reviews = useMemo(() => {
    if (workspace.mode !== "sample") return state.customReviews;
    const live = (state.arrivals ?? []).flatMap((a) => {
      const r = LIVE_BY_ID.get(a.id);
      return r && state.connections[r.platform] ? [{ ...r, receivedAt: a.at }] : [];
    });
    const sample = DEMO_REVIEWS.filter((r) => state.connections[r.platform]);
    return [...state.customReviews, ...live, ...sample];
  }, [state.connections, state.customReviews, state.arrivals, workspace.mode]);

  const agentOn = state.agentOn ?? true;
  const autoPostOn = state.autoPost ?? true;
  const sampleMode = state.workspace?.mode === "sample";
  const liveIndex = state.liveIndex ?? 0;

  // The live feed: while the dashboard is open, the sample restaurant keeps getting reviews
  // on its connected platforms. Paused while the tab is hidden, so nothing piles up unseen.
  useEffect(() => {
    if (!ready || !sampleMode) return;
    const s = stateRef.current;
    let idx = liveIndex;
    while (idx < LIVE_REVIEWS.length && !s.connections[LIVE_REVIEWS[idx].platform]) idx++;
    if (idx >= LIVE_REVIEWS.length) return;
    const delay = (s.arrivals ?? []).length === 0 ? FIRST_ARRIVAL_MS : 20_000 + Math.random() * 15_000;
    const timer = window.setTimeout(() => {
      if (document.hidden) {
        setArrivalTick((t) => t + 1);
        return;
      }
      const review = LIVE_REVIEWS[idx];
      const at = Date.now();
      setState((cur) =>
        (cur.liveIndex ?? 0) !== liveIndex
          ? cur
          : {
              ...cur,
              liveIndex: idx + 1,
              arrivals: [{ id: review.id, at }, ...(cur.arrivals ?? [])],
              records: { ...cur.records, [review.id]: { status: "new" } },
            },
      );
      pushEvent("arrived", review.id);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [ready, sampleMode, liveIndex, arrivalTick, pushEvent]);

  // The agent: every new review is drafted as soon as it lands, a few at a time.
  useEffect(() => {
    if (!ready || !agentOn) return;
    const timer = window.setTimeout(() => {
      const recs = stateRef.current.records;
      const pending = reviews
        .filter((r) => {
          const rec = recs[r.id];
          return rec?.status === "new" && !rec.draft && !rec.error && !rec.note && !inFlight.current.has(r.id);
        })
        .slice(0, Math.max(0, CONCURRENCY - inFlight.current.size));
      for (const r of pending) void draftReview(r.id);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [ready, agentOn, reviews, state.records, drafting, draftReview]);

  // Autopilot: post each scheduled reply when its countdown ends.
  useEffect(() => {
    const timers: number[] = [];
    for (const [id, rec] of Object.entries(state.records)) {
      if (!rec.autoPostAt || rec.status !== "drafted" || !rec.draft) continue;
      timers.push(
        window.setTimeout(() => {
          const cur = stateRef.current.records[id];
          if (!cur?.autoPostAt || cur.status !== "drafted" || !cur.draft || inFlight.current.has(id)) return;
          setState((s) => {
            const r = s.records[id];
            if (!r?.autoPostAt || r.status !== "drafted" || !r.draft) return s;
            return {
              ...s,
              records: {
                ...s.records,
                [id]: { ...r, status: "replied", posted: r.draft.reply, postedAt: Date.now(), postedBy: "autopilot", autoPostAt: undefined },
              },
            };
          });
          pushEvent("posted", id);
        }, Math.max(0, rec.autoPostAt - Date.now())),
      );
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [state.records, pushEvent]);

  /** Cancels every pending Autopilot post: they become drafts waiting for a person. */
  const cancelScheduled = (s: Persisted): Persisted["records"] =>
    Object.fromEntries(
      Object.entries(s.records).map(([id, r]) => [id, r.autoPostAt ? { ...r, autoPostAt: undefined, autoPostHeld: true } : r]),
    );

  const triageAll = useCallback(async () => {
    const queue = reviews.filter((r) => {
      const rec = stateRef.current.records[r.id];
      return rec?.status === "new" && !rec.draft;
    });
    if (queue.length === 0) return;
    setTriage({ running: true, done: 0, total: queue.length });
    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const r = queue[next++];
        try {
          await draftReview(r.id);
        } finally {
          setTriage((t) => ({ ...t, done: t.done + 1 }));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    setTriage((t) => ({ ...t, running: false }));
  }, [reviews, draftReview]);

  const value: DeskContextValue = {
    ready,
    account,
    loadError,
    retryLoad: () => {
      setLoadError(null);
      setLoadAttempt((n) => n + 1);
    },
    saveStatus,
    flushSave: async () => {
      if (!demoKey && pendingSave.current) await saveToAccount(pendingSave.current);
    },
    workspace,
    hasWorkspace: state.workspace !== null,
    answers: state.answers,
    reviews,
    records: state.records,
    connections: state.connections,
    profile: state.profile,
    drafts: state.drafts,
    trialDaysLeft: now
      ? Math.max(0, TRIAL_DAYS - Math.floor((now - state.trialStartedAt) / 86_400_000))
      : TRIAL_DAYS - 2,
    triage,
    agentOn,
    autoPost: autoPostOn,
    setAgentOn: (on) =>
      setState((s) => ({ ...s, agentOn: on, records: on ? s.records : cancelScheduled(s) })),
    setAutoPost: (on) =>
      setState((s) => ({ ...s, autoPost: on, records: on ? s.records : cancelScheduled(s) })),
    holdAutoPost: (id) => {
      if (stateRef.current.records[id]?.autoPostAt) patchRecord(id, { autoPostAt: undefined, autoPostHeld: true });
    },
    liveRemaining: sampleMode
      ? LIVE_REVIEWS.slice(liveIndex).filter((r) => state.connections[r.platform]).length
      : 0,
    events,
    dismissEvent: (key) => setEvents((e) => e.filter((x) => x.key !== key)),
    focusId,
    focusReview: setFocusId,
    findReview,
    drafting,
    getChat,
    draftReview,
    triageAll,
    approve: (id, reply) =>
      patchRecord(id, { status: "replied", posted: reply, postedAt: Date.now(), postedBy: "manager", autoPostAt: undefined }),
    sendToOwner: (id) => patchRecord(id, { status: "with-owner", autoPostAt: undefined }),
    reopen: (id) =>
      patchRecord(id, {
        status: stateRef.current.records[id]?.draft ? "drafted" : "new",
        autoPostAt: undefined,
        autoPostHeld: true,
      }),
    connect: (p) => setState((s) => ({ ...s, connections: { ...s.connections, [p]: true } })),
    disconnect: (p) => setState((s) => ({ ...s, connections: { ...s.connections, [p]: false } })),
    setProfile: (profile) => setState((s) => ({ ...s, profile })),
    addReview: (r) => {
      const id = `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const review: DemoReview = { ...r, id, hoursAgo: 0, receivedAt: Date.now() };
      justAdded.current.set(id, review);
      setState((s) => ({
        ...s,
        customReviews: [review, ...s.customReviews],
        records: { ...s.records, [id]: { status: "new" } },
      }));
      return id;
    },
    finishOnboarding: (ws, answers, profile, autoTriage) => {
      chats.current.clear();
      startedAt.current.clear();
      setEvents([]);
      setState((s) => ({
        ...initialState(Date.now()),
        trialStartedAt: s.trialStartedAt,
        workspace: ws,
        answers,
        profile,
        autoTriage,
        connections: Object.fromEntries(PLATFORMS.map((p) => [p.id, answers.platforms.includes(p.id)])) as Record<
          Platform,
          boolean
        >,
      }));
    },
    autoTriage: state.autoTriage ?? false,
    clearAutoTriage: () => setState((s) => ({ ...s, autoTriage: false })),
    resetDemo: () => {
      chats.current.clear();
      startedAt.current.clear();
      setEvents([]);
      // The demo goes back to a fresh sample inbox; an account clears its restaurant and starts onboarding again.
      setState((s) =>
        demoKey
          ? { ...sampleState(Date.now()), trialStartedAt: s.trialStartedAt }
          : { ...initialState(Date.now()), trialStartedAt: s.trialStartedAt },
      );
    },
  };

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}
