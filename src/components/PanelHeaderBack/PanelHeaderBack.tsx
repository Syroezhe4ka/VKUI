import * as React from "react";
import {
  Icon28ChevronBack,
  Icon28ChevronLeftOutline,
  Icon28ArrowLeftOutline,
} from "@vkontakte/icons";
import {
  PanelHeaderButton,
  PanelHeaderButtonProps,
} from "../PanelHeaderButton/PanelHeaderButton";
import { ANDROID, VKCOM, IOS } from "../../lib/platform";
import { usePlatform } from "../../hooks/usePlatform";
import { AdaptivityProps } from "../../hoc/withAdaptivity";
import { getClassName } from "../../helpers/getClassName";
import { classNames } from "../../lib/classNames";
import { useAdaptivity } from "../../hooks/useAdaptivity";
import "./PanelHeaderBack.css";

export type PanelHeaderBackProps = PanelHeaderButtonProps & {
  "aria-label"?: string;
};

const PanelHeaderBack: React.FC<PanelHeaderBackProps> = ({
  label,
  "aria-label": ariaLabel = "Назад",
  ...restProps
}: PanelHeaderButtonProps & AdaptivityProps) => {
  const platform = usePlatform();
  const { sizeX } = useAdaptivity();
  const showLabel = platform === VKCOM || platform === IOS;

  return (
    <PanelHeaderButton
      {...restProps}
      vkuiClass={classNames(
        getClassName("PanelHeaderBack", platform),
        sizeX && `PanelHeaderBack--sizeX-${sizeX}`,
        label && "PanelHeaderBack--has-label"
      )}
      label={showLabel && label}
      aria-label={ariaLabel}
    >
      {platform === ANDROID && <Icon28ArrowLeftOutline />}
      {platform === VKCOM && <Icon28ChevronLeftOutline />}
      {platform === IOS && <Icon28ChevronBack />}
    </PanelHeaderButton>
  );
};

// eslint-disable-next-line import/no-default-export
export default React.memo(PanelHeaderBack);
