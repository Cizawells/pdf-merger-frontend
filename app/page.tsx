"use client";

import AppBar from "@/components/ui/appbar";
import ToolSelectionModal from "@/components/ui/tool-selection-modal";
import {
  Archive,
  ArrowRight,
  Edit3,
  Eye,
  FileImage,
  FileText,
  Image,
  Lock,
  Plus,
  RotateCw,
  Scissors,
  Shield,
  Unlock,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFilesContext } from "./context/context";

const PDFToolsLanding = () => {
  const { files, setFiles } = useFilesContext();
  const [hoveredTool, setHoveredTool] = useState(null);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const pdfTools = [
    {
      id: 1,
      name: "Merge PDF",
      description: "Combine multiple PDFs into one document",
      icon: <Plus className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      url: "merge_pdf",
    },
    {
      id: 2,
      name: "Split PDF",
      description: "Extract pages or split PDF into multiple files",
      icon: <Scissors className="w-8 h-8" />,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
    },
    {
      id: 3,
      name: "Compress PDF",
      description: "Reduce PDF file size while maintaining quality",
      icon: <Archive className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
    },
    {
      id: 4,
      name: "PDF to Word",
      description: "Convert PDF to editable Word documents",
      icon: <FileText className="w-8 h-8" />,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
    },
    {
      id: 5,
      name: "PDF to Image",
      description: "Convert PDF pages to JPG or PNG images",
      icon: <FileImage className="w-8 h-8" />,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      hoverColor: "hover:from-red-600 hover:to-red-700",
    },
    {
      id: 6,
      name: "Image to PDF",
      description: "Convert images to PDF format",
      icon: <Image className="w-8 h-8" />,
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      hoverColor: "hover:from-teal-600 hover:to-teal-700",
    },
    {
      id: 7,
      name: "Edit PDF",
      description: "Add text, images, and shapes to PDF",
      icon: <Edit3 className="w-8 h-8" />,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
    },
    {
      id: 8,
      name: "Sign PDF",
      description: "Add electronic signatures to documents",
      icon: <Edit3 className="w-8 h-8" />,
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      hoverColor: "hover:from-pink-600 hover:to-pink-700",
    },
    {
      id: 9,
      name: "Protect PDF",
      description: "Add password protection to PDF files",
      icon: <Lock className="w-8 h-8" />,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      hoverColor: "hover:from-yellow-600 hover:to-yellow-700",
    },
    {
      id: 10,
      name: "Unlock PDF",
      description: "Remove password protection from PDFs",
      icon: <Unlock className="w-8 h-8" />,
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      hoverColor: "hover:from-cyan-600 hover:to-cyan-700",
    },
    {
      id: 11,
      name: "Rotate PDF",
      description: "Rotate PDF pages to correct orientation",
      icon: <RotateCw className="w-8 h-8" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
    },
    {
      id: 12,
      name: "View PDF",
      description: "Read and view PDF files online",
      icon: <Eye className="w-8 h-8" />,
      color: "bg-gradient-to-br from-slate-500 to-slate-600",
      hoverColor: "hover:from-slate-600 hover:to-slate-700",
    },
  ];

  const handleFileUpload = (files) => {
    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );
    if (pdfFiles.length > 0) {
      setUploadedFiles(pdfFiles);
      setShowToolSelector(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pdfFiles = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    setFiles(
      pdfFiles.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        pages: Math.floor(Math.random() * 50) + 1, // Mock page count
        file,
      }))
    );
    setShowToolSelector(true);
  };

  const handleToolSelect = (tool) => {
    // Here you would navigate to the specific tool page with the uploaded files
    console.log(`Selected tool: ${tool.name} for files:`, uploadedFiles);
    setShowToolSelector(false);
    // In a real app: router.push(`/tools/${tool.id}?files=${uploadedFiles}`)
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Secure",
      description: "All files are processed securely and deleted after 1 hour",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process your PDFs in seconds with our optimized algorithms",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Easy to Use",
      description:
        "No registration required. Simply upload, process, and download",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <AppBar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Your Complete
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              {" "}
              PDF Toolkit
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Process, edit, and convert your PDF files with ease. All tools are
            free, secure, and work directly in your browser.
          </p>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-slate-200">
            <div
              className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer relative ${
                isDragOver
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 hover:border-red-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input").click()}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                  isDragOver ? "text-red-500" : "text-slate-400"
                }`}
              />
              <p className="text-lg font-semibold text-slate-700 mb-2">
                {isDragOver ? "Drop your PDF here" : "Drop your PDF here"}
              </p>
              <p className="text-slate-500 mb-4">or click to browse files</p>
              <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200">
                Choose Files
              </button>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Choose Your Tool
            </h2>
            <p className="text-lg text-slate-600">
              Select from our comprehensive suite of PDF processing tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pdfTools.map((tool) => (
              <Link key={tool.id} href={`/${tool.url}`} passHref>
                <div
                  className={`${tool.color} ${tool.hoverColor} text-white p-6 rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  // onClick={() => handleToolSelect(tool)}
                >
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="mb-4 opacity-90">{tool.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                    <p className="text-sm opacity-90 leading-snug">
                      {tool.description}
                    </p>
                    {hoveredTool === tool.id && (
                      <ArrowRight className="w-5 h-5 mt-3 animate-pulse" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Selection Modal */}
      {showToolSelector && (
        <ToolSelectionModal setShowToolSelector={setShowToolSelector} />
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose PDFTools?
            </h2>
            <p className="text-xl text-slate-300">
              Fast, secure, and reliable PDF processing for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">10M+</div>
              <div className="text-slate-600">Files Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">150+</div>
              <div className="text-slate-600">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                99.9%
              </div>
              <div className="text-slate-600">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 mb-2">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">PDFTools</span>
              </div>
              <p className="text-slate-400">
                Your trusted partner for PDF processing and document management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Merge PDF
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Split PDF
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Compress PDF
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Convert PDF
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 PDFTools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PDFToolsLanding;
