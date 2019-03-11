import { h } from 'preact'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

const CodeBlock = ({ children, ...props }) => {
  let child = children
  let isHighlight = child && child.type === 'code'

  if (isHighlight && child.props.children) {
    let text = child.props.children.replace(/(^\s+|\s+$)/g, '')
    let highlighted = Prism.highlight(text, Prism.languages.javascript, 'javascript')
    return (
      <pre class={`language-javascript  ${props.class || ''}`}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    )
  }
  return <pre {...props}>{children}</pre>
}

export { CodeBlock }
