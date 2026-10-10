export default function SectionHeader({
    title,
    icon,
    align = "start",
}) {
    return (
        <div
            className={`
                mb-10
                flex
                w-full
                items-center
                gap-4

                ${align === "center" ? "justify-center" : ""}

                ${align === "end" ? "justify-end" : ""}
            `}
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9EC73A]/30 text-[#222062]">
                {icon}
            </div>

            <h2 className="text-3xl font-extrabold text-[#222062]">
                {title}
            </h2>
        </div>
    );
}