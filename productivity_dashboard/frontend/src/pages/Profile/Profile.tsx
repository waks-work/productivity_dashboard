import React from 'react'
import './Profile.css'
import { UserProfile } from '../../components/UserProfile/UserProfile'
import { Upcoming } from '../../components/Upcoming/Upcoming'
import { RightBar } from '../../components/RightBar/RightBar'
import { SideBar } from '../../components/SideBar/SideBar'


export const Profile = () => {
    return (
        <div>
            <SideBar />
            <UserProfile />
            <Upcoming />
            <RightBar />
        </div>
    )
}

