import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { t } from '../../lib/i18n'

export default function Login() {
  const [email, setEmail] = useState('')
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate(user.babyName ? '/' : '/setup')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    login(email.trim())
    navigate('/setup')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👶</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('appName')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t('appSlogan')}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder={t('enterEmail')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CB4EE] text-center"
          autoFocus
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#6CB4EE] text-white font-medium hover:bg-[#5AA3DD] transition-colors active:scale-[0.98]"
        >
          {t('getStarted')}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-6">{t('mvpNote')}</p>
    </div>
  )
}
