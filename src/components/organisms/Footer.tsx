
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight drop-shadow-lg">
          Ready to make a difference?
        </h2>
        <p className="mb-8 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Join HemoHive today and be a part of the solution to India's blood crisis.
        </p>
        <Link
          href="/register"
          className="glowing-edge relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-white transition duration-300 ease-out bg-secondary rounded-full shadow-md group"
        >
          <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-accent group-hover:translate-x-0 ease">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </span>
          <span className="absolute flex items-center justify-center w-full h-full text-white transition-all duration-300 transform group-hover:translate-x-full ease tracking-wider">Join Now</span>
          <span className="relative invisible">Join Now</span>
        </Link>
        <div className="mt-12 text-sm text-accent opacity-60">
          &copy; {new Date().getFullYear()} HemoHive. All rights reserved. | <Link href="/developer" className="hover:underline">Meet the Developer</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
