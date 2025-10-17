import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  

  return (
    <Link to={`/product/${product._id}`} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col relative group">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-contain bg-white"
      />
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold mb-1 text-gray-800">{product.title}</h2>
        <p className="text-gray-600 mb-1">{product.price}</p>
        {product.available !== undefined && (
          <p className={`mb-2 text-sm font-medium ${product.available ? "text-green-600" : "text-red-500"}`}>
            {product.available ? "In Stock" : "Out of Stock"}
          </p>
        )}
      </div>
    </Link>
  );
}