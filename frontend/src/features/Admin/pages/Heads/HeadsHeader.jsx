import { Download } from "lucide-react";

const HeadsHeader = ({ onDownload }) => {
  return (
    <>
      <div className="mb-3 text-sm text-gray-400">
        الرئيسية / رؤساء الأقسام
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold text-[#222062]">
            لائحة رؤساء الأقسام
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            عرض وإدارة جميع ملفات رؤساء الأقسام بالمركز
          </p>
        </div>

        <button
          onClick={onDownload}
          type="button"
          className="flex items-center gap-2 rounded-xl bg-[#222062] px-6 py-3 text-white transition hover:bg-[#1b1950]"
        >
          <Download size={18} />
          تنزيل اللائحة
        </button>
        
      </div>

      <div className="mt-8 h-px bg-[#E7E9F0]" />
    </>
  );
};

export default HeadsHeader;