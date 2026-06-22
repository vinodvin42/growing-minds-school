"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, CarouselSlide, GalleryImage, VideoItem, NewsItem, Teacher, Testimonial, StudentActivity } from "@/types/content";
import ImageCropEditor from "@/components/admin/ImageCropEditor";
import {
  AdminBadge,
  AdminCellText,
  AdminEditModal,
  AdminCollapsibleSection,
  AdminTable,
  AdminTableActions,
  AdminTableThumb,
  AdminFloatingSaveBar,
} from "@/components/admin/AdminListUi";
import StudentsEditor from "@/components/admin/StudentsEditor";
import HomeworkEditor from "@/components/admin/HomeworkEditor";
import StudentMessagesEditor from "@/components/admin/StudentMessagesEditor";
import StudentFeesEditor from "@/components/admin/StudentFeesEditor";
import CalendarRemindersEditor from "@/components/admin/CalendarRemindersEditor";
import AdminTopNav from "@/components/admin/AdminTopNav";
import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  type AdminTab,
  usesWebsiteContentSave,
} from "@/components/admin/admin-nav";
import { ACTIVITY_CATEGORIES } from "@/lib/activities";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AdminPanel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");
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
    } catch {
      setStatus("Save failed — check your connection and try again.");
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

  if (!content) {
    return (
      <div className="admin-loading">
        <div className="spinner-border text-orange" role="status" />
        <p className="admin-loading__text">Loading content...</p>
      </div>
    );
  }

  const showWebsiteSave = usesWebsiteContentSave(tab);

  function selectTab(id: AdminTab) {
    setTab(id);
    setStatus("");
  }

  return (
    <div className="admin-app">
      <div className="admin-sticky-top">
        <header className="admin-header">
          <div className="admin-header__inner">
          <div className="admin-header__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.settings.logoUrl} alt="" className="admin-header__logo d-none d-sm-block" />
            <div className="min-w-0">
              <p className="admin-header__title">Admin Panel</p>
              <p className="admin-header__subtitle d-none d-md-block">{content.settings.schoolName}</p>
            </div>
          </div>
          <div className="admin-header__actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light">
              <i className="fas fa-external-link-alt me-1" />
              <span className="d-none d-sm-inline">View Site</span>
            </a>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={logout}>
              <i className="fas fa-sign-out-alt d-sm-none" />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
          </div>
        </header>

        <AdminTopNav activeTab={tab} onSelect={selectTab} />
      </div>

      {status && (
        <div className="admin-status">
          <div className={`alert admin-status__alert ${status.includes("success") ? "alert-success" : "alert-danger"}`}>
            <i className={`fas fa-${status.includes("success") ? "check-circle" : "exclamation-circle"} me-2`} />
            {status}
          </div>
        </div>
      )}

      <main className="admin-main">
        <div className="admin-card">
            {tab === "dashboard" && <AdminDashboard onSelect={selectTab} />}
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
            {tab === "activities" && (
              <ActivitiesEditor content={content} setContent={setContent} uploadFile={uploadFile} persist={persist} />
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
            {tab === "students" && <StudentsEditor />}
            {tab === "fees" && <StudentFeesEditor />}
            {tab === "homework" && <HomeworkEditor uploadFile={uploadFile} />}
            {tab === "calendar" && <CalendarRemindersEditor />}
            {tab === "messages" && <StudentMessagesEditor uploadFile={uploadFile} />}
        </div>
      </main>
      {showWebsiteSave && (
        <AdminFloatingSaveBar
          label="Save Website"
          saving={saving}
          onSave={() => save()}
          status={status.includes("success") || status.includes("failed") ? status : ""}
        />
      )}
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
    <AdminCollapsibleSection title="Site Settings" hint="Logo, contact details, footer, and map." defaultOpen>
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
    </AdminCollapsibleSection>
  );
}

function HomepageEditor({ content, setContent }: { content: SiteContent; setContent: (c: SiteContent) => void }) {
  const h = content.homepage;
  const update = (key: keyof typeof h, value: string) =>
    setContent({ ...content, homepage: { ...h, [key]: value } });

  return (
    <AdminCollapsibleSection title="Homepage" hint="Hero text and admissions banner copy." defaultOpen>
      {(["badge", "heroTitle", "heroHighlight", "heroTagline", "heroDescription", "admissionTitle", "admissionYear", "admissionGrades", "featuredVideoButtonText"] as const).map((key) => (
        <Field key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}>
          <input className="form-control" value={h[key]} onChange={(e) => update(key, e.target.value)} />
        </Field>
      ))}
    </AdminCollapsibleSection>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Hero Carousel Slides"
        hint="Edit opens a popup with image crop preview. Remember to Save Website when done."
        count={content.carousel.length}
        addLabel="Add Slide"
        onAdd={addSlide}
        defaultOpen
      >
      {content.carousel.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-images d-block" />
          <p className="mb-0">No slides yet. Add your first carousel slide.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th aria-label="Preview" />
              <th>#</th>
              <th>Title</th>
              <th>Eyebrow</th>
              <th>Image</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.carousel.map((s, i) => (
              <tr key={s.id}>
                <AdminTableThumb url={s.imageUrl || undefined} alt={s.alt} />
                <td>{i + 1}</td>
                <AdminCellText primary={s.title ?? s.caption} secondary={s.description} />
                <td>{s.eyebrow || "—"}</td>
                <td>{s.imagePosition ?? (i % 2 === 0 ? "right" : "left")}</td>
                <AdminTableActions onEdit={() => setEditingId(s.id)} onDelete={() => removeSlide(s.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={slide != null && editingIndex >= 0}
        title={slide ? `Edit Slide ${editingIndex + 1}` : "Edit Slide"}
        onClose={() => setEditingId(null)}
        onDelete={slide ? () => removeSlide(slide.id) : undefined}
        size="xl"
      >
        {slide && editingIndex >= 0 && (
          <div className="row g-2">
            <div className="col-md-6">
              <Field label="Eyebrow"><input className="form-control" value={slide.eyebrow ?? ""} onChange={(e) => patchSlide(editingIndex, { eyebrow: e.target.value })} placeholder="Welcome" /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Image Position">
                <select className="form-select" value={slide.imagePosition ?? (editingIndex % 2 === 0 ? "right" : "left")} onChange={(e) => patchSlide(editingIndex, { imagePosition: e.target.value as "left" | "right" })}>
                  <option value="left">Image Left</option>
                  <option value="right">Image Right</option>
                </select>
              </Field>
            </div>
            <div className="col-12">
              <Field label="Title"><input className="form-control" value={slide.title ?? slide.caption} onChange={(e) => patchSlide(editingIndex, { title: e.target.value, caption: e.target.value })} /></Field>
            </div>
            <div className="col-12">
              <Field label="Description"><textarea className="form-control" rows={4} value={slide.description ?? ""} onChange={(e) => patchSlide(editingIndex, { description: e.target.value })} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Button Text"><input className="form-control" value={slide.linkText ?? ""} onChange={(e) => patchSlide(editingIndex, { linkText: e.target.value })} placeholder="Learn More" /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Button Link"><input className="form-control" value={slide.linkUrl ?? ""} onChange={(e) => patchSlide(editingIndex, { linkUrl: e.target.value })} placeholder="/admissions" /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Image URL"><input className="form-control" value={slide.imageUrl} onChange={(e) => patchSlide(editingIndex, { imageUrl: e.target.value })} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Alt Text"><input className="form-control" value={slide.alt} onChange={(e) => patchSlide(editingIndex, { alt: e.target.value })} /></Field>
            </div>
            <div className="col-12">
              <Field label="Upload Image">
                <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  if (!url) return;
                  const next = patchSlide(editingIndex, { imageUrl: url });
                  const ok = await persist(next);
                  if (!ok) alert("Image uploaded but save failed. Click Save Website.");
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
                    patchSlide(editingIndex, { imageFit: fit, imageFocusX: focusX, imageFocusY: focusY })
                  }
                />
              </Field>
            </div>
          </div>
        )}
      </AdminEditModal>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Photo Gallery"
        hint="Upload photos with title, caption, and category. They appear on /gallery and the homepage preview."
        count={content.gallery.length}
        addLabel="Add Photo"
        onAdd={addPhoto}
        defaultOpen
      >
      {content.gallery.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-camera d-block" />
          <p className="mb-0">No photos yet. Add your first gallery image.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th aria-label="Preview" />
              <th>Title</th>
              <th>Category</th>
              <th>Caption</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.gallery.map((g) => (
              <tr key={g.id}>
                <AdminTableThumb url={g.imageUrl || undefined} alt={g.alt} />
                <AdminCellText primary={g.title || g.alt || "Untitled photo"} />
                <td><AdminBadge>{g.category || "Campus"}</AdminBadge></td>
                <AdminCellText primary={g.caption || "—"} truncate={false} />
                <AdminTableActions onEdit={() => setEditingId(g.id)} onDelete={() => removePhoto(g.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={img != null && editingIndex >= 0}
        title={img ? `Edit Photo ${editingIndex + 1}` : "Edit Photo"}
        onClose={() => setEditingId(null)}
        onDelete={img ? () => removePhoto(img.id) : undefined}
        size="lg"
      >
        {img && editingIndex >= 0 && (
          <>
            <div className="row g-2">
              <div className="col-md-6">
                <Field label="Title"><input className="form-control" value={img.title ?? ""} onChange={(e) => patchImage(editingIndex, { title: e.target.value })} placeholder="Photo title shown on gallery page" /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Category">
                  <select className="form-select" value={img.category ?? "Campus"} onChange={(e) => patchImage(editingIndex, { category: e.target.value })}>
                    {["Campus", "Events", "Activities", "Sports", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="col-12">
                <Field label="Caption / Description"><textarea className="form-control" rows={3} value={img.caption ?? ""} onChange={(e) => patchImage(editingIndex, { caption: e.target.value })} placeholder="Short description visitors see when viewing this photo" /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Image URL"><input className="form-control" value={img.imageUrl} onChange={(e) => patchImage(editingIndex, { imageUrl: e.target.value })} /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Alt Text"><input className="form-control" value={img.alt} onChange={(e) => patchImage(editingIndex, { alt: e.target.value })} /></Field>
              </div>
              <div className="col-12">
                <Field label="Upload Image">
                  <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadFile(f);
                    if (!url) return;
                    const next = patchImage(editingIndex, { imageUrl: url });
                    await persist(next);
                  }} />
                </Field>
              </div>
            </div>
            {img.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.imageUrl} alt={img.alt} className="w-100 rounded mt-2" style={{ maxHeight: 240, objectFit: "cover" }} />
            )}
          </>
        )}
      </AdminEditModal>
    </>
  );
}

function ActivitiesEditor({ content, setContent, uploadFile, persist }: { content: SiteContent; setContent: (c: SiteContent) => void; uploadFile: (f: File) => Promise<string | null>; persist: (override?: SiteContent) => Promise<boolean> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const section = content.activitiesSection;

  const applyActivities = (activities: StudentActivity[]) => {
    const next = { ...content, activities };
    setContent(next);
    return next;
  };

  const updateSection = (key: keyof typeof section, value: string) =>
    setContent({ ...content, activitiesSection: { ...section, [key]: value } });

  const editingIndex = content.activities.findIndex((a) => a.id === editingId);
  const activity = editingIndex >= 0 ? content.activities[editingIndex] : null;

  const patchActivity = (index: number, patch: Partial<StudentActivity>) => {
    const activities = [...content.activities];
    activities[index] = { ...activities[index], ...patch };
    return applyActivities(activities);
  };

  function addActivity() {
    const newActivity: StudentActivity = {
      id: uid(),
      title: "New Activity",
      description: "",
      body: "",
      imageUrl: "",
      alt: "Student activity",
      category: "Art & Craft",
      dateLabel: "",
      featured: false,
    };
    applyActivities([...content.activities, newActivity]);
    setEditingId(newActivity.id);
  }

  function removeActivity(id: string) {
    applyActivities(content.activities.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <>
      <AdminCollapsibleSection
        title="Section Intro"
        hint="Headline text for the homepage block and /activities page."
        defaultOpen={false}
      >
        <div className="row g-2">
          <div className="col-md-6"><Field label="Eyebrow"><input className="form-control" value={section.eyebrow} onChange={(e) => updateSection("eyebrow", e.target.value)} /></Field></div>
          <div className="col-md-3"><Field label="Title"><input className="form-control" value={section.title} onChange={(e) => updateSection("title", e.target.value)} /></Field></div>
          <div className="col-md-3"><Field label="Highlight"><input className="form-control" value={section.highlight} onChange={(e) => updateSection("highlight", e.target.value)} /></Field></div>
          <div className="col-12"><Field label="Subtitle"><textarea className="form-control" rows={2} value={section.subtitle} onChange={(e) => updateSection("subtitle", e.target.value)} /></Field></div>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Student Activities"
        hint="Card shows the short summary. View Details opens a photo + article layout with the full story."
        count={content.activities.length}
        addLabel="Add Activity"
        onAdd={addActivity}
        defaultOpen
      >
      {content.activities.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-palette d-block" />
          <p className="mb-0">No activities yet. Add your first student activity showcase.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th aria-label="Preview" />
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Featured</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.activities.map((a) => (
              <tr key={a.id}>
                <AdminTableThumb url={a.imageUrl || undefined} alt={a.alt} />
                <AdminCellText primary={a.title || "Untitled activity"} secondary={a.description} />
                <td><AdminBadge>{a.category || "—"}</AdminBadge></td>
                <td>{a.dateLabel || "—"}</td>
                <td>{a.featured ? <AdminBadge tone="success">Yes</AdminBadge> : "—"}</td>
                <AdminTableActions onEdit={() => setEditingId(a.id)} onDelete={() => removeActivity(a.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={activity != null && editingIndex >= 0}
        title={activity ? `Edit Activity: ${activity.title}` : "Edit Activity"}
        onClose={() => setEditingId(null)}
        onDelete={activity ? () => removeActivity(activity.id) : undefined}
        size="xl"
      >
        {activity && editingIndex >= 0 && (
          <>
            <div className="row g-2">
              <div className="col-md-6">
                <Field label="Title"><input className="form-control" value={activity.title} onChange={(e) => patchActivity(editingIndex, { title: e.target.value })} /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Category">
                  <select className="form-select" value={activity.category} onChange={(e) => patchActivity(editingIndex, { category: e.target.value })}>
                    {ACTIVITY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Date / Frequency Label"><input className="form-control" value={activity.dateLabel ?? ""} onChange={(e) => patchActivity(editingIndex, { dateLabel: e.target.value })} placeholder="e.g. Every Week, Jan 2026" /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Alt Text"><input className="form-control" value={activity.alt} onChange={(e) => patchActivity(editingIndex, { alt: e.target.value })} /></Field>
              </div>
              <div className="col-12">
                <Field label="Short Summary (card preview)">
                  <textarea className="form-control" rows={2} value={activity.description} onChange={(e) => patchActivity(editingIndex, { description: e.target.value })} placeholder="Brief text shown on the activity card" />
                </Field>
              </div>
              <div className="col-12">
                <Field label="Full Article (detail view)">
                  <textarea className="form-control" rows={8} value={activity.body ?? ""} onChange={(e) => patchActivity(editingIndex, { body: e.target.value })} placeholder="Write the full story for View Details. Leave a blank line between paragraphs." />
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Image URL"><input className="form-control" value={activity.imageUrl} onChange={(e) => patchActivity(editingIndex, { imageUrl: e.target.value })} /></Field>
              </div>
              <div className="col-md-6">
                <Field label="Upload Image">
                  <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadFile(f);
                    if (!url) return;
                    const next = patchActivity(editingIndex, { imageUrl: url });
                    await persist(next);
                  }} />
                </Field>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={!!activity.featured}
                    onChange={(e) => patchActivity(editingIndex, { featured: e.target.checked })}
                    id={`activity-featured-${activity.id}`}
                  />
                  <label className="form-check-label" htmlFor={`activity-featured-${activity.id}`}>
                    Show on homepage preview (up to 3 featured activities)
                  </label>
                </div>
              </div>
            </div>
            {activity.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activity.imageUrl} alt={activity.alt} className="w-100 rounded mt-2" style={{ maxHeight: 240, objectFit: "cover" }} />
            )}
          </>
        )}
      </AdminEditModal>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Video Library"
        hint="Edit opens a popup to manage embed URL, thumbnail, and featured status."
        count={content.videos.length}
        addLabel="Add Video"
        onAdd={addVideo}
        defaultOpen
      >
      {content.videos.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-video d-block" />
          <p className="mb-0">No videos yet. Add your first video.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th aria-label="Preview" />
              <th>Title</th>
              <th>Category</th>
              <th>Featured</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.videos.map((v) => (
              <tr key={v.id}>
                <AdminTableThumb url={v.thumbnailUrl || undefined} alt={v.title} />
                <AdminCellText primary={v.title} secondary={v.description} />
                <td><AdminBadge>{v.category}</AdminBadge></td>
                <td>{v.featured ? <AdminBadge tone="success">Yes</AdminBadge> : "—"}</td>
                <AdminTableActions onEdit={() => setEditingId(v.id)} onDelete={() => removeVideo(v.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={video != null && editingIndex >= 0}
        title={video ? `Edit Video: ${video.title}` : "Edit Video"}
        onClose={() => setEditingId(null)}
        onDelete={video ? () => removeVideo(video.id) : undefined}
        size="lg"
      >
        {video && editingIndex >= 0 && (
          <>
            <p className="admin-hint mb-3">Use YouTube embed URLs (e.g. https://www.youtube.com/embed/VIDEO_ID). Mark one as featured for the homepage.</p>
            <div className="row g-2">
              <div className="col-md-6"><Field label="Title"><input className="form-control" value={video.title} onChange={(e) => patchVideo(editingIndex, { title: e.target.value })} /></Field></div>
              <div className="col-md-6">
                <Field label="Category">
                  <select className="form-select" value={video.category} onChange={(e) => patchVideo(editingIndex, { category: e.target.value as VideoItem["category"] })}>
                    {["tour", "events", "activities", "other"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <div className="col-12"><Field label="Description"><textarea className="form-control" rows={3} value={video.description} onChange={(e) => patchVideo(editingIndex, { description: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Video Embed URL"><input className="form-control" value={video.videoUrl} onChange={(e) => patchVideo(editingIndex, { videoUrl: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Thumbnail URL"><input className="form-control" value={video.thumbnailUrl} onChange={(e) => patchVideo(editingIndex, { thumbnailUrl: e.target.value })} /></Field></div>
              <div className="col-12">
                <Field label="Upload Thumbnail">
                  <input type="file" accept="image/*" className="form-control" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const url = await uploadFile(f); if (url) patchVideo(editingIndex, { thumbnailUrl: url }); } }} />
                </Field>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" checked={video.featured} onChange={(e) => { const v = content.videos.map((vid, j) => ({ ...vid, featured: j === editingIndex ? e.target.checked : false })); update(v); }} id={`featured-${video.id}`} />
                  <label className="form-check-label" htmlFor={`featured-${video.id}`}>Featured on homepage</label>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminEditModal>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Main Announcement Banner"
        hint="Large banner shown at the top of the news page."
        level="subsection"
        defaultOpen={false}
      >
        <Field label="Title"><input className="form-control" value={ann.title} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, title: e.target.value } })} /></Field>
        <Field label="Subtitle"><input className="form-control" value={ann.subtitle} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, subtitle: e.target.value } })} /></Field>
        <Field label="Description"><textarea className="form-control" rows={2} value={ann.description} onChange={(e) => setContent({ ...content, newsAnnouncement: { ...ann, description: e.target.value } })} /></Field>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="News Items"
        hint="Edit opens a popup to update a news card."
        count={content.news.length}
        addLabel="Add News Item"
        onAdd={addItem}
        defaultOpen
      >
      {content.news.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-newspaper d-block" />
          <p className="mb-0">No news items yet.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Excerpt</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.news.map((n) => (
              <tr key={n.id}>
                <AdminCellText primary={n.title} />
                <td><AdminBadge>{n.category || "UPDATE"}</AdminBadge></td>
                <td>{n.dateLabel || "—"}</td>
                <AdminCellText primary={n.excerpt || "—"} />
                <AdminTableActions onEdit={() => setEditingId(n.id)} onDelete={() => removeItem(n.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={item != null && editingIndex >= 0}
        title={item ? `Edit News: ${item.title}` : "Edit News"}
        onClose={() => setEditingId(null)}
        onDelete={item ? () => removeItem(item.id) : undefined}
      >
        {item && editingIndex >= 0 && (
          <>
            <Field label="Title"><input className="form-control" value={item.title} onChange={(e) => patchItem(editingIndex, { title: e.target.value })} /></Field>
            <Field label="Excerpt"><textarea className="form-control" rows={3} value={item.excerpt} onChange={(e) => patchItem(editingIndex, { excerpt: e.target.value })} /></Field>
            <div className="row g-2">
              <div className="col-md-4"><Field label="Category"><input className="form-control" value={item.category} onChange={(e) => patchItem(editingIndex, { category: e.target.value })} /></Field></div>
              <div className="col-md-4"><Field label="Date Label"><input className="form-control" value={item.dateLabel} onChange={(e) => patchItem(editingIndex, { dateLabel: e.target.value })} /></Field></div>
              <div className="col-md-4"><Field label="Icon (fa-*)"><input className="form-control" value={item.icon} onChange={(e) => patchItem(editingIndex, { icon: e.target.value })} /></Field></div>
            </div>
          </>
        )}
      </AdminEditModal>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Teachers"
        hint="Edit opens a popup to update teacher details and photo."
        count={content.teachers.length}
        addLabel="Add Teacher"
        onAdd={addTeacher}
        defaultOpen
      >
      {content.teachers.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-chalkboard-teacher d-block" />
          <p className="mb-0">No teachers yet.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th aria-label="Photo" />
              <th>Name</th>
              <th>Role</th>
              <th>Experience</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.teachers.map((t) => (
              <tr key={t.id}>
                <AdminTableThumb url={t.photoUrl || undefined} alt={t.name} />
                <AdminCellText primary={t.name} />
                <td>{t.role || "—"}</td>
                <td>{t.experience || "—"}</td>
                <AdminTableActions onEdit={() => setEditingId(t.id)} onDelete={() => removeTeacher(t.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={teacher != null && editingIndex >= 0}
        title={teacher ? `Edit Teacher: ${teacher.name}` : "Edit Teacher"}
        onClose={() => setEditingId(null)}
        onDelete={teacher ? () => removeTeacher(teacher.id) : undefined}
      >
        {teacher && editingIndex >= 0 && (
          <div className="row g-2">
            <div className="col-md-6"><Field label="Name"><input className="form-control" value={teacher.name} onChange={(e) => patchTeacher(editingIndex, { name: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Role"><input className="form-control" value={teacher.role} onChange={(e) => patchTeacher(editingIndex, { role: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Experience"><input className="form-control" value={teacher.experience} onChange={(e) => patchTeacher(editingIndex, { experience: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Photo URL"><input className="form-control" value={teacher.photoUrl} onChange={(e) => patchTeacher(editingIndex, { photoUrl: e.target.value })} /></Field></div>
            <div className="col-12">
              <Field label="Upload Photo">
                <input type="file" accept="image/*" className="form-control" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f);
                  if (!url) return;
                  const next = patchTeacher(editingIndex, { photoUrl: url });
                  await persist(next);
                }} />
              </Field>
            </div>
          </div>
        )}
      </AdminEditModal>
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

  return (
    <>
      <AdminCollapsibleSection
        title="Parent Testimonials"
        hint="Edit opens a popup to update quote and author details."
        count={content.testimonials.length}
        addLabel="Add Testimonial"
        onAdd={addTestimonial}
        defaultOpen
      >
      {content.testimonials.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-quote-left d-block" />
          <p className="mb-0">No testimonials yet.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Author</th>
              <th>Subtitle</th>
              <th>Quote</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {content.testimonials.map((t) => (
              <tr key={t.id}>
                <AdminCellText primary={t.author || "Anonymous"} />
                <td>{t.subtitle || "—"}</td>
                <AdminCellText primary={t.quote || "—"} />
                <AdminTableActions onEdit={() => setEditingId(t.id)} onDelete={() => removeTestimonial(t.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>

      <AdminEditModal
        open={testimonial != null && editingIndex >= 0}
        title={testimonial ? `Edit Testimonial: ${testimonial.author || "Untitled"}` : "Edit Testimonial"}
        onClose={() => setEditingId(null)}
        onDelete={testimonial ? () => removeTestimonial(testimonial.id) : undefined}
      >
        {testimonial && editingIndex >= 0 && (
          <>
            <Field label="Quote"><textarea className="form-control" rows={4} value={testimonial.quote} onChange={(e) => patchTestimonial(editingIndex, { quote: e.target.value })} /></Field>
            <div className="row g-2">
              <div className="col-md-6"><Field label="Author"><input className="form-control" value={testimonial.author} onChange={(e) => patchTestimonial(editingIndex, { author: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Subtitle"><input className="form-control" value={testimonial.subtitle} onChange={(e) => patchTestimonial(editingIndex, { subtitle: e.target.value })} /></Field></div>
            </div>
          </>
        )}
      </AdminEditModal>
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
      <AdminCollapsibleSection title="Hero & story" hint="Titles, vision, mission, and intro copy." defaultOpen>
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
          </div>
        </div>
      </AdminCollapsibleSection>

      <AdminCollapsibleSection title="Page images" hint="Intro and approach photos with crop focus." defaultOpen={false}>
        <div className="row">
          <div className="col-md-6">
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
          </div>
          <div className="col-md-6">
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
      </AdminCollapsibleSection>
    </>
  );
}
