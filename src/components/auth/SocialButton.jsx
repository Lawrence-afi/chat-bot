const SocialButton = ({ provider }) => {
  const icons = {
    facebook: (
      <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
        <span className="text-white text-3xl font-bold leading-none">f</span>
      </div>
    ),
    google: (
      <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white">
        <img
          src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
          alt="Google"
          className="w-6 h-6"
        />
      </div>
    ),
    apple: (
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
        <span className="text-white text-3xl"></span>
      </div>
    ),
  };

  return (
    <button className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
      {icons[provider]}
    </button>
  );
};

export default SocialButton;
