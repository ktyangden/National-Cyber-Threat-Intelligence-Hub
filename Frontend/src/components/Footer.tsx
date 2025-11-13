import { useNavigate, Link } from "react-router-dom";
import { useEffect } from 'react';
export default function Footer() {
const navigate = useNavigate();
useEffect(() => {
        console.time('footer-mounted');
    }, []);
    return (
        <footer className="bg-neutral-100 dark:bg-black text-neutral-300 border-t border-neutral-800 flex justify-center items-center w-full mt-auto min-h-[150px]">
            <div className="container flex flex-col lg:flex-row justify-between py-12 px-9 sm:px-9 md:px-8 mx-auto max-w-7xl">

                {/* Left section: Logo and copyright */}
                <div className="flex flex-col items-center lg:items-start lg:w-1/3 mb-8 lg:mb-0 text-center lg:text-left">
                    <a rel="noopener noreferrer" href="/home" className="flex gap-2">
                        <div className="hidden md:flex items-center">
                            <img src="https://res.cloudinary.com/dykzzd9sy/image/upload/v1763040855/logo_cykuw9.png"
                                className="size-6"
                            />
                        </div>
                        <span className="self-center text-3xl font-bold text-black dark:text-white">THREAT VISTA</span>
                    </a>
                    <div className="pt-4 text-sm text-neutral-800 dark:text-neutral-500">
                        Copyright © THREAT VISTA. All Rights Reserved.
                    </div>
                </div>

                {/* Right section: Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 lg:w-2/3">

                    {/* Section 1: Content */}
                    <div className="space-y-4">
                        <h3 className="tracking-wide uppercase text-black dark:text-neutral-400 font-semibold text-[1rem]">Content</h3>
                        <ul className="space-y-2 text-sm md:text-base">
                            <li>
                                <Link to="/" className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200">Home</Link>
                            </li>
                            <li>
                                <a onClick={() => {navigate("/honeypage")}} 
                                className="text-neutral-800 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white hover:cursor-pointer transition-colors duration-200"
                                >
                                    Honeypage
                                </a>
                            </li>
                            <li>
                                <a onClick={() => {navigate("/threat-feeds")}} 
                                className="text-neutral-800 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white hover:cursor-pointer transition-colors duration-200"
                                >
                                    Threat Feeds
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Section 2: Support */}
                    <div className="space-y-4">
                        <h3 className="tracking-wide uppercase text-black dark:text-neutral-400 font-semibold text-[1rem]">Support</h3>
                        <ul className="space-y-2 text-sm md:text-base">
                            <li>
                                <a href="https://docs.google.com/document/d/1fRtjQL_7dRpG6aUMsek7Tl3iYpSA6zfZw_zgpgo6gX0/edit?tab=t.0#heading=h.tn579u38fg74" className="text-neutral-800 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white transition-colors duration-200">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="https://docs.google.com/document/d/1fRtjQL_7dRpG6aUMsek7Tl3iYpSA6zfZw_zgpgo6gX0/edit?tab=t.0#heading=h.b5uc4dogriwx" className="text-neutral-800 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white transition-colors duration-200">Terms of Service</a>
                            </li>
                            <li>
                                <a href="https://docs.google.com/document/d/1fRtjQL_7dRpG6aUMsek7Tl3iYpSA6zfZw_zgpgo6gX0/edit?tab=t.0#heading=h.3yp6j1fpzgpo" className="text-neutral-800 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white transition-colors duration-200">Help / FAQ</a>
                            </li>
                        </ul>
                    </div>

                    {/* Section 3: About */}
                    <div className="space-y-4">
                        <h3 className="uppercase text-black dark:text-neutral-400 font-semibold text-[1rem]">About</h3>
                        <ul className="space-y-2 text-sm md:text-base">
                            <li>
                                <a href="https://mail.google.com/mail/u/0/?fs=1&to=kanishak.sharma22@st.niituniversity.in&su&body&tf=cm" className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200">Contact</a>
                            </li>
                            <li>
                                <Link to="/about" className="text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200">About Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
