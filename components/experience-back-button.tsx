'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ExperienceBackButton() {
  const router = useRouter()

  function goBack() {
    const referrer = document.referrer
    if (referrer && new URL(referrer).origin === window.location.origin) {
      router.back()
      return
    }
    router.push('/experience')
  }

  return (
    <button
      aria-label="이전 페이지로 돌아가기"
      className="experience-back-button"
      onClick={goBack}
      type="button"
    >
      <ArrowLeft aria-hidden="true" size={18} />
    </button>
  )
}
