import Link from "next/link";
import { useEffect, useState } from "react";

const exampleProducts = [
    { id: "v7rlFWpviexqgBRveUYJ", name: "Oats" },
    { id: "653341360601", name: "Gum" },
];

const RecentlyViewedProducts = ({ userId }: { userId: string }) => {
    const [products, setProducts] = useState<typeof exampleProducts>([]);

    useEffect(() => {
        // Simulate fetching recently viewed products for the given userId
        const fetchRecentlyViewedProducts = async () => {
            // Replace this with your actual API call
            const fetchedProducts = exampleProducts
            setProducts(fetchedProducts.slice(0, 3));
        };

        fetchRecentlyViewedProducts();
    }, [userId]);

    return (
        <div>
            {products.map((product) => (
                <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block p-4 mb-3 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100 no-underline"
                >
                    <div className="font-medium text-lg">{product.name}</div>
                </Link>
            ))}
        </div>
    );
};

export default RecentlyViewedProducts;