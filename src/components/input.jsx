import React, { forwardRef } from "react";

export const CustomInput = forwardRef(({ placeholder, type = "text", width = "100%", height = "50px", radius = "4px" }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]"
        style={{
          width: width,
          height: height,
          borderRadius: radius,
        }}
      />
    );
});
