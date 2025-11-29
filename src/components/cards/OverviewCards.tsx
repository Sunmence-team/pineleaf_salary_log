import React from 'react'

const OverviewCards = ({ title, icon, value } : { title:string, icon: React.ReactNode, value: string | number }) => {
  return (
    <div className='bg-white p-3 w-full rounded-lg flex flex-col gap-3'>
        <div className="flex items-center justify-between">
            <p className='text-[10px]'>{title}</p>
            {icon}
        </div>
        <h3 className='md:text-2xl text-xl text-pryClr font-bold'>{value}</h3>
    </div>
  )
}

export default OverviewCards