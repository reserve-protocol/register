import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CURRENT_SCENARIOS, type Scenario } from './fixtures'

export function useCurrentScene() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const query = params.get('current')
  const requested: Scenario =
    query === null
      ? 'ready'
      : Object.hasOwn(CURRENT_SCENARIOS, query)
        ? (query as Scenario)
        : 'not-found'
  const [scenario, setScenario] = useState(requested)
  const [pendingScene, setPendingScene] = useState<Scenario | null>(null)
  const approved = useRef<Scenario | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const guarded = () => !!root.current?.querySelector('[data-guarded="true"]')
  const write = (scene: Scenario, replace = false) => {
    const next = new URLSearchParams(params)
    next.set('current', scene)
    navigate(
      { search: next.toString(), hash: location.hash },
      { replace, preventScrollReset: true }
    )
  }
  useEffect(() => {
    if (requested === scenario) {
      approved.current = null
      return
    }
    if (
      approved.current === requested ||
      !root.current?.querySelector('[data-guarded="true"]')
    ) {
      approved.current = null
      setScenario(requested)
    } else setPendingScene(requested)
  }, [requested, scenario])
  return {
    root,
    scenario,
    pendingScene,
    requestScene: (scene: Scenario) => {
      if (scene === scenario) return
      if (guarded()) setPendingScene(scene)
      else write(scene)
    },
    cancelScene: () => {
      setPendingScene(null)
      write(scenario, true)
    },
    confirmScene: () => {
      if (!pendingScene) return
      approved.current = pendingScene
      write(pendingScene)
      setScenario(pendingScene)
      setPendingScene(null)
    },
  }
}
