import * as React from "react";
import { ScrollContext } from "../AppRoot/ScrollContext";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";

export interface ScrollSaverProps {
  initialScroll?: number;
  saveScroll: (scroll: number) => any;
}

export const ScrollSaver: React.FC<ScrollSaverProps> = ({
  children,
  initialScroll,
  saveScroll,
}) => {
  const { getScroll, scrollTo } = React.useContext(ScrollContext);
  useIsomorphicLayoutEffect(() => {
    if (typeof initialScroll === "number") {
      scrollTo(0, initialScroll);
    }
    return () => saveScroll(getScroll().y ?? 0);
  }, []);
  return <React.Fragment>{children}</React.Fragment>;
};
