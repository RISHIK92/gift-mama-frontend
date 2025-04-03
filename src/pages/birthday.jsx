import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { NavbarItem } from "../components/navbar-item";
import useProducts from "../hooks/useProduct";

export function Birthday() {
    const {products, loading, error} = useProducts();
    const subCategory = products.map((product) => product.category.includes("Birthday"));
    return (
        <>
        <HomeFlashSaleBanner />
            <Navbar />
            {subCategory &&
                <NavbarItem heading={"Birthday"} title1={"Birthday Gifts for Boys"} title2={"Birthday Gifts for Girls"}/>
            }
            <Footer />
        </>
    )
}