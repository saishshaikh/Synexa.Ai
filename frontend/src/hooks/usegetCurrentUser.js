import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import Api from '../utils/axios';

// ✅ Yahan 'export const' likhna zaroori hai!
export const useGetCurrentUser = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await Api.get("/api/me");
                dispatch(setUserData(data));
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, [dispatch]);
};