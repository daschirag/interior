import "../styles/admin.css";

function PageHeader({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>

        {subtitle && (
          <p className="page-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {buttonText && (
        <button
          className="primary-btn"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default PageHeader;