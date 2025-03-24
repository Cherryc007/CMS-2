"use client"
import { useState } from "react";

const Footer = () => {
  const [hovered, setHovered] = useState(null);
  
  const footerLinks = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Documentation", "Roadmap"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Contact"]
    },
    {
      title: "Resources",
      links: ["Community", "Help Center", "Privacy", "Terms"]
    }
  ];
  
  const socialLinks = [
    { name: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
    { name: "GitHub", icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" },
    { name: "LinkedIn", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 3a2 2 0 100 4 2 2 0 000-4z" }
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 transform transition-transform duration-300 hover:translate-x-1">CMS</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              A powerful content management system designed for modern teams and developers.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a 
                  key={social.name}
                  href="#" 
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all duration-300"
                  onMouseEnter={() => setHovered(social.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transition-all duration-300 ${hovered === social.name ? 'transform -translate-y-1' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={social.icon} />
                  </svg>
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer Link Columns */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, index) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 block"
                      style={{ transitionDelay: `${index * 50}ms` }}
                      onMouseEnter={(e) => e.target.classList.add('transform', 'translate-x-1')}
                      onMouseLeave={(e) => e.target.classList.remove('transform', 'translate-x-1')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} CMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 