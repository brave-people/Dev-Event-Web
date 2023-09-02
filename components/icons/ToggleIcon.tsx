import { WindowContext } from "context/window";
import { useContext } from "react";
import { Icon } from "types/icon"

const ToggleIcon = ({ color, ...rest }: Icon) => {
  const { windowTheme } = useContext(WindowContext)
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...rest}
  >
    <path
      fill={`${windowTheme ? "#20222D" : "#F2F2F2"}`}
      fillOpacity={0.6}
      d="M1 16a.967.967 0 0 1-.713-.287A.968.968 0 0 1 0 15c0-.283.096-.52.287-.713A.967.967 0 0 1 1 14h4c.283 0 .52.096.713.287.191.192.287.43.287.713s-.096.52-.287.713A.967.967 0 0 1 5 16H1ZM1 4a.968.968 0 0 1-.713-.288A.968.968 0 0 1 0 3c0-.283.096-.52.287-.712A.968.968 0 0 1 1 2h8c.283 0 .52.096.713.288.191.191.287.429.287.712s-.096.52-.287.712A.968.968 0 0 1 9 4H1Zm8 14a.967.967 0 0 1-.713-.288A.968.968 0 0 1 8 17v-4c0-.283.096-.52.287-.713A.967.967 0 0 1 9 12c.283 0 .52.096.713.287.191.192.287.43.287.713v1h7c.283 0 .52.096.712.287.192.192.288.43.288.713s-.096.52-.288.713A.968.968 0 0 1 17 16h-7v1c0 .283-.096.52-.287.712A.967.967 0 0 1 9 18Zm-4-6a.967.967 0 0 1-.713-.287A.968.968 0 0 1 4 11v-1H1a.968.968 0 0 1-.713-.287A.968.968 0 0 1 0 9c0-.283.096-.52.287-.713A.968.968 0 0 1 1 8h3V7c0-.283.096-.52.287-.713A.968.968 0 0 1 5 6c.283 0 .52.096.713.287.191.192.287.43.287.713v4c0 .283-.096.52-.287.713A.967.967 0 0 1 5 12Zm4-2a.968.968 0 0 1-.713-.287A.968.968 0 0 1 8 9c0-.283.096-.52.287-.713A.968.968 0 0 1 9 8h8c.283 0 .52.096.712.287.192.192.288.43.288.713s-.096.52-.288.713A.968.968 0 0 1 17 10H9Zm4-4a.968.968 0 0 1-.713-.287A.967.967 0 0 1 12 5V1c0-.283.096-.52.287-.713A.968.968 0 0 1 13 0c.283 0 .52.096.713.287.191.192.287.43.287.713v1h3c.283 0 .52.096.712.288.192.191.288.429.288.712s-.096.52-.288.712A.968.968 0 0 1 17 4h-3v1c0 .283-.096.52-.287.713A.968.968 0 0 1 13 6Z"
    />
  </svg>
  )
}

export default ToggleIcon;
