/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type IdeaSvgrepoComSvgIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function IdeaSvgrepoComSvgIcon(props: IdeaSvgrepoComSvgIconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      viewBox={"0 0 48 48"}
      fill={"none"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fillRule={"evenodd"}
        clipRule={"evenodd"}
        d={
          "M23 5v2a1 1 0 102 0V5a1 1 0 10-2 0zm3.887 24.979h-5.764c-1.71 0-3.118 1.33-3.118 3v8.37c0 1.433 1.204 2.572 2.664 2.572h6.66c1.46 0 2.666-1.139 2.666-2.572l.007-5.81A13.007 13.007 0 0037 24.002c0-7.178-5.822-13-13-13-7.18 0-13 5.821-13 13a12.95 12.95 0 003.146 8.48 1 1 0 101.516-1.304A10.952 10.952 0 0113 24.002c0-6.074 4.925-11 11-11 6.074 0 11 4.926 11 11 0 3.844-1.979 7.251-4.995 9.22v-.24c0-1.673-1.408-3.003-3.118-3.003zm1.116 4.274l.002-1.272c0-.541-.488-1.002-1.118-1.002h-5.764c-.63 0-1.118.46-1.118 1v8.37c0 .303.285.572.664.572h6.66c.38 0 .666-.27.666-.574l.006-4.97c-.908.292-1.861.488-2.847.575a1 1 0 11-.176-1.992 10.949 10.949 0 003.025-.707zM41 23h2a1 1 0 110 2h-2a1 1 0 110-2zM7 23H5a1 1 0 100 2h2a1 1 0 100-2zm3-14.414L11.414 10A1 1 0 0110 11.414L8.586 10A1 1 0 0110 8.586zm28 2.828L39.414 10A1 1 0 0038 8.586L36.586 10A1 1 0 0038 11.414z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default IdeaSvgrepoComSvgIcon;
/* prettier-ignore-end */
