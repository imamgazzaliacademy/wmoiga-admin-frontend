import ManualApplicationForm from "@/components/admission/ManualApplicationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewApplicationPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admission"
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">New Application</h1>
                    <p className="text-gray-500">Create a new student application manually.</p>
                </div>
            </div>

            <ManualApplicationForm />
        </div>
    );
}
