import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.babyName || '')
  const [birthday, setBirthday] = useState(user?.babyBirthday || '')

  const handleSave = () => {
    if (!name.trim() || !birthday) return
    updateUser({ babyName: name.trim(), babyBirthday: birthday })
    setEditing(false)
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">⚙️ 设置</h1>

      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">账号</p>
          <p className="text-gray-700 dark:text-gray-200">{user?.email}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">宝宝信息</p>
            <button
              onClick={() => { setEditing(!editing); setName(user?.babyName || ''); setBirthday(user?.babyBirthday || '') }}
              className="text-xs text-[#6CB4EE]"
            >
              {editing ? '取消' : '编辑'}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">昵称</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">出生日期</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-[#6CB4EE] text-white text-sm font-medium"
              >
                保存
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-200">{user?.babyName}</p>
              <p className="text-xs text-gray-400 mt-1">生日: {user?.babyBirthday}</p>
            </>
          )}
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">存储</p>
          <p className="text-gray-700 dark:text-gray-200">本地浏览器 (MVP)</p>
          <p className="text-xs text-gray-400 mt-1">🔒 数据未离开此设备</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">版本</p>
          <p className="text-gray-700 dark:text-gray-200">BabyVault MVP v0.1.0</p>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 font-medium active:scale-[0.98] transition-transform"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
