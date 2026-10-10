import { Download } from "lucide-react";

const PageHeader = ({
  title,
  description,
  downloadText,
  onDownload,
}) => {
  return (
    <section className="mb-10">
      {/* Breadcrumb */}
      <div className="mb-16 mt-16 flex justify-center text-lg">
        <span className="font-semibold text-[#222062]">
          الرئيسية
        </span>

        <span className="mx-3 text-[#9EC73A]">{">"}</span>

        <span className="text-gray-500">
          {title}
        </span>
      </div>

      {/* Title & Action Section */}
      <div dir="ltr" className="flex items-end justify-between">
        {/* Download Button */}
        {downloadText && (
          <button
            onClick={onDownload}
            type="button"
            className="flex h-12 items-center gap-2 rounded-xl bg-[#222062] px-6 text-white transition hover:opacity-90"
          >
            <Download size={18} />
            {downloadText}
          </button>
        )}

        {/* Title and Subtitle */}
        <div className="text-right">
          <h1 className="text-[44px] font-bold text-[#222062]">
            {title}
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            {description}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-px bg-[#E7E9F0]" />
    </section>
  );
};

export default PageHeader;