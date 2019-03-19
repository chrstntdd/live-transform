import { h } from 'preact'
import { useRef, useEffect } from 'preact/hooks'

const CodeBlock = ({ children, ...props }) => {
  const prismJSModule = useRef(null)

  useEffect(() => {
    const fetchPrismJS = async () => {
      prismJSModule.current = await import(/* webpackChunkName: "prismjs" */ 'prismjs').then(
        module => module.default
      )
    }

    fetchPrismJS()
  }, [])

  let child = children
  let isHighlight = child && child.type === 'code'

  if (isHighlight && child.props.children && prismJSModule.current) {
    let text = child.props.children.replace(/(^\s+|\s+$)/g, '')
    let highlighted = prismJSModule.current.highlight(
      text,
      prismJSModule.current.languages.javascript,
      'javascript'
    )
    return (
      <pre class={`language-javascript  ${props.class || ''}`}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    )
  }
  return <pre {...props}>{children}</pre>
}

export { CodeBlock }
