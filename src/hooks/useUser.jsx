import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";
import axios from "axios";

const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${BACKEND_URL}user`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch user");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    return { user, loading, error };
};

export default useUser;
