import { useEffect, useState } from "react";
import api from "../../../../services/api";
import PatientsHeader from "../../../components/PageHeader";
import PatientsTable from "./PatientsTable";
import { useSearch } from "../../../../context/SearchContext"; 
import ExportModal from "../../../components/ExportModal";
import { PROGRAMS } from "../../../../constants/programs";


const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [programName, setProgramName] = useState("all");

  // 2. Get global search term
  const { searchTerm } = useSearch();
   useEffect(() => {
    setPage(1);
  }, [searchTerm, programName]);

  // 3. Re-fetch whenever searchTerm changes (with debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page, programName]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients", {
        params: {
          search: searchTerm,
          page,
          limit: 15,
          programName,
        },
      });

      if (response.data.success) {
        setPatients(response.data.data || []);
        setTotalPages(
          response.data.pagination?.totalPages || 1
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "حدث خطأ أثناء تحميل بيانات المستفيدين"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setIsExportModalOpen(true);
  };

  return (
    <div dir="rtl" className="mx-auto max-w-[1350px] px-8 py-10">
      <PatientsHeader
        title="لائحة المستفيدين"
        description="عرض وإدارة جميع ملفات المستفيدين الخاصة بالمركز"
        downloadText="تنزيل لائحة المستفيدين"
        onDownload={handleDownload}
      />

      <div className="mt-10">
      
<div className="mb-6 flex flex-wrap items-center gap-3">
  <label className="font-semibold text-[#222062]">
    تصفية حسب البرنامج:
  </label>

  <div className="flex flex-wrap items-center gap-2">
    {[
      { value: "all", label: "الكل" },
      ...PROGRAMS.map((program) => ({
        value: program,
        label: program,
      })),
    ].map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => setProgramName(tab.value)}
        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          programName === tab.value
            ? "border-[#222062] bg-[#222062] text-white shadow-sm"
            : "border-[#E7E9F0] bg-white text-[#222062] hover:border-[#9EC73A] hover:bg-[#F5F7EC]"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">جاري التحميل...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-500">{error}</div>
        ) : (
           <>
            <PatientsTable patients={patients} />

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-lg border px-4 py-2 disabled:opacity-50"
              >
                السابق
              </button>

              <span className="font-medium">
                الصفحة {page} من {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border px-4 py-2 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          </>
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default PatientsPage;
