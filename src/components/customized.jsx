import { ProductCard } from "./product";
import useProducts from "../hooks/useProduct";

export const Customized = ({ title, customCategory }) => {
    const { products, loading, error } = useProducts();
    const category = products.filter((product) => product.category.includes(customCategory))

    const ProductCardSkeleton = () => (
        <div className="min-w-[220px] flex-shrink-0 animate-pulse">
            <div className="h-64 bg-gray-300 rounded-md mb-2"></div>
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
    );

    if (loading) {
        return (
            <div className="my-12 px-6">
                <h2 className="text-2xl font-serif italic ml-4 sm:ml-20"></h2>
                <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap space-x-4 px-4 sm:px-20 mt-4">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <ProductCardSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="my-12 mr-20">
            
            <h2 className="text-2xl font-serif italic mb-4 ml-20">{title}</h2>
            <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap ml-24">
                {category.map((product) => (
                   <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}