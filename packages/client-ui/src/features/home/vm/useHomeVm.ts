import { useAtomValue, useSetAtom } from "jotai";
import {
  homeCountAtom,
  homeIncrementActionAtom,
  homeShowMessageActionAtom,
  homeShowMessageAtom,
} from "../state/home.atoms";

export type HomeVm = {
  state: {
    count: number;
    showMessage: boolean;
  };
  actions: {
    increment(): void;
    showMessage(): void;
  };
};

export function useHomeVm(): HomeVm {
  const count = useAtomValue(homeCountAtom);
  const showMessage = useAtomValue(homeShowMessageAtom);
  const increment = useSetAtom(homeIncrementActionAtom);
  const show = useSetAtom(homeShowMessageActionAtom);

  return {
    state: { count, showMessage },
    actions: {
      increment: () => increment(),
      showMessage: () => show(),
    },
  };
}
