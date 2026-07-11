import { Suspense } from "react";

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-walnut-600">加载中...</div>
      }
    >
      {children}
    </Suspense>
  );
}
