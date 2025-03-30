import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";

const useAllCategories = () => {
    const [allCategories, setAllCategories] = useState([]);
    const [allOccasions, setAllOccasions] = useState([]);
    const [allRecipients, setAllRecipients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesResponse = await fetch(`${BACKEND_URL}all-categories`);
                if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
                const categoriesData = await categoriesResponse.json();
                const subCategoriesResponse = await fetch(`${BACKEND_URL}get-categories`);
                if (!subCategoriesResponse.ok) throw new Error("Failed to fetch subcategories");
                const subCategoriesData = await subCategoriesResponse.json();

                if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                    setAllCategories(categoriesData[0].categories || []);
                    setAllOccasions(categoriesData[0].occasions || []);
                    setAllRecipients(categoriesData[0].recipients || []);
                } else {
                    throw new Error("Invalid data format received from all-categories API");
                }

                // Process get-categories data
                if (Array.isArray(subCategoriesData)) {
                    const categoryNames = subCategoriesData.map(item => item.categories);
                    setCategories(categoryNames);
                    
                    const subCategoriesMap = {};
                    subCategoriesData.forEach(item => {
                        subCategoriesMap[item.categories] = item.subCategories;
                    });
                    setSubCategories(subCategoriesMap);
                } else {
                    throw new Error("Invalid data format received from get-categories API");
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { 
        allCategories, 
        allOccasions, 
        allRecipients, 
        categories, 
        subCategories,
        loading, 
        error 
    };
};

export default useAllCategories;