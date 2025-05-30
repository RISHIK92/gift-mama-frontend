import React from "react";
import { SidebarSignin } from "../components/sidebarSignin";

export function Signin() {
  return (
    <div className="h-screen bg-[#F8F8F8] flex flex-col items-center justify-center md:block relative">
      {/* Mobile/Tablet Logo - centered above form */}
      <div className="md:hidden mb-8">
        <img
          src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778280/Group_17_hn00uo.png"
          className="h-16 w-44"
          alt="Logo"
        />
      </div>

      {/* Desktop-only elements */}
      <div className="hidden md:block absolute left-52 top-[7%] sm:w-2/3 md:w-1/2 lg:w-1/3 sm:p-6">
        <div>
          <img
            src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778280/Group_17_hn00uo.png"
            className="ml-10 h-20 w-56"
            alt="Logo"
          />
        </div>
        <p className="text-4xl font-medium mt-6 ml-6 font-jakarta">
          <span className="text-black">Thoughtful</span>
          <span className="text-[#FF3B3B]"> Gifts</span>,
        </p>
        <p className="text-4xl font-medium font-jakarta">
          <span className="text-black">Timeless</span>
          <span className="text-[#FF3B3B]"> Memories</span>!
        </p>
      </div>
      <div className="hidden md:block">
        <img
          src="https://res.cloudinary.com/df622sxkk/image/upload/v1747778543/Sparkles_1_cpr1od.png"
          className="absolute bottom-0 w-[38rem] object-contain"
          alt="Sparkles"
        />
      </div>

      {/* Signin form */}
      <div className="w-full px-4 md:fixed md:right-40 md:top-1/2 md:transform md:-translate-y-1/2 md:w-auto md:px-0">
        <SidebarSignin />
      </div>
    </div>
  );
}
