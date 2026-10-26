// 和 from Noto Serif CJK JP Light (Japanese Mincho form), inlined from
// plan/assets/wa-kanji-light.svg. Never set 和 as text; see DESIGN-SPEC
// "The WA panel — craft rules". Size it by height; the width follows the viewBox.
interface WaKanjiProps {
  className?: string;
}

export default function WaKanji({ className = "" }: WaKanjiProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 922 926"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={`block w-auto ${className}`}
    >
      <path
        transform="translate(-24 841) scale(1 -1)"
        d="M435 574 393 520H301V732C354 745 402 759 442 772C464 764 481 763 489 773L420 831C334 788 168 728 34 698L39 680C107 689 180 703 248 719V520H43L51 490H222C186 349 125 209 38 103L52 89C138 172 203 272 248 383V-75H256C283 -75 301 -61 301 -56V409C350 364 410 299 432 252C492 214 525 333 301 430V490H489C503 490 512 495 515 506C484 535 435 574 435 574ZM834 650V120H590V650ZM590 -7V90H834V-9H842C859 -9 886 1 888 5V637C910 641 929 649 936 658L857 719L823 680H595L537 710V-27H547C571 -27 590 -14 590 -7Z"
      />
    </svg>
  );
}
