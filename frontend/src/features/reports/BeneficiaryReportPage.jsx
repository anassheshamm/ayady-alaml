import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userService from "../../services/user.service";
import patientService from "../../services/patient.service";
import reportService from "../../services/report.service";
import BackButton from "../components/BackButton";
import Swal from "sweetalert2";


const BeneficiaryReportPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [patient, setPatient] = useState(null);
  const [teamLeaders, setTeamLeaders] = useState([]);
  
  const [formData, setFormData] = useState({
    teamLeader: "",

    reportInformation: {
      programName: "",
      startDate: new Date().toISOString().split("T")[0],
    },

    generalCaseInformation: {
      addictionSeverity: "",
      previousSubstanceType: "",
      addictionDuration: "",
      previousRecoveryAttempts: 0,

      motivations: {
        personal: false,
        family: false,
        legal: false,
        other: false,
      },
    },

    initialEvaluations: {
      psychologicalStatus: "",
      behavioralStatus: "",
      programCommitment: "",
    },

    initialRecommendations: {
      recommendations: "",
    },
  });

  useEffect(() => {
    loadPatient();
    
    // Fetch Team Leaders for the dropdown
    userService.getTeamLeaders()
      .then((res) => setTeamLeaders(res.data?.data || []))
      .catch((err) => console.error("Failed to load team leaders", err));
  }, [patientId]);

const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatientById(patientId);
      const loadedPatient = response?.data?.patient || response?.patient || response;
      setPatient(loadedPatient);
      setFormData((prev) => ({
        ...prev,
        reportInformation: {
          ...prev.reportInformation,
          programName: loadedPatient.programName || "",
        },
      }));
    } catch (error) {
      Swal.fire({
        title: "تنبيه",
        text: "فشل في تحميل بيانات المستفيد.",
        icon: "error",
        confirmButtonColor: "#9EC73A",
        confirmButtonText: "حسناً",
        customClass: { popup: "font-['Cairo']" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setFormData((prev) => {
      const updated = { ...prev };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleCheckboxChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      generalCaseInformation: {
        ...prev.generalCaseInformation,
        motivations: {
          ...prev.generalCaseInformation.motivations,
          [key]: !prev.generalCaseInformation.motivations[key],
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.teamLeader) {
      Swal.fire({
        title: "خطأ في الإدخال",
        text: "الرجاء اختيار رئيس الفريق لاعتماد التقرير.",
        icon: "warning",
        confirmButtonColor: "#9EC73A",
        confirmButtonText: "حسناً",
        customClass: { popup: "font-['Cairo']" },
      });
      return;
    }

    const motivations = Object.entries(formData.generalCaseInformation.motivations)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    const payload = {
      patient: patientId,
      teamLeader: formData.teamLeader,
      reportInformation: {
        programName: formData.reportInformation.programName,
        startDate: formData.reportInformation.startDate,
      },
      generalCaseInformation: {
        addictionSeverity: formData.generalCaseInformation.addictionSeverity,
        previousSubstanceType: formData.generalCaseInformation.previousSubstanceType,
        addictionDuration: formData.generalCaseInformation.addictionDuration,
        previousRecoveryAttempts: Number(formData.generalCaseInformation.previousRecoveryAttempts),
        motivations,
      },
      initialEvaluations: {
        psychologicalStatus: formData.initialEvaluations.psychologicalStatus,
        behavioralStatus: formData.initialEvaluations.behavioralStatus,
        programCommitment: formData.initialEvaluations.programCommitment,
      },
      initialRecommendations: {
        recommendations: formData.initialRecommendations.recommendations,
      },
    };

try {
      setSaving(true);
      await reportService.createPreReport(payload);
      
      await Swal.fire({
        title: "عملية ناجحة",
        text: "تم إرسال التقرير القبلي بنجاح إلى رئيس الفريق للمراجعة والاعتماد.",
        icon: "success",
        confirmButtonColor: "#9EC73A",
        confirmButtonText: "استمرار",
        customClass: { popup: "font-['Cairo']" },
      });
      navigate(`/doctor/patient/${patientId}`);
    } catch (error) {
      Swal.fire({
        title: "خطأ",
        text: error?.response?.data?.message || "حدث خطأ أثناء إرسال التقرير.",
        icon: "error",
        confirmButtonColor: "#9EC73A",
        confirmButtonText: "حسناً",
        customClass: { popup: "font-['Cairo']" },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-['Cairo'] text-lg text-[#222062]">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#222062]/10 to-white font-['Cairo',sans-serif] text-[15px] leading-[1.9] text-[#222062]">
      <div>
      <BackButton />
      
    </div>
      <div className="mx-auto my-10 w-full max-w-[1100px] px-4 md:px-10">

        {/* ================= LETTERHEAD ================= */}
        <header className="rounded-[28px] border border-[#f9f9f9] bg-white/95 p-[28px] shadow-[0_10px_35px_rgba(30,122,90,0.08)]">
        
          <div className="mb-8 flex flex-wrap items-center justify-center gap-12">
            <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
            <img src="/logo2.png" alt="Logo" className="h-16 object-contain" />
          </div>
          <div className="my-6 h-[2px] w-full bg-gradient-to-r from-transparent via-[#222062] to-transparent" />
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-[#222062]">التقرير القبلي</h1>
              <p className="mt-2 text-gray-500">برنامج التأهيل والتعافي</p>
            </div>
            <div className="rounded-full bg-[#222062]/20 px-6 py-3 font-bold text-[#222062]">
              قبلي
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-10">

          {/* ================= BASIC INFORMATION ================= */}
          <section className="mt-12">
            <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-8 shadow-[0_10px_35px_rgba(30,122,90,0.08)]">
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">اسم المستفيد</label>
                  <input
                    type="text"
                    value={patient ? `${patient.firstName || ""} ${patient.middleName || ""} ${patient.lastName || ""}` : ""}
                    readOnly
                    className="w-full rounded-xl border border-[#E7E9F0] bg-gray-100 px-5 py-4"
                  />
                </div>
            <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">اسم البرنامج</label>
                  <input
                    type="text"
                    value={formData.reportInformation.programName}
                    readOnly
                    placeholder="لم يُحدد برنامج للمستفيد"
                    className="w-full rounded-xl border border-[#E7E9F0] bg-gray-100 px-5 py-4"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">تاريخ بداية البرنامج</label>
                  <input
                    type="date"
                    name="reportInformation.startDate"
                    value={formData.reportInformation.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">رقم الهوية</label>
                  <input
                    type="text"
                    value={patient?.nationalId || ""}
                    readOnly
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4"
                  />
                </div>
                <div className="flex flex-col gap-3 md:col-span-2">
                  <label className="font-semibold text-[#222062]">رئيس الفريق (للاعتماد)</label>
                  <select
                    name="teamLeader"
                    value={formData.teamLeader}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  >
                    <option value="">اختر رئيس الفريق...</option>
                    {teamLeaders.map((tl) => (
                      <option key={tl._id} value={tl._id}>
                        {tl.firstName} {tl.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ================= GENERAL INFORMATION ================= */}
          <section className="mt-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222062]/10 font-bold text-[#222062]">01</span>
              <h2 className="text-2xl font-bold text-[#222062]">معلومات عامة عن الحالة</h2>
            </div>
            <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-8 shadow-[0_10px_35px_rgba(30,122,90,0.08)]">
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">شدة الإدمان</label>
                  <input
                    type="text"
                    name="generalCaseInformation.addictionSeverity"
                    value={formData.generalCaseInformation.addictionSeverity}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">نوع التعاطي السابق</label>
                  <input
                    type="text"
                    name="generalCaseInformation.previousSubstanceType"
                    value={formData.generalCaseInformation.previousSubstanceType}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">مدة التعاطي</label>
                  <input
                    type="text"
                    name="generalCaseInformation.addictionDuration"
                    value={formData.generalCaseInformation.addictionDuration}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-[#222062]">عدد محاولات التعافي السابقة</label>
                  <input
                    type="number"
                    min={0}
                    name="generalCaseInformation.previousRecoveryAttempts"
                    value={formData.generalCaseInformation.previousRecoveryAttempts}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-[#222062] bg-[#222062]/5 px-5 py-4 outline-none focus:border-[#222062]"
                  />
                </div>
              </div>

              <div className="mt-8">
                <label className="mb-4 block font-semibold text-[#222062]">الدافع للالتحاق بالبرنامج</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: "personal", label: "شخصي" },
                    { key: "family", label: "عائلي" },
                    { key: "legal", label: "قانوني" },
                    { key: "other", label: "أخرى" },
                  ].map((item) => (
                    <label key={item.key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E9F0] bg-[#222062]/5 px-5 py-3 hover:border-[#222062]">
                      <input
                        type="checkbox"
                        checked={formData.generalCaseInformation.motivations[item.key]}
                        onChange={() => handleCheckboxChange(item.key)}
                        className="accent-[#222062]"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ================= INITIAL EVALUATIONS ================= */}
          <section className="mt-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222062]/5 font-bold text-[#222062]">02</span>
              <h2 className="text-2xl font-bold text-[#222062]">التقييمات الأولية</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-7 shadow-[0_10px_30px_rgba(30,122,90,0.08)]">
                <h3 className="mb-6 border-b border-[#E7E9F0] pb-4 text-center text-lg font-bold text-[#222062]">التقييم النفسي الأولي</h3>
                {[
                  { value: "stable", label: "مستقر" },
                  { value: "mild_disorder", label: "يعاني من اضطراب طفيف" },
                  { value: "severe_disorder", label: "يعاني من اضطراب شديد" },
                ].map((option) => (
                  <label key={option.value} className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E9F0] px-4 py-3 transition hover:border-[#222062] hover:bg-[#222062]/5">
                    <input
                      type="radio"
                      name="initialEvaluations.psychologicalStatus"
                      value={option.value}
                      checked={formData.initialEvaluations.psychologicalStatus === option.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, initialEvaluations: { ...prev.initialEvaluations, psychologicalStatus: e.target.value } }))}
                      className="accent-[#222062]"
                      required
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-7 shadow-[0_10px_30px_rgba(30,122,90,0.08)]">
                <h3 className="mb-6 border-b border-[#E7E9F0] pb-4 text-center text-lg font-bold text-[#222062]">التقييم السلوكي</h3>
                {[
                  { value: "cooperative", label: "تعاوني ومتجاوب" },
                  { value: "hesitant", label: "متردد" },
                  { value: "aggressive", label: "عدواني أو مقاوم" },
                ].map((option) => (
                  <label key={option.value} className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E9F0] px-4 py-3 transition hover:border-[#222062] hover:bg-[#222062]/5">
                    <input
                      type="radio"
                      name="initialEvaluations.behavioralStatus"
                      value={option.value}
                      checked={formData.initialEvaluations.behavioralStatus === option.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, initialEvaluations: { ...prev.initialEvaluations, behavioralStatus: e.target.value } }))}
                      className="accent-[#222062]"
                      required
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-7 shadow-[0_10px_30px_rgba(30,122,90,0.08)]">
                <h3 className="mb-6 border-b border-[#E7E9F0] pb-4 text-center text-lg font-bold text-[#222062]">القدرة على الالتزام بالبرنامج</h3>
                {[
                  { value: "high", label: "عالية" },
                  { value: "medium", label: "متوسطة" },
                  { value: "low", label: "ضعيفة" },
                ].map((option) => (
                  <label key={option.value} className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[#E7E9F0] px-4 py-3 transition hover:border-[#222062] hover:bg-[#222062]/5">
                    <input
                      type="radio"
                      name="initialEvaluations.programCommitment"
                      value={option.value}
                      checked={formData.initialEvaluations.programCommitment === option.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, initialEvaluations: { ...prev.initialEvaluations, programCommitment: e.target.value } }))}
                      className="accent-[#222062]"
                      required
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ================= RECOMMENDATIONS ================= */}
          <section className="mt-12">
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F7EC] font-bold text-[#222062]">03</span>
              <h2 className="text-2xl font-bold text-[#222062]">التوصيات الأولية</h2>
            </div>
            <div className="rounded-[22px] border border-[#E7E9F0] bg-white p-8 shadow-[0_10px_35px_rgba(30,122,90,0.08)]">
              <textarea
                rows={8}
                name="initialRecommendations.recommendations"
                value={formData.initialRecommendations.recommendations}
                onChange={handleInputChange}
                placeholder="اكتب التوصيات الخاصة بالمستفيد..."
                className="min-h-[180px] w-full resize-y rounded-xl border border-[#E7E9F0] bg-[#FFFFFF] px-5 py-4 outline-none transition focus:border-[#222062]"
              />
            </div>
          </section>

          {/* ================= BUTTONS ================= */}
          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row print:hidden">
            <button
              type="submit"
              disabled={saving}
              className="h-[58px] w-full max-w-[900px] rounded-2xl bg-[#222062] text-[18px] font-bold text-white transition hover:-translate-y-[1px] hover:bg-[#1b1950] focus:outline-none focus:ring-4 focus:ring-[#222062]/20 active:scale-[0.99] disabled:opacity-60 sm:flex-1"
            >
              {saving ? "جاري الحفظ..." : "حفظ التقرير وإرساله"}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="h-[58px] w-full max-w-[900px] rounded-2xl border-2 border-[#222062] bg-white text-[18px] font-bold text-[#222062] transition hover:-translate-y-[1px] hover:bg-[#222062] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#222062]/20 active:scale-[0.99] sm:flex-1"
            >
              تنزيل PDF / طباعة
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BeneficiaryReportPage;
