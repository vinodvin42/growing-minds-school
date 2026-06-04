"use client";

import { useState, FormEvent, ChangeEvent } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export default function AdmissionForm() {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

    const fileFields = [
      "birthCertificate", "studentPhoto", "studentAadhaar",
      "fatherAadhaar", "fatherPhoto", "motherAadhaar",
      "motherPhoto", "electricityBill", "previousTC",
    ];

    try {
      const files: Record<string, string> = {};

      for (const field of fileFields) {
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
          message: result.message || "Application submitted successfully! Our admission team will contact you shortly.",
        });
        form.reset();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setStatus({ type: "error", message: result.message || "Submission failed. Please check your information." });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to submit application. Please contact us at +91 97685 32431.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {status && (
        <div className={`alert alert-${status.type === "success" ? "success" : "danger"}`} role="alert">
          <i className={`fas fa-${status.type === "success" ? "check-circle" : "exclamation-triangle"} me-2`} />
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h4 className="border-bottom border-orange pb-2 mb-3">Student Details</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Student Full Name *</label>
            <input type="text" className="form-control" name="studentName" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Date of Birth *</label>
            <input type="date" className="form-control" name="dateOfBirth" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Gender *</label>
            <select className="form-select" name="gender" required defaultValue="">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Applying for Standard *</label>
            <select className="form-select" name="applyingForStandard" required defaultValue="">
              <option value="">Select Standard</option>
              {[
                ["nursery", "Nursery"],
                ["lkg", "LKG"],
                ["ukg", "UKG"],
                ["1st", "1st Standard"],
                ["2nd", "2nd Standard"],
                ["3rd", "3rd Standard"],
                ["4th", "4th Standard"],
                ["5th", "5th Standard"],
                ["6th", "6th Standard"],
                ["7th", "7th Standard"],
                ["8th", "8th Standard"],
              ].map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <h4 className="border-bottom border-lime pb-2 mb-3">Student Documents (Mandatory)</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-file-pdf text-orange" /> Birth Certificate *</label>
            <input type="file" className="form-control" name="birthCertificate" accept=".pdf,.jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-image text-orange" /> Student Photograph (Passport Size) *</label>
            <input type="file" className="form-control" name="studentPhoto" accept=".jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-id-card text-orange" /> Student Aadhaar Card *</label>
            <input type="file" className="form-control" name="studentAadhaar" accept=".pdf,.jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-certificate text-orange" /> Previous School TC/LC (For 2nd-8th Std)</label>
            <input type="file" className="form-control" name="previousTC" accept=".pdf,.jpg,.jpeg,.png" onChange={validateFile} />
            <small className="text-muted">Mandatory for 2nd-8th Standard only</small>
          </div>
        </div>

        <h4 className="border-bottom border-primary pb-2 mb-3">Parent Details</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Parent Email (for confirmation) *</label>
            <input type="email" className="form-control" name="parentEmail" required placeholder="you@example.com" />
            <small className="text-muted">We will send application confirmation to this email</small>
          </div>
          <div className="col-md-6">
            <label className="form-label">Father&apos;s Name *</label>
            <input type="text" className="form-control" name="fatherName" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Mother&apos;s Name *</label>
            <input type="text" className="form-control" name="motherName" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Father&apos;s Contact Number *</label>
            <input type="tel" className="form-control" name="fatherContact" pattern="[0-9]{10}" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Mother&apos;s Contact Number *</label>
            <input type="tel" className="form-control" name="motherContact" pattern="[0-9]{10}" required />
          </div>
        </div>

        <h4 className="border-bottom border-info pb-2 mb-3">Father&apos;s Documents</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-id-card text-info" /> Father&apos;s Aadhaar Card *</label>
            <input type="file" className="form-control" name="fatherAadhaar" accept=".pdf,.jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-image text-info" /> Father&apos;s Photograph *</label>
            <input type="file" className="form-control" name="fatherPhoto" accept=".jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
        </div>

        <h4 className="border-bottom border-danger pb-2 mb-3">Mother&apos;s Documents</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-id-card text-danger" /> Mother&apos;s Aadhaar Card *</label>
            <input type="file" className="form-control" name="motherAadhaar" accept=".pdf,.jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-md-6">
            <label className="form-label"><i className="fas fa-image text-danger" /> Mother&apos;s Photograph *</label>
            <input type="file" className="form-control" name="motherPhoto" accept=".jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
        </div>

        <h4 className="border-bottom border-success pb-2 mb-3">Address Details</h4>
        <div className="row g-3 mb-4">
          <div className="col-12">
            <label className="form-label">Current Residential Address *</label>
            <textarea className="form-control" name="currentAddress" rows={3} required />
          </div>
          <div className="col-12">
            <label className="form-label"><i className="fas fa-bolt text-warning" /> Electricity Bill (Residential Proof) *</label>
            <input type="file" className="form-control" name="electricityBill" accept=".pdf,.jpg,.jpeg,.png" required onChange={validateFile} />
          </div>
          <div className="col-12">
            <label className="form-label">Permanent Address *</label>
            <textarea className="form-control" name="permanentAddress" rows={3} required />
          </div>
        </div>

        <h4 className="border-bottom border-secondary pb-2 mb-3">Sibling Details (If Any)</h4>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Sibling Name</label>
            <input type="text" className="form-control" name="siblingName" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Sibling School Name</label>
            <input type="text" className="form-control" name="siblingSchool" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Sibling Standard</label>
            <input type="text" className="form-control" name="siblingStandard" />
          </div>
        </div>

        <div className="text-center mt-4">
          <button type="submit" className="btn btn-gradient-orange btn-lg px-5" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading documents & submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </form>
    </>
  );
}
