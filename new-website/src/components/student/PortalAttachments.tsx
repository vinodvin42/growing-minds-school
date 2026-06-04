import type { PortalAttachment } from "@/types/student-portal";
import { attachmentIcon } from "@/types/student-portal";

export default function PortalAttachments({ attachments }: { attachments: PortalAttachment[] }) {
  if (!attachments.length) return null;

  return (
    <ul className="portal-attachments list-unstyled mb-0 mt-3">
      {attachments.map((file) => (
        <li key={file.id}>
          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="portal-attachment-link">
            <i className={`fas ${attachmentIcon(file.fileName)}`} aria-hidden="true" />
            <span>{file.fileName}</span>
            <i className="fas fa-download ms-auto small opacity-75" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
