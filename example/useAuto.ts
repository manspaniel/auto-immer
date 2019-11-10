import React from "react"
import produce, { Patch } from "immer"
import { auto, Auto, Mutator, Proposer } from "../src/index"

export function useAuto<T>(
  initial: T,
  patchListener?: (patches: Patch[], inversePatches: Patch[]) => void
): [Auto<T>, Proposer<T>] {
  const [state, setState] = React.useState(initial)
  const propose = (proposal: Mutator<T>) => {
    const nextState = produce(state, proposal, (patches, inversePatches) => {
      if (patches.length > 0 && patchListener)
        patchListener(patches, inversePatches)
    }) as T
    if (nextState !== state) {
      setState(nextState)
    }
  }
  const val = auto(state, propose)
  return [val, propose]
}
