import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { NavbarItem } from "../components/navbar-item";

export function Anniversary() {
    return (
        <div>
            <HomeFlashSaleBanner />
            <Navbar />
            <NavbarItem heading={"Anniversary Gifts"} title1={"Anniversary Gifts"} title2={"Anniversary Gifts"}/>
            <Footer />
        </div>
    )
}