import { useRef, useEffect, Ref } from 'preact/hooks'

const useModule = <ModuleType>(moduleFetcher: () => Promise<ModuleType>): ModuleType | null => {
  const module: Ref<ModuleType> = useRef(null)

  useEffect(() => {
    const fetchModule = async () => {
      module.current = await moduleFetcher()
    }

    fetchModule()

    return () => {
      module.current = null
    }
  }, [])

  return module && module.current
}

export { useModule }
