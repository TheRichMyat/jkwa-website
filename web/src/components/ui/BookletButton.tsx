import { BookOpen } from "lucide-react";
import Button, { type ButtonSize } from "./Button";

interface BookletButtonProps {
  url: string;
  size?: ButtonSize;
  /** The hero version shows a trailing arrow */
  trailingArrow?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function BookletButton({ url, ...props }: BookletButtonProps) {
  return (
    <Button href={url} variant="primary" icon={<BookOpen aria-hidden />} {...props}>
      Get Free Booklet
    </Button>
  );
}
