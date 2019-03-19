import { useRef, useEffect, Ref } from 'preact/hooks'

type ModuleFetcher<T> = () => Promise<T>

const useModule = <ModuleType>(moduleFetcher: ModuleFetcher<ModuleType>): ModuleType | null => {
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
