import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
const Header = ({ title }: { title: string }): React.JSX.Element => {
  const router = useRouter();
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              className="text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">{title}</span>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a
              href="#"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              All Tools
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Help
            </a>
          </nav>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
            Premium
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
