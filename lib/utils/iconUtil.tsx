import { PlusIcon } from "components/icons";
import React from "react";

function getIconByName(icon: string, className: string | undefined, color: string) {
  if (icon === "plus")
    return (
      <PlusIcon 
        className={className}
        color={color}
      />
    )
}


export default getIconByName;