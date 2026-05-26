import React from 'react'
import { MdCastForEducation } from "react-icons/md";
import { SiOpenaccess } from "react-icons/si";
import { FaSackDollar } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
function Logos() {
    return (
        <div className='w-full max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-4 md:mb-[50px] px-6 py-8'>

            <div className='flex items-center justify-center gap-3 px-6 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer'>
                <SiOpenaccess className='w-[22px] h-[22px] fill-black' />
                <span className='text-black font-black text-sm uppercase tracking-wider'>Lifetime Access</span>
            </div>
            <div className='flex items-center justify-center gap-3 px-6 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer'>
                <FaSackDollar className='w-[22px] h-[22px] fill-black' />
                <span className='text-black font-black text-sm uppercase tracking-wider'>Value For Money</span>
            </div>
            <div className='flex items-center justify-center gap-3 px-6 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer'>
                <BiSupport className='w-[25px] h-[25px] fill-black' />
                <span className='text-black font-black text-sm uppercase tracking-wider'>Lifetime Support</span>
            </div>
            <div className='flex items-center justify-center gap-3 px-6 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer'>
                <FaUsers className='w-[25px] h-[25px] fill-black' />
                <span className='text-black font-black text-sm uppercase tracking-wider'>Community Support</span>
            </div>

        </div>
    )
}

export default Logos
