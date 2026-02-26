export type Lang = 'zh' | 'en' | 'ja'

const translations = {
  zh: {
    // App
    appName: 'BabyVault',
    appSlogan: '宝宝的第一步，不该存在别人的服务器上',
    mvpNote: 'MVP 版本 · 数据存储在本地浏览器',

    // Auth
    enterEmail: '输入邮箱',
    getStarted: '开始使用 🔒',
    createProfile: '创建宝宝档案',
    babyNickname: '宝宝昵称',
    nicknamePlaceholder: '小名或昵称',
    birthday: '出生日期',
    create: '创建 🎉',

    // Nav
    navTimeline: '时间线',
    navMilestones: '里程碑',
    navSettings: '设置',

    // Timeline
    timeline: '的时间线',
    months: '个月',
    day: '第 {n} 天',
    today: '今天',
    yesterday: '昨天',
    justNow: '刚刚',
    minutesAgo: '{n} 分钟前',
    hoursAgo: '{n} 小时前',
    daysAgo: '{n} 天前',
    noPhotos: '还没有照片',
    noPhotosTip: '点击 + 记录第一个瞬间',
    recordMoment: '记录这个瞬间…（可选）',
    cancel: '取消',
    save: '保存 📸',
    saving: '保存中…',
    loading: '加载中…',
    deletePhoto: '删除这张照片？',
    delete: '删除',
    addNote: '点击添加备注…',

    // Milestones
    milestones: '🏆 里程碑',
    completed: '已完成 🎉',
    done: '完成',
    addCustom: '+ 自定义里程碑',
    milestoneName: '里程碑名称',
    add: '添加',
    selectDate: '选择完成日期',
    confirm: '确认',
    cheerUp: '加油！每个里程碑都值得纪念 💪',

    // Milestone presets
    'ms.smile': '第一次微笑',
    'ms.rollover': '翻身',
    'ms.sit': '独坐',
    'ms.crawl': '爬行',
    'ms.stand': '站立',
    'ms.walk': '走路',
    'ms.talk': '叫妈妈/爸爸',
    'ms.tooth': '第一颗牙',
    'ms.food': '第一口辅食',
    'ms.sleep': '睡整夜',

    // Settings
    settings: '⚙️ 设置',
    account: '账号',
    babyInfo: '宝宝信息',
    edit: '编辑',
    nickname: '昵称',
    storage: '存储',
    localStorage: '本地浏览器 (MVP)',
    localOnly: '🔒 数据未离开此设备',
    dataBackup: '数据备份',
    exportJSON: '📦 导出 JSON 备份',
    exportDesc: '包含宝宝信息、里程碑、照片缩略图',
    exporting: '导出中…',
    version: '版本',
    language: '语言',
    logout: '退出登录',
  },

  en: {
    appName: 'BabyVault',
    appSlogan: "Baby's first steps shouldn't live on someone else's server",
    mvpNote: 'MVP · Data stored locally in browser',

    enterEmail: 'Enter email',
    getStarted: 'Get Started 🔒',
    createProfile: 'Create Baby Profile',
    babyNickname: 'Baby nickname',
    nicknamePlaceholder: 'Nickname',
    birthday: 'Date of birth',
    create: 'Create 🎉',

    navTimeline: 'Timeline',
    navMilestones: 'Milestones',
    navSettings: 'Settings',

    timeline: "'s Timeline",
    months: ' months',
    day: 'Day {n}',
    today: 'Today',
    yesterday: 'Yesterday',
    justNow: 'Just now',
    minutesAgo: '{n}m ago',
    hoursAgo: '{n}h ago',
    daysAgo: '{n}d ago',
    noPhotos: 'No photos yet',
    noPhotosTip: 'Tap + to capture a moment',
    recordMoment: 'Describe this moment… (optional)',
    cancel: 'Cancel',
    save: 'Save 📸',
    saving: 'Saving…',
    loading: 'Loading…',
    deletePhoto: 'Delete this photo?',
    delete: 'Delete',
    addNote: 'Tap to add a note…',

    milestones: '🏆 Milestones',
    completed: 'Completed 🎉',
    done: 'Done',
    addCustom: '+ Custom milestone',
    milestoneName: 'Milestone name',
    add: 'Add',
    selectDate: 'Select date',
    confirm: 'Confirm',
    cheerUp: 'Every milestone is worth celebrating 💪',

    'ms.smile': 'First smile',
    'ms.rollover': 'Rolling over',
    'ms.sit': 'Sitting up',
    'ms.crawl': 'Crawling',
    'ms.stand': 'Standing',
    'ms.walk': 'Walking',
    'ms.talk': 'Saying mama/dada',
    'ms.tooth': 'First tooth',
    'ms.food': 'First solid food',
    'ms.sleep': 'Sleeping through the night',

    settings: '⚙️ Settings',
    account: 'Account',
    babyInfo: 'Baby info',
    edit: 'Edit',
    nickname: 'Nickname',
    storage: 'Storage',
    localStorage: 'Local browser (MVP)',
    localOnly: '🔒 Data never leaves this device',
    dataBackup: 'Data backup',
    exportJSON: '📦 Export JSON backup',
    exportDesc: 'Includes baby info, milestones, photo thumbnails',
    exporting: 'Exporting…',
    version: 'Version',
    language: 'Language',
    logout: 'Log out',
  },

  ja: {
    appName: 'BabyVault',
    appSlogan: '赤ちゃんの一歩を、他人のサーバーに預けない',
    mvpNote: 'MVP版・データはブラウザにローカル保存',

    enterEmail: 'メールアドレス',
    getStarted: '始める 🔒',
    createProfile: '赤ちゃんプロフィール作成',
    babyNickname: 'ニックネーム',
    nicknamePlaceholder: 'ニックネーム',
    birthday: '生年月日',
    create: '作成 🎉',

    navTimeline: 'タイムライン',
    navMilestones: 'マイルストーン',
    navSettings: '設定',

    timeline: 'のタイムライン',
    months: 'ヶ月',
    day: '{n}日目',
    today: '今日',
    yesterday: '昨日',
    justNow: 'たった今',
    minutesAgo: '{n}分前',
    hoursAgo: '{n}時間前',
    daysAgo: '{n}日前',
    noPhotos: '写真はまだありません',
    noPhotosTip: '+ をタップして最初の瞬間を記録',
    recordMoment: 'この瞬間を記録…（任意）',
    cancel: 'キャンセル',
    save: '保存 📸',
    saving: '保存中…',
    loading: '読み込み中…',
    deletePhoto: 'この写真を削除しますか？',
    delete: '削除',
    addNote: 'タップしてメモを追加…',

    milestones: '🏆 マイルストーン',
    completed: '達成済み 🎉',
    done: '完了',
    addCustom: '+ カスタムマイルストーン',
    milestoneName: 'マイルストーン名',
    add: '追加',
    selectDate: '日付を選択',
    confirm: '確認',
    cheerUp: 'すべてのマイルストーンは記念に値する 💪',

    'ms.smile': '初めての笑顔',
    'ms.rollover': '寝返り',
    'ms.sit': 'お座り',
    'ms.crawl': 'ハイハイ',
    'ms.stand': 'つかまり立ち',
    'ms.walk': 'あんよ',
    'ms.talk': 'ママ/パパと呼ぶ',
    'ms.tooth': '初めての歯',
    'ms.food': '初めての離乳食',
    'ms.sleep': '夜通し睡眠',

    settings: '⚙️ 設定',
    account: 'アカウント',
    babyInfo: '赤ちゃん情報',
    edit: '編集',
    nickname: 'ニックネーム',
    storage: 'ストレージ',
    localStorage: 'ローカルブラウザ (MVP)',
    localOnly: '🔒 データはこのデバイスから出ません',
    dataBackup: 'データバックアップ',
    exportJSON: '📦 JSONバックアップを出力',
    exportDesc: '赤ちゃん情報、マイルストーン、写真サムネイル含む',
    exporting: '出力中…',
    version: 'バージョン',
    language: '言語',
    logout: 'ログアウト',
  },
} as const

type TranslationKey = keyof typeof translations.zh

const LANG_KEY = 'babyvault_lang'
const LANG_NAMES: Record<Lang, string> = { zh: '中文', en: 'English', ja: '日本語' }

export function getLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY) as Lang | null
  if (saved && saved in translations) return saved
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('zh')) return 'zh'
  if (nav.startsWith('ja')) return 'ja'
  return 'en'
}

export function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang)
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = getLang()
  let text = (translations[lang]?.[key] ?? translations.zh[key]) as string
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export { LANG_NAMES }
export type { TranslationKey }
