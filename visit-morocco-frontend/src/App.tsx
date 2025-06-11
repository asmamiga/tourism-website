import React, { useEffect, useState } from 'react';
import MoroccoShowcase from './components/MoroccoShowcase';
import FeatureCard from './components/FeatureCard';
import DestinationCard from './components/DestinationCard';
import { 
  MapPin, 
  Hotel, 
  Users, 
  Route, 
  Star, 
  Award, 
  Shield, 
  Compass,
  ArrowRight,
  Heart,
  Sparkles,
  Globe,
  Camera,
  Mountain,
  Waves
} from 'lucide-react';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "Discover Hidden Gems",
      description: "Explore Morocco's most authentic and lesser-known destinations with our curated selection of hidden treasures.",
      Icon: MapPin
    },
    {
      title: "Luxury Accommodations",
      description: "Stay in carefully selected riads, luxury hotels, and unique properties that showcase Moroccan hospitality.",
      Icon: Hotel
    },
    {
      title: "Expert Local Guides",
      description: "Connect with certified local guides who share their deep knowledge and passion for Moroccan culture.",
      Icon: Users
    },
    {
      title: "Custom Itineraries",
      description: "Create personalized travel experiences tailored to your interests, pace, and budget preferences.",
      Icon: Route
    }
  ];

  const destinations = [
    {
      name: "Royal Palace of Marrakech",
      description: "Explore the magnificent architecture and gardens of this historic royal residence in the heart of the Red City.",
      image: "https://images.pexels.com/photos/3889690/pexels-photo-3889690.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.8,
      location: "Marrakech"
    },
    {
      name: "Blue Streets of Chefchaouen",
      description: "Wander through the enchanting blue-painted alleyways of Morocco's most photogenic mountain town.",
      image: "https://images.pexels.com/photos/3889839/pexels-photo-3889839.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.9,
      location: "Chefchaouen"
    },
    {
      name: "Fes Medina UNESCO Site",
      description: "Discover the world's largest car-free urban area and immerse yourself in medieval Islamic architecture.",
      image: "https://images.pexels.com/photos/5767919/pexels-photo-5767919.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.7,
      location: "Fes"
    },
    {
      name: "Erg Chebbi Sand Dunes",
      description: "Experience the magic of the Sahara with camel treks and overnight camping under the desert stars.",
      image: "https://images.pexels.com/photos/3889715/pexels-photo-3889715.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.9,
      location: "Sahara Desert"
    },
    {
      name: "Essaouira Coastal Charm",
      description: "Enjoy the perfect blend of Atlantic coastline, historic Portuguese architecture, and vibrant arts scene.",
      image: "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.6,
      location: "Essaouira"
    },
    {
      name: "Atlas Mountains Villages",
      description: "Trek through stunning landscapes and visit traditional Berber villages in the High Atlas Mountains.",
      image: "https://images.pexels.com/photos/3889833/pexels-photo-3889833.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      rating: 4.8,
      location: "Atlas Mountains"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Travelers", Icon: Heart, color: "from-pink-500 to-red-500" },
    { number: "200+", label: "Destinations", Icon: Globe, color: "from-blue-500 to-cyan-500" },
    { number: "15+", label: "Years Experience", Icon: Award, color: "from-yellow-500 to-orange-500" },
    { number: "99%", label: "Satisfaction Rate", Icon: Star, color: "from-purple-500 to-pink-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section with Morocco Showcase */}
      <MoroccoShowcase />

      {/* Animated Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-200 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center group cursor-pointer transform transition-all duration-700 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg relative overflow-hidden`}>
                  <stat.Icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Pulsing Ring Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  
                  {/* Sparkle Effect */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
        </div>

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Mountain className="absolute top-20 left-10 w-16 h-16 text-orange-200 opacity-30 animate-bounce" style={{ animationDuration: '4s' }} />
          <Waves className="absolute bottom-20 right-10 w-20 h-20 text-blue-200 opacity-30 animate-pulse" style={{ animationDuration: '3s' }} />
          <Camera className="absolute top-1/2 left-1/4 w-12 h-12 text-red-200 opacity-30 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-orange-500 mr-3 animate-pulse" />
              <span className="text-orange-600 font-semibold tracking-wider uppercase text-sm">Premium Experience</span>
              <Sparkles className="w-8 h-8 text-orange-500 ml-3 animate-pulse" />
            </div>
            <h2 className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              Your Complete Morocco Experience
            </h2>
            <p className={`text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed transform transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              Discover the magic of Morocco with our comprehensive platform designed to make your journey unforgettable, authentic, and hassle-free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.Icon}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Popular Destinations */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Parallax Background Elements */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-red-500 mr-3 animate-bounce" />
              <span className="text-red-600 font-semibold tracking-wider uppercase text-sm">Explore Morocco</span>
              <MapPin className="w-8 h-8 text-red-500 ml-3 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Popular Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Explore these incredible locations that showcase the diversity and beauty of Morocco's rich cultural heritage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <DestinationCard
                key={index}
                name={destination.name}
                description={destination.description}
                image={destination.image}
                rating={destination.rating}
                location={destination.location}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Why Choose Us */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Shield className="w-10 h-10 text-orange-500 mr-4 animate-pulse" />
                <span className="text-orange-400 font-semibold tracking-wider uppercase text-sm">Trusted Excellence</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                Why Choose Morocco Explorer?
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                With over 15 years of experience and thousands of satisfied travelers, we're your trusted partner for discovering authentic Morocco.
              </p>
              
              <div className="space-y-8">
                {[
                  {
                    icon: Shield,
                    title: "100% Secure & Trusted",
                    description: "All our partners are verified and our platform is fully secured for your peace of mind.",
                    color: "from-green-500 to-emerald-600"
                  },
                  {
                    icon: Compass,
                    title: "Expert Local Knowledge",
                    description: "Our local experts provide authentic insights you won't find in guidebooks.",
                    color: "from-blue-500 to-cyan-600"
                  },
                  {
                    icon: Star,
                    title: "Premium Quality",
                    description: "Every experience is carefully curated to exceed your expectations.",
                    color: "from-yellow-500 to-orange-600"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-6 group">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-orange-400 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              {/* Animated Grid of Images */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  "https://images.pexels.com/photos/3889832/pexels-photo-3889832.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                  "https://images.pexels.com/photos/3889847/pexels-photo-3889847.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                  "https://images.pexels.com/photos/3889848/pexels-photo-3889848.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
                  "https://images.pexels.com/photos/3889849/pexels-photo-3889849.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                ].map((src, index) => (
                  <img 
                    key={index}
                    src={src}
                    alt={`Morocco Experience ${index + 1}`}
                    className="rounded-3xl shadow-2xl hover:scale-105 transition-all duration-700 border-4 border-white/10"
                    style={{
                      transform: `translateY(${index % 2 === 0 ? '0' : '2rem'}) rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-500 rounded-full animate-bounce opacity-80" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-white/10 rounded-full translate-x-64 translate-y-64 animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Floating Icons */}
          <Camera className="absolute top-20 right-20 w-12 h-12 text-white/20 animate-bounce" style={{ animationDuration: '3s' }} />
          <Heart className="absolute bottom-32 left-32 w-10 h-10 text-white/20 animate-pulse" style={{ animationDuration: '2s' }} />
          <Star className="absolute top-1/2 left-20 w-8 h-8 text-white/20 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-yellow-300 mr-4 animate-pulse" />
            <span className="text-yellow-200 font-semibold tracking-wider uppercase text-lg">Start Your Adventure</span>
            <Sparkles className="w-12 h-12 text-yellow-300 ml-4 animate-pulse" />
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Ready to Explore Morocco?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed opacity-90">
            Start planning your perfect Moroccan adventure today. Discover authentic experiences, connect with local experts, and create memories that will last a lifetime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button className="group relative px-12 py-6 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-yellow-50 transition-all duration-500 hover:scale-110 shadow-2xl overflow-hidden">
              <span className="relative z-10 flex items-center">
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button className="group px-12 py-6 border-3 border-white text-white font-bold text-lg rounded-full hover:bg-white hover:text-orange-600 transition-all duration-500 hover:scale-110 relative overflow-hidden">
              <span className="relative z-10">View Sample Itineraries</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xl opacity-80 mb-4">Join thousands of travelers who discovered Morocco with us</p>
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
              <span className="ml-2 text-lg font-semibold">4.9/5 from 10,000+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Morocco Explorer
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your trusted companion for authentic Moroccan adventures and unforgettable experiences.
              </p>
              <div className="flex space-x-4">
                {[Heart, Star, Globe].map((Icon, index) => (
                  <div key={index} className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                    <Icon className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Destinations",
                links: ["Marrakech", "Chefchaouen", "Fes", "Sahara Desert"]
              },
              {
                title: "Services",
                links: ["Custom Tours", "Hotel Booking", "Local Guides", "Transportation"]
              },
              {
                title: "Contact",
                links: ["info@moroccoexplorer.com", "+212 123 456 789", "Marrakech, Morocco"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-xl font-semibold mb-6 text-orange-400">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors duration-300 hover:translate-x-1 transform inline-block">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center">
              &copy; 2025 Morocco Explorer. All rights reserved. Made with 
              <Heart className="w-4 h-4 mx-2 text-red-500 animate-pulse" />
              for travelers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;