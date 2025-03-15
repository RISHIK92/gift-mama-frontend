// Home.js
import { Advert } from "../components/advert";
import { NewlyArrived } from "../components/arrived";
import { Customized } from "../components/customized";
import { FlashSale } from "../components/flash";
import { HeroBanner } from "../components/heroBanner";
import { GiftsForOccasions } from "../components/occasion";
import useHomes from "../hooks/useHome";

export function Home() {
    const { home, customSections, loading } = useHomes();
    const heroData = home?.[0] || {};
    const image = heroData.advert || [];

    const renderCustomSectionsWithBanners = () => {
        // Filter only enabled sections
        const enabledSections = customSections.filter(section => section.enabled);
        
        if (!enabledSections || enabledSections.length === 0) return null;
        
        const result = [];
        let currentIndex = 0;
        
        while (currentIndex < enabledSections.length) {
            if (currentIndex < enabledSections.length) {
                const bannerIndex = currentIndex % image.length;
                result.push(
                    <Advert 
                        key={`banner-${currentIndex}`}
                        image={image[bannerIndex]} 
                    />
                );
            }
            
            const productsToAdd = Math.min(2, enabledSections.length - currentIndex);
            for (let i = 0; i < productsToAdd; i++) {
                const section = enabledSections[currentIndex];
                result.push(
                    <Customized
                        key={`section-${section.id}`}
                        customCategory={section.category}
                        title={section.title}
                    />
                );
                currentIndex++;
            }
        }
        
        return result;
    };
    
    return (
        <>
            <HeroBanner />
            {heroData.flashSaleEnabled && (
                <FlashSale description={heroData.flashSaleDescription} />
            )}
            <NewlyArrived title={"Newly Arrived"}/>
            <GiftsForOccasions />
            {renderCustomSectionsWithBanners()}
        </>
    );
}