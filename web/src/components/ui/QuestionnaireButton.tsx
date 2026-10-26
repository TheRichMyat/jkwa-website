import { ClipboardList } from "lucide-react";
import Button, { type ButtonSize } from "./Button";

interface QuestionnaireButtonProps {
  url: string;
  size?: ButtonSize;
  /** Use "dark" on photo or dark backgrounds */
  tone?: "light" | "dark";
  className?: string;
  onClick?: () => void;
}

export default function QuestionnaireButton({
  url,
  tone = "light",
  ...props
}: QuestionnaireButtonProps) {
  return (
    <Button
      href={url}
      variant={tone === "dark" ? "outline-dark" : "outline"}
      icon={<ClipboardList aria-hidden />}
      {...props}
    >
      Project Questionnaire
    </Button>
  );
}
