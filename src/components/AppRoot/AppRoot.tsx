import * as React from "react";
import { useDOM } from "../../lib/dom";
import { classNames } from "../../lib/classNames";
import { AppRootContext } from "./AppRootContext";
import { useIsomorphicLayoutEffect } from "../../lib/useIsomorphicLayoutEffect";
import { classScopingMode } from "../../lib/classScopingMode";
import { IconSettingsProvider } from "@vkontakte/icons";
import {
  elementScrollController,
  globalScrollController,
  ScrollContext,
  ScrollContextInterface,
} from "./ScrollContext";
import { noop } from "../../lib/utils";
import { useKeyboardInputTracker } from "../../hooks/useKeyboardInputTracker";
import { useInsets } from "../../hooks/useInsets";
import { Insets } from "@vkontakte/vk-bridge";
import { useAdaptivity } from "../../hooks/useAdaptivity";
import "./AppRoot.css";

// Используйте classList, но будьте осторожны
/* eslint-disable no-restricted-properties */

export interface AppRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Режим встраивания */
  mode?: "partial" | "embedded" | "full";
  window?: Window;
  /** Убирает классы без префикса (.Button) */
  noLegacyClasses?: boolean;
  scroll?: "global" | "contain";
}

export const AppRoot: React.FC<AppRootProps> = ({
  children,
  mode = "full",
  noLegacyClasses = false,
  scroll = "global",
  ...props
}) => {
  const isKeyboardInputActive = useKeyboardInputTracker();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [portalRoot, setPortalRoot] = React.useState<HTMLDivElement | null>(
    null
  );
  const { window, document } = useDOM();
  const insets = useInsets();

  const initialized = React.useRef(false);
  if (!initialized.current) {
    if (document && mode === "full") {
      document.documentElement.classList.add("vkui");
    }
    classScopingMode.noConflict = noLegacyClasses;
    initialized.current = true;
  }

  const { hasMouse } = useAdaptivity();

  // setup portal
  useIsomorphicLayoutEffect(() => {
    const portal = document!.createElement("div");
    portal.classList.add("vkui__portal-root");
    document!.body.appendChild(portal);
    setPortalRoot(portal);
    return () => {
      portal.parentElement?.removeChild(portal);
    };
  }, []);

  // setup root classes
  useIsomorphicLayoutEffect(() => {
    if (mode === "partial") {
      return noop;
    }

    const parent = rootRef.current?.parentElement;
    const classes = ["vkui__root"].concat(
      mode === "embedded" ? "vkui__root--embedded" : []
    );
    parent?.classList.add(...classes);

    return () => {
      parent?.classList.remove(...classes);
      if (mode === "full") {
        document?.documentElement.classList.remove("vkui");
      }
    };
  }, []);

  // setup insets
  useIsomorphicLayoutEffect(() => {
    if (mode === "partial" || !rootRef.current?.parentElement) {
      return noop;
    }

    const parent = rootRef.current.parentElement;

    for (const key in insets) {
      if (
        insets.hasOwnProperty(key) &&
        typeof insets[key as keyof Insets] === "number"
      ) {
        const inset = insets[key as keyof Insets];
        parent.style.setProperty(`--safe-area-inset-${key}`, `${inset}px`);
        portalRoot &&
          portalRoot.style.setProperty(
            `--safe-area-inset-${key}`,
            `${inset}px`
          );
      }
    }

    return () => {
      for (const key in insets) {
        if (insets.hasOwnProperty(key)) {
          parent.style.removeProperty(`--safe-area-inset-${key}`);
          portalRoot &&
            portalRoot.style.removeProperty(`--safe-area-inset-${key}`);
        }
      }
    };
  }, [insets, portalRoot]);

  const scrollController = React.useMemo<ScrollContextInterface>(
    () =>
      scroll === "contain"
        ? elementScrollController(rootRef)
        : globalScrollController(window, document),
    [document, scroll, window]
  );

  const content = (
    <AppRootContext.Provider
      value={{
        appRoot: rootRef,
        portalRoot: portalRoot,
        embedded: mode === "embedded",
        keyboardInput: isKeyboardInputActive,
        mode,
      }}
    >
      <ScrollContext.Provider value={scrollController}>
        <IconSettingsProvider
          classPrefix="vkui"
          globalClasses={!noLegacyClasses}
        >
          {children}
        </IconSettingsProvider>
      </ScrollContext.Provider>
    </AppRootContext.Provider>
  );

  return mode === "partial" ? (
    content
  ) : (
    <div
      ref={rootRef}
      // eslint-disable-next-line vkui/no-object-expression-in-arguments
      vkuiClass={classNames("AppRoot", {
        "AppRoot--no-mouse": !hasMouse,
      })}
      {...props}
    >
      {content}
    </div>
  );
};
