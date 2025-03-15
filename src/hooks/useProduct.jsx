import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}products`);
                if (!response.ok) throw new Error("Failed to fetch products");

                const data = await response.json();
                console.log(data)
                const formattedData = data.map(product => {
                    const discount = product.discount || 0;
                    const discountedPrice = product.price
                        ? Math.round(product.price - (product.price * (discount / 100)))
                        : null;

                    return {
                        id: product.id,
                        title: product.name,
                        price: product.price || 0,
                        discount,
                        discountedPrice,
                        category: product.categories || [],
                        occasion: product.occasion || [],
                        subCategory: product.subCategories || [],
                        image: product.images?.[0]?.mainImage || "https://via.placeholder.com/150",
                        subImages: product.images?.[0]?.subImages || [],
                        inclusiveOfTaxes: true,
                        showIcons: true
                    };
                });

                setProducts(formattedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, []);

    return { products, loading, error };
};

export default useProducts;
