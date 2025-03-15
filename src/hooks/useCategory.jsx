import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";

const useCategory = () => {
    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}categories`);
                if (!response.ok) throw new Error("Failed to fetch categories");

                const data = await response.json();
                
                setCategory(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, []);

    return { category, loading, error };
};

export default useCategory;
