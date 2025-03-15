import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { NavbarItem } from "../components/navbar-item";
import useProducts from "../hooks/useProduct";

export function Personalized() {
    const {products,loading,error} = useProducts();
    return (
        <>
            {/* <Navbar /> */}
                <NavbarItem heading={"Personalized"} title1={"Personalized gifts curated for you"} title2={"Personalized gifts curated for your loved ones"}/>
            {/* <Footer /> */}
        </>
    )
}