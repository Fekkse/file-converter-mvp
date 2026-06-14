import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [format, setFormat] = useState("png");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);

  const onDrop = (acceptedFiles) => {
    const f = acceptedFiles[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const convert = () => {
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
    xhr.open("POST", "http://localhost:5001/convert", true);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const url = URL.createObjectURL(xhr.response);

      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${format === "jpeg" ? "jpg" : format}`;
      a.click();

      URL.revokeObjectURL(url);

      setHistory((prev) => [
        ...prev,
        { name: file.name, format }
      ]);

      setLoading(false);
    };

    xhr.onerror = () => {
      alert("Ошибка конвертации");
      setLoading(false);
    };

    xhr.send(fd);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center mb-2">
          File Converter
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
          <div className="mt-4 text-green-400">
            📄 {file.name}
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

        {/* PROGRESS */}
        {progress > 0 && (
          <div className="mt-4 bg-slate-700 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
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

      </div>
    </div>
  );
}