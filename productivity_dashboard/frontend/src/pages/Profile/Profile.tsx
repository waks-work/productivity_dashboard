import { useState, useEffect } from 'react'
import './Profile.css'
import ApiService from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../Dashboard/Dashboard';
// import { UserProfile } from '../../components/UserProfile/UserProfile'
// import { Upcoming } from '../../components/Upcoming/Upcoming'
// import { RightBar } from '../../components/RightBar/RightBar'
// import { SideBar } from '../../components/SideBar/SideBar'
/* <SideBar /> <UserProfile /> <Upcoming /> <RightBar /> */


export const Profile = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileResponse = await ApiService.users.getUserProfile<UserProfile>()
                setUser(profileResponse.data);

            } catch (err) {
                console.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const getDisplayName = (email?: string) => {
        if (!email) return "User";

        return email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    if (loading) {
        return (
            <div className="profile-page">
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-card">
                <div className="profile-top">
                    <div className="profile-avatar">
                        {user?.profile_pic ? (
                            <img
                                src={user.profile_pic}
                                alt="profile"
                                className='profile-avatar-image'
                            />) : (
                            getDisplayName(user?.email).charAt(0) || "U"
                        )}
                    </div>

                    <div>
                        <h1>{getDisplayName(user?.email)}</h1>
                        <p>{user?.email?.toLowerCase()}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h2>Account Information</h2>

                    <div className="profile-info">
                        {user?.email && (
                            <div>
                                <span>Username</span>
                                <p>{user.username ? user.username : getDisplayName(user.email)}</p>
                            </div>
                        )}

                        <div>
                            <span>Timezone</span>
                            <p>{user?.timezone || "Africa/Nairobi"}</p>
                        </div>

                        <div>
                            <span>Subscription</span>
                            <p>Premium</p>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button>Edit Profile</button>
                    <button className="danger-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>

            </div>

        </div>
    );
}

