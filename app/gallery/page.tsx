"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AdminCard from "@/components/AdminCard";
import Button from "@/components/Button";
import AuthGuard from "@/components/AuthGuard";
import {
  Upload,
  Trash2,
  X,
  ImagePlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Images,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  createdAt: string;
}

const CATEGORIES = [
  "All",
  "Exterior Detailing",
  "Interior Detailing",
  "Paint Correction",
  "Ceramic Coating",
  "PPF",
  "Before & After",
  "General",
];

function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      showToast("Please select valid image files", "error");
      return;
    }
    setUploadFiles(fileArray);
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setUploadPreviews(previews);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      showToast("Please select at least one image", "error");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    let successCount = 0;
    for (let i = 0; i < uploadFiles.length; i++) {
      try {
        const formData = new FormData();
        formData.append("file", uploadFiles[i]);
        formData.append("title", uploadTitle || uploadFiles[i].name.replace(/\.[^/.]+$/, ""));
        formData.append("category", uploadCategory);
        const res = await fetch("/api/gallery", { method: "POST", body: formData });
        if (res.ok) {
          successCount++;
        }
      } catch (error) {
        console.error("Upload failed for:", uploadFiles[i].name, error);
      }
      setUploadProgress(Math.round(((i + 1) / uploadFiles.length) * 100));
    }
    setUploading(false);
    if (successCount > 0) {
      showToast(`${successCount} image(s) uploaded successfully!`, "success");
      resetUploadForm();
      setShowUploadModal(false);
      fetchImages();
    } else {
      showToast("Upload failed. Please check your Cloudinary config.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        showToast("Image deleted successfully", "success");
      } else {
        showToast("Failed to delete image", "error");
      }
    } catch (error) {
      showToast("Failed to delete image", "error");
    }
    setDeleteConfirm(null);
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setUploadTitle("");
    setUploadCategory("General");
    uploadPreviews.forEach((url) => URL.revokeObjectURL(url));
    setUploadPreviews([]);
    setUploadProgress(0);
  };

  const filteredImages = images.filter((img) => {
    const matchCategory = selectedCategory === "All" || img.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-secondary/50 font-sans">
      <Sidebar />
      <main className="lg:pl-72 px-4 md:px-8 py-8 transition-all duration-300">
        <Header title="Gallery" />

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Images", value: images.length, color: "bg-primary/10 text-primary" },
            { label: "Categories", value: new Set(images.map((i) => i.category)).size, color: "bg-emerald-50 text-emerald-600" },
            { label: "This Month", value: images.filter((i) => { const d = new Date(i.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length, color: "bg-amber-50 text-amber-600" },
            { label: "Cloudinary", value: "Active", color: "bg-violet-50 text-violet-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-brand-border p-4 hover:shadow-lg transition-all duration-300">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-border pl-11 pr-4 py-3 rounded-xl font-bold text-sm text-accent placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button onClick={() => { resetUploadForm(); setShowUploadModal(true); }}>
            <ImagePlus size={18} />
            Upload Images
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-foreground/60 border border-brand-border hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredImages.length === 0 ? (
          <AdminCard>
            <div className="text-center py-16">
              <Images className="mx-auto text-foreground/20 mb-4" size={56} />
              <h3 className="text-lg font-serif font-bold text-accent mb-2">No images yet</h3>
              <p className="text-foreground/40 text-sm mb-6">Upload your first car work images to showcase on the website</p>
              <Button onClick={() => { resetUploadForm(); setShowUploadModal(true); }}>
                <ImagePlus size={18} /> Upload Your First Image
              </Button>
            </div>
          </AdminCard>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filteredImages.map((image, idx) => (
              <div
                key={image.id}
                className="break-inside-avoid bg-white rounded-2xl border border-brand-border overflow-hidden group hover:shadow-xl transition-all duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative overflow-hidden cursor-pointer" onClick={() => setLightbox(idx)}>
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <p className="text-white text-sm font-bold truncate">{image.title}</p>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{image.category}</p>
                  </div>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
                    <Eye size={14} className="text-accent" />
                  </button>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-accent truncate">{image.title}</p>
                    <p className="text-[10px] text-foreground/40">{new Date(image.createdAt).toLocaleDateString()}</p>
                  </div>
                  {deleteConfirm === image.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(image.id)} className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-secondary text-foreground/60 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-all">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(image.id)} className="p-2 text-foreground/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-brand-border p-5 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-serif font-bold text-accent">Upload Images</h2>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">To Cloudinary CDN</p>
              </div>
              <button onClick={() => !uploading && setShowUploadModal(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/40 hover:text-accent hover:bg-gray-200 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-brand-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
                <Upload className={`mx-auto mb-3 transition-colors ${isDragging ? "text-primary" : "text-foreground/20"}`} size={40} />
                <p className="font-bold text-sm text-accent mb-1">Drop images here or click to browse</p>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">PNG, JPG, WEBP up to 10MB each</p>
              </div>

              {/* Previews */}
              {uploadPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {uploadPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(preview);
                          setUploadFiles((f) => f.filter((_, idx) => idx !== i));
                          setUploadPreviews((p) => p.filter((_, idx) => idx !== i));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">Title</label>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. BMW M4 Ceramic Coating"
                  className="w-full bg-secondary border border-transparent px-4 py-3 rounded-xl font-bold text-accent placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest pl-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-secondary border border-transparent px-4 py-3 rounded-xl font-bold text-accent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground/60">Uploading to Cloudinary...</p>
                    <p className="text-xs font-bold text-primary">{uploadProgress}%</p>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button onClick={handleUpload} disabled={uploading || uploadFiles.length === 0} className="w-full h-14">
                {uploading ? (
                  <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={18} /> Upload {uploadFiles.length > 0 ? `${uploadFiles.length} Image(s)` : "Images"}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && filteredImages[lightbox] && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
            <X size={24} />
          </button>
          {lightbox > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
              <ChevronLeft size={24} />
            </button>
          )}
          {lightbox < filteredImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
              <ChevronRight size={24} />
            </button>
          )}
          <div className="max-w-5xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img src={filteredImages[lightbox].imageUrl} alt={filteredImages[lightbox].title} className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto" />
            <div className="text-center mt-4">
              <p className="text-white font-bold">{filteredImages[lightbox].title}</p>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{filteredImages[lightbox].category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[80] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl font-bold text-sm animate-slide-up ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <AuthGuard>
      <GalleryManagement />
    </AuthGuard>
  );
}
