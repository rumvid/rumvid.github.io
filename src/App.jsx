import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { Instagram } from "lucide-react";


// UI primitives
function Input({ dark, style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.18)",
        background: dark ? "#141518" : "#ffffff",
        color: dark ? "#f2f2f2" : "#111111",
        outline: "none",
        ...style,
      }}
    />
  );
}

function Textarea({ dark, style, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.18)",
        background: dark ? "#141518" : "#ffffff",
        color: dark ? "#f2f2f2" : "#111111",
        outline: "none",
        resize: "vertical",
        ...style,
      }}
    />
  );
}

function Button({ dark, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: dark ? "#f2f2f2" : "#111111",
        color: dark ? "#111111" : "#ffffff",
        fontWeight: 700,
        ...style,
      }}
    />
  );
}

// Simple toast
function useToastLocal() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => setToasts((cur) => cur.filter((c) => c.id !== t.id)), 3500)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  const push = (type, message) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, type, message }]);
  };
  return {
    toasts,
    info: (m) => push("info", m),
    success: (m) => push("success", m),
    error: (m) => push("error", m),
  };
}
function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-xs px-4 py-2 rounded-lg shadow-md text-sm border ${
            t.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-neutral-50 border-neutral-200 text-neutral-900"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function getModalRoot() {
  if (typeof document === "undefined") return null;
  let el = document.getElementById("modal-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
  }
  return el;
}

function PostModal({ post, onClose, dark }) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    if (!post?.src) return;

    let alive = true;
    const img = new Image();
    img.src = post.src;

    img.onload = () => {
      if (!alive) return;
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    };

    return () => {
      alive = false;
    };
  }, [post?.src]);

  if (!post) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 96vw)",
          maxHeight: "92vh",
          background: dark ? "#111214" : "#ffffff",
          color: dark ? "#f2f2f2" : "#111111",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 20px 70px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          position: "relative",
        }}
      >
        {/* LEFT — IMAGE */}
        <div
          style={{
            background: "#000",
            flex: isPortrait ? "0 0 auto" : "1 1 60%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <img
            src={post.src}
            alt={post.title}
            style={{
              maxWidth: "100%",
              maxHeight: isPortrait ? "70vh" : "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
            }}
            draggable={false}
          />
        </div>

        {/* RIGHT — INFO */}
        <div
          style={{
            flex: "1 1 40%",
            padding: 18,
            overflowY: "auto",
            background: dark ? "#111214" : "#ffffff",
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 12 }}>
            <span style={{ fontWeight: 800 }}>{post.title}</span>{" "}
            <span style={{ opacity: 0.85 }}>{post.description}</span>
          </div>

          <div
            style={{
              border: dark
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              padding: 14,
              fontSize: 13,
              opacity: 0.95,
            }}
          >
            <div style={{ marginBottom: 6 }}>
              <b>Location:</b> {post.location}
            </div>
            <div>
              <b>Settings:</b> {post.settings}
            </div>
          </div>
        </div>

        {/* CLOSE */}
        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "none",
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: "38px",
            textAlign: "center",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}


const iconBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
  padding: 6,
  borderRadius: 10,
};



const gear = {
  camera: "Fujifilm X-T2",
  lenses: ["18-55mm f2.8-4"],
  accessories: ["Battery Grip", "Flash"]
};


export default function Portfolio() {

  const [activePost, setActivePost] = useState(null); 

  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");

useEffect(() => {
  localStorage.setItem("darkMode", String(dark));
}, [dark]);


const images = useMemo(() => ([
  {
    src: "/photos/photo1.webp",
    thumb: "/photos/thumbs/photo1.webp",
    title: "Sun Over Hills",
    location: "Rigi",
    description: "Warm sunlight over rolling hills",
    settings: "f/8 · 1/200s · ISO 100",
  },
  {
    src: "/photos/photo2.webp",
    thumb: "/photos/thumbs/photo2.webp",
    title: "A Lonely House",
    location: "Rigi",
    description: "A quiet house in the mountains",
    settings: "f/5.6 · 1/320s · ISO 100",
  },
  {
    src: "/photos/photo3.webp",
    thumb: "/photos/thumbs/photo3.webp",
    title: "A Mountain of Peace",
    location: "Rigi",
    description: "Calm mountain landscape",
    settings: "f/11 · 1/160s · ISO 100",
  },
  {
    src: "/photos/photo4.webp",
    thumb: "/photos/thumbs/photo4.webp",
    title: "French Street",
    location: "Cannes",
    description: "Street Life in the South of France",
    settings: "f/4 · 1/250s · ISO 200",
  },
  {
    src: "/photos/photo5.webp",
    thumb: "/photos/thumbs/photo5.webp",
    title: "Leaves",
    location: "Cannes",
    description: "Embodiment of Peace",
    settings: "f/5.6 · 1/125s · ISO 400",
  },
  {
    src: "/photos/photo6.webp",
    thumb: "/photos/thumbs/photo6.webp",
    title: "A Peaceful Park",
    location: "Cannes",
    description: "Quiet park atmosphere ",
    settings: "f/8 · 1/500s · ISO 100",
  },
  {
    src: "/photos/photo7.webp",
    thumb: "/photos/thumbs/photo7.webp",
    title: "A Look from afar",
    location: "Cannes",
    description: "Overlooking the Whole City",
    settings: "f/5.6 · 1/200s · ISO 200",
  },
  {
    src: "/photos/photo8.webp",
    thumb: "/photos/thumbs/photo8.webp",
    title: "A Bird in the Sky",
    location: "Cannes",
    description: "Bird Flying in the Sky",
    settings: "f/4 · 1/160s · ISO 400",
  },
  {
    src: "/photos/photo9.webp",
    thumb: "/photos/thumbs/photo9.webp",
    title: "Lighthouse on a Shore",
    location: "Cannes",
    description: "Lighthouse by the sea",
    settings: "f/8 · 1/250s · ISO 100",
  },
  {
    src: "/photos/photo10.webp",
    thumb: "/photos/thumbs/photo10.webp",
    title: "Berries on a Tree",
    location: "Rigi",
    description: "Red Berries in Soft Light",
    settings: "f/11 · 1/320s · ISO 100",
  },
  {
    src: "/photos/photo11.webp",
    thumb: "/photos/thumbs/photo11.webp",
    title: "Forest Trail",
    location: "Rigi",
    description: "A Forest full of Fog",
    settings: "f/6.3 · 1/1000s · ISO 200",
  },
  {
    src: "/photos/photo12.webp",
    thumb: "/photos/thumbs/photo12.webp",
    title: "Cows on a Hill",
    location: "Rigi",
    description: "Cows basking in the Sun",
    settings: "f/9 · 1/400s · ISO 100",
  },
  {
    src: "/photos/photo13.webp",
    thumb: "/photos/thumbs/photo13.webp",
    title: "Night Lights",
    location: "Nice",
    description: "Night Portrait near the Shore",
    settings: "f/8 · 1/160s · ISO 100",
  },
]), []);

useEffect(() => {
  if (!activePost) return;

  const i = images.findIndex((x) => x.src === activePost.src);
  if (i === -1) return;

  const next = images[(i + 1) % images.length];
  const prev = images[(i - 1 + images.length) % images.length];

  [next?.src, prev?.src].forEach((url) => {
    if (!url) return;
    const im = new Image();
    im.src = url;
  });
}, [activePost, images]);


const groupedByLocation = useMemo(() => {
  return images.reduce((acc, img) => {
    (acc[img.location] ||= []).push(img);
    return acc;
  }, {});
}, [images]);
  

  
  const formRef = useRef(null);
  const toast = useToastLocal();
  
  const sendEmail = (e) => {
    e.preventDefault();
    const SERVICE_ID = "service_stk9f8g"; 
    const TEMPLATE_ID = "template_xddzrmg"; 
    const PUBLIC_KEY = "G2gFi4BPdIlNUTNmJ"; 

    toast.info("Sending message...");

    if (!formRef.current) {
      toast.error("Form not found — cannot send.");
      return;
    }

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then(() => {
        toast.success("Nachricht geschickt");
        try {
          formRef.current.reset();
        } catch (e) {}
      })
      .catch((err) => {
        console.error("EmailJS error", err);
        toast.error("Failed to send message. Please try again later.");
      });
  };

  return (
    <div
  className="min-h-screen p-6"
  style={{
    background: dark ? "#0b0b0d" : "#f5f5f5",
    color: dark ? "#f5f5f5" : "#111",
  }}
>

<header className="text-center mb-10" style={{ position: "relative" }}>

        <motion.h1
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Photoportpholio
        </motion.h1>
        <p className="text-neutral-600">Meine Lieblingsbilder</p>

        <button
  onClick={() => setDark((d) => !d)}
  style={{
    position: "absolute",
    top: 24,
    right: 24,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: dark ? "#f5f5f5" : "#111",
    color: dark ? "#111" : "#fff",
    fontWeight: 600,
  }}
>
  {dark ? "Light" : "Dark"}
</button>


      </header>

      <main className="space-y-12">
  {Object.entries(groupedByLocation).map(([location, imgs]) => (
    <section key={location}>
      <h2 className="text-xl font-semibold mb-4">{location}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {imgs.map((img, i) => (
  <div
  key={i}
  style={{
    transition: "transform 160ms ease",
    willChange: "transform",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>

    <div
      className="
        overflow-hidden
        rounded-2xl
        bg-white dark:bg-neutral-900
        shadow-md hover:shadow-xl
        transition
        cursor-pointer"

        onClick={() => setActivePost(img)}

        
        
        
        
        
    >
      <img
  src={img.thumb || img.src}
  alt={img.title}
  className="w-full h-64 object-cover"
  loading="lazy"
  decoding="async"
/>



      <div className="p-4 text-center">
        <h3 className="font-semibold">{img.title}</h3>
      </div>
    </div>
  </div>
))}
      </div>
    </section>
  ))}
</main>

{activePost && (
  <PostModal
    post={activePost}
    onClose={() => setActivePost(null)}
    dark={dark}
  />
)}


      <section className="mt-16 max-w-3xl mx-auto text-center">
  <h2 className="text-2xl font-semibold mb-6">Gear</h2>

  <div className="space-y-8">
    <div>
      <h3 className="font-semibold text-lg mb-2">Kamera</h3>
      <p>Fujifilm X-T2</p>
    </div>


    <div>
      <h3 className="font-semibold text-lg mb-2">Objektiv</h3>
      <p>18–55mm f/2.8–4</p>
    </div>

    <div>
      <h3 className="font-semibold text-lg mb-4">Accessories</h3>

      <div className="space-y-2">
        <p>Battery Grip</p>
        <p>Flash</p>
      </div>
    </div>

  </div>
</section>




      <section className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
        <p className="text-neutral-600 mb-6">Fragen?</p>

        <form ref={formRef} onSubmit={sendEmail} className="max-w-md mx-auto space-y-4">
  <Input dark={dark} name="name" placeholder="Your Name" required />
  <Input dark={dark} name="email" type="email" placeholder="Your Email" required />
  <Textarea dark={dark} name="message" placeholder="Your Message" required style={{ height: 128 }} />
  <Button dark={dark} type="submit">Abschicken</Button>
</form>

      </section>

      <footer className="text-center mt-12 text-sm text-neutral-500">
        <div className="flex items-center justify-center gap-4 mb-4">
          <a href="https://instagram.com/tymur.sg" aria-label="Instagram" className="inline-flex p-2 rounded-full hover:bg-neutral-200">
            <Instagram />
          </a>
        </div>
        <p>© {new Date().getFullYear()} Meine Bilder</p>
      </footer>

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}
