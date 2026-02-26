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
    <div className="px-4 pt-6 pb-24 paper-texture">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">{t('settings')}</h1>

      <div className="space-y-4">
        {/* Account */}
        <div className="card p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('account')}</p>
          <p className="text-[var(--color-text)]">{user?.email}</p>
        </div>

        {/* Baby info */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{t('babyInfo')}</p>
            <button
              onClick={() => { setEditing(!editing); setName(user?.babyName || ''); setBirthday(user?.babyBirthday || '') }}
              className="text-sm text-[var(--color-primary)] font-medium"
            >
              {editing ? t('cancel') : t('edit')}
            </button>
          </div>
          {editing ? (
            <div className="space-y-3 mt-3">
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">{t('nickname')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">{t('birthday')}</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
              </div>
              <button onClick={handleSave} className="btn-primary w-full">
                {t('save')}
              </button>
            </div>
          ) : (
            <>
              <p className="text-[var(--color-text)] font-medium">{user?.babyName}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('birthday')}: {user?.babyBirthday}</p>
            </>
          )}
        </div>

        {/* Language */}
        <div className="card p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-3">{t('language')}</p>
          <div className="flex gap-2">
            {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentLang === code
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'bg-[var(--color-bg)] text-[var(--color-text-light)] border border-[var(--color-border)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Storage */}
        <div className="card p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('storage')}</p>
          <p className="text-[var(--color-text)]">{t('localStorage')}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('localOnly')}</p>
        </div>

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full card p-4 text-left active:scale-[0.99] transition-transform disabled:opacity-50"
        >
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('dataBackup')}</p>
          <p className="text-[var(--color-text)]">
            {exporting ? t('exporting') : t('exportJSON')}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('exportDesc')}</p>
        </button>

        {/* Version */}
        <div className="card p-4">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('version')}</p>
          <p className="text-[var(--color-text)]">BabyVault MVP v0.1.0</p>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3.5 rounded-2xl bg-red-50 text-red-500 font-medium active:scale-[0.99] transition-transform dark:bg-red-900/20"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}