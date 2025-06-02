import React from 'react'
import { useAuth } from '../../hooks/useAuth'


const PremiumBadge = () => {
    const { user } = useAuth();
    return (
        { user?.is_premium ? (
            <div className='premium'>
                PREMIUM
            </div>
        ):(
        <button
            onClick={() => window.location.href = '/subscribe'}
            className="bg-gray-200 px-2 py-1 rounded-full text-xs hover:bg-gray-300"
            >
            Upgrade
        </button>
        )
    }

    )
}

export default PremiumBadge
