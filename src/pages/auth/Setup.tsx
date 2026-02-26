import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'

export default function Setup() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [birthday, setBirthday] = useState('')

  if (user?.babyName) {
    navigate('/')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !birthday) return
    updateUser({
      babyName: name.trim(),
      babyBirthday: birthday,
      familyId: crypto.randomUUID(),
    })
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🍼</div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">创建宝宝档案</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">宝宝昵称</label>
          <input
            type="text"
            placeholder="小名或昵称"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CB4EE]"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">出生日期</label>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CB4EE]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#6CB4EE] text-white font-medium hover:bg-[#5AA3DD] transition-colors active:scale-[0.98]"
        >
          创建 🎉
        </button>
      </form>
    </div>
  )
}
