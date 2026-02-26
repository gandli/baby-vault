export default function Milestones() {
  const presets = [
    { emoji: '😊', name: '第一次微笑', done: false },
    { emoji: '🔄', name: '翻身', done: false },
    { emoji: '🪑', name: '独坐', done: false },
    { emoji: '🐛', name: '爬行', done: false },
    { emoji: '🧍', name: '站立', done: false },
    { emoji: '🚶', name: '走路', done: false },
    { emoji: '🗣️', name: '叫妈妈/爸爸', done: false },
  ]

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🏆 里程碑</h1>
      <div className="space-y-3">
        {presets.map(m => (
          <button
            key={m.name}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-gray-700 dark:text-gray-200 font-medium">{m.name}</span>
            <span className="ml-auto text-gray-300">○</span>
          </button>
        ))}
      </div>
    </div>
  )
}
