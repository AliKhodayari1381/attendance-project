export function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={`px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    />
  );
}
