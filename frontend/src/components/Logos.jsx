import React from 'react'
import { MdCastForEducation } from "react-icons/md";
import { SiOpenaccess } from "react-icons/si";
import { FaSackDollar } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
function Logos() {
    return (
        <div className='w-full max-w-7xl mx-auto min-h-[90px] flex items-center justify-center flex-wrap gap-4 md:mb-[50px] px-6'>

            <div className='flex items-center justify-center gap-2 px-5 py-3 rounded-3xl bg-gray-200 border border-gray-300 cursor-pointer'>
                <SiOpenaccess className='w-[30px] h-[30px] fill-black' />
                <span className='text-black'>Lifetime Access</span>
            </div>
            <div className='flex items-center justify-center gap-2 px-5 py-3 rounded-3xl bg-gray-200 border border-gray-300 cursor-pointer'>
                <FaSackDollar className='w-[30px] h-[30px] fill-black' />
                <span className='text-black'>Value For Money</span>
            </div>
            <div className='flex items-center justify-center gap-2 px-5 py-3 rounded-3xl bg-gray-200 border border-gray-300 cursor-pointer'>
                <BiSupport className='w-[35px] h-[35px] fill-black' />
                <span className='text-black'>Lifetime Support</span>
            </div>
            <div className='flex items-center justify-center gap-2 px-5 py-3 rounded-3xl bg-gray-200 border border-gray-300 cursor-pointer'>
                <FaUsers className='w-[35px] h-[35px] fill-black' />
                <span className='text-black'>Community Support</span>
            </div>

        </div>
    )
}

export default Logos
