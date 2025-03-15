import { useState } from 'react';
import './App.css';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import { CartProvider } from './pages/cartContext';

const Layout = ({ children, setNavCategory }) => {
  return (
    <>
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/home" element={<Main />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/all" element={<GiftShopPage />} />
                <Route path="/category/:navCategory" element={<NavbarItem navCategory={navCategory} />} />
                
                <Route path="/cart" element={<Cart />} />
                
                <Route path="/profile" element={<Profile />} />
              </Routes>

            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
