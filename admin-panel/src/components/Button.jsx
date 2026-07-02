function Button({ text, type = "button", onClick }) {
  return (
    <button type={type} onClick={onClick} className="admin-btn">
      {text}
    </button>
  );
}

export default Button;