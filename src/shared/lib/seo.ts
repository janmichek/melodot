import {useEffect} from 'react'

const SITE_URL = 'https://donalyze.vercel.app'

export interface PageMeta {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

function setMeta(selector: string, attribute: 'content' | 'href', value: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
  if (!element) {
    element = selector.startsWith('link')
      ? document.createElement('link')
      : document.createElement('meta')
    if (selector.startsWith('link')) {
      ;(element as HTMLLinkElement).rel = 'canonical'
    } else {
      const name = selector.match(/name="([^"]+)"/)?.[1]
      const property = selector.match(/property="([^"]+)"/)?.[1]
      if (name) {(element as HTMLMetaElement).name = name}
      if (property) {(element as HTMLMetaElement).setAttribute('property', property)}
    }
    document.head.appendChild(element)
  }
  element.setAttribute(attribute, value)
}

/** Keeps title, description, canonical and social metadata in sync per route. */
export function usePageMeta({title, description, path, type = 'website'}: PageMeta) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', url)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[property="og:type"]', 'content', type)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [title, description, path, type])
}
