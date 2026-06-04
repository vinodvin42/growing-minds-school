"use client";

import { useState, FormEvent, type ReactNode } from "react";

function FormField({
  id,
  label,
  icon,
  required,
  children,
}: {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="contact-form-field mb-3">
      <label htmlFor={id} className="contact-form-field__label">
        {label}
        {required && <span className="text-orange"> *</span>}
      </label>
      <div className="contact-form-field__input-wrap">
        <span className="contact-form-field__icon">
          <i className={`fas ${icon}`} />
        </span>
        {children}
      </div>
    </div>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setStatus({ type: "success", message: result.message || "Message sent successfully!" });
        form.reset();
      } else {
        setStatus({ type: "error", message: result.message || "Failed to send message." });
      }
    } catch {
      setStatus({ type: "error", message: "Unable to send message. Please try again or call us directly." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {status && (
        <div className={`alert contact-form-alert alert-${status.type === "success" ? "success" : "danger"}`} role="alert">
          <i className={`fas fa-${status.type === "success" ? "check-circle" : "exclamation-triangle"} me-2`} />
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="row g-3">
          <div className="col-md-6">
            <FormField id="name" label="Your Name" icon="fa-user" required>
              <input type="text" className="form-control contact-form-control" id="name" name="name" placeholder="Full name" required />
            </FormField>
          </div>
          <div className="col-md-6">
            <FormField id="phone" label="Phone Number" icon="fa-phone" required>
              <input type="tel" className="form-control contact-form-control" id="phone" name="phone" placeholder="10-digit mobile" pattern="[0-9]{10}" required />
            </FormField>
          </div>
          <div className="col-12">
            <FormField id="email" label="Email Address" icon="fa-envelope" required>
              <input type="email" className="form-control contact-form-control" id="email" name="email" placeholder="you@example.com" required />
            </FormField>
          </div>
          <div className="col-12">
            <FormField id="subject" label="Subject" icon="fa-tag" required>
              <input type="text" className="form-control contact-form-control" id="subject" name="subject" placeholder="Admission enquiry, visit request, etc." required />
            </FormField>
          </div>
          <div className="col-12">
            <FormField id="message" label="Message" icon="fa-comment-dots" required>
              <textarea className="form-control contact-form-control" id="message" name="message" rows={5} placeholder="Tell us how we can help you..." required />
            </FormField>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-gradient-orange contact-form-submit w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
