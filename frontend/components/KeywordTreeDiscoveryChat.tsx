import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Layers2, Stethoscope } from 'lucide-react'
import type { TreeNode } from '../lib/treeTaxonomy'
import { buildHoverOverview, buildViewportOverview } from '../lib/keywordTreeContext'
import { postClinicalChat, resolveClinicalPatientId } from '../lib/clinicalIntelligence'

type MessageSource = 'welcome' | 'hover' | 'viewport' | 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  source: MessageSource
  content: string
}

interface Props {
  tree: TreeNode
  patientId: string | null
  patientName: string | null
  hoveredNode: TreeNode | null
  /** Latest visible node ids from the tree viewport. */
  viewportVisibleIds: ReadonlySet<string> | null
  /** Increments when tree interaction settles — triggers viewport overview refresh. */
  interactionIdleTick: number
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderMessageBody(content: string) {
  return content.split('\n').map((line, i) => {
    if (!line.trim()) return null
    if (line.startsWith('_') && line.endsWith('_')) {
      return (
        <p key={i} className="text-[14px] text-slate-500 italic">
          {line.slice(1, -1)}
        </p>
      )
    }
    return (
      <p key={i} className={i > 0 ? 'mt-1' : ''}>
        {renderInlineMarkdown(line)}
      </p>
    )
  })
}

let messageSeq = 0
function nextId() {
  messageSeq += 1
  return `kt-chat-${messageSeq}`
}

function AssistantAvatar() {
  return (
    <div
      className="shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm"
      aria-hidden
    >
      <Layers2 className="w-5 h-5 text-white" />
    </div>
  )
}

function UserAvatar() {
  return (
    <div
      className="shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm"
      aria-hidden
    >
      <Stethoscope className="w-5 h-5 text-white" />
    </div>
  )
}

export default function KeywordTreeDiscoveryChat({
  tree,
  patientId,
  patientName,
  hoveredNode,
  viewportVisibleIds,
  interactionIdleTick,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: nextId(),
      role: 'assistant',
      source: 'welcome',
      content:
        'Hover a node for a focused summary, or pause after panning and zooming for an overview of keywords in frame.',
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pinnedToBottomRef = useRef(true)
  const lastHoverIdRef = useRef<string | null>(null)
  const lastViewportSigRef = useRef('')

  const isNearBottom = useCallback((el: HTMLDivElement) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }, [])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    pinnedToBottomRef.current = isNearBottom(el)
  }, [isNearBottom])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  const upsertAutoMessage = useCallback((source: 'hover' | 'viewport', content: string) => {
    setMessages((prev) => {
      const withoutSame = prev.filter((m) => m.source !== source)
      return [
        ...withoutSame,
        { id: nextId(), role: 'assistant', source, content },
      ]
    })
  }, [])

  useEffect(() => {
    if (!hoveredNode) return
    if (lastHoverIdRef.current === hoveredNode.id) return
    lastHoverIdRef.current = hoveredNode.id
    upsertAutoMessage('hover', buildHoverOverview(tree, hoveredNode))
  }, [hoveredNode, tree, upsertAutoMessage])

  useEffect(() => {
    if (hoveredNode) return
    lastHoverIdRef.current = null
  }, [hoveredNode])

  useEffect(() => {
    if (hoveredNode) return
    if (!viewportVisibleIds || viewportVisibleIds.size === 0) return
    const sig = [...viewportVisibleIds].sort().join('\x1e')
    if (sig === lastViewportSigRef.current && interactionIdleTick === 0) return
    lastViewportSigRef.current = sig
    upsertAutoMessage('viewport', buildViewportOverview(tree, viewportVisibleIds))
  }, [hoveredNode, viewportVisibleIds, interactionIdleTick, tree, upsertAutoMessage])

  useEffect(() => {
    if (!pinnedToBottomRef.current) return
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = input.trim()
    if (!query || sending) return

    setInput('')
    pinnedToBottomRef.current = true
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', source: 'user', content: query }])
    setSending(true)

    const contextBits: string[] = []
    if (patientName) contextBits.push(`Patient: ${patientName}`)
    if (hoveredNode) contextBits.push(`Currently hovered: ${hoveredNode.label} (${hoveredNode.taxonomyPath})`)
    if (viewportVisibleIds && viewportVisibleIds.size > 0) {
      contextBits.push(`Visible in keyword tree viewport: ${viewportVisibleIds.size} nodes`)
    }

    const enrichedQuery =
      contextBits.length > 0
        ? `${query}\n\n[Keyword tree context: ${contextBits.join('; ')}]`
        : query

    const clinicalId = patientId ? resolveClinicalPatientId(patientId) : null
    if (clinicalId === null) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          source: 'assistant',
          content:
            'Clinical Intelligence is not configured for this patient id. I can still summarize from the tree — hover nodes or pause after panning to refresh the overview.',
        },
      ])
      setSending(false)
      return
    }

    try {
      const res = await postClinicalChat({ patient_id: clinicalId, user_query: enrichedQuery })
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', source: 'assistant', content: res.ai_analysis },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          source: 'assistant',
          content: 'Could not reach Clinical Intelligence. Try again in a moment.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-2.5 space-y-2"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' ? <AssistantAvatar /> : null}
            <div
              className={`max-w-[min(920px,90%)] rounded-xl px-3 py-2 text-[16px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : msg.source === 'hover'
                    ? 'bg-violet-50 text-slate-800 border border-violet-100'
                    : msg.source === 'viewport'
                      ? 'bg-slate-50 text-slate-800 border border-slate-200'
                      : 'bg-gray-100 text-gray-900'
              }`}
            >
              {msg.role === 'assistant' ? renderMessageBody(msg.content) : msg.content}
            </div>
            {msg.role === 'user' ? <UserAvatar /> : null}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start items-start gap-2.5">
            <AssistantAvatar />
            <div className="rounded-xl px-3 py-2 text-[16px] bg-gray-100 text-slate-500">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 flex items-center gap-2 px-4 py-2 border-t border-slate-100 bg-slate-50/80"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about these keywords…"
          disabled={sending}
          className="flex-1 min-w-0 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[17px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:pointer-events-none transition-colors"
          aria-label="Send message"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
