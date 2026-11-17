export default function Campo({ id, label, erro, ajuda, className, children }) {
  return (
    <div className={className ? `mb-4 ${className}` : "mb-4"}>
      <label htmlFor={id} className="jr-label">
        {label}
      </label>
      {children}
      {ajuda && !erro && <p className="jr-legenda mt-1 mb-0">{ajuda}</p>}
      {erro && (
        <p id={`erro-${id}`} className="jr-erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}