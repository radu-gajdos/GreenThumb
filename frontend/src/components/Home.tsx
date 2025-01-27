import React from "react";

const Home = () => {
    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Navigation */}
            <nav className="bg-primary text-white px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <a href="#" className="text-2xl font-semibold">
                        GreenThumb
                    </a>
                    <div className="flex items-center gap-8">
                        {["Home", "Product", "Pricing", "Contact"].map(
                            (link, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="hover:text-green-200"
                                >
                                    {link}
                                </a>
                            )
                        )}
                        <button className="hover:text-green-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex flex-col w-full h-75vh">
                {/* Top Section */}
                <div className="flex w-full h-[10%]">
                    <div className="flex-[1] pt-3">
                        <img
                            src="/assets/leaf1.svg"
                            alt="Decorative leaf"
                            className="w-3/5 h-auto"
                        />
                    </div>
                    <div className="flex-[7]"></div>
                </div>

                {/* Middle Section */}
                <div className="flex w-full h-[70%]">
                    <div className="w-2/3 pt-20 pl-20">
                        <h1 className="text-dark text-5xl font-bold leading-tight">
                            Cultivate Your Perfect Garden
                        </h1>
                        <p className="text-lg text-dark max-w-xl mt-4">
                            <span className="text-[#C2703D]">GreenThumb</span>{" "}
                            is the ultimate app for{" "}
                            <span className="text-[#C2703D]">gardening</span>{" "}
                            enthusiasts, empowering you to{" "}
                            <span className="text-[#C2703D]">
                                track, manage,
                            </span>{" "}
                            and <span className="text-[#C2703D]">enhance</span>{" "}
                            your gardening journey. Whether you're growing a
                            small herb garden or cultivating a sprawling
                            vegetable paradise,{" "}
                            <span className="text-[#C2703D]">GreenThumb</span>{" "}
                            provides the tools and insights to make your garden
                            thrive.
                        </p>
                        <div className="grid grid-cols-4 gap-4 mt-10">
                            <div className="p-4">
                                <img
                                    src="/assets/leaf2.svg"
                                    alt="Decorative leaf"
                                    className="w-3/4 h-auto"
                                />
                            </div>
                            <div className="p-4"></div>
                            <div className="p-4"></div>
                            <div className="p-4">
                                <img
                                    src="/assets/leaf3.svg"
                                    alt="Decorative leaf"
                                    className="w-3/4 h-auto"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-1/3 flex justify-end items-center">
                        <img
                            src="/assets/home-illustration.svg"
                            alt="Garden illustration"
                            className="w-11/12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
