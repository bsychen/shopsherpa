import Link from "next/link";
import { useEffect, useState } from "react";

const RecentlyViewedProducts = ({ userId }: { userId: string }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchRecentlyViewedProducts = async () => {
            try {
                const response = await fetch(`/api/products/recents?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                } else {
                    console.error("Failed to fetch products:", await response.json());
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentlyViewedProducts();
    }, [userId]);

    // Remove loading spinner and always render the list, but apply blur/opacity when loading
    if (!products.length && !loading) return <div className="text-gray-400">No recently viewed products.</div>;

    const sortedProducts = [...products];
    const visibleProducts = showAll ? sortedProducts : sortedProducts.slice(0, 3);

    return (
        <div className={`transition-all duration-300 ${loading ? 'opacity-40 blur-[2px] pointer-events-none select-none' : 'opacity-100 blur-0'}`}>
            <ul className="space-y-3">
                {visibleProducts.map((product) => (
                    <li
                        key={product.id}
                        className="bg-zinc-50 rounded p-3 border border-zinc-200 hover:bg-zinc-100 transition cursor-pointer"
                    >
                        <Link
                            href={`/product/${product.id}`}
                            className="block w-full h-full"
                        >
                            <div className="font-semibold text-blue-600 hover:underline text-lg mb-1">
                                {product.productName}
                            </div>
                            <div className="text-xs text-gray-400">
                                Product ID: {product.id}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            {!showAll && products.length > 3 && (
                <div className="flex justify-center mt-3">
                    <button
                        className="px-4 py-2 rounded bg-zinc-200 hover:bg-zinc-300 text-sm text-zinc-700 transition"
                        onClick={() => setShowAll(true)}
                    >
                        See more
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentlyViewedProducts;