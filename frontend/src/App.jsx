import { useState } from "react";
import { useDropzone } from "react-dropzone";

// 🔥 ТВОЙ РАБОЧИЙ BACKEND НА RENDER
const API_URL = "https://file-converter-mvp.onrender.com";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState("png");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [totalConverted, setTotalConverted] = useState(0);

  const onDrop = (acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;

    setFile(f);

    if (preview) URL.revokeObjectURL(preview);

    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);

    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  const convert = async () => {
    if (!file) {
      alert("Выберите файл");
      return;
    }

    setLoading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("format", format);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_URL}/convert`, true);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setLoading(false);
      setProgress(0);

      if (xhr.status !== 200) {
        console.error("Server error:", xhr.response);
        alert("Ошибка конвертации (сервер)");
        return;
      }

      const blob = xhr.response;

      if (!blob || blob.size === 0) {
        alert("Пустой ответ от сервера");
        return;
      }

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      setHistory((prev) => [
        { name: file.name, format },
        ...prev,
      ]);

      setTotalConverted((prev) => prev + 1);
    };

    xhr.onerror = () => {
      setLoading(false);
      setProgress(0);
      console.error("Network error");
      alert("Ошибка сети (проверь backend Render)");
    };

    xhr.send(fd);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center mb-2">
          Convertox
        </h1>

        <p className="text-center text-slate-400 mb-8">
          PNG • JPG • WEBP
        </p>

        {/* DROPZONE */}
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p>Отпустите файл...</p>
          ) : (
            <p>Перетащите файл сюда или нажмите</p>
          )}
        </div>

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 max-h-64 rounded-lg mx-auto"
          />
        )}

        {/* FILE INFO */}
        {file && (
          <div className="mt-4 bg-slate-700 rounded-lg p-3">
            <div className="text-green-400">
              📄 {file.name}
            </div>

            <div className="text-slate-400 text-sm">
              Размер: {(file.size / 1024).toFixed(2)} KB
            </div>
          </div>
        )}

        {/* FORMAT */}
        <div className="mt-6">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full bg-slate-700 rounded-lg p-3"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>

        {/* FORMAT BADGE */}
        <div className="mt-3 text-center">
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            Конвертация в {format.toUpperCase()}
          </span>
        </div>

        {/* PROGRESS */}
        {loading && (
          <div className="mt-4 bg-slate-700 rounded">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={convert}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 transition rounded-lg p-3 font-semibold"
        >
          {loading ? "Конвертация..." : "Конвертировать"}
        </button>

        {/* CLEAR */}
        <button
          onClick={clearFile}
          className="w-full mt-3 bg-slate-700 hover:bg-slate-600 transition rounded-lg p-3"
        >
          Очистить
        </button>

        {/* STATS */}
        <div className="mt-6 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {totalConverted}
          </div>

          <div className="text-slate-400 text-sm">
            Успешных конвертаций
          </div>
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm mb-2 text-slate-300">
              История:
            </h3>

            {history.map((h, i) => (
              <div key={i} className="text-xs text-slate-400">
                {h.name} → {h.format}
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          Powered by convertox.vercel.app 🚀
        </div>

      </div>
    </div>
  );
}