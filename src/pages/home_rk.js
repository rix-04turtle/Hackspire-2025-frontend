import Link from 'next/link';
import { FaSeedling, FaCloud, FaFlask, FaNewspaper, FaLeaf, FaMap, FaBug, FaLightbulb, FaBell, FaChartLine, FaUsers } from 'react-icons/fa';
import { MdCalculate } from 'react-icons/md';
import { Button } from '@/components/ui/button';

export default function Home() {
  const features = [
    { title: 'Crop Details', icon: FaSeedling, href: '/crop-details' },
    { title: 'Weather Insights', icon: FaCloud, href: '/weather' },
    { title: 'Soil Health', icon: FaFlask, href: '/soil-health' },
    { title: 'News & Updates', icon: FaNewspaper, href: '/news' },
    { title: 'Heal Your Plant', icon: FaLeaf, href: '/plant-health' },
    { title: 'My Field', icon: FaMap, href: '/my-field' },
    { title: 'Fertilizer Calculator', icon: MdCalculate, href: '/calculator' },
    { title: 'Pests & Diseases', icon: FaBug, href: '/pests-diseases' },
    { title: 'Cultivation Tips', icon: FaLightbulb, href: '/tips' },
    { title: 'Pest & Disease Alerts', icon: FaBell, href: '/alerts' },
    { title: 'Financial Overview', icon: FaChartLine, href: '/finance' },
    { title: 'Community Forum', icon: FaUsers, href: '/community' },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-green-800">Farming Advisory System</h1>
          <p className="text-gray-600 mt-2">Smart insights for better farming.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              href={feature.href}
              className="block"
            >
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <feature.icon className="w-8 h-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Chatbot Section */}
        <div className="fixed bottom-8 right-8">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg"
            onClick={() => alert('Chatbot functionality coming soon!')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2025 Farming Advisory System</p>
            <div className="mt-4 md:mt-0">
              <Link href="/about" className="text-green-600 hover:text-green-700 mx-2">About</Link>
              <Link href="/contact" className="text-green-600 hover:text-green-700 mx-2">Contact</Link>
              <Link href="/privacy" className="text-green-600 hover:text-green-700 mx-2">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}