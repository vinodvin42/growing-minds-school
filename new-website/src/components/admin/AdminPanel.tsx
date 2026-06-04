"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, CarouselSlide, GalleryImage, VideoItem, NewsItem, Teacher, Testimonial } from "@/types/content";
import ImageCropEditor from "@/components/admin/ImageCropEditor";
import { AdminEditorPanel, AdminListHeader, AdminListRow } from "@/components/admin/AdminListUi";

type Tab = "settings" | "homepage" | "carousel" | "gallery" | "videos" | "news" | "teachers" | "testimonials" | "about";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminPanel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("settings");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    setContent(await res.json());
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function persist(override?: SiteContent): Promise<boolean> {
    const payload = override ?? content;
    if (!payload) return false;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        if (data.content) setContent(data.content);
        else setContent(payload);
        setStatus("Saved successfully!");
        return true;
      }
      setStatus(data.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    await persist();
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) return data.url;
    alert(data.message || "Upload failed");
    return null;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!content) {
    return (
      <div className="admin-loading">
        <div className="spinner-border text-orange" role="status" />
        <p className="admin-loading__text">Loading content...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "settings", label: "Site Settings", icon: "fa-cog" },
    { id: "homepage", label: "Homepage", icon: "fa-home" },
    { id: "carousel", label: "Carousel", icon: "fa-images" },
    { id: "gallery", label: "Photo Gallery", icon: "fa-camera" },
    { id: "videos", label: "Video Library", icon: "fa-video" },
    { id: "news", label: "News & Events", icon: "fa-newspaper" },
    { id: "teachers", label: "Teachers", icon: "fa-chalkboard-teacher" },
    { id: "testimonials", label: "Testimonials", icon: "fa-quote-left" },
    { id: "about", label: "About Page", icon: "fa-info-circle" },
  ];

  const activeTab = tabs.find((t) => t.id === tab);

  function selectTab(id: Tab) {
    setTab(id);
    setSidebarOpen(false);
  }

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-header__inner">
          <div className="admin-header__brand">
            <button
              type="button"
              className="admin-header__menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="fas fa-bars" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.settings.logoUrl} alt="" className="admin-header__logo d-none d-sm-block" />
            <div className="min-w-0">
              <p className="admin-header__title">Content Manager</p>
              <p className="admin-header__subtitle d-none d-md-block">{content.settings.schoolName}</p>
            </div>
          </div>
          <div className="admin-header__actions admin-header__actions--mobile d-flex d-lg-none">
            <button type="button" className="btn btn-sm btn-orange" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          <div className="admin-header__actions d-none d-lg-flex">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light">
              <i className="fas fa-external-link-alt me-1" />
              View Site
            </a>
            <button type="button" className="btn btn-sm btn-orange" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {status && (
        <div className="admin-status">
          <div className={`alert admin-status__alert ${status.includes("success") ? "alert-success" : "alert-danger"}`}>
            <i className={`fas fa-${status.includes("success") ? "check-circle" : "exclamation-circle"} me-2`} />
            {status}
          </div>
        </div>
      )}

      <div className={`admin-overlay ${sidebarOpen ? "is-visible" : ""}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <div className="admin-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <p className="admin-sidebar__label">Manage Content</p>
          <nav aria-label="Admin sections">
            <ul className="admin-nav">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`admin-nav__btn ${tab === t.id ? "is-active" : ""}`}
                    onClick={() => selectTab(t.id)}
                  >
                    <i className={`fas ${t.icon}`} />
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="admin-main">
          <h1 className="admin-main__page-title">{activeTab?.label ?? "Admin"}</h1>
          <div className="admin-card">
            {tab === "settings" && (
              <SettingsEditor content={content} setContent={setContent} />
            )}
            {tab === "homepage" && (
              <HomepageEditor content={content} setContent={setContent} />
            )}
            {tab === "carousel" && (
              <CarouselEditor content={content} setContent={setContent} uploadFile={uploadFile} persist={persist} />
            )}
            {tab === "gallery" && (
              <GalleryEditor content={content} setContent={setContent} uploadFile={uploadFile} persist={persist} />
            )}
            {tab === "videos" && (
              <VideosEditor content={content} setContent={setContent} uploadFile={uploadFile} />
            )}
            {tab === "news" && (
              <NewsEditor content={content} setContent={setContent} />
            )}
            {tab === "teachers" && (
              <TeachersEditor content={content} setContent={setContent} uploadFile={uploadFile} persist={persist} />
            )}
            {tab === "testimonials" && (
              <TestimonialsEditor content={content} setContent={setContent} />
            )}
            {tab === "about" && (
              <AboutEditor content={content} setContent={setContent} uploadFile={uploadFile} persist={persist} />
            )}
          </div>
        </main>
      </div>

      <div className="admin-mobile-bar">
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary">
          <i className="fas fa-external-link-alt" />
        </a>
        <button type="button" className="btn btn-orange" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" className="btn btn-outline-danger" onClick={logout}>
          <i className="fas fa-sign-out-alt" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

function SettingsEditor({ content, setContent }: { content: SiteContent; setContent: (c: SiteContent) => void }) {
  const s = content.settings;
  const update = (key: keyof typeof s, value: string) =>
    setContent({ ...content, settings: { ...s, [key]: value } });

  return (
    <>
      <h2 className="admin-section-title">Site Settings</h2>
      <div className="row">
        <div className="col-md-6">
          <Field label="School Name"><input className="form-control" value={s.schoolName} onChange={(e) => update("schoolName", e.target.value)} /></Field>
          <Field label="Tagline"><input className="form-control" value={s.tagline} onChange={(e) => update("tagline", e.target.value)} /></Field>
          <Field label="Logo URL"><input className="form-control" value={s.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} /></Field>
          <Field label="Phone"><input className="form-control" value={s.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="Email"><input className="form-control" value={s.email} onChange={(e) => update("email", e.target.value)} /></Field>
        </div>
        <div className="col-md-6">
          <Field label="Address"><textarea className="form-control" rows={3} value={s.address} onChange={(e) => update("address", e.target.value)} /></Field>
          <Field label="Office Hours"><textarea className="form-control" rows={2} value={s.officeHours} onChange={(e) => update("officeHours", e.target.value)} /></Field>
          <Field label="Footer Description"><textarea className="form-control" rows={2} value={s.footerDescription} onChange={(e) => update("footerDescription", e.target.value)} /></Field>
          <Field label="Map Embed URL"><input className="form-control" value={s.mapEmbedUrl} onChange={(e) => update("mapEmbedUrl", e.target.value)} /></Field>
        </div>
      </div>
    </>
  );
}

function HomepageEditor({ content, setContent }: { content: SiteContent; setContent: (c: SiteContent) => void }) {
  const h = content.homepage;
  const update = (key: keyof typeof h, value: string) =>
    setContent({ ...content, homepage: { ...h, [key]: value } });

  return (
    <>
      <h2 className="admin-section-title">Homepage Content</h2>
      {(["badge", "heroTitle", "heroHighlight", "heroTagline", "heroDescription", "admissionTitle", "admissionYear", "admissionGrades", "featuredVideoButtonText"] as const).map((key) => (
        <Field key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}>
          <input className="form-control" value={h[key]} onChange={(e) => update(key, e.target.value)} />
        </Field>
      ))}
    </>
  );
}

function CarouselEditor({ content, setContent, uploadFile, persist }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null>; persist: (override?: SiteContent) => Promise<boolean> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const withCarousel = (slides: CarouselSlide[]) => ({ ...content, carousel: slides });

  const applyCarousel = (slides: CarouselSlide[]) => {
    const next = withCarousel(slides);
    setContent(next);
    return next;
  };

  const editingIndex = content.carousel.findIndex((s) => s.id === editingId);
  const slide = editingIndex >= 0 ? content.carousel[editingIndex] : null;

  const patchSlide = (index: number, patch: Partial<CarouselSlide>) => {
    const slides = [...content.carousel];
    slides[index] = { ...slides[index], ...patch };
    return applyCarousel(slides);
  };

  async function addSlide() {
    const newSlide: CarouselSlide = {
      id: uid(),
      imageUrl: "",
      caption: "New Slide",
      alt: "Slide",
      title: "New Slide",
      description: "",
      eyebrow: "",
      linkUrl: "/admissions",
      linkText: "Learn More",
      imagePosition: "right",
      imageFit: "cover",
      imageFocusX: 50,
      imageFocusY: 32,
    };
    const next = applyCarousel([...content.carousel, newSlide]);
    setEditingId(newSlide.id);
    await persist(next);
  }

  async function removeSlide(id: string) {
    const next = applyCarousel(content.carousel.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
    await persist(next);
  }

  if (slide && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel
        title={`Edit Slide ${i + 1}`}
        onBack={() => setEditingId(null)}
        onDelete={() => removeSlide(slide.id)}
      >
        <div className="row g-2">
          <div className="col-md-6">
            <Field label="Eyebrow"><input className="form-control" value={slide.eyebrow ?? ""} onChange={(e) => patchSlide(i, { eyebrow: e.target.value })} placeholder="Welcome" /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Image Position">
              <select className="form-select" value={slide.imagePosition ?? (i % 2 === 0 ? "right" : "left")} onChange={(e) => patchSlide(i, { imagePosition: e.target.value as "left" | "right" })}>
                <option value="left">Image Left</option>
                <option value="right">Image Right</option>
              </select>
            </Field>
          </div>
          <div className="col-12">
            <Field label="Title"><input className="form-control" value={slide.title ?? slide.caption} onChange={(e) => patchSlide(i, { title: e.target.value, caption: e.target.value })} /></Field>
          </div>
          <div className="col-12">
            <Field label="Description"><textarea className="form-control" rows={4} value={slide.description ?? ""} onChange={(e) => patchSlide(i, { description: e.target.value })} /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Button Text"><input className="form-control" value={slide.linkText ?? ""} onChange={(e) => patchSlide(i, { linkText: e.target.value })} placeholder="Learn More" /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Button Link"><input className="form-control" value={slide.linkUrl ?? ""} onChange={(e) => patchSlide(i, { linkUrl: e.target.value })} placeholder="/admissions" /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Image URL"><input className="form-control" value={slide.imageUrl} onChange={(e) => patchSlide(i, { imageUrl: e.target.value })} /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Alt Text"><input className="form-control" value={slide.alt} onChange={(e) => patchSlide(i, { alt: e.target.value })} /></Field>
          </div>
          <div className="col-12">
            <Field label="Upload Image">
              <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                if (!url) return;
                const next = patchSlide(i, { imageUrl: url });
                const ok = await persist(next);
                if (!ok) alert("Image uploaded but save failed. Click Save Changes.");
              }} />
            </Field>
          </div>
          <div className="col-12">
            <Field label="Image Crop &amp; Focus">
              <ImageCropEditor
                imageUrl={slide.imageUrl}
                fit={slide.imageFit}
                focusX={slide.imageFocusX}
                focusY={slide.imageFocusY}
                focus={slide.imageFocus}
                previewVariant="carousel"
                onChange={({ fit, focusX, focusY }) =>
                  patchSlide(i, { imageFit: fit, imageFocusX: focusX, imageFocusY: focusY })
                }
              />
            </Field>
          </div>
        </div>
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <AdminListHeader
        title="Hero Carousel Slides"
        hint="Tap Edit to open the full slide editor with image crop preview."
        count={content.carousel.length}
        addLabel="Add Slide"
        onAdd={addSlide}
      />
      {content.carousel.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-images d-block" />
          <p className="mb-0">No slides yet. Add your first carousel slide.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.carousel.map((s, i) => (
            <AdminListRow
              key={s.id}
              badge={`Slide ${i + 1}`}
              title={s.title ?? s.caption}
              subtitle={s.description}
              meta={s.eyebrow}
              imageUrl={s.imageUrl || undefined}
              onEdit={() => setEditingId(s.id)}
              onDelete={() => removeSlide(s.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function GalleryEditor({ content, setContent, uploadFile, persist }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null>; persist: (override?: SiteContent) => Promise<boolean> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const applyGallery = (gallery: GalleryImage[]) => {
    const next = { ...content, gallery };
    setContent(next);
    return next;
  };
  const editingIndex = content.gallery.findIndex((g) => g.id === editingId);
  const img = editingIndex >= 0 ? content.gallery[editingIndex] : null;

  const patchImage = (index: number, patch: Partial<GalleryImage>) => {
    const gallery = [...content.gallery];
    gallery[index] = { ...gallery[index], ...patch };
    return applyGallery(gallery);
  };

  function addPhoto() {
    const newImg: GalleryImage = { id: uid(), imageUrl: "", alt: "Photo", title: "", caption: "", category: "Campus" };
    applyGallery([...content.gallery, newImg]);
    setEditingId(newImg.id);
  }

  function removePhoto(id: string) {
    applyGallery(content.gallery.filter((g) => g.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (img && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel title={`Edit Photo ${i + 1}`} onBack={() => setEditingId(null)} onDelete={() => removePhoto(img.id)}>
        <div className="row g-2">
          <div className="col-md-6">
            <Field label="Title"><input className="form-control" value={img.title ?? ""} onChange={(e) => patchImage(i, { title: e.target.value })} placeholder="Photo title shown on gallery page" /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Category">
              <select className="form-select" value={img.category ?? "Campus"} onChange={(e) => patchImage(i, { category: e.target.value })}>
                {["Campus", "Events", "Activities", "Sports", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-12">
            <Field label="Caption / Description"><textarea className="form-control" rows={3} value={img.caption ?? ""} onChange={(e) => patchImage(i, { caption: e.target.value })} placeholder="Short description visitors see when viewing this photo" /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Image URL"><input className="form-control" value={img.imageUrl} onChange={(e) => patchImage(i, { imageUrl: e.target.value })} /></Field>
          </div>
          <div className="col-md-6">
            <Field label="Alt Text"><input className="form-control" value={img.alt} onChange={(e) => patchImage(i, { alt: e.target.value })} /></Field>
          </div>
          <div className="col-12">
            <Field label="Upload Image">
              <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                if (!url) return;
                const next = patchImage(i, { imageUrl: url });
                await persist(next);
              }} />
            </Field>
          </div>
        </div>
        {img.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.imageUrl} alt={img.alt} className="w-100 rounded mt-2" style={{ maxHeight: 240, objectFit: "cover" }} />
        )}
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <AdminListHeader title="Photo Gallery" hint="Upload photos with title, caption, and category. They appear on /gallery and the homepage preview." count={content.gallery.length} addLabel="Add Photo" onAdd={addPhoto} />
      {content.gallery.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-camera d-block" />
          <p className="mb-0">No photos yet. Add your first gallery image.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.gallery.map((g, i) => (
            <AdminListRow key={g.id} badge={g.category || `Photo ${i + 1}`} title={g.title || g.alt || "Untitled photo"} subtitle={g.caption || (g.imageUrl ? g.imageUrl.split("/").pop() : "No image URL")} imageUrl={g.imageUrl || undefined} onEdit={() => setEditingId(g.id)} onDelete={() => removePhoto(g.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function VideosEditor({ content, setContent, uploadFile }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const update = (videos: VideoItem[]) => setContent({ ...content, videos });
  const editingIndex = content.videos.findIndex((v) => v.id === editingId);
  const video = editingIndex >= 0 ? content.videos[editingIndex] : null;

  const patchVideo = (index: number, patch: Partial<VideoItem>) => {
    const videos = [...content.videos];
    videos[index] = { ...videos[index], ...patch };
    update(videos);
  };

  function addVideo() {
    const newVideo: VideoItem = { id: uid(), title: "New Video", description: "", videoUrl: "", thumbnailUrl: "", category: "other", featured: false };
    update([...content.videos, newVideo]);
    setEditingId(newVideo.id);
  }

  function removeVideo(id: string) {
    update(content.videos.filter((v) => v.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (video && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel title={`Edit Video: ${video.title}`} onBack={() => setEditingId(null)} onDelete={() => removeVideo(video.id)}>
        <p className="admin-hint mb-3">Use YouTube embed URLs (e.g. https://www.youtube.com/embed/VIDEO_ID). Mark one as featured for the homepage.</p>
        <div className="row g-2">
          <div className="col-md-6"><Field label="Title"><input className="form-control" value={video.title} onChange={(e) => patchVideo(i, { title: e.target.value })} /></Field></div>
          <div className="col-md-6">
            <Field label="Category">
              <select className="form-select" value={video.category} onChange={(e) => patchVideo(i, { category: e.target.value as VideoItem["category"] })}>
                {["tour", "events", "activities", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-12"><Field label="Description"><textarea className="form-control" rows={3} value={video.description} onChange={(e) => patchVideo(i, { description: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Video Embed URL"><input className="form-control" value={video.videoUrl} onChange={(e) => patchVideo(i, { videoUrl: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Thumbnail URL"><input className="form-control" value={video.thumbnailUrl} onChange={(e) => patchVideo(i, { thumbnailUrl: e.target.value })} /></Field></div>
          <div className="col-12">
            <Field label="Upload Thumbnail">
              <input type="file" accept="image/*" className="form-control" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadFile(f); if (url) patchVideo(i, { thumbnailUrl: url }); } }} />
            </Field>
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={video.featured} onChange={(e) => { const v = content.videos.map((vid, j) => ({ ...vid, featured: j === i ? e.target.checked : false })); update(v); }} id={`featured-${video.id}`} />
              <label className="form-check-label" htmlFor={`featured-${video.id}`}>Featured on homepage</label>
            </div>
          </div>
        </div>
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <AdminListHeader title="Video Library" hint="Tap Edit to manage embed URL, thumbnail, and featured status." count={content.videos.length} addLabel="Add Video" onAdd={addVideo} />
      {content.videos.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-video d-block" />
          <p className="mb-0">No videos yet. Add your first video.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.videos.map((v, i) => (
            <AdminListRow
              key={v.id}
              badge={v.featured ? "Featured" : `Video ${i + 1}`}
              title={v.title}
              subtitle={v.description}
              meta={v.category}
              imageUrl={v.thumbnailUrl || undefined}
              onEdit={() => setEditingId(v.id)}
              onDelete={() => removeVideo(v.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function NewsEditor({ content, setContent }: { content: SiteContent; setContent: (c: SiteContent) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const updateNews = (news: NewsItem[]) => setContent({ ...content, news });
  const ann = content.newsAnnouncement;
  const editingIndex = content.news.findIndex((n) => n.id === editingId);
  const item = editingIndex >= 0 ? content.news[editingIndex] : null;

  const patchItem = (index: number, patch: Partial<NewsItem>) => {
    const news = [...content.news];
    news[index] = { ...news[index], ...patch };
    updateNews(news);
  };

  function addItem() {
    const newItem: NewsItem = { id: uid(), title: "New Update", excerpt: "", category: "UPDATE", dateLabel: "New", icon: "fa-bell", headerColor: "bg-orange" };
    updateNews([...content.news, newItem]);
    setEditingId(newItem.id);
  }

  function removeItem(id: string) {
    updateNews(content.news.filter((n) => n.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (item && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel title={`Edit News: ${item.title}`} onBack={() => setEditingId(null)} onDelete={() => removeItem(item.id)}>
        <Field label="Title"><input className="form-control" value={item.title} onChange={(e) => patchItem(i, { title: e.target.value })} /></Field>
        <Field label="Excerpt"><textarea className="form-control" rows={3} value={item.excerpt} onChange={(e) => patchItem(i, { excerpt: e.target.value })} /></Field>
        <div className="row g-2">
          <div className="col-md-4"><Field label="Category"><input className="form-control" value={item.category} onChange={(e) => patchItem(i, { category: e.target.value })} /></Field></div>
          <div className="col-md-4"><Field label="Date Label"><input className="form-control" value={item.dateLabel} onChange={(e) => patchItem(i, { dateLabel: e.target.value })} /></Field></div>
          <div className="col-md-4"><Field label="Icon (fa-*)"><input className="form-control" value={item.icon} onChange={(e) => patchItem(i, { icon: e.target.value })} /></Field></div>
        </div>
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <h2 className="admin-section-title">News & Events</h2>
      <h3 className="admin-section-subtitle">Main Announcement Banner</h3>
      <Field label="Title"><input className="form-control" value={ann.title} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, title: e.target.value } })} /></Field>
      <Field label="Subtitle"><input className="form-control" value={ann.subtitle} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, subtitle: e.target.value } })} /></Field>
      <Field label="Description"><textarea className="form-control" rows={2} value={ann.description} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, description: e.target.value } })} /></Field>
      <hr className="admin-divider" />
      <AdminListHeader title="News Items" hint="Tap Edit to update a news card." count={content.news.length} addLabel="Add News Item" onAdd={addItem} />
      {content.news.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-newspaper d-block" />
          <p className="mb-0">No news items yet.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.news.map((n, i) => (
            <AdminListRow key={n.id} badge={n.category || `Item ${i + 1}`} title={n.title} subtitle={n.excerpt} meta={n.dateLabel} onEdit={() => setEditingId(n.id)} onDelete={() => removeItem(n.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function TeachersEditor({ content, setContent, uploadFile, persist }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null>; persist: (override?: SiteContent) => Promise<boolean> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const applyTeachers = (teachers: Teacher[]) => {
    const next = { ...content, teachers };
    setContent(next);
    return next;
  };
  const editingIndex = content.teachers.findIndex((t) => t.id === editingId);
  const teacher = editingIndex >= 0 ? content.teachers[editingIndex] : null;

  const patchTeacher = (index: number, patch: Partial<Teacher>) => {
    const teachers = [...content.teachers];
    teachers[index] = { ...teachers[index], ...patch };
    return applyTeachers(teachers);
  };

  function addTeacher() {
    const newTeacher: Teacher = { id: uid(), name: "New Teacher", role: "Teacher", experience: "", photoUrl: "" };
    applyTeachers([...content.teachers, newTeacher]);
    setEditingId(newTeacher.id);
  }

  function removeTeacher(id: string) {
    applyTeachers(content.teachers.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (teacher && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel title={`Edit Teacher: ${teacher.name}`} onBack={() => setEditingId(null)} onDelete={() => removeTeacher(teacher.id)}>
        <div className="row g-2">
          <div className="col-md-6"><Field label="Name"><input className="form-control" value={teacher.name} onChange={(e) => patchTeacher(i, { name: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Role"><input className="form-control" value={teacher.role} onChange={(e) => patchTeacher(i, { role: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Experience"><input className="form-control" value={teacher.experience} onChange={(e) => patchTeacher(i, { experience: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Photo URL"><input className="form-control" value={teacher.photoUrl} onChange={(e) => patchTeacher(i, { photoUrl: e.target.value })} /></Field></div>
          <div className="col-12">
            <Field label="Upload Photo">
              <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f);
                if (!url) return;
                const next = patchTeacher(i, { photoUrl: url });
                await persist(next);
              }} />
            </Field>
          </div>
        </div>
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <AdminListHeader title="Teachers" hint="Tap Edit to update teacher details and photo." count={content.teachers.length} addLabel="Add Teacher" onAdd={addTeacher} />
      {content.teachers.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-chalkboard-teacher d-block" />
          <p className="mb-0">No teachers yet.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.teachers.map((t, i) => (
            <AdminListRow key={t.id} badge={`Teacher ${i + 1}`} title={t.name} subtitle={t.role} meta={t.experience} imageUrl={t.photoUrl || undefined} onEdit={() => setEditingId(t.id)} onDelete={() => removeTeacher(t.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function TestimonialsEditor({ content, setContent }: { content: SiteContent; setContent: (c: SiteContent) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const update = (testimonials: Testimonial[]) => setContent({ ...content, testimonials });
  const editingIndex = content.testimonials.findIndex((t) => t.id === editingId);
  const testimonial = editingIndex >= 0 ? content.testimonials[editingIndex] : null;

  const patchTestimonial = (index: number, patch: Partial<Testimonial>) => {
    const testimonials = [...content.testimonials];
    testimonials[index] = { ...testimonials[index], ...patch };
    update(testimonials);
  };

  function addTestimonial() {
    const newItem: Testimonial = { id: uid(), quote: "", author: "", subtitle: "Happy Parents", stars: 5 };
    update([...content.testimonials, newItem]);
    setEditingId(newItem.id);
  }

  function removeTestimonial(id: string) {
    update(content.testimonials.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  if (testimonial && editingIndex >= 0) {
    const i = editingIndex;
    return (
      <AdminEditorPanel title={`Edit Testimonial: ${testimonial.author || "Untitled"}`} onBack={() => setEditingId(null)} onDelete={() => removeTestimonial(testimonial.id)}>
        <Field label="Quote"><textarea className="form-control" rows={4} value={testimonial.quote} onChange={(e) => patchTestimonial(i, { quote: e.target.value })} /></Field>
        <div className="row g-2">
          <div className="col-md-6"><Field label="Author"><input className="form-control" value={testimonial.author} onChange={(e) => patchTestimonial(i, { author: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Subtitle"><input className="form-control" value={testimonial.subtitle} onChange={(e) => patchTestimonial(i, { subtitle: e.target.value })} /></Field></div>
        </div>
      </AdminEditorPanel>
    );
  }

  return (
    <>
      <AdminListHeader title="Parent Testimonials" hint="Tap Edit to update quote and author details." count={content.testimonials.length} addLabel="Add Testimonial" onAdd={addTestimonial} />
      {content.testimonials.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-quote-left d-block" />
          <p className="mb-0">No testimonials yet.</p>
        </div>
      ) : (
        <div className="admin-list-rows">
          {content.testimonials.map((t, i) => (
            <AdminListRow key={t.id} badge={`Testimonial ${i + 1}`} title={t.author || "Anonymous"} subtitle={t.quote} meta={t.subtitle} onEdit={() => setEditingId(t.id)} onDelete={() => removeTestimonial(t.id)} />
          ))}
        </div>
      )}
    </>
  );
}

function AboutEditor({ content, setContent, uploadFile, persist }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null>; persist: (override?: SiteContent) => Promise<boolean> }) {
  const a = content.about;
  const update = (key: keyof typeof a, value: string) =>
    setContent({ ...content, about: { ...a, [key]: value } });
  const patchAbout = (patch: Partial<typeof a>) =>
    setContent({ ...content, about: { ...a, ...patch } });

  async function uploadAboutImage(key: "introImageUrl" | "approachImageUrl", file: File) {
    const url = await uploadFile(file);
    if (!url) return;
    const next = { ...content, about: { ...a, [key]: url } };
    setContent(next);
    await persist(next);
  }

  return (
    <>
      <h2 className="admin-section-title">About Page</h2>
      <div className="row">
        <div className="col-md-6">
          {(["heroTitle", "heroSubtitle", "introTitle", "introLead", "vision", "visionExtra", "mission", "missionExtra"] as const).map((key) => (
            <Field key={key} label={key}>
              {key.includes("Extra") || key === "introLead" || key === "vision" || key === "mission" ? (
                <textarea className="form-control" rows={2} value={a[key]} onChange={(e) => update(key, e.target.value)} />
              ) : (
                <input className="form-control" value={a[key]} onChange={(e) => update(key, e.target.value)} />
              )}
            </Field>
          ))}
        </div>
        <div className="col-md-6">
          <Field label="Intro Text"><textarea className="form-control" rows={4} value={a.introText} onChange={(e) => update("introText", e.target.value)} /></Field>
          <Field label="Intro Image URL"><input className="form-control" value={a.introImageUrl} onChange={(e) => update("introImageUrl", e.target.value)} /></Field>
          <input type="file" accept="image/*" className="form-control form-control-sm mb-2" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadAboutImage("introImageUrl", f); }} />
          <Field label="Intro Image Crop">
            <ImageCropEditor
              imageUrl={a.introImageUrl}
              fit={a.introImageFit}
              focusX={a.introImageFocusX}
              focusY={a.introImageFocusY}
              focus={a.introImageFocus}
              previewVariant="about"
              onChange={({ fit, focusX, focusY }) =>
                patchAbout({ introImageFit: fit, introImageFocusX: focusX, introImageFocusY: focusY })
              }
            />
          </Field>
          <Field label="Approach Image URL"><input className="form-control" value={a.approachImageUrl} onChange={(e) => update("approachImageUrl", e.target.value)} /></Field>
          <input type="file" accept="image/*" className="form-control form-control-sm mb-2" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadAboutImage("approachImageUrl", f); }} />
          <Field label="Approach Image Crop">
            <ImageCropEditor
              imageUrl={a.approachImageUrl}
              fit={a.approachImageFit}
              focusX={a.approachImageFocusX}
              focusY={a.approachImageFocusY}
              focus={a.approachImageFocus}
              previewVariant="about"
              onChange={({ fit, focusX, focusY }) =>
                patchAbout({ approachImageFit: fit, approachImageFocusX: focusX, approachImageFocusY: focusY })
              }
            />
          </Field>
        </div>
      </div>
    </>
  );
}
