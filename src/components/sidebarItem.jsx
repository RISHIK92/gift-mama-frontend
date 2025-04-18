import { ReactElement } from "react";

export function SideBarItem({text,icon,onClick,isActive}) {
    return <div className={`flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-custom-orange ${isActive ? "bg-custom-orange" : "text-gray-700"}`} onClick={onClick}>
        <div className="p-2">
            {icon}
        </div> 
        <div className="p-2">
            {text}
        </div>
    </div>
}