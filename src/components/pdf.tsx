import { useFormState } from "@/hooks/form-context";
import * as pdfjsLib from "pdfjs-dist";
import Image from "next/image";
import { useEffect, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function getUrlFromFormData(formData?: FormData) {
  if (!formData) return "";
  const resume = formData.get("resume");
  if (resume instanceof Blob) return URL.createObjectURL(resume);

  return "";
}

function getUrlFromFormUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("https")) return url;

  return url.replace("public", "");
}

export default function PDF() {
  const [formState] = useFormState();
  const [showFallback, setShowFallback] = useState(false);
  const url = formState.formData
    ? getUrlFromFormData(formState.formData)
    : getUrlFromFormUrl(formState.url);

  return (
    <object
      className="rounded-lg overflow-hidden mb-8 border-2 border-black/30 dark:border-white/30 h-auto lg:h-full lg:min-h-[500px]"
      type="application/pdf"
      data={url}
      onErrorCapture={() => setShowFallback(true)}
      onLoad={(object) => {
        // free memory
        URL.revokeObjectURL((object.target as HTMLObjectElement).data);
      }}
      width="100%"
      height="100%"
    >
      {showFallback ? <ImageFallback url={url} /> : null}
    </object>
  );
}

function ImageFallback({ url }: { url: string }) {
  const [images, setImages] = useState<Array<string>>([]);

  useEffect(() => {
    async function handleConversion() {
      if (!url) return;

      try {
        const pdf = await pdfjsLib.getDocument(url).promise;

        const imgs = [];
        for (let pageNumber = 0; pageNumber < pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber + 1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx!, viewport }).promise;

          const imgUrl = canvas.toDataURL("image/jpeg");
          imgs.push(imgUrl);
        }

        setImages(imgs);
      } catch {
        console.log("there was an error coverting pdf to jpeg");
      }
    }

    handleConversion();
  }, [url]);

  return (
    <ul className="overflow-scroll max-h-[200px] h-full flex flex-col gap-4">
      {images.map((img, idx) => (
        <Image
          alt={`PDF page ${idx}`}
          src={img}
          key={img}
          className="w-full h-auto object-cover"
          width={200}
          height={200}
        />
      ))}
    </ul>
  );
}
