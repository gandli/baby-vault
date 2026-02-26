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
    window.location.reload()
  }

  return (
    <div className="px-4 pt-8 pb-28 paper-texture">
      <h1 className="text-2xl font-display text-[var(--color-text)] mb-8">{t('settings')}</h1>

      <div className="space-y-4">
        {/* Account Card */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary-wash)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 pointer-events-none" />
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2 relative z-10">{t('account')}</p>
          <p className="text-[var(--color-text)] font-medium text-lg relative z-10">{user?.email}</p>
        </div>

        {/* Baby Info Card */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-wash)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">{t('babyInfo')}</p>
            <button
              onClick={() => { setEditing(!editing); setName(user?.babyName || ''); setBirthday(user?.babyBirthday || '') }}
              className={`text-sm font-semibold transition-colors ${
                editing 
                  ? 'text-[var(--color-accent)] hover:text-[var(--color-accent-dark)]' 
                  : 'text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]'
              }`}
            >
              {editing ? t('cancel') : t('edit')}
            </button>
          </div>
          {editing ? (
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-2">{t('nickname')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] font-medium transition-colors focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-2">{t('birthday')}</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] font-medium transition-colors focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                />
              </div>
              <button onClick={handleSave} className="btn-primary w-full">
                {t('save')}
              </button>
            </div>
          ) : (
            <div className="relative z-10">
              <p className="text-[var(--color-text)] font-display text-2xl mb-1">{user?.babyName}</p>
              <p className="text-sm text-[var(--color-text-light)]">
                {t('birthday')}: {new Date(user?.babyBirthday!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Language Card */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-success-wash)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 pointer-events-none" />
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-4 relative z-10">{t('language')}</p>
          <div className="flex gap-3 relative z-10">
            {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  currentLang === code
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary-wash)]'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-light)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Card */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-linen-dark)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 opacity-30 pointer-events-none" />
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2 relative z-10">{t('storage')}</p>
          <p className="text-[var(--color-text)] relative z-10">Local storage only</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 opacity-70 relative z-10">{t('localOnly')}</p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full card p-6 text-left active:scale-[0.99] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-accent-wash)] to-[var(--color-primary-wash)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none" />
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2 relative z-10">{t('dataBackup')}</p>
          <p className="text-[var(--color-text)] font-medium text-lg mb-1 relative z-10">
            {exporting ? t('exporting') : t('exportJSON')}
          </p>
          <p className="text-xs text-[var(--color-text-light)] relative z-10">{t('exportDesc')}</p>
        </button>

        {/* Version Info */}
        <div className="card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-accent-wash)] rounded-bl-3xl rounded-tr-sm -mr-8 -mt-8 pointer-events-none" />
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-2 relative z-10">{t('version')}</p>
          <p className="text-[var(--color-text)] font-display text-xl relative z-10">BabyVault MVP v0.1.0</p>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-4.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold active:scale-[0.99] transition-all duration-300 dark:bg-red-900/20 dark:hover:bg-red-900/30"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}