import React from "react";

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md w-64">
            <img 
                src={product.image} 
                alt={product.title} 
                className="w-64 h-64 object-cover rounded-md" 
            />
            <div className="mt-3">
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">${product.discountedPrice}</span>
                    <span className="text-gray-500 line-through font-extralight">${product.originalPrice}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    {product.inclusiveOfTaxes ? "Inclusive of all taxes" : "Exclusive of taxes"}
                </p>
            </div>
        </div>
    );
};

export const productData = [
    {
        id: 1,
        title: "Smartphone",
        price: 499,
        discountedPrice: 599,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
    },
    {
        id: 2,
        title: "Wireless Headphones",
        price: 149,
        discountedPrice: 199,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
    },
    {
        id: 3,
        title: "Gaming Laptop",
        price: 1199,
        discountedPrice: 1399,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
    },
    {
        id: 4,
        title: "Smart Watch",
        price: 199,
        discountedPrice: 249,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: false,
    },
    {
        id: 5,
        title: "Bluetooth Speaker",
        price: 99,
        discountedPrice: 129,
        image: "https://via.placeholder.com/300",
        inclusiveOfTaxes: true,
    }
];

const ProductList = () => {
    return (
        <div className="flex flex-wrap gap-6 justify-center p-6">
            {productData.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductList;
