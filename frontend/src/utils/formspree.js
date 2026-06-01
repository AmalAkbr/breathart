const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT || "https://formspree.io/f/myyagyqg";

export const submitToFormspree = async (formElement, extraFields = {}) => {
  const formData = new FormData(formElement);

  Object.entries(extraFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.set(key, value);
    }
  });

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.errors?.[0]?.message || data?.error || "Form submission failed";
    throw new Error(message);
  }

  return data;
};

export default FORMSPREE_ENDPOINT;
