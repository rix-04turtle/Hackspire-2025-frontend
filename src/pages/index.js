import Link from 'next/link'
import React from 'react'

const IndexPage = () => {
    const ROUTES = [
        { name: 'Home', path: '/pwa' },
        { name: "Login", path: "/login" },
        { name: "Signup", path: "/signup" },
        { name: "Crops", path: "/crops" },
        { name: "Indian States", path: "/indian-states" },
        { name: "Crop Doctor [BETA]", path: "/beta/image-upload" },
        { name: "Crop Chatbot [NEW]", path: "/beta/crop-chatbot" },
        { name: "Text TO Speech", path: "/text-to-speech" },
        { name: "Rohan's Home", path: "/rohan/home" }
    ]

    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">IndexPage</h1>
            <ul className="list-disc list-inside space-y-2">
                {ROUTES.map(route => (
                    <li
                        key={route.path}
                        className="px-3 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Link
                            href={route.path}
                            target='_blank'
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                        >
                            {route.name} [ {route.path} ]
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default IndexPage