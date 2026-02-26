import { useAuth } from '../../lib/auth-context'

function getMonthAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

export default function Timeline() {
  const { user } = useAuth()
  const monthAge = user?.babyBirthday ? getMonthAge(user.babyBirthday) : 0

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {user?.babyName}的时间线
          </h1>
          <p className="text-sm text-gray-400">{monthAge} 个月</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-[#6CB4EE] text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          +
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-5xl mb-4">📷</div>
        <p className="text-center">
          还没有照片<br />
          <span className="text-sm">点击 + 记录第一个瞬间</span>
        </p>
      </div>
    </div>
  )
}
