import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.breathartinstitute.in";

const META_BY_ROUTE = [
  {
    match: (pathname) => pathname === "/" || pathname === "",
    title:
      "Breathart Institute of Creative Technology | AI Digital Marketing & Creative Media Courses",
    description:
      "Breathart Institute of Creative Technology (BICT) offers industry-leading diplomas in AI Digital Marketing, Photography, and Graphic Design in Attingal, Kerala.",
    image: `${SITE_URL}/app/og-home.png?v=1`,
    imageAlt: "Breathart Institute homepage preview",
  },
  {
    match: (pathname) => pathname.startsWith("/about"),
    title: "About Breathart Institute | Creative Technology Education",
    description:
      "Learn about Breathart Institute of Creative Technology, our mentors, global agency-based training approach, and career-focused learning model.",
    image: `${SITE_URL}/app/og-about.png?v=1`,
    imageAlt: "About Breathart Institute page preview",
  },
  {
    match: (pathname) => pathname.startsWith("/courses"),
    title: "Courses | AI Digital Marketing and Creative Programs at BICT",
    description:
      "Explore industry-ready courses in AI digital marketing, creative media, and practical training pathways designed for career growth.",
    image: `${SITE_URL}/app/og-courses.png?v=1`,
    imageAlt: "Courses page preview",
  },
  {
    match: (pathname) => pathname.startsWith("/blogs"),
    title: "Blogs | Digital Marketing Tips and Insights from BICT",
    description:
      "Read the latest digital marketing blogs, industry insights, and career guidance from Breathart Institute experts.",
    image: `${SITE_URL}/app/og-blogs.png?v=1`,
    imageAlt: "Blogs page preview",
  },
];

const DEFAULT_META = META_BY_ROUTE[0];

const setMetaByName = (name, content) => {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setMetaByProperty = (property, content) => {
  let el = document.head.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector("link[rel=\"canonical\"]");
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const selected =
      META_BY_ROUTE.find((entry) => entry.match(pathname)) || DEFAULT_META;
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    const pageUrl = `${SITE_URL}${normalizedPath || "/"}`;

    document.title = selected.title;

    setCanonical(pageUrl);
    setMetaByName("description", selected.description);

    setMetaByProperty("og:url", pageUrl);
    setMetaByProperty("og:title", selected.title);
    setMetaByProperty("og:description", selected.description);
    setMetaByProperty("og:image", selected.image);
    setMetaByProperty("og:image:secure_url", selected.image);
    setMetaByProperty("og:image:alt", selected.imageAlt);

    setMetaByName("twitter:url", pageUrl);
    setMetaByName("twitter:title", selected.title);
    setMetaByName("twitter:description", selected.description);
    setMetaByName("twitter:image", selected.image);
    setMetaByName("twitter:image:alt", selected.imageAlt);
  }, [pathname]);

  return null;
};

export default RouteMeta;