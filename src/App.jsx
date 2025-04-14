import { useState } from 'react';
import './App.css';
import './index.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Signup } from './pages/signup';
import { Signin } from './pages/signin';
import { Dashboard } from './pages/dashboard';
import { Main } from './pages/home';
import ProductPage from './pages/product';
import { Cart } from './pages/cart';
import Profile from './pages/profile';
import { Navbar } from './components/navbar';
import GiftShopPage from './components/allProducts';
import { Footer } from './components/footer';
import { NavbarItem } from './components/navbar-item';
import { OrderHistory } from './pages/orderHistory';
import OrderDetail from './pages/orderDetail';
import Wallet from './pages/wallet'
import { OrderConfirmation } from './pages/orderConfirmation';
import { OccasionPage } from './pages/occasionPage';
import { RecipientPage } from './pages/recipientPage';
import HomeFlashSaleBanner from './components/test';
import { Wishlist } from './pages/wishlist';
import Profileside from './pages/profileSidebar';

const Layout = ({ children, setNavCategory }) => {
  return (
    <>
      <HomeFlashSaleBanner />
      <Navbar setNavCategory={setNavCategory} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  const [navCategory, setNavCategory] = useState();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        <Route
          path="/*"
          element={
            <Layout navCategory={navCategory} setNavCategory={setNavCategory}>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Main />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/all" element={<GiftShopPage />} />
                <Route path="/category/:navCategory" element={<NavbarItem navCategory={navCategory}/>} />
                <Route path="/occasions/:occasionName" element={<OccasionPage />} />
                <Route path="/recipients/:recipientName" element={<RecipientPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path='/wishlist' element={<Wishlist />}/>
                <Route path="/profile" element={<Profileside />} />
                <Route path='/orders' element={<OrderHistory />} />
                <Route path="/order/:orderId" element={<OrderDetail />}/>
                <Route path="/order-confirmation" element={<OrderConfirmation />}/>
                <Route path='/wallet' element={<Wallet />}/>
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
