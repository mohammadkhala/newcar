export default function ShopSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-5 md:py-8">
      {children}
    </div>
  );
}
