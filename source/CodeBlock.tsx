import { h } from 'preact'
import { useRef, useEffect } from 'preact/hooks'
import * as monaco from 'monaco-editor'

const CodeBlock = ({ value }) => {
  const domRef = useRef(null)
  const monacoRef = useRef<null | ReturnType<typeof monaco.editor.create>>(null)

  useEffect(() => {
    if (domRef.current && !monacoRef.current) {
      const instance = monaco.editor.create(domRef.current, {
        value,
        language: 'typescript',
        scrollBeyondLastLine: false,
        fontFamily: 'Operator Mono Lig',
        theme: 'vs-dark',
        wordWrap: 'on'
      })

      monacoRef.current = instance
    }
  }, [])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  return <div id="code-block" ref={domRef} style={{ height: '100vh', width: '50vw' }} />
}

export { CodeBlock }
