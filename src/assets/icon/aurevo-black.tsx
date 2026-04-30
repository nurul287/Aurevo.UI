type AurevoBlackProps = {
  className?: string;
};

const AurevoBlack = ({
  className = "h-12 lg:h-14 w-auto",
}: AurevoBlackProps) => {
  return (
    <img
      src="/aurevoLogoBlack.svg"
      alt="Aurevo Fashion"
      className={className}
      draggable={false}
    />
  );
};

export default AurevoBlack;
