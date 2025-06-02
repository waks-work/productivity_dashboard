import React from 'react'
import './Profile.css'
import UserProfile from '../../components/UserProfile/UserProfile'
import SideBar from '../../components/SideBar/SideBar'
import Upcoming from '../../components/Upcoming/Upcoming'
import RightBar from '../../components/RightBar/RightBar'


const Profile = () => {
    return (
        <div>
            <SideBar/>
            <UserProfile/>
            <Upcoming/>
            <RightBar/>
        </div>
    )
}

export default Profile
