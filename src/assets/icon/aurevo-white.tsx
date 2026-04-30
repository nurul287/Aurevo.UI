type AurevoWhiteProps = {
  className?: string;
};

const AurevoWhite = ({
  className = "h-12 lg:h-14 w-auto",
}: AurevoWhiteProps) => {
  return (
    <img
      src="/aurevoLogoWhite.svg"
      alt="Aurevo Fashion"
      className={className}
      draggable={false}
    />
  );
};

export default AurevoWhite;
