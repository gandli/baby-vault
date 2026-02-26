import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import { exportData, downloadJSON } from '../../lib/photo-store'
import { t, getLang, setLang, LANG_NAMES, type Lang } from '../../lib/i18n'

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.babyName || '')
  const [birthday, setBirthday] = useState(user?.babyBirthday || '')
  const [exporting, setExporting] = useState(false)
  const [currentLang, setCurrentLang] = useState(getLang())

  const handleSave = () => {
    if (!name.trim() || !birthday) return
    updateUser({ babyName: name.trim(), babyBirthday: birthday })
    setEditing(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const json = await exportData()
      const date = new Date().toISOString().slice(0, 10)
      downloadJSON(json, `babyvault-backup-${date}.json`)
    } finally {
      setExporting(false)
    }
  }

  const handleLangChange = (lang: Lang) => {
    setLang(lang)
    setCurrentLang(lang)
    // Force re-render by reloading
    window.location.reload()
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t('settings')}</h1>

      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">{t('account')}</p>
          <p className="text-gray-700 dark:text-gray-200">{user?.email}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">{t('babyInfo')}</p>
            <button onClick={() => { setEditing(!editing); setName(user?.babyName || ''); setBirthday(user?.babyBirthday || '') }} className="text-xs text-[#6CB4EE]">
              {editing ? t('cancel') : t('edit')}
            </button>
          </div>
          {editing ? (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('nickname')}</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('birthday')}</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm" />
              </div>
              <button onClick={handleSave} className="w-full py-2 rounded-lg bg-[#6CB4EE] text-white text-sm font-medium">{t('save')}</button>
            </div>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-200">{user?.babyName}</p>
              <p className="text-xs text-gray-400 mt-1">{t('birthday')}: {user?.babyBirthday}</p>
            </>
          )}
        </div>

        {/* Language */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400 mb-2">{t('language')}</p>
          <div className="flex gap-2">
            {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentLang === code
                    ? 'bg-[#6CB4EE] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">{t('storage')}</p>
          <p className="text-gray-700 dark:text-gray-200">{t('localStorage')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('localOnly')}</p>
        </div>

        <button onClick={handleExport} disabled={exporting}
          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-left active:scale-[0.98] transition-transform disabled:opacity-50">
          <p className="text-sm text-gray-400">{t('dataBackup')}</p>
          <p className="text-gray-700 dark:text-gray-200">{exporting ? t('exporting') : t('exportJSON')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('exportDesc')}</p>
        </button>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">{t('version')}</p>
          <p className="text-gray-700 dark:text-gray-200">BabyVault MVP v0.1.0</p>
        </div>

        <button onClick={logout}
          className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 font-medium active:scale-[0.98] transition-transform">
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
