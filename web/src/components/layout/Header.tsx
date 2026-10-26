import { getSettings } from "@/lib/data";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const { bookletUrl, questionnaireUrl } = await getSettings();
  return <HeaderClient bookletUrl={bookletUrl} questionnaireUrl={questionnaireUrl} />;
}
