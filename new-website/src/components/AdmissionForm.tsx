"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import {
  AdmissionCollapsibleSection,
  AdmissionField,
  AdmissionFileField,
  ADMISSION_INPUT_CLASS,
  ADMISSION_SELECT_CLASS,
  STANDARD_OPTIONS,
} from "@/components/AdmissionFormUi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const FILE_FIELDS = [
  "birthCertificate",
  "studentPhoto",
  "studentAadhaar",
  "fatherAadhaar",
  "fatherPhoto",
  "motherAadhaar",
  "motherPhoto",
  "electricityBill",
  "previousTC",
] as const;

export default function AdmissionForm() {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [sectionKey, setSectionKey] = useState(0);

  function validateFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 5MB");
      e.target.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, JPG, and PNG files are allowed");
      e.target.value = "";
    }
  }

  async function uploadFile(field: string, file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("field", field);
    const res = await fetch("/api/admission/upload", { method: "POST", body: fd });
    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || `Failed to upload ${field}`);
    }
    return result.url;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const files: Record<string, string> = {};

      for (const field of FILE_FIELDS) {
        const file = formData.get(field) as File | null;
        if (!file || file.size === 0) continue;
        files[field] = await uploadFile(field, file);
      }

      const payload = {
        studentName: String(formData.get("studentName")),
        dateOfBirth: String(formData.get("dateOfBirth")),
        gender: String(formData.get("gender")),
        applyingForStandard: String(formData.get("applyingForStandard")),
        parentEmail: String(formData.get("parentEmail")),
        fatherName: String(formData.get("fatherName")),
        motherName: String(formData.get("motherName")),
        fatherContact: String(formData.get("fatherContact")),
        motherContact: String(formData.get("motherContact")),
        currentAddress: String(formData.get("currentAddress")),
        permanentAddress: String(formData.get("permanentAddress")),
        siblingName: String(formData.get("siblingName") || ""),
        siblingSchool: String(formData.get("siblingSchool") || ""),
        siblingStandard: String(formData.get("siblingStandard") || ""),
        files,
      };

      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatus({
          type: "success",
          message:
            result.message ||
            "Application submitted successfully! Our admission team will contact you shortly.",
        });
        form.reset();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setStatus({
          type: "error",
          message: result.message || "Submission failed. Please check your information.",
        });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Unable to submit application. Please contact us at +91 97685 32431.",
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleAllSections(open: boolean) {
    setExpandAll(open);
    setSectionKey((k) => k + 1);
  }

  return (
    <div className="admission-form-wrap">
      {status && (
        <div
          className={`alert admission-form-alert alert-${status.type === "success" ? "success" : "danger"}`}
          role="alert"
        >
          <i
            className={`fas fa-${status.type === "success" ? "check-circle" : "exclamation-triangle"} me-2`}
          />
          {status.message}
        </div>
      )}

      <div className="admission-form-toolbar">
        <p className="admission-form-toolbar__text mb-0">
          <i className="fas fa-info-circle me-2 text-orange" aria-hidden="true" />
          Expand each section to fill details. Fields marked with <span className="text-orange">*</span> are
          required.
        </p>
        <div className="admission-form-toolbar__actions">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleAllSections(true)}>
            Expand all
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toggleAllSections(false)}>
            Collapse all
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="admission-form" key={sectionKey}>
        <AdmissionCollapsibleSection
          step={1}
          title="Student Details"
          icon="fa-child"
          hint="Basic information about the child applying for admission."
          defaultOpen={expandAll || sectionKey === 0}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <AdmissionField id="studentName" label="Student Full Name" icon="fa-user" required>
                <input
                  type="text"
                  id="studentName"
                  className={ADMISSION_INPUT_CLASS}
                  name="studentName"
                  placeholder="As per birth certificate"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="dateOfBirth" label="Date of Birth" icon="fa-calendar-day" required>
                <input
                  type="date"
                  id="dateOfBirth"
                  className={ADMISSION_INPUT_CLASS}
                  name="dateOfBirth"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="gender" label="Gender" icon="fa-venus-mars" required>
                <select id="gender" className={ADMISSION_SELECT_CLASS} name="gender" required defaultValue="">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="applyingForStandard" label="Applying for Standard" icon="fa-graduation-cap" required>
                <select
                  id="applyingForStandard"
                  className={ADMISSION_SELECT_CLASS}
                  name="applyingForStandard"
                  required
                  defaultValue=""
                >
                  <option value="">Select standard</option>
                  {STANDARD_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </AdmissionField>
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={2}
          title="Student Documents"
          icon="fa-folder-open"
          hint="Upload clear scans or photos. Maximum file size is 5 MB per document."
          defaultOpen={expandAll}
        >
          <div className="row g-4">
            <div className="col-md-6">
              <AdmissionFileField
                name="birthCertificate"
                label="Birth Certificate"
                icon="fa-file-pdf"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-md-6">
              <AdmissionFileField
                name="studentPhoto"
                label="Student Photograph (Passport Size)"
                icon="fa-image"
                accept=".jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-md-6">
              <AdmissionFileField
                name="studentAadhaar"
                label="Student Aadhaar Card"
                icon="fa-id-card"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-md-6">
              <AdmissionFileField
                name="previousTC"
                label="Previous School TC / LC"
                icon="fa-certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                hint="Mandatory for 2nd to 8th Standard only"
                onChange={validateFile}
              />
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={3}
          title="Parent Details"
          icon="fa-users"
          hint="Contact details for admission follow-up and confirmation email."
          defaultOpen={expandAll}
        >
          <div className="row g-3">
            <div className="col-12">
              <AdmissionField
                id="parentEmail"
                label="Parent Email"
                icon="fa-envelope"
                required
                hint="We will send application confirmation to this address"
              >
                <input
                  type="email"
                  id="parentEmail"
                  className={ADMISSION_INPUT_CLASS}
                  name="parentEmail"
                  placeholder="you@example.com"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="fatherName" label="Father's Name" icon="fa-male" required>
                <input
                  type="text"
                  id="fatherName"
                  className={ADMISSION_INPUT_CLASS}
                  name="fatherName"
                  placeholder="Full name"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="motherName" label="Mother's Name" icon="fa-female" required>
                <input
                  type="text"
                  id="motherName"
                  className={ADMISSION_INPUT_CLASS}
                  name="motherName"
                  placeholder="Full name"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="fatherContact" label="Father's Contact Number" icon="fa-phone" required>
                <input
                  type="tel"
                  id="fatherContact"
                  className={ADMISSION_INPUT_CLASS}
                  name="fatherContact"
                  placeholder="10-digit mobile"
                  pattern="[0-9]{10}"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-md-6">
              <AdmissionField id="motherContact" label="Mother's Contact Number" icon="fa-phone" required>
                <input
                  type="tel"
                  id="motherContact"
                  className={ADMISSION_INPUT_CLASS}
                  name="motherContact"
                  placeholder="10-digit mobile"
                  pattern="[0-9]{10}"
                  required
                />
              </AdmissionField>
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={4}
          title="Father's Documents"
          icon="fa-id-card"
          defaultOpen={expandAll}
        >
          <div className="row g-4">
            <div className="col-md-6">
              <AdmissionFileField
                name="fatherAadhaar"
                label="Father's Aadhaar Card"
                icon="fa-id-card"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-md-6">
              <AdmissionFileField
                name="fatherPhoto"
                label="Father's Photograph"
                icon="fa-image"
                accept=".jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={5}
          title="Mother's Documents"
          icon="fa-id-card"
          defaultOpen={expandAll}
        >
          <div className="row g-4">
            <div className="col-md-6">
              <AdmissionFileField
                name="motherAadhaar"
                label="Mother's Aadhaar Card"
                icon="fa-id-card"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-md-6">
              <AdmissionFileField
                name="motherPhoto"
                label="Mother's Photograph"
                icon="fa-image"
                accept=".jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={6}
          title="Address Details"
          icon="fa-map-marker-alt"
          hint="Current and permanent residential address with proof of residence."
          defaultOpen={expandAll}
        >
          <div className="row g-3">
            <div className="col-12">
              <AdmissionField id="currentAddress" label="Current Residential Address" icon="fa-home" required>
                <textarea
                  id="currentAddress"
                  className={ADMISSION_INPUT_CLASS}
                  name="currentAddress"
                  rows={3}
                  placeholder="House no., street, area, city, PIN"
                  required
                />
              </AdmissionField>
            </div>
            <div className="col-12">
              <AdmissionFileField
                name="electricityBill"
                label="Electricity Bill (Residential Proof)"
                icon="fa-bolt"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={validateFile}
              />
            </div>
            <div className="col-12">
              <AdmissionField id="permanentAddress" label="Permanent Address" icon="fa-map-pin" required>
                <textarea
                  id="permanentAddress"
                  className={ADMISSION_INPUT_CLASS}
                  name="permanentAddress"
                  rows={3}
                  placeholder="If same as current address, copy the details above"
                  required
                />
              </AdmissionField>
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <AdmissionCollapsibleSection
          step={7}
          title="Sibling Details"
          icon="fa-user-friends"
          hint="Fill only if the applicant has a sibling already studying at this or another school."
          defaultOpen={expandAll}
          optional
        >
          <div className="row g-3">
            <div className="col-md-4">
              <AdmissionField id="siblingName" label="Sibling Name" icon="fa-user">
                <input
                  type="text"
                  id="siblingName"
                  className={ADMISSION_INPUT_CLASS}
                  name="siblingName"
                  placeholder="Optional"
                />
              </AdmissionField>
            </div>
            <div className="col-md-4">
              <AdmissionField id="siblingSchool" label="Sibling School Name" icon="fa-school">
                <input
                  type="text"
                  id="siblingSchool"
                  className={ADMISSION_INPUT_CLASS}
                  name="siblingSchool"
                  placeholder="Optional"
                />
              </AdmissionField>
            </div>
            <div className="col-md-4">
              <AdmissionField id="siblingStandard" label="Sibling Standard" icon="fa-layer-group">
                <input
                  type="text"
                  id="siblingStandard"
                  className={ADMISSION_INPUT_CLASS}
                  name="siblingStandard"
                  placeholder="e.g. 3rd Standard"
                />
              </AdmissionField>
            </div>
          </div>
        </AdmissionCollapsibleSection>

        <div className="admission-form-submit">
          <button type="submit" className="btn btn-gradient-orange btn-lg px-5" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading documents & submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2" aria-hidden="true" />
                Submit Application
              </>
            )}
          </button>
          <p className="admission-form-submit__note">
            By submitting, you confirm that the information and documents provided are accurate.
          </p>
        </div>
      </form>
    </div>
  );
}
