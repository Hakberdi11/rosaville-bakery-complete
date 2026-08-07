export default function RoseIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rose petals */}
      <circle cx="50" cy="35" r="8" fill="#D4A5A5" />
      <circle cx="42" cy="30" r="7" fill="#E8C4C4" />
      <circle cx="58" cy="30" r="7" fill="#E8C4C4" />
      <circle cx="38" cy="38" r="6" fill="#D4A5A5" />
      <circle cx="62" cy="38" r="6" fill="#D4A5A5" />
      <circle cx="45" cy="45" r="5" fill="#C99999" />
      <circle cx="55" cy="45" r="5" fill="#C99999" />
      
      {/* Stem */}
      <path
        d="M 50 50 Q 48 60 45 70 Q 43 80 50 85"
        stroke="#8B7355"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Leaves */}
      <ellipse cx="40" cy="60" rx="4" ry="8" fill="#A8C9B8" transform="rotate(-30 40 60)" />
      <ellipse cx="60" cy="65" rx="4" ry="8" fill="#A8C9B8" transform="rotate(30 60 65)" />
    </svg>
  );
}
