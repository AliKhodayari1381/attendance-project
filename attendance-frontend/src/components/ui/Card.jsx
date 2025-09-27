// src/components/ui/Card.jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl shadow-lg bg-white/20 backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
