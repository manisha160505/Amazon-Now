import { Link } from 'react-router-dom';

export default function AmazonFooter() {
  return (
    <footer className="bg-amazon-light text-white mt-auto">
      <Link
        to="#"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="block bg-amazon-light/80 hover:bg-gray-600 text-center py-3 text-sm font-medium border-b border-gray-600"
      >
        Back to top
      </Link>
      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="font-bold mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Press Releases</a></li>
            <li><a href="#" className="hover:underline">Amazon Science</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Connect with Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:underline">Facebook</a></li>
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Make Money with Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:underline">Sell on Amazon</a></li>
            <li><a href="#" className="hover:underline">Sell under Amazon Accelerator</a></li>
            <li><a href="#" className="hover:underline">Protect and Build Your Brand</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-3">Let Us Help You</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:underline">Your Account</a></li>
            <li><a href="#" className="hover:underline">Returns Centre</a></li>
            <li><a href="#" className="hover:underline">Help</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-600 py-6 text-center text-xs text-gray-300">
        <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
        <p className="mt-1">Amazon Flash Mode - Hackathon MVP</p>
      </div>
    </footer>
  );
}
