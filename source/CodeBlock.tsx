import { h } from 'preact'

import { useModule } from './hooks'

const CodeBlock = ({ children, minifyOutput, ...props }) => {
  const prismJSModule = useModule(
    async () =>
      await import(/* webpackChunkName: "prismjs" */ 'prismjs').then(module => module.default)
  )

  let child = children
  let isHighlight = child && child.type === 'code'

  if (isHighlight && child.props.children && prismJSModule) {
    let text = child.props.children.replace(/(^\s+|\s+$)/g, '')
    let highlighted = prismJSModule.highlight(
      text,
      prismJSModule.languages.javascript,
      prismJSModule.languages.javascript
    )
    return (
      <pre class={`language-javascript  ${props.class || ''} ${minifyOutput ? 'minified' : ''}`}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    )
  }
  return <pre {...props}>{children}</pre>
}

export { CodeBlock }
