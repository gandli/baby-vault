import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'

interface Milestone {
  id: string
  emoji: string
  name: string
  doneAt?: string // ISO date
}

const PRESETS: Omit<Milestone, 'id'>[] = [
  { emoji: '😊', name: '第一次微笑' },
  { emoji: '🔄', name: '翻身' },
  { emoji: '🪑', name: '独坐' },
  { emoji: '🐛', name: '爬行' },
  { emoji: '🧍', name: '站立' },
  { emoji: '🚶', name: '走路' },
  { emoji: '🗣️', name: '叫妈妈/爸爸' },
  { emoji: '🦷', name: '第一颗牙' },
  { emoji: '🍚', name: '第一口辅食' },
  { emoji: '😴', name: '睡整夜' },
]

const STORAGE_KEY = 'babyvault_milestones'

function loadMilestones(): Milestone[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return JSON.parse(saved)
  return PRESETS.map((p, i) => ({ ...p, id: `preset-${i}` }))
}

function saveMilestones(ms: Milestone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ms))
}

export default function Milestones() {
  const { user } = useAuth()
  const [milestones, setMilestones] = useState<Milestone[]>(loadMilestones)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')

  useEffect(() => { saveMilestones(milestones) }, [milestones])

  const toggle = (id: string) => {
    setMilestones(prev => prev.map(m =>
      m.id === id ? { ...m, doneAt: m.doneAt ? undefined : new Date().toISOString() } : m
    ))
  }

  const addCustom = () => {
    if (!newName.trim()) return
    setMilestones(prev => [...prev, {
      id: crypto.randomUUID(),
      emoji: newEmoji || '⭐',
      name: newName.trim(),
    }])
    setNewName('')
    setNewEmoji('⭐')
    setAdding(false)
  }

  const remove = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  const done = milestones.filter(m => m.doneAt)
  const todo = milestones.filter(m => !m.doneAt)

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">🏆 里程碑</h1>
        <span className="text-sm text-gray-400">{done.length}/{milestones.length} 完成</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-[#FFD966] rounded-full transition-all duration-500"
          style={{ width: `${milestones.length ? (done.length / milestones.length) * 100 : 0}%` }}
        />
      </div>

      {/* Todo */}
      <div className="space-y-3 mb-6">
        {todo.map(m => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform text-left"
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="flex-1 text-gray-700 dark:text-gray-200 font-medium">{m.name}</span>
            <span className="text-gray-300 text-xl">○</span>
          </button>
        ))}
      </div>

      {/* Add custom */}
      {adding ? (
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-3 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="w-14 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-xl"
              maxLength={2}
            />
            <input
              type="text"
              placeholder="里程碑名称"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addCustom()}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 text-sm">取消</button>
            <button onClick={addCustom} className="flex-1 py-2 rounded-lg bg-[#6CB4EE] text-white text-sm">添加</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-400 text-sm active:scale-[0.98] transition-transform mb-6"
        >
          + 自定义里程碑
        </button>
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-400 mb-3">已完成 🎉</h2>
          <div className="space-y-3">
            {done.map(m => (
              <div
                key={m.id}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
              >
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{m.name}</span>
                  <p className="text-xs text-gray-400">{new Date(m.doneAt!).toLocaleDateString('zh-CN')}</p>
                </div>
                <button onClick={() => toggle(m.id)} className="text-green-500 text-xl">✓</button>
                {!m.id.startsWith('preset-') && (
                  <button onClick={() => remove(m.id)} className="text-red-400 text-sm ml-1">删除</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {user?.babyName && (
        <p className="text-center text-xs text-gray-300 mt-8">
          {user.babyName}加油！每个里程碑都值得纪念 💪
        </p>
      )}
    </div>
  )
}
