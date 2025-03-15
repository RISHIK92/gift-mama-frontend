import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";

const useAllCategories = () => {
    const [allCategories, setAllCategories] = useState([]);
    const [allOccasions, setAllOccasions] = useState([]);
    const [allRecipients, setAllRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}all-categories`);
                if (!response.ok) throw new Error("Failed to fetch categories");

                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    setAllCategories(data[0].categories || []);
                    setAllOccasions(data[0].occasions || []);
                    setAllRecipients(data[0].recipients || []);
                } else {
                    throw new Error("Invalid data format received from API");
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, []);

    return { allCategories, allOccasions, allRecipients, loading, error };
};

export default useAllCategories;
