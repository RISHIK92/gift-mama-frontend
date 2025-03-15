import { useState, useEffect } from "react";
import { BACKEND_URL } from "../Url";

const useHomes = () => {
    const [home, setHome] = useState([]);
    const [occasion, setOccasion] = useState([]);
    const [customSections, setCustomSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}home`);
                if (!response.ok) throw new Error("Failed to fetch data");
                
                const data = await response.json();
                
                if (!data.homeImages || !Array.isArray(data.homeImages)) {
                    throw new Error("Invalid homeImages data format");
                }
                
                if (!data.occasions || !Array.isArray(data.occasions)) {
                    throw new Error("Invalid occasions data format");
                }
                
                const formattedHomeData = data.homeImages.map((home) => ({
                    id: home.id,
                    heroBanners: home.heroImages || [],
                    titles: home.heroTitles || [],
                    subtitles: home.heroSubtitles || [],
                    advert: home.advertImages || [],
                    flashSaleEnabled: home.flashSaleEnabled,
                    flashSaleDescription: home.flashSaleDescription || "",
                }));
                
                let allCustomSections = [];
                data.homeImages.forEach(home => {
                    if (home.customSections && Array.isArray(home.customSections)) {
                        const sections = home.customSections.map(section => ({
                            id: section.id,
                            homeImagesId: section.homeImagesId,
                            category: section.category,
                            title: section.title,
                            enabled: section.enabled
                        }));
                        allCustomSections = [...allCustomSections, ...sections];
                    }
                });
                
                // Format occasion data
                const formattedOccasionData = data.occasions.map((occasion) => ({
                    id: occasion.id,
                    occasionName: occasion.occasionName || "Unknown Occasion",
                    occasionImages: occasion.occasionImages || [],
                }));
                
                setHome(formattedHomeData);
                setOccasion(formattedOccasionData);
                setCustomSections(allCustomSections.filter(section => section.enabled));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchHomeData();
    }, []);
    
    return { home, occasion, customSections, loading, error };
};

export default useHomes;