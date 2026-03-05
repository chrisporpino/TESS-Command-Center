import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Sets --snake-t0 on :root synchronously (useLayoutEffect, empty deps) and
 * only renders children once that is done.
 *
 * Why useLayoutEffect instead of useEffect:
 *   React fires useLayoutEffect effects children-first, then parents.
 *   The ready gate ensures SnakeClockProvider's effect has already written
 *   --snake-t0 before any child's useLayoutEffect can read it.
 *
 * Why the ready gate:
 *   setReady(true) inside useLayoutEffect triggers a synchronous re-render
 *   before the browser paints — children never mount before t0 exists.
 *   Without the gate, AgentCard's useLayoutEffect (which fires before the
 *   parent's) would read an unset --snake-t0 and compute a broken delay.
 */
export function SnakeClockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--snake-t0', String(Date.now()))
    setReady(true)
  }, [])

  if (!ready) return null
  return <>{children}</>
}
