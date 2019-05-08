import { useEffect, useState } from 'preact/hooks'

const useModule = <ModuleType>(moduleFetcher: () => Promise<ModuleType>): ModuleType | null => {
  const [module, setModule] = useState(() => void 0)

  useEffect(() => {
    const fetchModule = async () => {
      setModule(await moduleFetcher())
    }

    fetchModule()
  }, [])

  return module
}

export { useModule }
