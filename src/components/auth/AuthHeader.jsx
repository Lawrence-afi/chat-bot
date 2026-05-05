const AuthHeader = ({ title, subtitle }) => (
  <div className="mb-10">
    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-3">
      {title}
    </h1>
    <p className="text-gray-600 text-[15px] leading-relaxed">{subtitle}</p>
  </div>
);

export default AuthHeader;
