import Link from 'next/link'
import { FaBookOpen, FaEnvelope, FaGithub } from 'react-icons/fa'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        오늘의 기록
      </Link>
      <nav aria-label="주요 메뉴">
        <Link href="/experience">Experience</Link>
        <a
          href="https://github.com/junghyunkim329"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </a>
        <a href="https://shshjang14.tistory.com/" target="_blank">
          Blog
        </a>
        <a href="mailto:shshjang14@gmail.com">Email</a>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <strong>Let&apos;s work together</strong>
      <div className="socials">
        <a
          href="https://github.com/junghyunkim329"
          target="_blank"
          rel="noreferrer"
          aria-label="Github"
        >
          <FaGithub aria-hidden="true" />
        </a>
        <a
          href="https://shshjang14.tistory.com/"
          target="_blank"
          aria-label="Blog"
        >
          <FaBookOpen aria-hidden="true" />
        </a>
        <a href="mailto:shshjang14@gmail.com" aria-label="Email">
          <FaEnvelope aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}
