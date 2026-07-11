import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-serif text-6xl font-bold text-walnut-300">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-walnut-900">
        未找到该品种
      </h1>
      <p className="mt-2 text-walnut-600">该核桃品种可能尚未收录</p>
      <Link href="/knowledge" className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" />
        返回知识库
      </Link>
    </div>
  );
}
