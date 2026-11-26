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
import type { ReplyDraft } from "@/lib/reply-tool";
import { RESTAURANT_PROFILE } from "@/lib/restaurant-profile";

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
};

type Persisted = {
  v: 1;
  connections: Record<Platform, boolean>;
  records: Record<string, ReviewRecord>;
  profile: string;
  drafts: number;
  trialStartedAt: number;
};

const STORAGE_KEY = "foh-demo-v1";
const TRIAL_DAYS = 14;
const CONCURRENCY = 3;

/** `now` is 0 on the server's first render; the browser passes the real clock. */
function initialState(now = 0): Persisted {
  const records: Record<string, ReviewRecord> = {};
  for (const r of DEMO_REVIEWS) {
    records[r.id] = r.pastReply
      ? { status: "replied", posted: r.pastReply, postedAt: now - (r.hoursAgo - 3) * 3_600_000 }
      : { status: "new" };
  }
  return {
    v: 1,
    connections: Object.fromEntries(PLATFORMS.map((p) => [p.id, p.initiallyConnected])) as Record<
      Platform,
      boolean
    >,
    records,
    profile: RESTAURANT_PROFILE,
    drafts: 0,
    trialStartedAt: now - 2 * 86_400_000,
  };
}

function load(now: number): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState(now);
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.v !== 1) return initialState(now);
    const base = initialState(now);
    return {
      ...base,
      ...parsed,
      records: { ...base.records, ...parsed.records },
      connections: { ...base.connections, ...parsed.connections },
    };
  } catch {
    return initialState(now);
  }
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
  reviews: DemoReview[];
  records: Record<string, ReviewRecord>;
  connections: Record<Platform, boolean>;
  profile: string;
  drafts: number;
  trialDaysLeft: number;
  triage: { running: boolean; done: number; total: number };
  drafting: Record<string, boolean>;
  getChat: (id: string) => Chat<DeskMessage>;
  draftReview: (id: string) => Promise<void>;
  triageAll: () => Promise<void>;
  approve: (id: string, reply: string) => void;
  sendToOwner: (id: string) => void;
  reopen: (id: string) => void;
  connect: (p: Platform) => void;
  disconnect: (p: Platform) => void;
  setProfile: (profile: string) => void;
  resetDemo: () => void;
};

const DeskContext = createContext<DeskContextValue | null>(null);

export function useDesk() {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside <DeskProvider>");
  return ctx;
}

export function DeskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => initialState(0));
  const [ready, setReady] = useState(false);
  const [triage, setTriage] = useState({ running: false, done: 0, total: 0 });
  const [drafting, setDrafting] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(0);
  const chats = useRef(new Map<string, Chat<DeskMessage>>());
  const profileRef = useRef(state.profile);
  const recordsRef = useRef(state.records);

  useEffect(() => {
    profileRef.current = state.profile;
    recordsRef.current = state.records;
  }, [state.profile, state.records]);

  // Load the saved demo after mount, so server and client render the same first frame.
  useEffect(() => {
    const clock = Date.now();
    const loaded = load(clock);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setState(loaded);
    setNow(clock);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode or storage full: the demo still works for this visit */
    }
  }, [state, ready]);

  const patchRecord = useCallback((id: string, patch: Partial<ReviewRecord>) => {
    setState((s) => ({ ...s, records: { ...s.records, [id]: { ...s.records[id], ...patch } } }));
  }, []);

  const getChat = useCallback(
    (id: string) => {
      const existing = chats.current.get(id);
      if (existing) return existing;
      const review = DEMO_REVIEWS.find((r) => r.id === id);
      const record = recordsRef.current[id];
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
          body: () => ({ profile: profileRef.current }),
        }),
        onFinish: ({ message }) => {
          const { draft, text } = readAssistant(message);
          setState((s) => {
            const prev = s.records[id] ?? { status: "new" as const };
            const status: ReviewStatus =
              prev.status === "replied" || prev.status === "with-owner" ? prev.status : draft ? "drafted" : prev.status;
            return {
              ...s,
              drafts: s.drafts + (draft ? 1 : 0),
              records: {
                ...s.records,
                [id]: { ...prev, status, draft: draft ?? prev.draft, note: draft ? undefined : text, error: undefined },
              },
            };
          });
        },
        onError: () => patchRecord(id, { error: "Front of House couldn't reach the model. Try again." }),
      });
      chats.current.set(id, chat);
      return chat;
    },
    [patchRecord],
  );

  const draftReview = useCallback(
    async (id: string) => {
      const review = DEMO_REVIEWS.find((r) => r.id === id);
      if (!review) return;
      const chat = getChat(id);
      if (chat.status === "submitted" || chat.status === "streaming") return;
      patchRecord(id, { error: undefined });
      setDrafting((d) => ({ ...d, [id]: true }));
      try {
        if (chat.messages.length === 0) await chat.sendMessage({ text: reviewPrompt(review) });
        else await chat.regenerate();
      } finally {
        setDrafting((d) => ({ ...d, [id]: false }));
      }
    },
    [getChat, patchRecord],
  );

  const reviews = useMemo(() => DEMO_REVIEWS.filter((r) => state.connections[r.platform]), [state.connections]);

  const triageAll = useCallback(async () => {
    const queue = reviews.filter((r) => {
      const rec = recordsRef.current[r.id];
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
    reviews,
    records: state.records,
    connections: state.connections,
    profile: state.profile,
    drafts: state.drafts,
    trialDaysLeft: now
      ? Math.max(0, TRIAL_DAYS - Math.floor((now - state.trialStartedAt) / 86_400_000))
      : TRIAL_DAYS - 2,
    triage,
    drafting,
    getChat,
    draftReview,
    triageAll,
    approve: (id, reply) => patchRecord(id, { status: "replied", posted: reply, postedAt: Date.now() }),
    sendToOwner: (id) => patchRecord(id, { status: "with-owner" }),
    reopen: (id) => patchRecord(id, { status: recordsRef.current[id]?.draft ? "drafted" : "new" }),
    connect: (p) => setState((s) => ({ ...s, connections: { ...s.connections, [p]: true } })),
    disconnect: (p) => setState((s) => ({ ...s, connections: { ...s.connections, [p]: false } })),
    setProfile: (profile) => setState((s) => ({ ...s, profile })),
    resetDemo: () => {
      chats.current.clear();
      setState(initialState(Date.now()));
    },
  };

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}
