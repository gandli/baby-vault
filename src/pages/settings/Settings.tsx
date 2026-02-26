import { useAuth } from '../../lib/auth-context'

export default function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">⚙️ 设置</h1>
      
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">账号</p>
          <p className="text-gray-700 dark:text-gray-200">{user?.email}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">宝宝</p>
          <p className="text-gray-700 dark:text-gray-200">{user?.babyName}</p>
          <p className="text-xs text-gray-400 mt-1">生日: {user?.babyBirthday}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-400">存储</p>
          <p className="text-gray-700 dark:text-gray-200">本地浏览器 (MVP)</p>
          <p className="text-xs text-gray-400 mt-1">🔒 数据未离开此设备</p>
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
