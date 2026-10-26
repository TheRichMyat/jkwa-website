# Website Content (use exactly as written)

Copy provided by the client. Where the mockup had different placeholder text, this file wins, except for the short lines marked **(mockup)**, which we keep from the design.

---

## Brand

- Company name: **Atelier JK&WA Pte. Ltd.**
- Tagline under name: **INTERIOR DESIGN & CONSULTANCY**
- Footer line: **Timeless spaces. Lasting impressions.** (mockup)

## Header buttons

- **Get Free Booklet**: opens `settings.bookletUrl` (Google Drive download link)
- **Project Questionnaire**: opens `settings.questionnaireUrl` (Google Form) in a new tab

---

## 1. Hero

- Eyebrow: **TIMELESS SPACES. LASTING IMPRESSIONS.** (mockup)
- Heading: **Japanese Inspired Interior Design** (mockup)
- Sub-text: **Blending traditional values with modern living, we create spaces that bring balance, beauty and a sense of peace to your everyday life.** (mockup)
- Buttons: Get Free Booklet / Project Questionnaire

## 2. About

- Eyebrow: **ABOUT US**
- Heading: **The Philosophy Behind Our Design** (mockup)
- Body (two paragraphs):

  > Japanese interiors are built upon centuries of philosophy and craftsmanship. They embrace balance, simplicity, natural materials, and an understated elegance that never goes out of style.

  > By incorporating the spirit of WA into your home or commercial space, you can create an environment that brings peace, balance, and timeless sophistication to everyday life. Imagine returning home to a place where every line has purpose, every material tells a story, and every space invites calm.

- WA panel (right side):
  - Kanji: **和**
  - Title: **WA**
  - Subtitle: **Harmony**
  - Text: **The Japanese concept of WA (Harmony) is at the heart of every design.**

## 3. Designer Quotes (new section, not in the mockup)

- Eyebrow: **OUR DESIGNERS**
- Heading: **The People Behind the Harmony**
- Quotes (text exactly as given, with typos tidied; role in gold under each):

1. "Having spent many years working as an interior designer in New York City, my portfolio spans residential and commercial projects across the United States, Canada, China, the Philippines, South Korea, Japan, Thailand, and Hong Kong."
   Role: **Brand International Designer**

2. "With more than 35 years of experience in the interior design and management business… I love it and have never looked back."
   Role: **Hospitality International Designer**
   Note line (small, muted): **Awards in Best Resort Hotel, Best Spa Design and Best New Hotel**

3. "Observes what contemporary society has failed to value – instability among them – along with overlooked people, places, and the inherent qualities of materials, seeking to reveal their worth primarily through architecture, furniture, and artworks."
   Role: **Architectural and Furniture Designer**

4. "I value creating spaces that are gentle for people and comfortable to be in. Through communication, I provide spaces that match each client."
   Role: **Interior Stylist**

5. "Designing a space starts from imagination. I follow the flow and living nature, then combine it with reality. I love the feeling of satisfaction when my design and the client's requirements connect at the end of a project. My goal is creating comfortable living spaces for people."
   Role: **Creative Interior Designer**

## 4. Services

- Eyebrow: **OUR SERVICES**
- Heading: **Design & Build** / **for Residential & Commercial** (two lines)
- Body:

  > We offer Design & Build services for both residential and commercial properties. Our quotations are carefully tailored to suit your budget while maintaining outstanding quality and excellent value. We are committed to completing every project on schedule without compromising workmanship.

  > We never cut corners. Every project begins with thorough planning and careful preparation, using quality materials selected for durability, functionality, and lasting beauty.

- Closing line (serif italic, gold): **We look forward to creating a space that is uniquely yours.**
- Three features:
  - **Tailored Planning**: For your lifestyle and budget. (icon: house)
  - **Premium Materials**: Quality and lasting beauty. (icon: layers)
  - **On-Time Delivery**: Without compromise. (icon: diamond)

## 5. Portfolio (home)

- Eyebrow: **FEATURED PROJECTS**
- Heading: **Our Latest Projects**
- Link: **View All Projects →** (goes to `/projects`)

## 6. Contact

- Eyebrow: **LET'S CREATE SOMETHING BEAUTIFUL**
- Heading: **Get In Touch**
- Body:

  > Whether you are renovating a condominium, landed property, office, restaurant, retail space, or boutique hotel, our Japanese interior designers create bespoke environments that reflect both your lifestyle and your personality.

  > We invite you to begin the journey with us.

- Price line: small label **Projects starting from**, then large **S$100,000**
- Contact details come from `settings` (see the data layer).

## Projects page

- Eyebrow: **PORTFOLIO**
- Heading: **Our Projects**
- Intro:

  > In addition to filling a room with decoration, we create environments where natural light, proportion, texture, and craftsmanship become the true luxury. Our Japanese interior designers create spaces that are not only beautiful, but also deeply meaningful.

- Filters: **All / Residential / Commercial**

## Default settings (editable in the admin later)

```
companyName:     Atelier JK&WA Pte. Ltd.
uen:             202643450N
contactPerson:   Mr Kenji
addressLines:    ["7 Temasek Boulevard", "#12-07, Suntec Tower One", "Singapore 038987"]
phone:           +65 8028 7801
fax:             +65 6917 8977
email:           kenjisansg@gmail.com      <-- note the "g" (the mockup typo "kenjisans@" is WRONG)
hours:           Mon – Fri 9:00 AM – 6:00 PM (SGT)   <-- placeholder, client to confirm
bookletUrl:      "#"   (placeholder until the client sends the Google Drive link)
questionnaireUrl:"#"   (placeholder until the client sends the Google Form link)
socials:         { instagram: "", facebook: "", pinterest: "", linkedin: "", youtube: "" }  (empty = icon hidden)
```
