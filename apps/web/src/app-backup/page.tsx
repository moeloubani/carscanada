import Link from 'next/link';
import { Search, Car, Shield, TrendingUp, MapPin, Calendar, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const popularMakes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla'];

  const featuredListings = [
    {
      id: 1,
      title: '2023 Honda Civic Sport',
      price: '$32,500',
      location: 'Toronto, ON',
      mileage: '15,000 km',
      year: '2023',
      imageUrl: 'https://via.placeholder.com/400x300?text=Honda+Civic',
    },
    {
      id: 2,
      title: '2022 Toyota RAV4 Hybrid',
      price: '$38,900',
      location: 'Vancouver, BC',
      mileage: '25,000 km',
      year: '2022',
      imageUrl: 'https://via.placeholder.com/400x300?text=Toyota+RAV4',
    },
    {
      id: 3,
      title: '2023 Tesla Model 3',
      price: '$55,000',
      location: 'Montreal, QC',
      mileage: '8,000 km',
      year: '2023',
      imageUrl: 'https://via.placeholder.com/400x300?text=Tesla+Model+3',
    },
    {
      id: 4,
      title: '2021 Ford F-150',
      price: '$45,500',
      location: 'Calgary, AB',
      mileage: '35,000 km',
      year: '2021',
      imageUrl: 'https://via.placeholder.com/400x300?text=Ford+F150',
    },
    {
      id: 5,
      title: '2022 BMW X3',
      price: '$52,000',
      location: 'Ottawa, ON',
      mileage: '20,000 km',
      year: '2022',
      imageUrl: 'https://via.placeholder.com/400x300?text=BMW+X3',
    },
    {
      id: 6,
      title: '2023 Mazda CX-5',
      price: '$35,000',
      location: 'Edmonton, AB',
      mileage: '12,000 km',
      year: '2023',
      imageUrl: 'https://via.placeholder.com/400x300?text=Mazda+CX5',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CarsCanada</span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/listings" className="text-gray-700 hover:text-blue-600 transition-colors">
                Browse Cars
              </Link>
              <Link href="/dealers" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dealers
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Find Your Perfect Car in Canada
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse thousands of cars from trusted dealers and private sellers across Canada
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl mx-auto">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <select 
                    id="make" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Makes</option>
                    {popularMakes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input 
                    type="text" 
                    id="model" 
                    placeholder="Any Model"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select 
                    id="location" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Provinces</option>
                    <option value="ON">Ontario</option>
                    <option value="BC">British Columbia</option>
                    <option value="AB">Alberta</option>
                    <option value="QC">Quebec</option>
                    <option value="MB">Manitoba</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="PE">Prince Edward Island</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <select 
                    id="price" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Price</option>
                    <option value="0-10000">Under $10,000</option>
                    <option value="10000-20000">$10,000 - $20,000</option>
                    <option value="20000-30000">$20,000 - $30,000</option>
                    <option value="30000-50000">$30,000 - $50,000</option>
                    <option value="50000+">$50,000+</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>Search Cars</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Listings</h2>
            <Link href="/listings" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={listing.imageUrl} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-3">{listing.price}</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{listing.year}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>{listing.mileage}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Make */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Make</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularMakes.map(make => (
              <Link
                key={make}
                href={`/listings?make=${make}`}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <Car className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-medium text-center">{make}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">15,000+</div>
              <div className="text-blue-100">Active Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Verified Dealers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2,000+</div>
              <div className="text-blue-100">Cars Sold Monthly</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Are You a Car Dealer?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of dealers already using CarsCanada to reach more customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register?type=dealer"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Selling Today
            </Link>
            <Link 
              href="/dealers"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">CarsCanada</span>
              </div>
              <p className="text-sm">Your trusted marketplace for buying and selling cars across Canada.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings" className="hover:text-white">Browse Cars</Link></li>
                <li><Link href="/dealers" className="hover:text-white">Find Dealers</Link></li>
                <li><Link href="/sell" className="hover:text-white">Sell Your Car</Link></li>
                <li><Link href="/financing" className="hover:text-white">Financing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety Tips</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CarsCanada. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}