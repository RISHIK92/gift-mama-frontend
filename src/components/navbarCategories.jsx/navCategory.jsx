import useCategory from "../../hooks/useCategory";
import Footer from "../footer";
import Navbar from "../navbar";
import { NavbarItem } from "../navbar-item";
import useProducts from "../../hooks/useProduct";

export function NavCategory({navCategory}) {
    const {products} = useProducts();
    const {category, loading, error} = useCategory();
    const subCategory = products.map((product) => product.category.includes(navCategory));
    return (
        <>
            {/* <Navbar /> */}
            {subCategory &&
                <NavbarItem heading={navCategory} title1={"Birthday Gifts for Boys"} title2={"Birthday Gifts for Girls"}/>
            }
            {/* <Footer /> */}
        </>
    )
}