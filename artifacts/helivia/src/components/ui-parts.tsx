import type { ReactNode } from 'react';
import { Link } from 'wouter';

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  );
}

export function SectionHeading({
  title,
  caption,
  action,
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">{title}</h2>
        {caption && <p className="section-caption">{caption}</p>}
      </div>
      {action}
    </div>
  );
}

export function QuietLink({ href, children, testId }: { href: string; children: ReactNode; testId: string }) {
  return (
    <Link href={href} className="button secondary" data-testid={testId}>
      {children}
    </Link>
  );
}
