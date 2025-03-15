import { FlashSale } from "./flash";
import { ProductCard } from "./product";
import { Advert } from "./advert";
import useProducts from "../hooks/useProduct";
import useHomes from "../hooks/useHome";
import useCategory from "../hooks/useCategory";
import Navbar from "./navbar";
import Footer from "./footer";
import { useParams } from "react-router-dom";

export function NavbarItem() {
    const { products } = useProducts();
    const { category } = useCategory();
    const { home } = useHomes();
    const { navCategory } = useParams();
    console.log(navCategory,"dcsfvgb ")
    
    const image = home?.[0]?.advert;

    const subCatagories = category
        .filter((e) => e.category === navCategory)
        .flatMap((e) => e.subCategory) || [];

    return (
        <>
            <div>
                <div className="bg-[#FFECEC] h-52 flex justify-center items-center">
                    <p className="text-3xl">{navCategory}</p>
                </div>

                <div className="mt-12">
                    <FlashSale description="Offers in this Category" />
                </div>

                {subCatagories.length > 0 ? (
                    subCatagories.map((subCat, index) => (
                        <div key={index} className="my-12 mr-20">
                            <h2 className="text-2xl font-serif italic mb-4 ml-20">{subCat}</h2>
                            <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap ml-20">
                                {products
                                    .filter((product) => product.subCategory?.includes(subCat) ?? false)
                                    .map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="ml-20">No subcategories available</p>
                )}

                <Advert image={image} />
            </div>
        </>
    );
}