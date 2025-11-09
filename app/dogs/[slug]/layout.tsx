import NavbarFull from "@/components/NavbarFull";

export default function DogSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen max-h-[100dvh]">
      <NavbarFull />
      {children}
    </div>
  );
}
