import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (isStandalone()) {
      setHidden(true)
      return
    }

    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setHidden(true)
      return
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setHidden(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', '1')
    setHidden(true)
    setShowIosGuide(false)
  }

  if (hidden || isStandalone()) return null

  if (isIos() && !deferredPrompt) {
    if (!showIosGuide) {
      return (
        <button
          className="install-fab"
          onClick={() => setShowIosGuide(true)}
          aria-label="アプリをインストール"
        >
          📲
        </button>
      )
    }

    return (
      <div className="install-banner">
        <p className="install-title">📲 ホーム画面に追加</p>
        <ol className="install-steps">
          <li>
            下の <strong>共有ボタン</strong>
            <span className="ios-share-icon"> ⎙ </span> をタップ
          </li>
          <li>
            <strong>「ホーム画面に追加」</strong> を選択
          </li>
          <li>
            <strong>「追加」</strong> をタップ
          </li>
        </ol>
        <div className="install-actions">
          <button className="btn-install-dismiss" onClick={handleDismiss}>
            閉じる
          </button>
        </div>
      </div>
    )
  }

  if (deferredPrompt) {
    return (
      <div className="install-banner">
        <p className="install-title">📲 アプリとしてインストール</p>
        <p className="install-desc">
          ホーム画面に追加すると、アプリのようにすぐ起動できます。
        </p>
        <div className="install-actions">
          <button className="btn-install-primary" onClick={handleInstall}>
            インストール
          </button>
          <button className="btn-install-dismiss" onClick={handleDismiss}>
            後で
          </button>
        </div>
      </div>
    )
  }

  return null
}
