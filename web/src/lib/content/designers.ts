// Fixed page text from plan/CONTENT.md §3. Not admin data.
export interface DesignerQuote {
  quote: string;
  role: string;
  note?: string;
}

export const DESIGNER_QUOTES: DesignerQuote[] = [
  {
    quote:
      "Having spent many years working as an interior designer in New York City, my portfolio spans residential and commercial projects across the United States, Canada, China, the Philippines, South Korea, Japan, Thailand, and Hong Kong.",
    role: "Brand International Designer",
  },
  {
    quote:
      "With more than 35 years of experience in the interior design and management business… I love it and have never looked back.",
    role: "Hospitality International Designer",
    note: "Awards in Best Resort Hotel, Best Spa Design and Best New Hotel",
  },
  {
    quote:
      "Observes what contemporary society has failed to value – instability among them – along with overlooked people, places, and the inherent qualities of materials, seeking to reveal their worth primarily through architecture, furniture, and artworks.",
    role: "Architectural and Furniture Designer",
  },
  {
    quote:
      "I value creating spaces that are gentle for people and comfortable to be in. Through communication, I provide spaces that match each client.",
    role: "Interior Stylist",
  },
  {
    quote:
      "Designing a space starts from imagination. I follow the flow and living nature, then combine it with reality. I love the feeling of satisfaction when my design and the client's requirements connect at the end of a project. My goal is creating comfortable living spaces for people.",
    role: "Creative Interior Designer",
  },
];
